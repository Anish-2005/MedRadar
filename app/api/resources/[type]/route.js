import { updateResourceCollection } from "@/lib/server/service";
import { parseJsonBody, jsonError, jsonSuccess } from "@/lib/server/http";
import { readSessionToken } from "@/lib/server/sessionCookie";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PUT(request, { params }) {
  const token = readSessionToken(request);
  const body = await parseJsonBody(request);
  const result = await updateResourceCollection(token, params.type, body?.items ?? []);

  if (!result.ok) {
    return jsonError(result.message, result.status);
  }

  return jsonSuccess({ resources: result.resources });
}
