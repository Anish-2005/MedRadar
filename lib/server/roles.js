import "server-only";
import {
  ROLE_IDS,
  ROLE_META,
  ROLE_OPTIONS,
} from "@/lib/shared/roles";
export { ROLE_IDS, ROLE_META, ROLE_OPTIONS };

export function isValidRole(role) {
  return Object.prototype.hasOwnProperty.call(ROLE_META, role);
}

export function getRoleCapabilities(role) {
  if (!isValidRole(role)) {
    return ROLE_META[ROLE_IDS.OPERATIONS];
  }
  return ROLE_META[role];
}

export function canWriteResource(role, type) {
  return getRoleCapabilities(role).resourceWrite.includes(type);
}

export function hasAdminAccess(role) {
  return getRoleCapabilities(role).canAccessAdmin;
}
