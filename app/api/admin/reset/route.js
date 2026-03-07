import { resetDemoForSession } from "@/lib/server/service";
import { parseJsonBody, jsonError, jsonSuccess } from "@/lib/server/http";
import { readSessionToken } from "@/lib/server/sessionCookie";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request) {
  await parseJsonBody(request);
  const token = readSessionToken(request);
  const result = await resetDemoForSession(token);

  if (!result.ok) {
    return jsonError(result.message, result.status);
  }

  return jsonSuccess({ resources: result.resources, settings: result.settings, message: result.message });
}
