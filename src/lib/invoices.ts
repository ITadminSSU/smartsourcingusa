import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { query, withTransaction } from "./db";
import { decrypt, maskAccount } from "./crypto";
import { initials } from "./portal-auth";
import type { PortalSession } from "./portal-session";

export const BILL_TO_DEFAULT = "SmartSourcing USA, LLC";
export const BANK_FEE_RATE = 0.01;

export type InvoiceType = "hourly" | "monthly";
export type InvoiceStatus = "pending" | "approved" | "paid";

export type InvoiceRecord = {
  id: number;
  invoice_no: string;
  seq: number;
  user_id: number;
  timesheet_id: number | null;
  type: InvoiceType;
  invoice_date: string;
  coverage_start: string | null;
  coverage_end: string | null;
  pay_date: string | null;
  hourly_rate: string | null;
  monthly_rate: string | null;
  overtime_rate: string | null;
  subtotal: string;
  bank_fee: string;
  total_due: string;
  status: InvoiceStatus;
  bill_to: string;
  bank_name_snap: string | null;
  bank_account_snap: string | null;
  created_at: string;
};

export type InvoiceLine = {
  id: number;
  invoice_id: number;
  trade: string | null;
  client: string | null;
  description: string | null;
  hours: string | null;
  rate: string | null;
  amount: string;
  line_type: "regular" | "overtime" | "extra";
};

export type InvoiceSummary = {
  id: number;
  invoice_no: string;
  user_id: number;
  employee_name: string;
  type: InvoiceType;
  invoice_date: string;
  coverage_start: string | null;
  coverage_end: string | null;
  total_due: string;
  status: InvoiceStatus;
};

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

// Mirrors Excel's NETWORKDAYS: inclusive count of weekdays (Mon–Fri) between
// two YYYY-MM-DD dates. Weekends are excluded; holidays are not considered.
function networkDays(start: string, end: string): number {
  const s = new Date(`${start}T00:00:00`);
  const e = new Date(`${end}T00:00:00`);
  if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime()) || e < s) return 0;
  let count = 0;
  const d = new Date(s);
  while (d <= e) {
    const day = d.getDay(); // 0 = Sun, 6 = Sat
    if (day !== 0 && day !== 6) count++;
    d.setDate(d.getDate() + 1);
  }
  return count;
}

export const WORK_HOURS_PER_DAY = 8;

// The per-hour rate used to bill a timesheet. Hourly staff bill their hourly
// rate directly. Monthly staff are paid bi-monthly (twice a month): the monthly
// salary is halved, then spread across the business hours in the pay period:
//   rate = (monthlyRate / 2) / (NETWORKDAYS(start, end) × 8)
// This matches the company invoice spreadsheet's Monthly template.
export function effectiveHourlyRate(
  payType: InvoiceType,
  rates: { hourlyRate: number; monthlyRate: number },
  coverage: { start: string; end: string }
): number {
  if (payType !== "monthly") return rates.hourlyRate;
  const businessHours = networkDays(coverage.start, coverage.end) * WORK_HOURS_PER_DAY;
  if (businessHours <= 0) return 0;
  return (rates.monthlyRate / 2) / businessHours;
}

function buildInvoiceNo(
  name: { first_name: string; middle_name?: string | null; last_name: string },
  year: number,
  seq: number
): string {
  const inits = initials(name) || "XX";
  return `${inits}-${year}-${String(seq).padStart(3, "0")}`;
}

type ComputedLine = {
  trade: string | null;
  client: string | null;
  description: string | null;
  hours: number | null;
  rate: number | null;
  amount: number;
  line_type: "regular" | "overtime" | "extra";
};

