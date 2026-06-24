import { insert, query } from "./db";

export type TimesheetStatus =
  | "draft"
  | "submitted"
  | "lead_approved"
  | "approved"
  | "rejected"
  | "invoiced";

// Employees can only edit a timesheet that is a draft or was sent back (rejected).
export const EDITABLE_STATUSES: TimesheetStatus[] = ["draft", "rejected"];

export function isEditable(status: TimesheetStatus): boolean {
  return EDITABLE_STATUSES.includes(status);
}

export type TimesheetSummary = {
  id: number;
  user_id: number;
  coverage_start: string;
  coverage_end: string;
  status: TimesheetStatus;
  total_hours: string;
  submitted_at: string | null;
  review_notes: string | null;
  created_at: string;
  entry_count: number;
};

export type TimesheetRecord = {
  id: number;
  user_id: number;
  coverage_start: string;
  coverage_end: string;
  status: TimesheetStatus;
  total_hours: string;
  notes: string | null;
  submitted_at: string | null;
  reviewed_by: number | null;
  reviewed_at: string | null;
  review_notes: string | null;
  created_at: string;
};

export type TimesheetEntry = {
  id: number;
  timesheet_id: number;
  work_date: string;
  start_mst: string | null;
  end_mst: string | null;
  start_ph: string | null;
  end_ph: string | null;
  trade: string | null;
  client: string | null;
  hours: string;
  activity: string | null;
};

export type EntryInput = {
  work_date: string;
  start_mst?: string | null;
  end_mst?: string | null;
  start_ph?: string | null;
  end_ph?: string | null;
  trade?: string | null;
  client?: string | null;
  hours: number;
  activity?: string | null;
};

export type TimesheetInput = {
  coverageStart: string;
  coverageEnd: string;
  notes?: string | null;
  entries: EntryInput[];
};

export async function listTimesheetsForUser(
  userId: number
): Promise<TimesheetSummary[]> {
  return query<TimesheetSummary>(
    `SELECT
       t.id, t.user_id,
       DATE_FORMAT(t.coverage_start, '%Y-%m-%d') AS coverage_start,
       DATE_FORMAT(t.coverage_end, '%Y-%m-%d') AS coverage_end,
       t.status, t.total_hours,
       DATE_FORMAT(t.submitted_at, '%Y-%m-%d %H:%i') AS submitted_at,
       t.review_notes,
       DATE_FORMAT(t.created_at, '%Y-%m-%d') AS created_at,
       (SELECT COUNT(*) FROM timesheet_entries e WHERE e.timesheet_id = t.id) AS entry_count
     FROM timesheets t
     WHERE t.user_id = :uid
     ORDER BY t.coverage_start DESC, t.id DESC`,
    { uid: userId }
  );
}

export async function getTimesheetRecord(
  id: number
): Promise<TimesheetRecord | null> {
  const rows = await query<TimesheetRecord>(
    `SELECT
       id, user_id,
       DATE_FORMAT(coverage_start, '%Y-%m-%d') AS coverage_start,
       DATE_FORMAT(coverage_end, '%Y-%m-%d') AS coverage_end,
       status, total_hours, notes,
       DATE_FORMAT(submitted_at, '%Y-%m-%d %H:%i') AS submitted_at,
       reviewed_by,
       DATE_FORMAT(reviewed_at, '%Y-%m-%d %H:%i') AS reviewed_at,
       review_notes,
       DATE_FORMAT(created_at, '%Y-%m-%d') AS created_at
     FROM timesheets WHERE id = :id LIMIT 1`,
    { id }
  );
  return rows[0] ?? null;
}

export async function getTimesheetEntries(
  timesheetId: number
): Promise<TimesheetEntry[]> {
  return query<TimesheetEntry>(
    `SELECT id, timesheet_id,
       DATE_FORMAT(work_date, '%Y-%m-%d') AS work_date,
       start_mst, end_mst, start_ph, end_ph, trade, client, hours, activity
     FROM timesheet_entries
     WHERE timesheet_id = :id
     ORDER BY work_date ASC, id ASC`,
    { id: timesheetId }
  );
}

async function insertEntries(
  timesheetId: number,
  entries: EntryInput[]
): Promise<void> {
  for (const e of entries) {
    await query(
      `INSERT INTO timesheet_entries
         (timesheet_id, work_date, start_mst, end_mst, start_ph, end_ph, trade, client, hours, activity)
       VALUES
         (:timesheet_id, :work_date, :start_mst, :end_mst, :start_ph, :end_ph, :trade, :client, :hours, :activity)`,
      {
        timesheet_id: timesheetId,
        work_date: e.work_date,
        start_mst: e.start_mst?.trim() || null,
        end_mst: e.end_mst?.trim() || null,
        start_ph: e.start_ph?.trim() || null,
        end_ph: e.end_ph?.trim() || null,
        trade: e.trade?.trim() || null,
        client: e.client?.trim() || null,
        hours: Number.isFinite(e.hours) ? e.hours : 0,
        activity: e.activity?.trim() || null,
      }
    );
  }
}

