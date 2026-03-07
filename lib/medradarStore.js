import {
  DEFAULT_AUDIT_LOG,
  DEFAULT_RESOURCES,
  DEFAULT_SETTINGS,
  DEFAULT_USERS,
} from "./medradarData";

const STORAGE_KEYS = {
  users: "medradar.users",
  session: "medradar.session",
  resources: "medradar.resources",
  settings: "medradar.settings",
  audit: "medradar.audit",
};

function canUseStorage() {
  return typeof window !== "undefined" && !!window.localStorage;
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function readJson(key, fallbackValue) {
  if (!canUseStorage()) {
    return clone(fallbackValue);
  }

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      return clone(fallbackValue);
    }
    return JSON.parse(raw);
  } catch {
    return clone(fallbackValue);
  }
}

function writeJson(key, value) {
  if (!canUseStorage()) {
    return;
  }
  window.localStorage.setItem(key, JSON.stringify(value));
}

function ensureSeedData() {
  if (!canUseStorage()) {
    return;
  }

  if (!window.localStorage.getItem(STORAGE_KEYS.users)) {
    writeJson(STORAGE_KEYS.users, DEFAULT_USERS);
  }

  if (!window.localStorage.getItem(STORAGE_KEYS.resources)) {
    writeJson(STORAGE_KEYS.resources, DEFAULT_RESOURCES);
  }

  if (!window.localStorage.getItem(STORAGE_KEYS.settings)) {
    writeJson(STORAGE_KEYS.settings, DEFAULT_SETTINGS);
  }

  if (!window.localStorage.getItem(STORAGE_KEYS.audit)) {
    writeJson(STORAGE_KEYS.audit, DEFAULT_AUDIT_LOG);
  }
}

function todayTime() {
  return new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function seedMedRadarStore() {
  ensureSeedData();
}

export function getUsers() {
  ensureSeedData();
  return readJson(STORAGE_KEYS.users, DEFAULT_USERS);
}

export function registerUser(payload) {
  ensureSeedData();

  const users = getUsers();
  const email = payload.email.trim().toLowerCase();
  const existing = users.find((user) => user.email.toLowerCase() === email);

  if (existing) {
    return { ok: false, message: "An account with this email already exists." };
  }

  const newUser = {
    id: `u-${Date.now()}`,
    name: payload.name.trim(),
    email,
    password: payload.password,
    role: payload.role,
    hospitalName: payload.hospitalName.trim(),
  };

  const nextUsers = [...users, newUser];
  writeJson(STORAGE_KEYS.users, nextUsers);

  addAuditEntry({
    actor: newUser.name,
    action: "Account created",
    target: newUser.role,
  });

  return { ok: true, user: newUser };
}

export function loginUser(email, password) {
  ensureSeedData();

  const users = getUsers();
  const found = users.find((user) => user.email.toLowerCase() === email.trim().toLowerCase());

  if (!found || found.password !== password) {
    return { ok: false, message: "Invalid email or password." };
  }

  const session = {
    id: found.id,
    name: found.name,
    email: found.email,
    role: found.role,
    hospitalName: found.hospitalName,
    loginAt: new Date().toISOString(),
  };

  writeJson(STORAGE_KEYS.session, session);

  addAuditEntry({
    actor: session.name,
    action: "Logged in",
    target: "Portal",
  });

  return { ok: true, session };
}

export function getSession() {
  return readJson(STORAGE_KEYS.session, null);
}

export function logoutUser() {
  if (!canUseStorage()) {
    return;
  }

  const session = getSession();
  if (session?.name) {
    addAuditEntry({
      actor: session.name,
      action: "Logged out",
      target: "Portal",
    });
  }

  window.localStorage.removeItem(STORAGE_KEYS.session);
}

export function getResources() {
  ensureSeedData();
  return readJson(STORAGE_KEYS.resources, DEFAULT_RESOURCES);
}

export function saveResources(nextResources, actor = "System") {
  writeJson(STORAGE_KEYS.resources, nextResources);
  addAuditEntry({
    actor,
    action: "Resources updated",
    target: "Inventory",
  });
}

export function getSettings() {
  ensureSeedData();
  return readJson(STORAGE_KEYS.settings, DEFAULT_SETTINGS);
}

export function saveSettings(nextSettings, actor = "Admin") {
  writeJson(STORAGE_KEYS.settings, nextSettings);
  addAuditEntry({
    actor,
    action: "Settings changed",
    target: "Alert thresholds",
  });
}

export function getAuditLog() {
  ensureSeedData();
  return readJson(STORAGE_KEYS.audit, DEFAULT_AUDIT_LOG);
}

export function addAuditEntry({ actor, action, target }) {
  ensureSeedData();
  const existing = readJson(STORAGE_KEYS.audit, DEFAULT_AUDIT_LOG);
  const next = [
    {
      id: `audit-${Date.now()}`,
      actor,
      action,
      target,
      time: todayTime(),
    },
    ...existing,
  ].slice(0, 40);

  writeJson(STORAGE_KEYS.audit, next);
}

export function resetDemoData(actor = "Admin") {
  writeJson(STORAGE_KEYS.resources, DEFAULT_RESOURCES);
  writeJson(STORAGE_KEYS.settings, DEFAULT_SETTINGS);
  writeJson(STORAGE_KEYS.audit, DEFAULT_AUDIT_LOG);

  addAuditEntry({
    actor,
    action: "Demo data reset",
    target: "Resources & settings",
  });
}