// Pulls the bank snapshot (name + masked account) for the invoice. Never throws:
// if encryption isn't set up or no bank info exists, returns nulls.
async function bankSnapshot(
  userId: number
): Promise<{ name: string | null; account: string | null }> {
  try {
    const rows = await query<{
      bank_name_enc: string | null;
      bank_account_enc: string | null;
    }>(
      "SELECT bank_name_enc, bank_account_enc FROM employee_profiles WHERE user_id = :id LIMIT 1",
      { id: userId }
    );
    const row = rows[0];
    if (!row || !row.bank_name_enc || !row.bank_account_enc) {
      return { name: null, account: null };
    }
    return {
      name: decrypt(row.bank_name_enc),
      account: maskAccount(decrypt(row.bank_account_enc)),
    };
  } catch {
    return { name: null, account: null };
  }
}

export async function getInvoiceByTimesheet(
  timesheetId: number
): Promise<InvoiceRecord | null> {
  const rows = await query<InvoiceRecord>(
    `${INVOICE_SELECT} WHERE timesheet_id = :id LIMIT 1`,
    { id: timesheetId }
  );
  return rows[0] ?? null;
}

// Generates (once) the computed invoice for an approved timesheet. Idempotent:
// if an invoice already exists for the timesheet it is returned as-is.
export async function generateInvoiceForTimesheet(
  timesheetId: number
): Promise<InvoiceRecord> {
  const existing = await getInvoiceByTimesheet(timesheetId);
  if (existing) return existing;

  const tsRows = await query<{
    id: number;
    user_id: number;
    coverage_start: string;
    coverage_end: string;
    total_hours: string;
  }>(
    `SELECT id, user_id,
       DATE_FORMAT(coverage_start, '%Y-%m-%d') AS coverage_start,
       DATE_FORMAT(coverage_end, '%Y-%m-%d') AS coverage_end,
       total_hours
     FROM timesheets WHERE id = :id LIMIT 1`,
    { id: timesheetId }
  );
  const ts = tsRows[0];
  if (!ts) throw new Error("Timesheet not found.");

  const userRows = await query<{
    id: number;
    first_name: string;
    middle_name: string | null;
    last_name: string;
  }>(
    "SELECT id, first_name, middle_name, last_name FROM portal_users WHERE id = :id LIMIT 1",
    { id: ts.user_id }
  );
  const user = userRows[0];
  if (!user) throw new Error("Employee not found.");

  const profRows = await query<{
    pay_type: InvoiceType;
    hourly_rate: string | null;
    monthly_rate: string | null;
    overtime_rate: string | null;
  }>(
    "SELECT pay_type, hourly_rate, monthly_rate, overtime_rate FROM employee_profiles WHERE user_id = :id LIMIT 1",
    { id: ts.user_id }
  );
  const profile = profRows[0];
  const payType: InvoiceType = profile?.pay_type === "monthly" ? "monthly" : "hourly";
  const hourlyRate = profile?.hourly_rate != null ? Number(profile.hourly_rate) : 0;
  const monthlyRate = profile?.monthly_rate != null ? Number(profile.monthly_rate) : 0;
  const overtimeRate = profile?.overtime_rate != null ? Number(profile.overtime_rate) : 0;

  // Per-hour rate to bill. For monthly staff this is the bi-monthly derived
  // rate: (monthlyRate / 2) / (businessDays × 8). For hourly staff it's their
  // hourly rate. Worked hours come from the submitted timesheet either way.
  const rate = effectiveHourlyRate(
    payType,
    { hourlyRate, monthlyRate },
    { start: ts.coverage_start, end: ts.coverage_end }
  );

  // Aggregate submitted entry hours by trade + client, then bill hours × rate.
  const entries = await query<{
    trade: string | null;
    client: string | null;
    hours: string;
  }>(
    "SELECT trade, client, hours FROM timesheet_entries WHERE timesheet_id = :id",
    { id: timesheetId }
  );
  const groups = new Map<string, { trade: string | null; client: string | null; hours: number }>();
  for (const e of entries) {
    const key = `${e.trade ?? ""}|${e.client ?? ""}`;
    const g = groups.get(key) ?? { trade: e.trade, client: e.client, hours: 0 };
    g.hours += Number(e.hours) || 0;
    groups.set(key, g);
  }
  if (groups.size === 0) {
    // Fall back to the timesheet total if there were no itemized entries.
    groups.set("|", { trade: null, client: null, hours: Number(ts.total_hours) || 0 });
  }

  const lines: ComputedLine[] = [];
  for (const g of groups.values()) {
    lines.push({
      trade: g.trade,
      client: g.client,
      description: payType === "monthly" ? "Service Payment" : "Professional services",
      hours: round2(g.hours),
      rate,
      amount: round2(g.hours * rate),
      line_type: "regular",
    });
  }

  const subtotal = round2(lines.reduce((sum, l) => sum + l.amount, 0));
  const bankFee = round2(subtotal * BANK_FEE_RATE);
  const totalDue = round2(subtotal + bankFee);

  const now = new Date();
  const invoiceDate = now.toISOString().slice(0, 10);
  const year = now.getFullYear();

  const snap = await bankSnapshot(ts.user_id);

  const newId = await withTransaction(async (conn) => {
    // Atomically allocate this employee's next lifetime invoice number.
    await conn.execute(
      "UPDATE portal_users SET invoice_seq = invoice_seq + 1 WHERE id = :id",
      { id: ts.user_id }
    );
    const [seqRows] = await conn.execute(
      "SELECT invoice_seq AS seq FROM portal_users WHERE id = :id LIMIT 1",
      { id: ts.user_id }
    );
    const seq = Number((seqRows as RowDataPacket[])[0]?.seq ?? 0);
    const invoiceNo = buildInvoiceNo(user, year, seq);

    const [res] = await conn.execute(
      `INSERT INTO invoices
         (invoice_no, seq, user_id, timesheet_id, type, invoice_date,
          coverage_start, coverage_end, hourly_rate, monthly_rate, overtime_rate,
          subtotal, bank_fee, total_due, status, bill_to, bank_name_snap, bank_account_snap)
       VALUES
         (:invoice_no, :seq, :user_id, :timesheet_id, :type, :invoice_date,
          :coverage_start, :coverage_end, :hourly_rate, :monthly_rate, :overtime_rate,
          :subtotal, :bank_fee, :total_due, 'pending', :bill_to, :bank_name_snap, :bank_account_snap)`,
      {
        invoice_no: invoiceNo,
        seq,
        user_id: ts.user_id,
        timesheet_id: timesheetId,
        type: payType,
        invoice_date: invoiceDate,
        coverage_start: ts.coverage_start,
        coverage_end: ts.coverage_end,
        hourly_rate: payType === "hourly" ? hourlyRate : round2(rate),
        monthly_rate: payType === "monthly" ? monthlyRate : null,
        overtime_rate: payType === "monthly" ? overtimeRate : null,
        subtotal,
        bank_fee: bankFee,
        total_due: totalDue,
        bill_to: BILL_TO_DEFAULT,
        bank_name_snap: snap.name,
        bank_account_snap: snap.account,
      }
    );
    const invoiceId = (res as ResultSetHeader).insertId;

    for (const l of lines) {
      await conn.execute(
        `INSERT INTO invoice_lines
           (invoice_id, trade, client, description, hours, rate, amount, line_type)
         VALUES
           (:invoice_id, :trade, :client, :description, :hours, :rate, :amount, :line_type)`,
        {
          invoice_id: invoiceId,
          trade: l.trade,
          client: l.client,
          description: l.description,
          hours: l.hours,
          rate: l.rate,
          amount: l.amount,
          line_type: l.line_type,
        }
      );
    }

    return invoiceId;
  });

  const created = await getInvoice(newId);
  if (!created) throw new Error("Failed to load the generated invoice.");
  return created;
}

