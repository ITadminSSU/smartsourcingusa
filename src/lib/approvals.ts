import { query } from "./db";
import { logActivity } from "./auth";
import { sendNotificationEmail, buildEmailBody, fieldRow } from "./email";
import type { PortalSession, PortalRole } from "./portal-session";
import {
  approveTimesheet,
  getTimesheetRecord,
  markTimesheetInvoiced,
  rejectTimesheet,
  type TimesheetRecord,
  type TimesheetStatus,
} from "./timesheets";
import { generateInvoiceForTimesheet } from "./invoices";

// Roles that can review/approve at all.
export function canReviewAtAll(role: PortalRole): boolean {
  return role === "lead" || role === "accounting" || role === "hr_admin";
}

// Accounting/HR see and can act on every submitted timesheet; a lead only sees
// the people who report to them.
function reviewsEverything(role: PortalRole): boolean {
  return role === "accounting" || role === "hr_admin";
}

const APP_URL = (
  process.env.NEXT_PUBLIC_APP_URL ??
  process.env.APP_URL ??
  ""
).replace(/\/$/, "");

function portalLink(path: string): string {
  return APP_URL ? `${APP_URL}${path}` : path;
}

export type ReviewItem = {
  id: number;
  user_id: number;
  employee_name: string;
  coverage_start: string;
  coverage_end: string;
  status: TimesheetStatus;
  total_hours: string;
  submitted_at: string | null;
  entry_count: number;
  lead_user_id: number | null;
  lead_name: string | null;
};

const REVIEW_SELECT = `
  SELECT
    t.id, t.user_id,
    TRIM(CONCAT_WS(' ', u.first_name, u.middle_name, u.last_name)) AS employee_name,
    DATE_FORMAT(t.coverage_start, '%Y-%m-%d') AS coverage_start,
    DATE_FORMAT(t.coverage_end, '%Y-%m-%d') AS coverage_end,
    t.status, t.total_hours,
    DATE_FORMAT(t.submitted_at, '%Y-%m-%d %H:%i') AS submitted_at,
    (SELECT COUNT(*) FROM timesheet_entries e WHERE e.timesheet_id = t.id) AS entry_count,
    p.lead_user_id,
    TRIM(CONCAT_WS(' ', l.first_name, l.middle_name, l.last_name)) AS lead_name
  FROM timesheets t
  JOIN portal_users u ON u.id = t.user_id
  LEFT JOIN employee_profiles p ON p.user_id = t.user_id
  LEFT JOIN portal_users l ON l.id = p.lead_user_id
`;

// The pending queue for the signed-in reviewer (only "submitted" timesheets).
export async function listReviewQueue(
  session: PortalSession
): Promise<ReviewItem[]> {
  if (!canReviewAtAll(session.role)) return [];

  if (reviewsEverything(session.role)) {
    return query<ReviewItem>(
      `${REVIEW_SELECT}
       WHERE t.status = 'submitted'
       ORDER BY t.submitted_at ASC, t.id ASC`
    );
  }

  // Plain lead: only their direct reports.
  return query<ReviewItem>(
    `${REVIEW_SELECT}
     WHERE t.status = 'submitted' AND p.lead_user_id = :uid
     ORDER BY t.submitted_at ASC, t.id ASC`,
    { uid: session.uid }
  );
}

export async function countReviewQueue(
  session: PortalSession
): Promise<number> {
  if (!canReviewAtAll(session.role)) return 0;

  if (reviewsEverything(session.role)) {
    const rows = await query<{ count: number }>(
      "SELECT COUNT(*) AS count FROM timesheets WHERE status = 'submitted'"
    );
    return Number(rows[0]?.count ?? 0);
  }

  const rows = await query<{ count: number }>(
    `SELECT COUNT(*) AS count
     FROM timesheets t
     JOIN employee_profiles p ON p.user_id = t.user_id
     WHERE t.status = 'submitted' AND p.lead_user_id = :uid`,
    { uid: session.uid }
  );
  return Number(rows[0]?.count ?? 0);
}

export type ReviewContext = {
  record: TimesheetRecord;
  employee: { id: number; name: string; email: string };
  leadUserId: number | null;
};

export async function getReviewContext(
  id: number
): Promise<ReviewContext | null> {
  const record = await getTimesheetRecord(id);
  if (!record) return null;

  const rows = await query<{
    id: number;
    email: string;
    first_name: string;
    middle_name: string | null;
    last_name: string;
    lead_user_id: number | null;
  }>(
    `SELECT u.id, u.email, u.first_name, u.middle_name, u.last_name, p.lead_user_id
     FROM portal_users u
     LEFT JOIN employee_profiles p ON p.user_id = u.id
     WHERE u.id = :id LIMIT 1`,
    { id: record.user_id }
  );
  const u = rows[0];
  if (!u) return null;

  const name = [u.first_name, u.middle_name, u.last_name]
    .filter((p) => p && String(p).trim().length > 0)
    .join(" ");

  return {
    record,
    employee: { id: u.id, name, email: u.email },
    leadUserId: u.lead_user_id,
  };
}

