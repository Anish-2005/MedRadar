import { getAuditForSession } from "@/lib/server/service";
import { jsonError, jsonSuccess } from "@/lib/server/http";
import { readSessionToken } from "@/lib/server/sessionCookie";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request) {
  const token = readSessionToken(request);
  const limit = Number(new URL(request.url).searchParams.get("limit") || "40");
  const result = await getAuditForSession(token, limit);

  if (!result.ok) {
    return jsonError(result.message, result.status);
  }

  return jsonSuccess({ audit: result.audit });
}
