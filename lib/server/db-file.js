import "server-only";
import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import {
  DEFAULT_AUDIT_LOG,
  DEFAULT_RESOURCES,
  DEFAULT_SETTINGS,
} from "@/lib/medradarData";
import { normalizeResources, normalizeSettings } from "@/lib/medradarNormalize";
import { ROLE_IDS } from "@/lib/server/roles";
import { createPasswordHash } from "@/lib/server/security";

const DB_FILE = process.env.MEDRADAR_DB_PATH || path.join(process.cwd(), "data", "medradar-db.json");
const DB_DIR = path.dirname(DB_FILE);
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7;
let dbQueue = Promise.resolve();

function nowIso() {
  return new Date().toISOString();
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function normalizeAuditEntry(entry, index) {
  return {
    id: entry?.id || `audit-${Date.now()}-${index}`,
    actor: typeof entry?.actor === "string" ? entry.actor : "System",
    action: typeof entry?.action === "string" ? entry.action : "Unknown",
    target: typeof entry?.target === "string" ? entry.target : "General",
    severity: typeof entry?.severity === "string" ? entry.severity : "info",
    createdAt: entry?.createdAt || nowIso(),
    time: typeof entry?.time === "string" ? entry.time : new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }),
  };
}

function makeSeedDatabase() {
  const { hash, salt } = createPasswordHash("admin123");
  const createdAt = nowIso();

  return {
    version: 1,
    users: [
      {
        id: "u-admin",
        name: "Dr. Asha Mehta",
        email: "admin@medradar.app",
        role: ROLE_IDS.ADMIN,
        hospitalName: "MedRadar General Hospital",
        passwordHash: hash,
        passwordSalt: salt,
        createdAt,
        updatedAt: createdAt,
      },
    ],
    sessions: [],
    resources: normalizeResources(DEFAULT_RESOURCES),
    settings: normalizeSettings(DEFAULT_SETTINGS),
    audit: DEFAULT_AUDIT_LOG.map((entry, index) => normalizeAuditEntry(entry, index)),
  };
}

function sanitizeDatabase(raw) {
  const safe = raw && typeof raw === "object" ? raw : makeSeedDatabase();

  return {
    version: 1,
    users: Array.isArray(safe.users) ? safe.users : [],
    sessions: Array.isArray(safe.sessions) ? safe.sessions : [],
    resources: normalizeResources(safe.resources),
    settings: normalizeSettings(safe.settings),
    audit: Array.isArray(safe.audit)
      ? safe.audit.map((entry, index) => normalizeAuditEntry(entry, index)).slice(0, 500)
      : makeSeedDatabase().audit,
  };
}

async function ensureDatabaseFile() {
  await fs.mkdir(DB_DIR, { recursive: true });

  try {
    await fs.access(DB_FILE);
  } catch {
    const seed = makeSeedDatabase();
    await fs.writeFile(DB_FILE, JSON.stringify(seed, null, 2), "utf8");
  }
}

async function readDatabaseUnlocked() {
  await ensureDatabaseFile();

  try {
    const raw = await fs.readFile(DB_FILE, "utf8");
    return sanitizeDatabase(JSON.parse(raw));
  } catch {
    const seed = makeSeedDatabase();
    await writeDatabaseUnlocked(seed);
    return seed;
  }
}

async function writeDatabaseUnlocked(db) {
  await fs.mkdir(DB_DIR, { recursive: true });
  const tempPath = `${DB_FILE}.tmp`;
  await fs.writeFile(tempPath, JSON.stringify(db, null, 2), "utf8");
  await fs.rename(tempPath, DB_FILE);
}

function withDatabaseLock(task) {
  const execution = dbQueue.then(task, task);
  dbQueue = execution.then(
    () => undefined,
    () => undefined
  );
  return execution;
}

function pruneExpiredSessions(db) {
  const now = Date.now();
  db.sessions = db.sessions.filter((session) => {
    const expiresAt = new Date(session.expiresAt).getTime();
    return Number.isFinite(expiresAt) && expiresAt > now;
  });
}

export async function findUserByEmail(email) {
  return withDatabaseLock(async () => {
    const db = await readDatabaseUnlocked();
    const normalizedEmail = email.trim().toLowerCase();
    return db.users.find((user) => user.email.toLowerCase() === normalizedEmail) || null;
  });
}

export async function findUserById(id) {
  return withDatabaseLock(async () => {
    const db = await readDatabaseUnlocked();
    return db.users.find((user) => user.id === id) || null;
  });
}

