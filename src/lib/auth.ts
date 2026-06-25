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
import {
  LOCK_MINUTES,
  MAX_FAILED_ATTEMPTS,
  type LoginOutcome,
} from "./lockout";

export type AdminUser = {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  created_at: string;
};

type UserRow = AdminUser & {
  password_hash: string;
  failed_attempts: number;
  locked_until: string | null;
};

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
    "SELECT id, name, email, role, password_hash, failed_attempts, locked_until, created_at FROM admin_users WHERE email = :email LIMIT 1",
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

// Plain credential check (no lockout side effects). Used for re-auth such as
// confirming the current password before a change.
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

async function registerFailedAdminLogin(id: number): Promise<void> {
  await query(
    `UPDATE admin_users
       SET failed_attempts = failed_attempts + 1,
           locked_until = IF(failed_attempts + 1 >= :max,
                             DATE_ADD(NOW(), INTERVAL :mins MINUTE),
                             locked_until)
     WHERE id = :id`,
    { id, max: MAX_FAILED_ATTEMPTS, mins: LOCK_MINUTES }
  );
}

async function clearFailedAdminLogin(id: number): Promise<void> {
  await query(
    "UPDATE admin_users SET failed_attempts = 0, locked_until = NULL WHERE id = :id",
    { id }
  );
}

// Lockout-aware login. Returns "locked" with the unlock time, "invalid" for
// wrong email/password, or "ok" with the session payload.
export async function attemptAdminLogin(
  email: string,
  password: string
): Promise<LoginOutcome<SessionPayload>> {
  const user = await findUserByEmail(email);
  if (!user) return { status: "invalid" };

  if (user.locked_until) {
    const until = new Date(user.locked_until);
    if (until.getTime() > Date.now()) return { status: "locked", until };
  }

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) {
    await registerFailedAdminLogin(user.id);
    const refreshed = await getLockState("admin_users", user.id);
    if (refreshed?.locked_until) {
      const until = new Date(refreshed.locked_until);
      if (until.getTime() > Date.now()) return { status: "locked", until };
    }
    return { status: "invalid" };
  }

  await clearFailedAdminLogin(user.id);
  return {
    status: "ok",
    session: { uid: user.id, email: user.email, name: user.name, role: user.role },
  };
}

async function getLockState(
  table: "admin_users" | "portal_users",
  id: number
): Promise<{ locked_until: string | null } | null> {
  const rows = await query<{ locked_until: string | null }>(
    `SELECT locked_until FROM ${table} WHERE id = :id LIMIT 1`,
    { id }
  );
  return rows[0] ?? null;
}

export async function changeAdminPassword(
  userId: number,
  newPassword: string
): Promise<void> {
  const password_hash = await bcrypt.hash(newPassword, 12);
  await query(
    "UPDATE admin_users SET password_hash = :h, failed_attempts = 0, locked_until = NULL WHERE id = :id",
    { h: password_hash, id: userId }
  );
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
