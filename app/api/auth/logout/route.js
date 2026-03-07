import { logoutAccount } from "@/lib/server/service";
import { parseJsonBody, jsonError, jsonSuccess } from "@/lib/server/http";
import { clearSessionCookie, readSessionToken } from "@/lib/server/sessionCookie";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request) {
  await parseJsonBody(request);
  const token = readSessionToken(request);
  const result = await logoutAccount(token);

  if (!result.ok) {
    return jsonError(result.message, result.status);
  }

  const response = jsonSuccess({ message: result.message });
  clearSessionCookie(response);
  return response;
}