const INVOICE_SELECT = `
  SELECT
    id, invoice_no, seq, user_id, timesheet_id, type,
    DATE_FORMAT(invoice_date, '%Y-%m-%d') AS invoice_date,
    DATE_FORMAT(coverage_start, '%Y-%m-%d') AS coverage_start,
    DATE_FORMAT(coverage_end, '%Y-%m-%d') AS coverage_end,
    DATE_FORMAT(pay_date, '%Y-%m-%d') AS pay_date,
    hourly_rate, monthly_rate, overtime_rate,
    subtotal, bank_fee, total_due, status, bill_to,
    bank_name_snap, bank_account_snap,
    DATE_FORMAT(created_at, '%Y-%m-%d %H:%i') AS created_at
  FROM invoices
`;

export async function getInvoice(id: number): Promise<InvoiceRecord | null> {
  const rows = await query<InvoiceRecord>(`${INVOICE_SELECT} WHERE id = :id LIMIT 1`, {
    id,
  });
  return rows[0] ?? null;
}

export async function getInvoiceLines(invoiceId: number): Promise<InvoiceLine[]> {
  return query<InvoiceLine>(
    `SELECT id, invoice_id, trade, client, description, hours, rate, amount, line_type
     FROM invoice_lines WHERE invoice_id = :id ORDER BY id ASC`,
    { id: invoiceId }
  );
}

