import bcrypt from "bcryptjs";
import crypto from "crypto";
import { cookies } from "next/headers";
import { query } from "./db";
import {
  PORTAL_COOKIE,
  normalizePortalRole,
  signPortalSession,
  verifyPortalSession,
  type PortalRole,
  type PortalSession,
} from "./portal-session";
import {
  LOCK_MINUTES,
  MAX_FAILED_ATTEMPTS,
  type LoginOutcome,
} from "./lockout";

export type PortalUser = {
  id: number;
  username: string;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  email: string;
  role: PortalRole;
  invoice_seq: number;
  must_change_password: number;
  active: number;
  created_at: string;
};

type PortalUserRow = PortalUser & {
  password_hash: string;
  failed_attempts: number;
  locked_until: string | null;
};

const LOGIN_COLS = `${"id, username, first_name, middle_name, last_name, email, role, invoice_seq, must_change_password, active, created_at"}, password_hash, failed_attempts, locked_until`;

const USER_COLS =
  "id, username, first_name, middle_name, last_name, email, role, invoice_seq, must_change_password, active, created_at";

// Normalizes a username: trimmed + lowercased so logins are case-insensitive.
export function normalizeUsername(value: string): string {
  return value.trim().toLowerCase();
}

// Usernames allow letters, numbers, dot, underscore and hyphen (min 3 chars).
export function isValidUsername(value: string): boolean {
  return /^[a-z0-9._-]{3,80}$/.test(normalizeUsername(value));
}

type NameParts = {
  first_name: string;
  middle_name?: string | null;
  last_name: string;
};

export function fullName(u: NameParts): string {
  return [u.first_name, u.middle_name, u.last_name]
    .filter((p) => p && String(p).trim().length > 0)
    .join(" ");
}

// First initial + middle initial (when present) + last initial, uppercased.
export function initials(u: NameParts): string {
  return [u.first_name, u.middle_name, u.last_name]
    .filter((p) => p && String(p).trim().length > 0)
    .map((p) => String(p).trim()[0]!.toUpperCase())
    .join("");
}

export function generateTempPassword(): string {
  // 10 characters, ambiguous-looking characters removed (no 0/O/1/l/I).
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  const bytes = crypto.randomBytes(10);
  let out = "";
  for (let i = 0; i < 10; i++) out += alphabet[bytes[i] % alphabet.length];
  return out;
}

export async function countPortalUsers(): Promise<number> {
  const rows = await query<{ count: number }>(
    "SELECT COUNT(*) AS count FROM portal_users"
  );
  return Number(rows[0]?.count ?? 0);
}

export async function countByRole(role: PortalRole): Promise<number> {
  const rows = await query<{ count: number }>(
    "SELECT COUNT(*) AS count FROM portal_users WHERE role = :role",
    { role }
  );
  return Number(rows[0]?.count ?? 0);
}

export async function findPortalUserByEmail(
  email: string
): Promise<PortalUserRow | null> {
  const rows = await query<PortalUserRow>(
    `SELECT ${LOGIN_COLS} FROM portal_users WHERE email = :email LIMIT 1`,
    { email: email.trim().toLowerCase() }
  );
  const u = rows[0];
  if (!u) return null;
  return { ...u, role: normalizePortalRole(u.role) };
}

export async function findPortalUserByUsername(
  username: string
): Promise<PortalUserRow | null> {
  const rows = await query<PortalUserRow>(
    `SELECT ${LOGIN_COLS} FROM portal_users WHERE username = :username LIMIT 1`,
    { username: normalizeUsername(username) }
  );
  const u = rows[0];
  if (!u) return null;
  return { ...u, role: normalizePortalRole(u.role) };
}

export async function getPortalUserById(id: number): Promise<PortalUser | null> {
  const rows = await query<PortalUser>(
    `SELECT ${USER_COLS} FROM portal_users WHERE id = :id LIMIT 1`,
    { id }
  );
  const u = rows[0];
  if (!u) return null;
  return { ...u, role: normalizePortalRole(u.role) };
}

export async function createPortalUser(input: {
  username: string;
  firstName: string;
  middleName?: string | null;
  lastName: string;
  email: string;
  password: string;
  role: PortalRole;
  mustChange?: boolean;
}): Promise<number> {
  const password_hash = await bcrypt.hash(input.password, 12);
  const username = normalizeUsername(input.username);
  await query(
    `INSERT INTO portal_users
       (username, first_name, middle_name, last_name, email, password_hash, role, must_change_password)
     VALUES
       (:username, :first_name, :middle_name, :last_name, :email, :password_hash, :role, :must_change)`,
    {
      username,
      first_name: input.firstName.trim(),
      middle_name: input.middleName?.trim() || null,
      last_name: input.lastName.trim(),
      email: input.email.trim().toLowerCase(),
      password_hash,
      role: normalizePortalRole(input.role),
      must_change: input.mustChange === false ? 0 : 1,
    }
  );
  const created = await findPortalUserByUsername(username);
  if (!created) throw new Error("Failed to create portal user.");
  return created.id;
}

