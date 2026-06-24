import { NextResponse } from "next/server";
import { getCurrentPortalUser } from "@/lib/portal-auth";
import { approveAndNotify, canReview, getReviewContext } from "@/lib/approvals";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(_request: Request, ctx: Ctx) {
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

  await approveAndNotify(session, context);
  return NextResponse.json({ ok: true });
}
