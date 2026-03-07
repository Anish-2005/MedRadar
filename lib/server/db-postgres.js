import "server-only";
import { randomUUID } from "node:crypto";
import { Pool } from "pg";
import {
  DEFAULT_AUDIT_LOG,
  DEFAULT_RESOURCES,
  DEFAULT_SETTINGS,
} from "@/lib/medradarData";
import { normalizeResources, normalizeSettings } from "@/lib/medradarNormalize";
import { ROLE_IDS } from "@/lib/server/roles";
import { createPasswordHash } from "@/lib/server/security";

const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7;
const MAX_AUDIT_ROWS = 500;

function getDatabaseUrl() {
  return process.env.DATABASE_URL || process.env.POSTGRES_URL || "";
}

function nowIso() {
  return new Date().toISOString();
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function isoString(value) {
  if (!value) {
    return nowIso();
  }
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return nowIso();
  }
  return date.toISOString();
}

function formatTimeLabel(value) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  }

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function normalizeAuditEntry(entry, index) {
  return {
    id: entry?.id || `audit-${Date.now()}-${index}`,
    actor: typeof entry?.actor === "string" ? entry.actor : "System",
    action: typeof entry?.action === "string" ? entry.action : "Unknown",
    target: typeof entry?.target === "string" ? entry.target : "General",
    severity: typeof entry?.severity === "string" ? entry.severity : "info",
    createdAt: isoString(entry?.createdAt),
    time: typeof entry?.time === "string" ? entry.time : formatTimeLabel(entry?.createdAt),
  };
}

function parseJsonColumn(value, fallback) {
  if (value == null) {
    return fallback;
  }
  if (typeof value === "object") {
    return value;
  }
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function mapUserRow(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    hospitalName: row.hospital_name,
    passwordHash: row.password_hash,
    passwordSalt: row.password_salt,
    createdAt: isoString(row.created_at),
    updatedAt: isoString(row.updated_at),
  };
}

function mapSessionRow(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    token: row.token,
    userId: row.user_id,
    createdAt: isoString(row.created_at),
    expiresAt: isoString(row.expires_at),
  };
}

function mapAuditRow(row, index = 0) {
  return normalizeAuditEntry(
    {
      id: row.id,
      actor: row.actor,
      action: row.action,
      target: row.target,
      severity: row.severity,
      createdAt: row.created_at,
      time: row.time,
    },
    index
  );
}

function createPool() {
  const connectionString = getDatabaseUrl();
  if (!connectionString) {
    throw new Error("DATABASE_URL is required for postgres adapter.");
  }

  const isSupabase = connectionString.includes("supabase.co");
  return new Pool({
    connectionString,
    ssl: isSupabase ? { rejectUnauthorized: false } : undefined,
    max: 10,
    idleTimeoutMillis: 30000,
  });
}

function getPool() {
  if (!globalThis.__medradarPgPool) {
    globalThis.__medradarPgPool = createPool();
  }
  return globalThis.__medradarPgPool;
}

