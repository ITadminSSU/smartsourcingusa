// One-off: add the `username` column to portal_users in the LOCAL MySQL DB.
// Safe to run multiple times (checks if the column already exists first).
// Usage: node scripts/add-username-local.mjs
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

const [cols] = await conn.query(
  `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
   WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'portal_users' AND COLUMN_NAME = 'username'`,
  [db]
);

if (cols.length > 0) {
  console.log("OK: username column already exists.");
} else {
  const [rows] = await conn.query("SELECT COUNT(*) AS c FROM portal_users");
  const count = Number(rows[0]?.c ?? 0);
  if (count === 0) {
    await conn.query(
      "ALTER TABLE portal_users ADD COLUMN username VARCHAR(80) NOT NULL UNIQUE AFTER id"
    );
    console.log("OK: added username column (table was empty).");
  } else {
    // Backfill from the email local-part, then enforce constraints.
    await conn.query("ALTER TABLE portal_users ADD COLUMN username VARCHAR(80) NULL AFTER id");
    await conn.query(
      "UPDATE portal_users SET username = SUBSTRING_INDEX(email, '@', 1) WHERE username IS NULL"
    );
    await conn.query("ALTER TABLE portal_users MODIFY COLUMN username VARCHAR(80) NOT NULL");
    await conn.query("ALTER TABLE portal_users ADD UNIQUE KEY uq_portal_username (username)");
    console.log(`OK: added username column and backfilled ${count} existing user(s).`);
  }
}

await conn.end();
