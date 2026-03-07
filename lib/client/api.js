export class ApiError extends Error {
  constructor(message, status = 500) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function apiRequest(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    cache: "no-store",
  });

  const payload = await response
    .json()
    .catch(() => ({ ok: false, message: "Unexpected server response." }));

  if (!response.ok || payload?.ok === false) {
    throw new ApiError(payload?.message || "Request failed.", response.status);
  }

  return payload;
}

export async function login(payload) {
  return apiRequest("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function signup(payload) {
  return apiRequest("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function logout() {
  return apiRequest("/api/auth/logout", {
    method: "POST",
    body: JSON.stringify({}),
  });
}

export async function getSession() {
  return apiRequest("/api/auth/session");
}

export async function getResources() {
  return apiRequest("/api/resources");
}

export async function updateResourceType(type, items) {
  return apiRequest(`/api/resources/${type}`, {
    method: "PUT",
    body: JSON.stringify({ items }),
  });
}

export async function importResources(payload) {
  return apiRequest("/api/resources/import", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getSettings() {
  return apiRequest("/api/settings");
}

export async function updateSettings(settings) {
  return apiRequest("/api/settings", {
    method: "PUT",
    body: JSON.stringify({ settings }),
  });
}

export async function getAudit(limit = 40) {
  return apiRequest(`/api/audit?limit=${limit}`);
}

export async function resetDemoData() {
  return apiRequest("/api/admin/reset", {
    method: "POST",
    body: JSON.stringify({}),
  });
}
