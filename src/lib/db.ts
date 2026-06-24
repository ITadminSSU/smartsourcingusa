import mysql from "mysql2/promise";

let pool: mysql.Pool | null = null;

export function isDbConfigured(): boolean {
  return Boolean(
    process.env.MYSQL_HOST &&
      process.env.MYSQL_USER &&
      process.env.MYSQL_DATABASE
  );
}

export function getPool(): mysql.Pool {
  if (!isDbConfigured()) {
    throw new Error(
      "Database is not configured. Set MYSQL_HOST, MYSQL_USER, MYSQL_PASSWORD and MYSQL_DATABASE."
    );
  }

  if (!pool) {
    pool = mysql.createPool({
      host: process.env.MYSQL_HOST,
      port: Number(process.env.MYSQL_PORT ?? "3306"),
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
      waitForConnections: true,
      connectionLimit: Number(process.env.MYSQL_CONNECTION_LIMIT ?? "5"),
      queueLimit: 0,
      namedPlaceholders: true,
    });
  }

  return pool;
}

export async function query<T = unknown>(
  sql: string,
  params?: Record<string, unknown> | unknown[]
): Promise<T[]> {
  const [rows] = await getPool().execute(sql, params as never);
  return rows as T[];
}

// For INSERT statements: returns the new row's auto-increment id.
export async function insert(
  sql: string,
  params?: Record<string, unknown> | unknown[]
): Promise<number> {
  const [result] = await getPool().execute(sql, params as never);
  return (result as mysql.ResultSetHeader).insertId;
}

// Runs fn inside a single-connection transaction (commit on success, rollback on
// throw). Use for multi-statement work that must be atomic, e.g. allocating an
// invoice number then inserting the invoice.
export async function withTransaction<T>(
  fn: (conn: mysql.PoolConnection) => Promise<T>
): Promise<T> {
  const conn = await getPool().getConnection();
  try {
    await conn.beginTransaction();
    const result = await fn(conn);
    await conn.commit();
    return result;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}
