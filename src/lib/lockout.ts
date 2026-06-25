// Shared brute-force lockout policy for both /admin and /portal logins.
// After MAX_FAILED_ATTEMPTS wrong passwords, the account is locked for
// LOCK_MINUTES. A successful login clears the counter.

export const MAX_FAILED_ATTEMPTS = 5;
export const LOCK_MINUTES = 15;

export type LoginOutcome<T> =
  | { status: "ok"; session: T }
  | { status: "invalid" }
  | { status: "locked"; until: Date };

// User-facing message for a locked account.
export function lockMessage(until: Date): string {
  const mins = Math.max(1, Math.ceil((until.getTime() - Date.now()) / 60000));
  return `Too many failed attempts. Your account is locked for ${mins} more minute${
    mins === 1 ? "" : "s"
  }.`;
}