export async function createUserRecord(userInput) {
  return withDatabaseLock(async () => {
    const db = await readDatabaseUnlocked();
    const email = userInput.email.trim().toLowerCase();

    const exists = db.users.some((user) => user.email.toLowerCase() === email);
    if (exists) {
      return { ok: false, message: "An account with this email already exists." };
    }

    const createdAt = nowIso();
    const user = {
      id: `u-${randomUUID()}`,
      name: userInput.name,
      email,
      role: userInput.role,
      hospitalName: userInput.hospitalName,
      passwordHash: userInput.passwordHash,
      passwordSalt: userInput.passwordSalt,
      createdAt,
      updatedAt: createdAt,
    };

    db.users.push(user);
    await writeDatabaseUnlocked(db);
    return { ok: true, user };
  });
}

export async function createSessionRecord(userId) {
  return withDatabaseLock(async () => {
    const db = await readDatabaseUnlocked();
    pruneExpiredSessions(db);

    const createdAt = nowIso();
    const expiresAt = new Date(Date.now() + SESSION_TTL_MS).toISOString();
    const session = {
      id: `s-${randomUUID()}`,
      token: `tok-${randomUUID()}-${randomUUID()}`,
      userId,
      createdAt,
      expiresAt,
    };

    db.sessions.push(session);
    await writeDatabaseUnlocked(db);
    return session;
  });
}

export async function findSessionByToken(token) {
  if (!token) {
    return null;
  }

  return withDatabaseLock(async () => {
    const db = await readDatabaseUnlocked();
    pruneExpiredSessions(db);

    const session = db.sessions.find((item) => item.token === token) || null;
    await writeDatabaseUnlocked(db);
    return session;
  });
}

export async function removeSessionByToken(token) {
  if (!token) {
    return;
  }

  return withDatabaseLock(async () => {
    const db = await readDatabaseUnlocked();
    db.sessions = db.sessions.filter((session) => session.token !== token);
    await writeDatabaseUnlocked(db);
  });
}

export async function readResources() {
  return withDatabaseLock(async () => {
    const db = await readDatabaseUnlocked();
    return clone(normalizeResources(db.resources));
  });
}

export async function writeResources(resources) {
  return withDatabaseLock(async () => {
    const db = await readDatabaseUnlocked();
    db.resources = normalizeResources(resources);
    await writeDatabaseUnlocked(db);
    return clone(db.resources);
  });
}

export async function readSettings() {
  return withDatabaseLock(async () => {
    const db = await readDatabaseUnlocked();
    return clone(normalizeSettings(db.settings));
  });
}

export async function writeSettings(settings) {
  return withDatabaseLock(async () => {
    const db = await readDatabaseUnlocked();
    db.settings = normalizeSettings(settings);
    await writeDatabaseUnlocked(db);
    return clone(db.settings);
  });
}

export async function readAudit(limit = 40) {
  return withDatabaseLock(async () => {
    const db = await readDatabaseUnlocked();
    const count = Number.isFinite(Number(limit)) ? Number(limit) : 40;
    return clone(db.audit.slice(0, Math.max(1, Math.min(200, count))));
  });
}

export async function appendAudit(entry) {
  return withDatabaseLock(async () => {
    const db = await readDatabaseUnlocked();
    const next = normalizeAuditEntry(
      {
        id: `audit-${randomUUID()}`,
        actor: entry.actor,
        action: entry.action,
        target: entry.target,
        severity: entry.severity || "info",
        createdAt: nowIso(),
      },
      0
    );

    db.audit.unshift(next);
    db.audit = db.audit.slice(0, 500);
    await writeDatabaseUnlocked(db);
    return next;
  });
}

export async function resetOperationalData() {
  return withDatabaseLock(async () => {
    const db = await readDatabaseUnlocked();
    db.resources = normalizeResources(DEFAULT_RESOURCES);
    db.settings = normalizeSettings(DEFAULT_SETTINGS);
    db.audit = DEFAULT_AUDIT_LOG.map((entry, index) => normalizeAuditEntry(entry, index));
    await writeDatabaseUnlocked(db);
    return {
      resources: clone(db.resources),
      settings: clone(db.settings),
      audit: clone(db.audit),
    };
  });
}

export async function readDatabaseForTests() {
  return withDatabaseLock(async () => {
    const db = await readDatabaseUnlocked();
    return clone(db);
  });
}