const SUMMARY_SELECT = `
  SELECT
    i.id, i.invoice_no, i.user_id,
    TRIM(CONCAT_WS(' ', u.first_name, u.middle_name, u.last_name)) AS employee_name,
    i.type,
    DATE_FORMAT(i.invoice_date, '%Y-%m-%d') AS invoice_date,
    DATE_FORMAT(i.coverage_start, '%Y-%m-%d') AS coverage_start,
    DATE_FORMAT(i.coverage_end, '%Y-%m-%d') AS coverage_end,
    i.total_due, i.status
  FROM invoices i
  JOIN portal_users u ON u.id = i.user_id
`;

export async function listInvoicesForUser(
  userId: number
): Promise<InvoiceSummary[]> {
  return query<InvoiceSummary>(
    `${SUMMARY_SELECT} WHERE i.user_id = :uid ORDER BY i.invoice_date DESC, i.id DESC`,
    { uid: userId }
  );
}

export async function listAllInvoices(): Promise<InvoiceSummary[]> {
  return query<InvoiceSummary>(
    `${SUMMARY_SELECT} ORDER BY i.invoice_date DESC, i.id DESC`
  );
}

function canSeeAllInvoices(session: PortalSession): boolean {
  return session.role === "accounting" || session.role === "hr_admin";
}

// Returns the invoice only if this user is allowed to view it (owner, or
// accounting/hr_admin). Leads/others get null.
export async function getInvoiceForViewer(
  id: number,
  session: PortalSession
): Promise<InvoiceRecord | null> {
  const invoice = await getInvoice(id);
  if (!invoice) return null;
  if (invoice.user_id === session.uid) return invoice;
  if (canSeeAllInvoices(session)) return invoice;
  return null;
}

// Accounting/HR mark an invoice paid (records the pay date as today).
export async function markInvoicePaid(id: number): Promise<void> {
  await query(
    "UPDATE invoices SET status = 'paid', pay_date = COALESCE(pay_date, CURDATE()) WHERE id = :id",
    { id }
  );
}

// ===========================================================================
// Payroll rollup (accounting/hr_admin) — aggregate invoices over a date range.
// ===========================================================================

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export type RollupFilters = {
  from?: string | null;
  to?: string | null;
  // Free-form input; normalized via cleanStatus (anything invalid → "all").
  status?: string | null;
};

export type PayrollRow = {
  id: number;
  invoice_no: string;
  employee_name: string;
  type: InvoiceType;
  invoice_date: string;
  coverage_start: string | null;
  coverage_end: string | null;
  pay_date: string | null;
  hours: string | null;
  subtotal: string;
  bank_fee: string;
  total_due: string;
  status: InvoiceStatus;
  bank_name_snap: string | null;
  bank_account_snap: string | null;
};

export type PayrollRollup = {
  rows: PayrollRow[];
  totals: { count: number; hours: number; subtotal: number; bankFee: number; totalDue: number };
  filters: { from: string | null; to: string | null; status: InvoiceStatus | "all" };
};

function cleanDate(value?: string | null): string | null {
  if (value && DATE_RE.test(value)) return value;
  return null;
}

