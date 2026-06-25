import { NextResponse } from "next/server";
import { logActivity } from "@/lib/auth";
import { getCurrentPortalUser } from "@/lib/portal-auth";
import {
  deleteTimesheet,
  getTimesheetEntries,
  getTimesheetRecord,
  isEditable,
  parseTimesheetInput,
  updateTimesheet,
} from "@/lib/timesheets";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_request: Request, ctx: Ctx) {
  const session = await getCurrentPortalUser();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = Number((await ctx.params).id);
  const timesheet = await getTimesheetRecord(id);
  if (!timesheet) return NextResponse.json({ error: "Not found." }, { status: 404 });
  if (timesheet.user_id !== session.uid) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const entries = await getTimesheetEntries(id);
  return NextResponse.json({ timesheet, entries });
}

export async function PUT(request: Request, ctx: Ctx) {
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
      { error: "This timesheet can no longer be edited." },
      { status: 409 }
    );
  }

  try {
    const parsed = parseTimesheetInput(await request.json());
    if (!parsed.data) return NextResponse.json({ error: parsed.error }, { status: 400 });

    await updateTimesheet(id, parsed.data);
    await logActivity(session, "timesheet_updated", `Updated timesheet #${id}`);
    return NextResponse.json({ ok: true, id });
  } catch (err) {
    console.error("Update timesheet error:", err);
    return NextResponse.json({ error: "Unable to save timesheet. Please try again." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, ctx: Ctx) {
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
      { error: "Only draft timesheets can be deleted." },
      { status: 409 }
    );
  }

  await deleteTimesheet(id);
  await logActivity(session, "timesheet_deleted", `Deleted timesheet #${id}`);
  return NextResponse.json({ ok: true });
}
