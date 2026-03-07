import "server-only";
import * as fileDb from "@/lib/server/db-file";
import * as postgresDb from "@/lib/server/db-postgres";

const usePostgres = Boolean(process.env.DATABASE_URL || process.env.POSTGRES_URL);
const adapter = usePostgres ? postgresDb : fileDb;

export const databaseProvider = usePostgres ? "postgres" : "file";

export function findUserByEmail(...args) {
  return adapter.findUserByEmail(...args);
}

export function findUserById(...args) {
  return adapter.findUserById(...args);
}

export function createUserRecord(...args) {
  return adapter.createUserRecord(...args);
}

export function createSessionRecord(...args) {
  return adapter.createSessionRecord(...args);
}

export function findSessionByToken(...args) {
  return adapter.findSessionByToken(...args);
}

export function removeSessionByToken(...args) {
  return adapter.removeSessionByToken(...args);
}

export function readResources(...args) {
  return adapter.readResources(...args);
}

export function writeResources(...args) {
  return adapter.writeResources(...args);
}

export function readSettings(...args) {
  return adapter.readSettings(...args);
}

export function writeSettings(...args) {
  return adapter.writeSettings(...args);
}

export function readAudit(...args) {
  return adapter.readAudit(...args);
}

export function appendAudit(...args) {
  return adapter.appendAudit(...args);
}

export function resetOperationalData(...args) {
  return adapter.resetOperationalData(...args);
}

export function readDatabaseForTests(...args) {
  return adapter.readDatabaseForTests(...args);
}
