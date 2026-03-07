import "server-only";
import { parseResourceImport, normalizeSettings } from "@/lib/medradarNormalize";
import {
  appendAudit,
  createSessionRecord,
  createUserRecord,
  findSessionByToken,
  findUserByEmail,
  findUserById,
  readAudit,
  readResources,
  readSettings,
  removeSessionByToken,
  resetOperationalData,
  writeResources,
  writeSettings,
} from "@/lib/server/db";
import {
  canWriteResource,
  getRoleCapabilities,
  hasAdminAccess,
  isValidRole,
  ROLE_IDS,
} from "@/lib/server/roles";
import { createPasswordHash, verifyPassword } from "@/lib/server/security";

const RESOURCE_TYPES = ["beds", "oxygen", "medicines"];

function createError(status, message) {
  return { ok: false, status, message };
}

function createSuccess(data, status = 200) {
  return { ok: true, status, ...data };
}

function isValidEmail(email) {
  return typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function buildSessionPayload(user) {
  const capabilities = getRoleCapabilities(user.role);

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    roleLabel: capabilities.label,
    hospitalName: user.hospitalName,
    permissions: {
      canAccessAdmin: capabilities.canAccessAdmin,
      resourceWrite: capabilities.resourceWrite,
      resourceView: capabilities.resourceView,
    },
  };
}

async function resolveAuthorizedContext(token) {
  if (!token) {
    return createError(401, "Authentication required.");
  }

  const session = await findSessionByToken(token);
  if (!session) {
    return createError(401, "Session expired. Please sign in again.");
  }

  const user = await findUserById(session.userId);
  if (!user) {
    await removeSessionByToken(token);
    return createError(401, "Session user not found.");
  }

  return createSuccess({ user, session });
}

export async function signupAccount(input) {
  const name = typeof input?.name === "string" ? input.name.trim() : "";
  const hospitalName = typeof input?.hospitalName === "string" ? input.hospitalName.trim() : "";
  const email = typeof input?.email === "string" ? input.email.trim().toLowerCase() : "";
  const password = typeof input?.password === "string" ? input.password : "";
  const role = typeof input?.role === "string" ? input.role : ROLE_IDS.OPERATIONS;

  if (!name || !hospitalName || !isValidEmail(email) || password.length < 8) {
    return createError(400, "Name, hospital, valid email, and 8+ character password are required.");
  }

  if (!isValidRole(role)) {
    return createError(400, "Invalid role selected.");
  }

  const { hash, salt } = createPasswordHash(password);

  const created = await createUserRecord({
    name,
    hospitalName,
    email,
    role,
    passwordHash: hash,
    passwordSalt: salt,
  });

  if (!created.ok) {
    return createError(409, created.message);
  }

  const session = await createSessionRecord(created.user.id);
  await appendAudit({
    actor: created.user.name,
    action: "Account created",
    target: getRoleCapabilities(created.user.role).label,
    severity: "info",
  });

  return createSuccess(
    {
      sessionToken: session.token,
      session: buildSessionPayload(created.user),
    },
    201
  );
}

export async function loginAccount(input) {
  const email = typeof input?.email === "string" ? input.email.trim().toLowerCase() : "";
  const password = typeof input?.password === "string" ? input.password : "";

  if (!isValidEmail(email) || !password) {
    return createError(400, "Valid email and password are required.");
  }

  const user = await findUserByEmail(email);
  if (!user) {
    return createError(401, "Invalid email or password.");
  }

  const valid = verifyPassword(password, user.passwordHash, user.passwordSalt);
  if (!valid) {
    return createError(401, "Invalid email or password.");
  }

  const session = await createSessionRecord(user.id);
  await appendAudit({
    actor: user.name,
    action: "Logged in",
    target: "Portal",
    severity: "info",
  });

  return createSuccess({
    sessionToken: session.token,
    session: buildSessionPayload(user),
  });
}

export async function getSessionAccount(token) {
  const context = await resolveAuthorizedContext(token);
  if (!context.ok) {
    return context;
  }

  return createSuccess({ session: buildSessionPayload(context.user) });
}

export async function logoutAccount(token) {
  if (!token) {
    return createSuccess({ message: "Session cleared." });
  }

  const context = await resolveAuthorizedContext(token);

  if (context.ok) {
    await appendAudit({
      actor: context.user.name,
      action: "Logged out",
      target: "Portal",
      severity: "info",
    });
  }

  await removeSessionByToken(token);
  return createSuccess({ message: "Session cleared." });
}

export async function getResourcesForSession(token) {
  const context = await resolveAuthorizedContext(token);
  if (!context.ok) {
    return context;
  }

  const resources = await readResources();
  return createSuccess({ resources });
}

export async function updateResourceCollection(token, type, items) {
  const context = await resolveAuthorizedContext(token);
  if (!context.ok) {
    return context;
  }

  if (!RESOURCE_TYPES.includes(type)) {
    return createError(400, "Unsupported resource type.");
  }

  if (!canWriteResource(context.user.role, type)) {
    return createError(403, "You do not have permission to update this resource type.");
  }

  if (!Array.isArray(items)) {
    return createError(400, "Items must be an array.");
  }

  const existing = await readResources();
  const nextResources = {
    ...existing,
    [type]: items,
  };

  const saved = await writeResources(nextResources);

  await appendAudit({
    actor: context.user.name,
    action: "Resources updated",
    target: `Inventory / ${type}`,
    severity: "info",
  });

  return createSuccess({ resources: saved });
}

export async function importResourceSnapshot(token, payload) {
  const context = await resolveAuthorizedContext(token);
  if (!context.ok) {
    return context;
  }

  if (!hasAdminAccess(context.user.role)) {
    return createError(403, "Only admins can import full resource snapshots.");
  }

  const parsed = parseResourceImport(payload);
  if (!parsed.ok) {
    return createError(400, parsed.message);
  }

  const saved = await writeResources(parsed.data);

  await appendAudit({
    actor: context.user.name,
    action: "Resources imported",
    target: "Inventory snapshot",
    severity: "warning",
  });

  return createSuccess({ resources: saved, message: "Resource snapshot imported successfully." });
}

export async function getSettingsForSession(token) {
  const context = await resolveAuthorizedContext(token);
  if (!context.ok) {
    return context;
  }

  const settings = await readSettings();
  return createSuccess({ settings });
}

export async function updateSettingsForSession(token, settingsInput) {
  const context = await resolveAuthorizedContext(token);
  if (!context.ok) {
    return context;
  }

  if (!hasAdminAccess(context.user.role)) {
    return createError(403, "Only admins can update settings.");
  }

  const nextSettings = normalizeSettings(settingsInput);
  const settings = await writeSettings(nextSettings);

  await appendAudit({
    actor: context.user.name,
    action: "Settings changed",
    target: "Alert thresholds",
    severity: "info",
  });

  return createSuccess({ settings, message: "Settings saved." });
}

export async function getAuditForSession(token, limit) {
  const context = await resolveAuthorizedContext(token);
  if (!context.ok) {
    return context;
  }

  const audit = await readAudit(limit);
  return createSuccess({ audit });
}

export async function resetDemoForSession(token) {
  const context = await resolveAuthorizedContext(token);
  if (!context.ok) {
    return context;
  }

  if (!hasAdminAccess(context.user.role)) {
    return createError(403, "Only admins can reset operational data.");
  }

  const data = await resetOperationalData();

  await appendAudit({
    actor: context.user.name,
    action: "Demo data reset",
    target: "Resources & settings",
    severity: "warning",
  });

  return createSuccess({
    resources: data.resources,
    settings: data.settings,
    message: "Demo data reset complete.",
  });
}
