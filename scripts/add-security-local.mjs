// One-off: add login-lockout columns + password_resets table to the LOCAL DB.
// Safe to run multiple times (checks before altering).
// Usage: node scripts/add-security-local.mjs
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

const db = process.env.MYSQL_DATABASE ?? "smartsourcingusa";
const conn = await mysql.createConnection({
  host: process.env.MYSQL_HOST ?? "127.0.0.1",
  port: Number(process.env.MYSQL_PORT ?? "3306"),
  user: process.env.MYSQL_USER ?? "root",
  password: process.env.MYSQL_PASSWORD ?? "",
  database: db,
});

async function hasColumn(table, column) {
  const [rows] = await conn.query(
    `SELECT COUNT(*) AS c FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
    [db, table, column]
  );
  return Number(rows[0]?.c ?? 0) > 0;
}

async function addLockoutColumns(table) {
  if (!(await hasColumn(table, "failed_attempts"))) {
    await conn.query(`ALTER TABLE ${table} ADD COLUMN failed_attempts INT NOT NULL DEFAULT 0`);
    console.log(`OK: added ${table}.failed_attempts`);
  } else {
    console.log(`- ${table}.failed_attempts already exists`);
  }
  if (!(await hasColumn(table, "locked_until"))) {
    await conn.query(`ALTER TABLE ${table} ADD COLUMN locked_until DATETIME NULL`);
    console.log(`OK: added ${table}.locked_until`);
  } else {
    console.log(`- ${table}.locked_until already exists`);
  }
}

await addLockoutColumns("admin_users");
await addLockoutColumns("portal_users");

await conn.query(`
  CREATE TABLE IF NOT EXISTS password_resets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_type VARCHAR(10) NOT NULL,
    user_id INT NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    expires_at DATETIME NOT NULL,
    used TINYINT(1) NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_pr_token (token_hash),
    INDEX idx_pr_user (user_type, user_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
`);
console.log("OK: password_resets table ready");

await conn.end();
console.log("\nDone.");
