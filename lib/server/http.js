import "server-only";
import { NextResponse } from "next/server";

export async function parseJsonBody(request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

export function jsonSuccess(data = {}, status = 200) {
  return NextResponse.json({ ok: true, ...data }, { status });
}

export function jsonError(message, status = 400) {
  return NextResponse.json({ ok: false, message }, { status });
}
