// Read-only health check for local testing.
// Usage: node scripts/verify-portal.mjs
import fs from "node:fs";
import path from "node:path";
import mysql from "mysql2/promise";

function loadEnvLocal() {
  const file = path.resolve(process.cwd(), ".env.local");
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
}

loadEnvLocal();

const REQUIRED = [
  "admin_users",
  "portal_users",
  "employee_profiles",
  "timesheets",
  "timesheet_entries",
  "invoices",
  "invoice_lines",
];

let conn;
try {
  conn = await mysql.createConnection({
    host: process.env.MYSQL_HOST ?? "127.0.0.1",
    port: Number(process.env.MYSQL_PORT ?? "3306"),
    user: process.env.MYSQL_USER ?? "root",
    password: process.env.MYSQL_PASSWORD ?? "",
    database: process.env.MYSQL_DATABASE ?? "smartsourcingusa",
  });
} catch (err) {
  console.error("❌ Cannot connect to MySQL:", err.message);
  console.error("   Make sure XAMPP/MySQL is running and .env.local is correct.");
  process.exit(1);
}

console.log(`✅ Connected to MySQL db "${process.env.MYSQL_DATABASE ?? "smartsourcingusa"}"\n`);

const [rows] = await conn.query("SHOW TABLES");
const have = new Set(rows.map((r) => Object.values(r)[0]));

let allOk = true;
console.log("Tables:");
for (const t of REQUIRED) {
  const ok = have.has(t);
  if (!ok) allOk = false;
  let count = "";
  if (ok) {
    const [[c]] = await conn.query(`SELECT COUNT(*) AS n FROM \`${t}\``);
    count = `  (${c.n} rows)`;
  }
  console.log(`  ${ok ? "✅" : "❌ MISSING"}  ${t}${count}`);
}

// portal_users must have username + invoice_seq for login + invoice numbering.
if (have.has("portal_users")) {
  const [cols] = await conn.query("SHOW COLUMNS FROM portal_users");
  const names = new Set(cols.map((c) => c.Field));
  console.log("\nportal_users key columns:");
  for (const col of ["username", "email", "password_hash", "role", "invoice_seq", "must_change_password"]) {
    const ok = names.has(col);
    if (!ok) allOk = false;
    console.log(`  ${ok ? "✅" : "❌ MISSING"}  ${col}`);
  }

  const [admins] = await conn.query(
    "SELECT username, email, role FROM portal_users WHERE role = 'hr_admin'"
  );
  console.log(`\nPortal admin accounts: ${admins.length}`);
  for (const a of admins) console.log(`  • ${a.username} <${a.email}>`);
  if (admins.length === 0) {
    console.log("  ⚠️  No admin yet — create one at /portal/setup");
  }
}

console.log(
  allOk
    ? "\n🎉 Database looks ready for the portal."
    : "\n⚠️  Some tables/columns are missing. Run: node scripts/migrate-payroll-local.mjs"
);

await conn.end();
process.exit(allOk ? 0 : 2);
