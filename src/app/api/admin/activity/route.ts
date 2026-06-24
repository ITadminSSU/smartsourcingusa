import { NextResponse } from "next/server";
import { getCurrentUser, listActivity } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const activity = await listActivity(25);
  return NextResponse.json({ activity });
}