async function withTransaction(task) {
  await ensureInitialized();
  const client = await getPool().connect();
  try {
    await client.query("BEGIN");
    const result = await task(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function query(text, params = []) {
  await ensureInitialized();
  return getPool().query(text, params);
}

async function pruneExpiredSessions(client = null) {
  if (client) {
    await client.query("DELETE FROM sessions WHERE expires_at <= NOW()");
    return;
  }
  await query("DELETE FROM sessions WHERE expires_at <= NOW()");
}

async function ensureSchema(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      role TEXT NOT NULL,
      hospital_name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      password_salt TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      token TEXT NOT NULL UNIQUE,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL
    );

    CREATE INDEX IF NOT EXISTS sessions_user_id_idx ON sessions(user_id);
    CREATE INDEX IF NOT EXISTS sessions_expires_at_idx ON sessions(expires_at);

    CREATE TABLE IF NOT EXISTS app_state (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      resources JSONB NOT NULL,
      settings JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL
    );

    CREATE TABLE IF NOT EXISTS audit_log (
      id TEXT PRIMARY KEY,
      actor TEXT NOT NULL,
      action TEXT NOT NULL,
      target TEXT NOT NULL,
      severity TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL,
      time TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS audit_created_at_idx ON audit_log(created_at DESC);
  `);
}

async function seedState(client) {
  const resources = normalizeResources(DEFAULT_RESOURCES);
  const settings = normalizeSettings(DEFAULT_SETTINGS);

  await client.query(
    `
      INSERT INTO app_state (id, resources, settings, updated_at)
      VALUES (1, $1::jsonb, $2::jsonb, $3::timestamptz)
      ON CONFLICT (id) DO NOTHING
    `,
    [JSON.stringify(resources), JSON.stringify(settings), nowIso()]
  );
}

async function seedAdminUser(client) {
  const email = "admin@medradar.app";
  const existing = await client.query(
    "SELECT id FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1",
    [email]
  );
  if (existing.rowCount > 0) {
    return;
  }

  const { hash, salt } = createPasswordHash("admin123");
  const createdAt = nowIso();

  await client.query(
    `
      INSERT INTO users (
        id,
        name,
        email,
        role,
        hospital_name,
        password_hash,
        password_salt,
        created_at,
        updated_at
      )
      VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        $8::timestamptz,
        $9::timestamptz
      )
      ON CONFLICT (id) DO NOTHING
    `,
    [
      "u-admin",
      "Dr. Asha Mehta",
      email,
      ROLE_IDS.ADMIN,
      "MedRadar General Hospital",
      hash,
      salt,
      createdAt,
      createdAt,
    ]
  );
}

async function seedAudit(client) {
  const existing = await client.query("SELECT COUNT(*)::int AS count FROM audit_log");
  if (existing.rows[0]?.count > 0) {
    return;
  }

  const seedRows = DEFAULT_AUDIT_LOG.map((entry, index) =>
    normalizeAuditEntry(
      {
        ...entry,
        createdAt: nowIso(),
      },
      index
    )
  );

  for (const row of seedRows) {
    await client.query(
      `
        INSERT INTO audit_log (id, actor, action, target, severity, created_at, time)
        VALUES ($1, $2, $3, $4, $5, $6::timestamptz, $7)
      `,
      [row.id, row.actor, row.action, row.target, row.severity, row.createdAt, row.time]
    );
  }
}

async function runInitialization() {
  const client = await getPool().connect();
  try {
    await client.query("BEGIN");
    await ensureSchema(client);
    await seedState(client);
    await seedAdminUser(client);
    await seedAudit(client);
    await pruneExpiredSessions(client);
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function ensureInitialized() {
  if (!globalThis.__medradarPgInitPromise) {
    globalThis.__medradarPgInitPromise = runInitialization();
  }

  try {
    await globalThis.__medradarPgInitPromise;
  } catch (error) {
    globalThis.__medradarPgInitPromise = null;
    throw error;
  }
}

export async function findUserByEmail(email) {
  const normalizedEmail = email.trim().toLowerCase();
  const result = await query(
    "SELECT * FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1",
    [normalizedEmail]
  );
  return mapUserRow(result.rows[0]);
}

export async function findUserById(id) {
  const result = await query("SELECT * FROM users WHERE id = $1 LIMIT 1", [id]);
  return mapUserRow(result.rows[0]);
}

export async function createUserRecord(userInput) {
  const email = userInput.email.trim().toLowerCase();
  const createdAt = nowIso();

  const result = await query(
    `
      INSERT INTO users (
        id,
        name,
        email,
        role,
        hospital_name,
        password_hash,
        password_salt,
        created_at,
        updated_at
      )
      VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        $8::timestamptz,
        $9::timestamptz
      )
      ON CONFLICT (email) DO NOTHING
      RETURNING *
    `,
    [
      `u-${randomUUID()}`,
      userInput.name,
      email,
      userInput.role,
      userInput.hospitalName,
      userInput.passwordHash,
      userInput.passwordSalt,
      createdAt,
      createdAt,
    ]
  );

  if (result.rowCount === 0) {
    return { ok: false, message: "An account with this email already exists." };
  }

  return { ok: true, user: mapUserRow(result.rows[0]) };
}

export async function createSessionRecord(userId) {
  await pruneExpiredSessions();

  const createdAt = nowIso();
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS).toISOString();
  const result = await query(
    `
      INSERT INTO sessions (id, token, user_id, created_at, expires_at)
      VALUES ($1, $2, $3, $4::timestamptz, $5::timestamptz)
      RETURNING *
    `,
    [`s-${randomUUID()}`, `tok-${randomUUID()}-${randomUUID()}`, userId, createdAt, expiresAt]
  );

  return mapSessionRow(result.rows[0]);
}

export async function findSessionByToken(token) {
  if (!token) {
    return null;
  }

  await pruneExpiredSessions();

  const result = await query(
    `
      SELECT *
      FROM sessions
      WHERE token = $1
        AND expires_at > NOW()
      LIMIT 1
    `,
    [token]
  );

  return mapSessionRow(result.rows[0]);
}

export async function removeSessionByToken(token) {
  if (!token) {
    return;
  }
  await query("DELETE FROM sessions WHERE token = $1", [token]);
}

export async function readResources() {
  const result = await query("SELECT resources FROM app_state WHERE id = 1 LIMIT 1");
  const raw = parseJsonColumn(result.rows[0]?.resources, DEFAULT_RESOURCES);
  return clone(normalizeResources(raw));
}

export async function writeResources(resources) {
  const normalized = normalizeResources(resources);
  const now = nowIso();

  const update = await query(
    `
      UPDATE app_state
      SET resources = $1::jsonb, updated_at = $2::timestamptz
      WHERE id = 1
      RETURNING resources
    `,
    [JSON.stringify(normalized), now]
  );

  if (update.rowCount > 0) {
    return clone(normalizeResources(parseJsonColumn(update.rows[0].resources, normalized)));
  }

  const insert = await query(
    `
      INSERT INTO app_state (id, resources, settings, updated_at)
      VALUES (1, $1::jsonb, $2::jsonb, $3::timestamptz)
      RETURNING resources
    `,
    [JSON.stringify(normalized), JSON.stringify(normalizeSettings(DEFAULT_SETTINGS)), now]
  );

  return clone(normalizeResources(parseJsonColumn(insert.rows[0].resources, normalized)));
}

export async function readSettings() {
  const result = await query("SELECT settings FROM app_state WHERE id = 1 LIMIT 1");
  const raw = parseJsonColumn(result.rows[0]?.settings, DEFAULT_SETTINGS);
  return clone(normalizeSettings(raw));
}

export async function writeSettings(settings) {
  const normalized = normalizeSettings(settings);
  const now = nowIso();

  const update = await query(
    `
      UPDATE app_state
      SET settings = $1::jsonb, updated_at = $2::timestamptz
      WHERE id = 1
      RETURNING settings
    `,
    [JSON.stringify(normalized), now]
  );

  if (update.rowCount > 0) {
    return clone(normalizeSettings(parseJsonColumn(update.rows[0].settings, normalized)));
  }

  const insert = await query(
    `
      INSERT INTO app_state (id, resources, settings, updated_at)
      VALUES (1, $1::jsonb, $2::jsonb, $3::timestamptz)
      RETURNING settings
    `,
    [JSON.stringify(normalizeResources(DEFAULT_RESOURCES)), JSON.stringify(normalized), now]
  );

  return clone(normalizeSettings(parseJsonColumn(insert.rows[0].settings, normalized)));
}

export async function readAudit(limit = 40) {
  const count = Number.isFinite(Number(limit)) ? Number(limit) : 40;
  const safeLimit = Math.max(1, Math.min(200, count));

  const result = await query(
    `
      SELECT *
      FROM audit_log
      ORDER BY created_at DESC
      LIMIT $1
    `,
    [safeLimit]
  );

  return clone(result.rows.map((row, index) => mapAuditRow(row, index)));
}

export async function appendAudit(entry) {
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

  await withTransaction(async (client) => {
    await client.query(
      `
        INSERT INTO audit_log (id, actor, action, target, severity, created_at, time)
        VALUES ($1, $2, $3, $4, $5, $6::timestamptz, $7)
      `,
      [next.id, next.actor, next.action, next.target, next.severity, next.createdAt, next.time]
    );

    await client.query(
      `
        DELETE FROM audit_log
        WHERE id IN (
          SELECT id
          FROM audit_log
          ORDER BY created_at DESC
          OFFSET $1
        )
      `,
      [MAX_AUDIT_ROWS]
    );
  });

  return next;
}

export async function resetOperationalData() {
  const resources = normalizeResources(DEFAULT_RESOURCES);
  const settings = normalizeSettings(DEFAULT_SETTINGS);
  const seedAudit = DEFAULT_AUDIT_LOG.map((entry, index) =>
    normalizeAuditEntry(
      {
        ...entry,
        createdAt: nowIso(),
      },
      index
    )
  );

  await withTransaction(async (client) => {
    const now = nowIso();
    const updated = await client.query(
      `
        UPDATE app_state
        SET resources = $1::jsonb, settings = $2::jsonb, updated_at = $3::timestamptz
        WHERE id = 1
      `,
      [JSON.stringify(resources), JSON.stringify(settings), now]
    );

    if (updated.rowCount === 0) {
      await client.query(
        `
          INSERT INTO app_state (id, resources, settings, updated_at)
          VALUES (1, $1::jsonb, $2::jsonb, $3::timestamptz)
        `,
        [JSON.stringify(resources), JSON.stringify(settings), now]
      );
    }

    await client.query("DELETE FROM audit_log");
    for (const row of seedAudit) {
      await client.query(
        `
          INSERT INTO audit_log (id, actor, action, target, severity, created_at, time)
          VALUES ($1, $2, $3, $4, $5, $6::timestamptz, $7)
        `,
        [row.id, row.actor, row.action, row.target, row.severity, row.createdAt, row.time]
      );
    }
  });

  return {
    resources: clone(resources),
    settings: clone(settings),
    audit: clone(seedAudit),
  };
}

export async function readDatabaseForTests() {
  await ensureInitialized();

  const [usersResult, sessionsResult, stateResult, auditResult] = await Promise.all([
    query("SELECT * FROM users ORDER BY created_at DESC"),
    query("SELECT * FROM sessions ORDER BY created_at DESC"),
    query("SELECT resources, settings FROM app_state WHERE id = 1 LIMIT 1"),
    query("SELECT * FROM audit_log ORDER BY created_at DESC"),
  ]);

  const state = stateResult.rows[0] || {};

  return {
    version: 1,
    users: usersResult.rows.map(mapUserRow),
    sessions: sessionsResult.rows.map(mapSessionRow),
    resources: normalizeResources(parseJsonColumn(state.resources, DEFAULT_RESOURCES)),
    settings: normalizeSettings(parseJsonColumn(state.settings, DEFAULT_SETTINGS)),
    audit: auditResult.rows.map((row, index) => mapAuditRow(row, index)),
  };
}
