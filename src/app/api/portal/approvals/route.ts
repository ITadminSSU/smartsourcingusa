import { NextResponse } from "next/server";
import { getCurrentPortalUser } from "@/lib/portal-auth";
import { canReviewAtAll, listReviewQueue } from "@/lib/approvals";

export const runtime = "nodejs";

export async function GET() {
  const session = await getCurrentPortalUser();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!canReviewAtAll(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const items = await listReviewQueue(session);
  return NextResponse.json({ items });
}
