import { NextResponse } from "next/server";
import { logActivity } from "@/lib/auth";
import { getCurrentPortalUser } from "@/lib/portal-auth";
import { notifySubmission } from "@/lib/approvals";
import {
  getTimesheetEntries,
  getTimesheetRecord,
  isEditable,
  submitTimesheet,
} from "@/lib/timesheets";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(_request: Request, ctx: Ctx) {
  const session = await getCurrentPortalUser();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = Number((await ctx.params).id);
  const existing = await getTimesheetRecord(id);
  if (!existing) return NextResponse.json({ error: "Not found." }, { status: 404 });
  if (existing.user_id !== session.uid) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }
  if (!isEditable(existing.status)) {
    return NextResponse.json(
      { error: "This timesheet has already been submitted." },
      { status: 409 }
    );
  }

  const entries = await getTimesheetEntries(id);
  if (entries.length === 0) {
    return NextResponse.json(
      { error: "Add at least one entry before submitting." },
      { status: 400 }
    );
  }
  if (Number(existing.total_hours) <= 0) {
    return NextResponse.json(
      { error: "Total hours must be greater than 0 before submitting." },
      { status: 400 }
    );
  }

  await submitTimesheet(id);
  await logActivity(
    session,
    "timesheet_submitted",
    `Submitted timesheet #${id} (${existing.total_hours} hrs)`
  );

  // Best-effort: tell the approver(s) it's waiting. Never blocks submission.
  try {
    await notifySubmission(
      { id: session.uid, name: session.name },
      {
        id,
        total_hours: existing.total_hours,
        coverage_start: existing.coverage_start,
        coverage_end: existing.coverage_end,
      }
    );
  } catch (err) {
    console.error("Failed to notify approver of submission:", err);
  }

  return NextResponse.json({ ok: true });
}
