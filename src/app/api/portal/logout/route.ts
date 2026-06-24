import { NextResponse } from "next/server";
import { endPortalSession } from "@/lib/portal-auth";

export const runtime = "nodejs";

export async function POST() {
  await endPortalSession();
  return NextResponse.json({ ok: true });
}
