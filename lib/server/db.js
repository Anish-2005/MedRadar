import "server-only";
import * as fileDb from "@/lib/server/db-file";
import * as postgresDb from "@/lib/server/db-postgres";

const hasPostgresConfig = Boolean(process.env.DATABASE_URL || process.env.POSTGRES_URL);
let preferredProvider = hasPostgresConfig ? "postgres" : "file";
let fallbackWarned = false;

export function getDatabaseProvider() {
  return preferredProvider;
}

function isConnectionError(error) {
  const code = error?.code;
  const message = String(error?.message || "").toLowerCase();

  if (["ENOTFOUND", "ECONNREFUSED", "ECONNRESET", "ETIMEDOUT", "EHOSTUNREACH"].includes(code)) {
    return true;
  }

  return (
    message.includes("getaddrinfo") ||
    message.includes("connection") ||
    message.includes("timeout") ||
    message.includes("could not connect")
  );
}

async function call(method, args) {
  const primary = preferredProvider === "postgres" ? postgresDb : fileDb;

  try {
    return await primary[method](...args);
  } catch (error) {
    if (primary === postgresDb && isConnectionError(error)) {
      preferredProvider = "file";

      if (!fallbackWarned) {
        fallbackWarned = true;
        console.error(
          "[db] Postgres unavailable, falling back to file adapter.",
          error?.code || error?.message || error
        );
      }

      return fileDb[method](...args);
    }

    throw error;
  }
}

export function findUserByEmail(...args) {
  return call("findUserByEmail", args);
}

export function findUserById(...args) {
  return call("findUserById", args);
}

export function createUserRecord(...args) {
  return call("createUserRecord", args);
}

export function createSessionRecord(...args) {
  return call("createSessionRecord", args);
}

export function findSessionByToken(...args) {
  return call("findSessionByToken", args);
}

export function removeSessionByToken(...args) {
  return call("removeSessionByToken", args);
}

export function readResources(...args) {
  return call("readResources", args);
}

export function writeResources(...args) {
  return call("writeResources", args);
}

export function readSettings(...args) {
  return call("readSettings", args);
}

export function writeSettings(...args) {
  return call("writeSettings", args);
}

export function readAudit(...args) {
  return call("readAudit", args);
}

export function appendAudit(...args) {
  return call("appendAudit", args);
}

export function resetOperationalData(...args) {
  return call("resetOperationalData", args);
}

export function readDatabaseForTests(...args) {
  return call("readDatabaseForTests", args);
}
