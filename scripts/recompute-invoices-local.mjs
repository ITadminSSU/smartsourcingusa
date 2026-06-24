// One-off maintenance: recompute existing invoices in the LOCAL MySQL DB using
// the current payroll formula (bi-monthly derived rate for monthly staff,
// hourly rate for hourly staff). Rebuilds invoice_lines from the linked
// timesheet's entries and updates subtotal / bank_fee / total_due in place.
//
// Invoice number, seq, date, and status are PRESERVED. Safe to re-run.
//
// Usage:
//   node scripts/recompute-invoices-local.mjs            # recompute all invoices
//   node scripts/recompute-invoices-local.mjs 2          # recompute invoice id 2
//
// Mirrors the logic in src/lib/invoices.ts (effectiveHourlyRate / networkDays).
import fs from "node:fs";
import path from "node:path";
import mysql from "mysql2/promise";

const BANK_FEE_RATE = 0.01;
const WORK_HOURS_PER_DAY = 8;

function loadEnvLocal() {
  const file = path.resolve(process.cwd(), ".env.local");
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
}

function round2(n) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

// Inclusive count of weekdays (Mon-Fri) between two YYYY-MM-DD dates.
function networkDays(start, end) {
  const s = new Date(`${start}T00:00:00`);
  const e = new Date(`${end}T00:00:00`);
  if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime()) || e < s) return 0;
  let count = 0;
  const d = new Date(s);
  while (d <= e) {
    const day = d.getDay();
    if (day !== 0 && day !== 6) count++;
    d.setDate(d.getDate() + 1);
  }
  return count;
}

function effectiveHourlyRate(payType, hourlyRate, monthlyRate, start, end) {
  if (payType !== "monthly") return hourlyRate;
  const businessHours = networkDays(start, end) * WORK_HOURS_PER_DAY;
  if (businessHours <= 0) return 0;
  return monthlyRate / 2 / businessHours;
}

loadEnvLocal();

const db = process.env.MYSQL_DATABASE ?? "smartsourcingusa";
const conn = await mysql.createConnection({
  host: process.env.MYSQL_HOST ?? "127.0.0.1",
  port: Number(process.env.MYSQL_PORT ?? "3306"),
  user: process.env.MYSQL_USER ?? "root",
  password: process.env.MYSQL_PASSWORD ?? "",
  database: db,
  dateStrings: true,
});

const onlyId = process.argv[2] ? Number(process.argv[2]) : null;

const [invoices] = await conn.query(
  `SELECT id, invoice_no, user_id, timesheet_id, type,
          DATE_FORMAT(coverage_start, '%Y-%m-%d') AS coverage_start,
          DATE_FORMAT(coverage_end, '%Y-%m-%d') AS coverage_end,
          total_due
   FROM invoices
   ${onlyId ? "WHERE id = ?" : ""}
   ORDER BY id ASC`,
  onlyId ? [onlyId] : []
);

if (invoices.length === 0) {
  console.log(onlyId ? `No invoice with id ${onlyId}.` : "No invoices found.");
  await conn.end();
  process.exit(0);
}

let changed = 0;

for (const inv of invoices) {
  if (!inv.timesheet_id) {
    console.log(`- ${inv.invoice_no}: skipped (no linked timesheet).`);
    continue;
  }

  const [profRows] = await conn.query(
    "SELECT pay_type, hourly_rate, monthly_rate FROM employee_profiles WHERE user_id = ? LIMIT 1",
    [inv.user_id]
  );
  const profile = profRows[0] ?? {};
  const payType = profile.pay_type === "monthly" ? "monthly" : "hourly";
  const hourlyRate = profile.hourly_rate != null ? Number(profile.hourly_rate) : 0;
  const monthlyRate = profile.monthly_rate != null ? Number(profile.monthly_rate) : 0;

  const rate = effectiveHourlyRate(
    payType,
    hourlyRate,
    monthlyRate,
    inv.coverage_start,
    inv.coverage_end
  );

  const [tsRows] = await conn.query(
    "SELECT total_hours FROM timesheets WHERE id = ? LIMIT 1",
    [inv.timesheet_id]
  );
  const totalHours = Number(tsRows[0]?.total_hours ?? 0);

  const [entries] = await conn.query(
    "SELECT trade, client, hours FROM timesheet_entries WHERE timesheet_id = ?",
    [inv.timesheet_id]
  );

  const groups = new Map();
  for (const e of entries) {
    const key = `${e.trade ?? ""}|${e.client ?? ""}`;
    const g = groups.get(key) ?? { trade: e.trade, client: e.client, hours: 0 };
    g.hours += Number(e.hours) || 0;
    groups.set(key, g);
  }
  if (groups.size === 0) {
    groups.set("|", { trade: null, client: null, hours: totalHours });
  }

  const lines = [];
  for (const g of groups.values()) {
    lines.push({
      trade: g.trade,
      client: g.client,
      description: payType === "monthly" ? "Service Payment" : "Professional services",
      hours: round2(g.hours),
      rate,
      amount: round2(g.hours * rate),
    });
  }

  const subtotal = round2(lines.reduce((s, l) => s + l.amount, 0));
  const bankFee = round2(subtotal * BANK_FEE_RATE);
  const totalDue = round2(subtotal + bankFee);

  await conn.beginTransaction();
  try {
    await conn.query("DELETE FROM invoice_lines WHERE invoice_id = ?", [inv.id]);
    for (const l of lines) {
      await conn.query(
        `INSERT INTO invoice_lines
           (invoice_id, trade, client, description, hours, rate, amount, line_type)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'regular')`,
        [inv.id, l.trade, l.client, l.description, l.hours, l.rate, l.amount]
      );
    }
    await conn.query(
      `UPDATE invoices
         SET subtotal = ?, bank_fee = ?, total_due = ?,
             hourly_rate = ?
       WHERE id = ?`,
      [subtotal, bankFee, totalDue, payType === "hourly" ? hourlyRate : round2(rate), inv.id]
    );
    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  }

  changed++;
  console.log(
    `- ${inv.invoice_no} (${payType}): ${lines.length} line(s), rate ${round2(rate)}/hr, ` +
      `total ${Number(inv.total_due).toFixed(2)} -> ${totalDue.toFixed(2)}`
  );
}

console.log(`\nDone. Recomputed ${changed} invoice(s).`);
await conn.end();
