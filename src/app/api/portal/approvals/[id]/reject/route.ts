import { NextResponse } from "next/server";
import { getCurrentPortalUser } from "@/lib/portal-auth";
import { canReview, getReviewContext, rejectAndNotify } from "@/lib/approvals";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(request: Request, ctx: Ctx) {
  const session = await getCurrentPortalUser();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = Number((await ctx.params).id);
  const context = await getReviewContext(id);
  if (!context) return NextResponse.json({ error: "Not found." }, { status: 404 });

  if (context.record.status !== "submitted") {
    return NextResponse.json(
      { error: "This timesheet is no longer pending review." },
      { status: 409 }
    );
  }
  if (!canReview(session, context)) {
    return NextResponse.json(
      { error: "You don't have permission to review this timesheet." },
      { status: 403 }
    );
  }

  const body = (await request.json().catch(() => ({}))) as { notes?: unknown };
  const notes = typeof body.notes === "string" ? body.notes.trim() : "";
  if (!notes) {
    return NextResponse.json(
      { error: "Please include a reason so the employee knows what to fix." },
      { status: 400 }
    );
  }

  await rejectAndNotify(session, context, notes);
  return NextResponse.json({ ok: true });
}
