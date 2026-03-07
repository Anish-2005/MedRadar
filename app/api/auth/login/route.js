import { loginAccount } from "@/lib/server/service";
import { parseJsonBody, jsonError, jsonSuccess } from "@/lib/server/http";
import { attachSessionCookie } from "@/lib/server/sessionCookie";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request) {
  const body = await parseJsonBody(request);
  const result = await loginAccount(body ?? {});

  if (!result.ok) {
    return jsonError(result.message, result.status);
  }

  const response = jsonSuccess({ session: result.session });
  attachSessionCookie(response, result.sessionToken);
  return response;
}