export async function updatePortalUser(
  id: number,
  input: {
    username: string;
    firstName: string;
    middleName?: string | null;
    lastName: string;
    email: string;
    role: PortalRole;
  }
): Promise<void> {
  await query(
    `UPDATE portal_users
       SET username = :username,
           first_name = :first_name,
           middle_name = :middle_name,
           last_name = :last_name,
           email = :email,
           role = :role
     WHERE id = :id`,
    {
      id,
      username: normalizeUsername(input.username),
      first_name: input.firstName.trim(),
      middle_name: input.middleName?.trim() || null,
      last_name: input.lastName.trim(),
      email: input.email.trim().toLowerCase(),
      role: normalizePortalRole(input.role),
    }
  );
}

export async function deletePortalUser(id: number): Promise<void> {
  await query("DELETE FROM portal_users WHERE id = :id", { id });
}

export async function changePortalPassword(
  userId: number,
  newPassword: string
): Promise<void> {
  const password_hash = await bcrypt.hash(newPassword, 12);
  await query(
    "UPDATE portal_users SET password_hash = :h, must_change_password = 0, failed_attempts = 0, locked_until = NULL WHERE id = :id",
    { h: password_hash, id: userId }
  );
}

// Admin-triggered reset: generates a fresh temp password, stores its hash, and
// forces the user to set a new one on next login. Returns the plaintext temp
// password ONCE so it can be handed to the user (it is never recoverable later).
export async function resetPortalPassword(userId: number): Promise<string> {
  const tempPassword = generateTempPassword();
  const password_hash = await bcrypt.hash(tempPassword, 12);
  await query(
    "UPDATE portal_users SET password_hash = :h, must_change_password = 1, failed_attempts = 0, locked_until = NULL WHERE id = :id",
    { h: password_hash, id: userId }
  );
  return tempPassword;
}

// Plain credential check (no lockout side effects). Used for re-auth such as
// confirming the current password before a change.
export async function verifyPortalCredentials(
  username: string,
  password: string
): Promise<PortalSession | null> {
  const u = await findPortalUserByUsername(username);
  if (!u || !u.active) return null;
  const ok = await bcrypt.compare(password, u.password_hash);
  if (!ok) return null;
  return {
    uid: u.id,
    username: u.username,
    email: u.email,
    name: fullName(u),
    role: u.role,
    mustChange: Boolean(u.must_change_password),
  };
}

async function registerFailedPortalLogin(id: number): Promise<void> {
  await query(
    `UPDATE portal_users
       SET failed_attempts = failed_attempts + 1,
           locked_until = IF(failed_attempts + 1 >= :max,
                             DATE_ADD(NOW(), INTERVAL :mins MINUTE),
                             locked_until)
     WHERE id = :id`,
    { id, max: MAX_FAILED_ATTEMPTS, mins: LOCK_MINUTES }
  );
}

async function clearFailedPortalLogin(id: number): Promise<void> {
  await query(
    "UPDATE portal_users SET failed_attempts = 0, locked_until = NULL WHERE id = :id",
    { id }
  );
}

// Lockout-aware portal login. Returns "locked", "invalid", or "ok".
export async function attemptPortalLogin(
  username: string,
  password: string
): Promise<LoginOutcome<PortalSession>> {
  const u = await findPortalUserByUsername(username);
  if (!u || !u.active) return { status: "invalid" };

  if (u.locked_until) {
    const until = new Date(u.locked_until);
    if (until.getTime() > Date.now()) return { status: "locked", until };
  }

  const ok = await bcrypt.compare(password, u.password_hash);
  if (!ok) {
    await registerFailedPortalLogin(u.id);
    const rows = await query<{ locked_until: string | null }>(
      "SELECT locked_until FROM portal_users WHERE id = :id LIMIT 1",
      { id: u.id }
    );
    const lu = rows[0]?.locked_until;
    if (lu) {
      const until = new Date(lu);
      if (until.getTime() > Date.now()) return { status: "locked", until };
    }
    return { status: "invalid" };
  }

  await clearFailedPortalLogin(u.id);
  return {
    status: "ok",
    session: {
      uid: u.id,
      username: u.username,
      email: u.email,
      name: fullName(u),
      role: u.role,
      mustChange: Boolean(u.must_change_password),
    },
  };
}

export async function startPortalSession(payload: PortalSession): Promise<void> {
  const token = await signPortalSession(payload);
  const store = await cookies();
  store.set(PORTAL_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function endPortalSession(): Promise<void> {
  const store = await cookies();
  store.delete(PORTAL_COOKIE);
}

export async function getCurrentPortalUser(): Promise<PortalSession | null> {
  const store = await cookies();
  return verifyPortalSession(store.get(PORTAL_COOKIE)?.value);
}
