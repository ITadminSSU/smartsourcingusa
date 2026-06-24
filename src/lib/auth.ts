import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { query } from "./db";
import {
  SESSION_COOKIE,
  signSession,
  verifySession,
  type SessionPayload,
  type UserRole,
} from "./session";

export type AdminUser = {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  created_at: string;
};

type UserRow = AdminUser & { password_hash: string };

export type ActivityEntry = {
  id: number;
  actor_name: string | null;
  actor_email: string | null;
  action: string;
  detail: string | null;
  created_at: string;
};

function normalizeRole(role: unknown): UserRole {
  return role === "admin" ? "admin" : "editor";
}

export async function countUsers(): Promise<number> {
  const rows = await query<{ count: number }>(
    "SELECT COUNT(*) AS count FROM admin_users"
  );
  return Number(rows[0]?.count ?? 0);
}

export async function listUsers(): Promise<AdminUser[]> {
  const rows = await query<AdminUser>(
    "SELECT id, name, email, role, created_at FROM admin_users ORDER BY created_at ASC"
  );
  return rows.map((u) => ({ ...u, role: normalizeRole(u.role) }));
}

export async function findUserByEmail(email: string): Promise<UserRow | null> {
  const rows = await query<UserRow>(
    "SELECT id, name, email, role, password_hash, created_at FROM admin_users WHERE email = :email LIMIT 1",
    { email: email.trim().toLowerCase() }
  );
  const user = rows[0];
  if (!user) return null;
  return { ...user, role: normalizeRole(user.role) };
}

export async function createUser(
  name: string,
  email: string,
  password: string,
  role: UserRole = "editor"
): Promise<void> {
  const password_hash = await bcrypt.hash(password, 12);
  await query(
    "INSERT INTO admin_users (name, email, password_hash, role) VALUES (:name, :email, :password_hash, :role)",
    {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password_hash,
      role: normalizeRole(role),
    }
  );
}

export async function deleteUser(id: number): Promise<void> {
  await query("DELETE FROM admin_users WHERE id = :id", { id });
}

export async function countAdmins(): Promise<number> {
  const rows = await query<{ count: number }>(
    "SELECT COUNT(*) AS count FROM admin_users WHERE role = 'admin'"
  );
  return Number(rows[0]?.count ?? 0);
}

export async function getUserById(id: number): Promise<AdminUser | null> {
  const rows = await query<AdminUser>(
    "SELECT id, name, email, role, created_at FROM admin_users WHERE id = :id LIMIT 1",
    { id }
  );
  const user = rows[0];
  if (!user) return null;
  return { ...user, role: normalizeRole(user.role) };
}

export async function verifyCredentials(
  email: string,
  password: string
): Promise<SessionPayload | null> {
  const user = await findUserByEmail(email);
  if (!user) return null;
  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return null;
  return { uid: user.id, email: user.email, name: user.name, role: user.role };
}

export async function startSession(payload: SessionPayload): Promise<void> {
  const token = await signSession(payload);
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function endSession(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export async function getCurrentUser(): Promise<SessionPayload | null> {
  const store = await cookies();
  return verifySession(store.get(SESSION_COOKIE)?.value);
}

export async function logActivity(
  actor: { name?: string | null; email?: string | null },
  action: string,
  detail?: string
): Promise<void> {
  try {
    await query(
      "INSERT INTO activity_log (actor_name, actor_email, action, detail) VALUES (:actor_name, :actor_email, :action, :detail)",
      {
        actor_name: actor.name ?? null,
        actor_email: actor.email ?? null,
        action,
        detail: detail ?? null,
      }
    );
  } catch (err) {
    // Logging should never break the main action.
    console.error("Failed to write activity log:", err);
  }
}

export async function listActivity(limit = 25): Promise<ActivityEntry[]> {
  const safeLimit = Math.min(Math.max(Math.trunc(limit), 1), 100);
  return query<ActivityEntry>(
    `SELECT id, actor_name, actor_email, action, detail, created_at
     FROM activity_log ORDER BY created_at DESC, id DESC LIMIT ${safeLimit}`
  );
}