function cleanStatus(value?: string | null): InvoiceStatus | "all" {
  return value === "pending" || value === "approved" || value === "paid" ? value : "all";
}

export async function getPayrollRollup(
  filters: RollupFilters
): Promise<PayrollRollup> {
  const from = cleanDate(filters.from);
  const to = cleanDate(filters.to);
  const status = cleanStatus(filters.status);

  const where: string[] = [];
  const params: Record<string, unknown> = {};
  if (from) {
    where.push("i.invoice_date >= :from");
    params.from = from;
  }
  if (to) {
    where.push("i.invoice_date <= :to");
    params.to = to;
  }
  if (status !== "all") {
    where.push("i.status = :status");
    params.status = status;
  }
  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const rows = await query<PayrollRow>(
    `SELECT
       i.id, i.invoice_no,
       TRIM(CONCAT_WS(' ', u.first_name, u.middle_name, u.last_name)) AS employee_name,
       i.type,
       DATE_FORMAT(i.invoice_date, '%Y-%m-%d') AS invoice_date,
       DATE_FORMAT(i.coverage_start, '%Y-%m-%d') AS coverage_start,
       DATE_FORMAT(i.coverage_end, '%Y-%m-%d') AS coverage_end,
       DATE_FORMAT(i.pay_date, '%Y-%m-%d') AS pay_date,
       (SELECT COALESCE(SUM(li.hours), 0) FROM invoice_lines li WHERE li.invoice_id = i.id) AS hours,
       i.subtotal, i.bank_fee, i.total_due, i.status,
       i.bank_name_snap, i.bank_account_snap
     FROM invoices i
     JOIN portal_users u ON u.id = i.user_id
     ${whereSql}
     ORDER BY i.invoice_date DESC, i.id DESC`,
    params
  );

  const totals = rows.reduce(
    (acc, r) => {
      acc.count += 1;
      acc.hours += Number(r.hours) || 0;
      acc.subtotal += Number(r.subtotal) || 0;
      acc.bankFee += Number(r.bank_fee) || 0;
      acc.totalDue += Number(r.total_due) || 0;
      return acc;
    },
    { count: 0, hours: 0, subtotal: 0, bankFee: 0, totalDue: 0 }
  );

  return { rows, totals, filters: { from, to, status } };
}

function csvCell(value: unknown): string {
  const s = value == null ? "" : String(value);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

// Builds a CSV string from a rollup. Uses the MASKED account snapshot so the
// export never leaks full bank numbers into a spreadsheet.
export function rollupToCsv(rollup: PayrollRollup): string {
  const header = [
    "Invoice #",
    "Employee",
    "Type",
    "Invoice Date",
    "Coverage Start",
    "Coverage End",
    "Pay Date",
    "Hours",
    "Subtotal",
    "Bank Fee (1%)",
    "Total Due",
    "Status",
    "Bank Name",
    "Account",
  ];
  const lines = [header.map(csvCell).join(",")];

  for (const r of rollup.rows) {
    lines.push(
      [
        r.invoice_no,
        r.employee_name,
        r.type,
        r.invoice_date,
        r.coverage_start ?? "",
        r.coverage_end ?? "",
        r.pay_date ?? "",
        Number(r.hours ?? 0).toFixed(2),
        Number(r.subtotal).toFixed(2),
        Number(r.bank_fee).toFixed(2),
        Number(r.total_due).toFixed(2),
        r.status,
        r.bank_name_snap ?? "",
        r.bank_account_snap ?? "",
      ]
        .map(csvCell)
        .join(",")
    );
  }

  const t = rollup.totals;
  lines.push(
    [
      "TOTAL",
      `${t.count} invoice(s)`,
      "",
      "",
      "",
      "",
      "",
      t.hours.toFixed(2),
      t.subtotal.toFixed(2),
      t.bankFee.toFixed(2),
      t.totalDue.toFixed(2),
      "",
      "",
      "",
    ]
      .map(csvCell)
      .join(",")
  );

  return lines.join("\r\n");
}
