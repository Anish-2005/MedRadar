import "server-only";

export const SESSION_COOKIE = "medradar_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export function readSessionToken(request) {
  return request.cookies.get(SESSION_COOKIE)?.value ?? null;
}

export function attachSessionCookie(response, token) {
  response.cookies.set({
    name: SESSION_COOKIE,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export function clearSessionCookie(response) {
  response.cookies.set({
    name: SESSION_COOKIE,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}