async function recomputeTotal(timesheetId: number): Promise<void> {
  await query(
    `UPDATE timesheets
       SET total_hours = (SELECT COALESCE(SUM(hours), 0) FROM timesheet_entries WHERE timesheet_id = :id)
     WHERE id = :id`,
    { id: timesheetId }
  );
}

export async function createTimesheet(
  userId: number,
  data: TimesheetInput
): Promise<number> {
  const id = await insert(
    `INSERT INTO timesheets (user_id, coverage_start, coverage_end, notes, status)
     VALUES (:uid, :cs, :ce, :notes, 'draft')`,
    {
      uid: userId,
      cs: data.coverageStart,
      ce: data.coverageEnd,
      notes: data.notes?.trim() || null,
    }
  );
  await insertEntries(id, data.entries);
  await recomputeTotal(id);
  return id;
}

export async function updateTimesheet(
  id: number,
  data: TimesheetInput
): Promise<void> {
  await query(
    `UPDATE timesheets
       SET coverage_start = :cs, coverage_end = :ce, notes = :notes, status = 'draft',
           review_notes = NULL
     WHERE id = :id`,
    {
      id,
      cs: data.coverageStart,
      ce: data.coverageEnd,
      notes: data.notes?.trim() || null,
    }
  );
  await query("DELETE FROM timesheet_entries WHERE timesheet_id = :id", { id });
  await insertEntries(id, data.entries);
  await recomputeTotal(id);
}

export async function submitTimesheet(id: number): Promise<void> {
  await query(
    "UPDATE timesheets SET status = 'submitted', submitted_at = NOW() WHERE id = :id",
    { id }
  );
}

export async function deleteTimesheet(id: number): Promise<void> {
  await query("DELETE FROM timesheets WHERE id = :id", { id });
}

// A submitted timesheet is the only state a reviewer can act on.
export function isReviewable(status: TimesheetStatus): boolean {
  return status === "submitted";
}

// Single-step approval: a lead (for their team) or accounting/hr_admin marks the
// timesheet approved outright. Clears any prior "sent back" note.
export async function approveTimesheet(
  id: number,
  reviewerId: number
): Promise<void> {
  await query(
    `UPDATE timesheets
       SET status = 'approved', reviewed_by = :rid, reviewed_at = NOW(), review_notes = NULL
     WHERE id = :id`,
    { id, rid: reviewerId }
  );
}

// Marks an approved timesheet as invoiced once its invoice has been generated.
export async function markTimesheetInvoiced(id: number): Promise<void> {
  await query("UPDATE timesheets SET status = 'invoiced' WHERE id = :id", { id });
}

// Send a timesheet back to the employee with a required reason.
export async function rejectTimesheet(
  id: number,
  reviewerId: number,
  notes: string
): Promise<void> {
  await query(
    `UPDATE timesheets
       SET status = 'rejected', reviewed_by = :rid, reviewed_at = NOW(), review_notes = :notes
     WHERE id = :id`,
    { id, rid: reviewerId, notes }
  );
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function str(value: unknown): string | null {
  if (value === undefined || value === null) return null;
  const s = String(value).trim();
  return s.length ? s : null;
}

// Validates and normalizes a request body into a TimesheetInput.
export function parseTimesheetInput(
  body: unknown
): { data: TimesheetInput; error?: undefined } | { data?: undefined; error: string } {
  const b = (body ?? {}) as Record<string, unknown>;
  const coverageStart = str(b.coverageStart);
  const coverageEnd = str(b.coverageEnd);

  if (!coverageStart || !coverageEnd) {
    return { error: "Coverage start and end dates are required." };
  }
  if (!DATE_RE.test(coverageStart) || !DATE_RE.test(coverageEnd)) {
    return { error: "Coverage dates must be valid dates." };
  }
  if (coverageEnd < coverageStart) {
    return { error: "Coverage end date cannot be before the start date." };
  }

  const rawEntries = Array.isArray(b.entries) ? b.entries : [];
  const entries: EntryInput[] = [];

  for (let i = 0; i < rawEntries.length; i++) {
    const r = (rawEntries[i] ?? {}) as Record<string, unknown>;
    const work_date = str(r.work_date);
    // Skip fully empty rows.
    const hasAnything =
      work_date ||
      str(r.start_mst) ||
      str(r.end_mst) ||
      str(r.start_ph) ||
      str(r.end_ph) ||
      str(r.trade) ||
      str(r.client) ||
      str(r.activity) ||
      (r.hours !== undefined && r.hours !== null && String(r.hours).trim() !== "");
    if (!hasAnything) continue;

    if (!work_date || !DATE_RE.test(work_date)) {
      return { error: `Row ${i + 1}: a valid work date is required.` };
    }
    const hoursNum = Number(r.hours);
    if (!Number.isFinite(hoursNum) || hoursNum < 0) {
      return { error: `Row ${i + 1}: hours must be 0 or more.` };
    }

    entries.push({
      work_date,
      start_mst: str(r.start_mst),
      end_mst: str(r.end_mst),
      start_ph: str(r.start_ph),
      end_ph: str(r.end_ph),
      trade: str(r.trade),
      client: str(r.client),
      hours: hoursNum,
      activity: str(r.activity),
    });
  }

  return { data: { coverageStart, coverageEnd, notes: str(b.notes), entries } };
}
