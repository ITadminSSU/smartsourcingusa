import crypto from "crypto";
import { query } from "./db";
import { buildEmailBody, escapeHtml, sendNotificationEmail } from "./email";

export type ResetUserType = "admin" | "portal";

const TOKEN_TTL_MINUTES = 60;

const APP_URL = (
  process.env.NEXT_PUBLIC_APP_URL ??
  process.env.APP_URL ??
  ""
).replace(/\/$/, "");

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

// Creates a single-use reset token, invalidating any previous unused tokens for
// the same user. Returns the plaintext token (only emailed, never stored).
export async function createResetToken(
  userType: ResetUserType,
  userId: number
): Promise<string> {
  const token = crypto.randomBytes(32).toString("hex");
  const token_hash = hashToken(token);
  await query(
    "UPDATE password_resets SET used = 1 WHERE user_type = :t AND user_id = :u AND used = 0",
    { t: userType, u: userId }
  );
  await query(
    `INSERT INTO password_resets (user_type, user_id, token_hash, expires_at)
     VALUES (:t, :u, :h, DATE_ADD(NOW(), INTERVAL :ttl MINUTE))`,
    { t: userType, u: userId, h: token_hash, ttl: TOKEN_TTL_MINUTES }
  );
  return token;
}

// Validates a token and marks it used. Returns the user id, or null if the
// token is missing/expired/already used.
export async function consumeResetToken(
  userType: ResetUserType,
  token: string
): Promise<number | null> {
  if (!token || token.length < 32) return null;
  const token_hash = hashToken(token);
  const rows = await query<{ id: number; user_id: number }>(
    `SELECT id, user_id FROM password_resets
     WHERE user_type = :t AND token_hash = :h AND used = 0 AND expires_at > NOW()
     ORDER BY id DESC LIMIT 1`,
    { t: userType, h: token_hash }
  );
  const row = rows[0];
  if (!row) return null;
  await query("UPDATE password_resets SET used = 1 WHERE id = :id", { id: row.id });
  return row.user_id;
}

export function resetLink(userType: ResetUserType, token: string): string {
  const path = userType === "admin" ? "/admin/reset" : "/portal/reset";
  const qs = `?token=${encodeURIComponent(token)}`;
  return APP_URL ? `${APP_URL}${path}${qs}` : `${path}${qs}`;
}

// Sends the reset email. Best-effort (never throws) so the route can always
// return a generic response regardless of email delivery.
export async function sendResetEmail(opts: {
  to: string;
  name: string;
  userType: ResetUserType;
  token: string;
}): Promise<void> {
  const link = resetLink(opts.userType, opts.token);
  const area = opts.userType === "admin" ? "admin" : "staff payroll";
  const subject = "Reset your password";
  const html = buildEmailBody(
    "Password reset request",
    `<tr><td style="padding:14px;color:#111827;line-height:1.5;">
       Hi ${escapeHtml(opts.name)},<br/><br/>
       We received a request to reset your ${area} portal password. Click the button
       below to choose a new one. This link expires in ${TOKEN_TTL_MINUTES} minutes and
       can only be used once.<br/><br/>
       <a href="${link}" style="background:#2c84c4;color:#ffffff;padding:10px 18px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block;">Reset password</a>
       <br/><br/>
       If the button doesn't work, copy this link into your browser:<br/>
       <span style="color:#2c84c4;word-break:break-all;">${escapeHtml(link)}</span><br/><br/>
       If you didn't request this, you can ignore this email — your password won't change.
     </td></tr>`
  );
  const text =
    `Hi ${opts.name},\n\n` +
    `Reset your ${area} portal password using this link ` +
    `(expires in ${TOKEN_TTL_MINUTES} minutes, single use):\n${link}\n\n` +
    `If you didn't request this, ignore this email.`;
  await sendNotificationEmail({ to: opts.to, subject, html, text });
}
