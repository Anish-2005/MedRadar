import { importResourceSnapshot } from "@/lib/server/service";
import { parseJsonBody, jsonError, jsonSuccess } from "@/lib/server/http";
import { readSessionToken } from "@/lib/server/sessionCookie";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request) {
  const token = readSessionToken(request);
  const body = await parseJsonBody(request);

  const result = await importResourceSnapshot(token, body ?? {});
  if (!result.ok) {
    return jsonError(result.message, result.status);
  }

  return jsonSuccess({ resources: result.resources, message: result.message });
}
