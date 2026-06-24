// One-off: create the staff portal tables in the LOCAL MySQL database.
// Usage: node scripts/migrate-payroll-local.mjs
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

const sql = fs.readFileSync(
  path.resolve(process.cwd(), "database", "migration-payroll.sql"),
  "utf8"
);

const conn = await mysql.createConnection({
  host: process.env.MYSQL_HOST ?? "127.0.0.1",
  port: Number(process.env.MYSQL_PORT ?? "3306"),
  user: process.env.MYSQL_USER ?? "root",
  password: process.env.MYSQL_PASSWORD ?? "",
  database: process.env.MYSQL_DATABASE ?? "smartsourcingusa",
  multipleStatements: true,
});

await conn.query(sql);
const [tables] = await conn.query("SHOW TABLES LIKE 'portal_users'");
console.log(
  tables.length
    ? "OK: portal tables created (portal_users, employee_profiles, timesheets, ...)."
    : "WARNING: portal_users not found after migration."
);
await conn.end();
