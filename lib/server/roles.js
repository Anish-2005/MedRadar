import "server-only";

export const ROLE_IDS = {
  ADMIN: "admin",
  OPERATIONS: "operations",
  PHARMACY: "pharmacy",
};

export const ROLE_META = {
  [ROLE_IDS.ADMIN]: {
    label: "Hospital Administrator",
    canAccessAdmin: true,
    resourceWrite: ["beds", "oxygen", "medicines"],
    resourceView: ["beds", "oxygen", "medicines"],
  },
  [ROLE_IDS.OPERATIONS]: {
    label: "Operations Desk",
    canAccessAdmin: false,
    resourceWrite: ["beds", "oxygen"],
    resourceView: ["beds", "oxygen", "medicines"],
  },
  [ROLE_IDS.PHARMACY]: {
    label: "Pharmacy Desk",
    canAccessAdmin: false,
    resourceWrite: ["medicines"],
    resourceView: ["beds", "oxygen", "medicines"],
  },
};

export const ROLE_OPTIONS = [
  { id: ROLE_IDS.ADMIN, label: ROLE_META[ROLE_IDS.ADMIN].label },
  { id: ROLE_IDS.OPERATIONS, label: ROLE_META[ROLE_IDS.OPERATIONS].label },
  { id: ROLE_IDS.PHARMACY, label: ROLE_META[ROLE_IDS.PHARMACY].label },
];

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
