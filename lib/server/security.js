import "server-only";
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

export function createPasswordHash(password) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return { salt, hash };
}

export function verifyPassword(password, hash, salt) {
  const attempt = scryptSync(password, salt, 64);
  const original = Buffer.from(hash, "hex");

  if (attempt.length !== original.length) {
    return false;
  }

  return timingSafeEqual(attempt, original);
}

export function createSessionToken() {
  return randomBytes(32).toString("hex");
}