// Whether this reviewer is allowed to act on this specific timesheet.
export function canReview(session: PortalSession, ctx: ReviewContext): boolean {
  if (ctx.record.status !== "submitted") return false;
  if (reviewsEverything(session.role)) return true;
  if (session.role === "lead" && ctx.leadUserId === session.uid) return true;
  return false;
}

// Email addresses that should be notified when a given employee submits.
// Routes to their lead when set, otherwise to all active accounting/hr_admin.
async function approverEmailsForEmployee(employeeId: number): Promise<string[]> {
  const leadRows = await query<{ email: string }>(
    `SELECT l.email
     FROM employee_profiles p
     JOIN portal_users l ON l.id = p.lead_user_id
     WHERE p.user_id = :id AND l.active = 1
     LIMIT 1`,
    { id: employeeId }
  );
  if (leadRows[0]?.email) return [leadRows[0].email];

  const acct = await query<{ email: string }>(
    `SELECT email FROM portal_users
     WHERE role IN ('accounting', 'hr_admin') AND active = 1`
  );
  return acct.map((r) => r.email).filter(Boolean);
}

// Notify the right approver(s) that a timesheet is waiting for review.
export async function notifySubmission(
  employee: { id: number; name: string },
  record: { id: number; total_hours: string; coverage_start: string; coverage_end: string }
): Promise<void> {
  const recipients = await approverEmailsForEmployee(employee.id);
  if (recipients.length === 0) return;

  const link = portalLink(`/portal/approvals/${record.id}`);
  const html = buildEmailBody("Timesheet awaiting your review", [
    fieldRow("Employee", employee.name),
    fieldRow("Coverage", `${record.coverage_start} → ${record.coverage_end}`),
    fieldRow("Total hours", String(record.total_hours)),
    fieldRow("Review link", link),
  ].join(""));
  const text =
    `${employee.name} submitted a timesheet for review.\n` +
    `Coverage: ${record.coverage_start} to ${record.coverage_end}\n` +
    `Total hours: ${record.total_hours}\n` +
    `Review: ${link}`;

  await sendNotificationEmail({
    to: recipients,
    subject: `Timesheet to review — ${employee.name}`,
    html,
    text,
  });
}

// Approve and notify the employee. Caller must have already passed canReview().
export async function approveAndNotify(
  session: PortalSession,
  ctx: ReviewContext
): Promise<void> {
  await approveTimesheet(ctx.record.id, session.uid);

  // Approval auto-generates the computed invoice and flips the timesheet to
  // "invoiced". If invoice generation hiccups, the approval still stands.
  let invoiceNo: string | null = null;
  let invoiceId: number | null = null;
  try {
    const invoice = await generateInvoiceForTimesheet(ctx.record.id);
    invoiceNo = invoice.invoice_no;
    invoiceId = invoice.id;
    await markTimesheetInvoiced(ctx.record.id);
  } catch (err) {
    console.error("Invoice generation failed after approval:", err);
  }

  await logActivity(
    session,
    "timesheet_approved",
    `Approved timesheet #${ctx.record.id} for ${ctx.employee.name} (${ctx.record.total_hours} hrs)` +
      (invoiceNo ? ` → invoice ${invoiceNo}` : "")
  );

  const link = portalLink(
    invoiceId ? `/portal/invoices/${invoiceId}` : `/portal/timesheets/${ctx.record.id}`
  );
  const html = buildEmailBody("Your timesheet was approved", [
    fieldRow("Coverage", `${ctx.record.coverage_start} → ${ctx.record.coverage_end}`),
    fieldRow("Total hours", String(ctx.record.total_hours)),
    fieldRow("Approved by", session.name),
    invoiceNo ? fieldRow("Invoice", invoiceNo) : "",
    fieldRow("View", link),
  ].join(""));
  const text =
    `Your timesheet (${ctx.record.coverage_start} to ${ctx.record.coverage_end}, ` +
    `${ctx.record.total_hours} hrs) was approved by ${session.name}.` +
    (invoiceNo ? `\nInvoice: ${invoiceNo}` : "") +
    `\n${link}`;

  await sendNotificationEmail({
    to: ctx.employee.email,
    subject: "Your timesheet was approved",
    html,
    text,
  });
}

// Send back to the employee with a reason, and notify them.
export async function rejectAndNotify(
  session: PortalSession,
  ctx: ReviewContext,
  notes: string
): Promise<void> {
  await rejectTimesheet(ctx.record.id, session.uid, notes);
  await logActivity(
    session,
    "timesheet_rejected",
    `Sent back timesheet #${ctx.record.id} for ${ctx.employee.name}: ${notes}`
  );

  const link = portalLink(`/portal/timesheets/${ctx.record.id}`);
  const html = buildEmailBody("Your timesheet was sent back", [
    fieldRow("Coverage", `${ctx.record.coverage_start} → ${ctx.record.coverage_end}`),
    fieldRow("Reviewer", session.name),
    fieldRow("Reason", notes),
    fieldRow("Fix & resubmit", link),
  ].join(""));
  const text =
    `Your timesheet (${ctx.record.coverage_start} to ${ctx.record.coverage_end}) ` +
    `was sent back by ${session.name}.\nReason: ${notes}\nFix and resubmit: ${link}`;

  await sendNotificationEmail({
    to: ctx.employee.email,
    subject: "Your timesheet needs changes",
    html,
    text,
  });
}
