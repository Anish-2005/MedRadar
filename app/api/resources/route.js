import { getResourcesForSession } from "@/lib/server/service";
import { jsonError, jsonSuccess } from "@/lib/server/http";
import { readSessionToken } from "@/lib/server/sessionCookie";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request) {
  const token = readSessionToken(request);
  const result = await getResourcesForSession(token);

  if (!result.ok) {
    return jsonError(result.message, result.status);
  }

  return jsonSuccess({ resources: result.resources });
}
