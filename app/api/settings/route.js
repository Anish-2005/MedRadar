import { getSettingsForSession, updateSettingsForSession } from "@/lib/server/service";
import { parseJsonBody, jsonError, jsonSuccess } from "@/lib/server/http";
import { readSessionToken } from "@/lib/server/sessionCookie";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request) {
  const token = readSessionToken(request);
  const result = await getSettingsForSession(token);

  if (!result.ok) {
    return jsonError(result.message, result.status);
  }

  return jsonSuccess({ settings: result.settings });
}

export async function PUT(request) {
  const token = readSessionToken(request);
  const body = await parseJsonBody(request);
  const result = await updateSettingsForSession(token, body?.settings ?? {});

  if (!result.ok) {
    return jsonError(result.message, result.status);
  }

  return jsonSuccess({ settings: result.settings, message: result.message });
}
