import { NextResponse } from "next/server";
import { logActivity } from "@/lib/auth";
import { getCurrentPortalUser } from "@/lib/portal-auth";
import {
  createTimesheet,
  listTimesheetsForUser,
  parseTimesheetInput,
} from "@/lib/timesheets";

export const runtime = "nodejs";

export async function GET() {
  const session = await getCurrentPortalUser();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const timesheets = await listTimesheetsForUser(session.uid);
  return NextResponse.json({ timesheets });
}

export async function POST(request: Request) {
  const session = await getCurrentPortalUser();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const parsed = parseTimesheetInput(await request.json());
    if (!parsed.data) return NextResponse.json({ error: parsed.error }, { status: 400 });

    const id = await createTimesheet(session.uid, parsed.data);
    await logActivity(
      session,
      "timesheet_created",
      `Created timesheet #${id} (${parsed.data.coverageStart} to ${parsed.data.coverageEnd})`
    );
    return NextResponse.json({ ok: true, id });
  } catch (err) {
    console.error("Create timesheet error:", err);
    return NextResponse.json({ error: "Unable to save timesheet. Please try again." }, { status: 500 });
  }
}
