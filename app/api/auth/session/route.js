import { getSessionAccount } from "@/lib/server/service";
import { clearSessionCookie, readSessionToken } from "@/lib/server/sessionCookie";
import { jsonError, jsonSuccess } from "@/lib/server/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request) {
  const token = readSessionToken(request);
  const result = await getSessionAccount(token);

  if (!result.ok) {
    const response = jsonError(result.message, result.status);
    if (result.status === 401) {
      clearSessionCookie(response);
    }
    return response;
  }

  return jsonSuccess({ session: result.session });
}
