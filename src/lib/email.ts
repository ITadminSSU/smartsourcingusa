import nodemailer from "nodemailer";

// Builds a friendly "From" header like: Smart Sourcing USA <payroll@domain>.
// The display name comes from EMAIL_FROM_NAME (defaults to the company name).
function senderFrom(): string | undefined {
  const address = process.env.CONTACT_EMAIL_FROM ?? process.env.SMTP_USER;
  if (!address) return undefined;
  const name = process.env.EMAIL_FROM_NAME ?? "Smart Sourcing USA";
  return `"${name}" <${address}>`;
}

type SendContactEmailParams = {
  subject: string;
  html: string;
  text: string;
  replyTo: string;
};

export async function sendContactEmail({ subject, html, text, replyTo }: SendContactEmailParams) {
  const host = process.env.SMTP_HOST ?? "smtp.office365.com";
  const port = Number(process.env.SMTP_PORT ?? "587");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;
  const to = process.env.CONTACT_EMAIL_TO ?? "sales@smartsourcingusa.com";
  const from = process.env.CONTACT_EMAIL_FROM ?? user;

  if (!user || !pass) {
    throw new Error("SMTP credentials are not configured");
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: false,
    requireTLS: true,
    auth: { user, pass },
  });

  await transporter.sendMail({
    from: senderFrom() ?? from ?? user,
    to,
    replyTo,
    subject,
    text,
    html,
  });
}

type NotificationParams = {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
};

// Best-effort transactional email used by the staff portal (approvals, etc.).
// Unlike sendContactEmail, this never throws: if SMTP isn't configured or the
// send fails, it logs and resolves so the surrounding workflow still succeeds.
export async function sendNotificationEmail({
  to,
  subject,
  html,
  text,
}: NotificationParams): Promise<boolean> {
  const recipients = (Array.isArray(to) ? to : [to])
    .map((r) => r.trim())
    .filter(Boolean);
  if (recipients.length === 0) return false;

  const host = process.env.SMTP_HOST ?? "smtp.office365.com";
  const port = Number(process.env.SMTP_PORT ?? "587");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;

  if (!user || !pass) {
    console.warn(
      `[portal] SMTP not configured; skipped notification "${subject}" to ${recipients.join(", ")}`
    );
    return false;
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: false,
      requireTLS: true,
      auth: { user, pass },
    });
    await transporter.sendMail({
      from: senderFrom() ?? user,
      to: recipients.join(", "),
      subject,
      text,
      html,
    });
    return true;
  } catch (err) {
    console.error(`[portal] Failed to send notification "${subject}":`, err);
    return false;
  }
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function fieldRow(label: string, value: string): string {
  if (!value.trim()) return "";
  return `<tr><td style="padding:8px 12px;font-weight:600;color:#374151;vertical-align:top;">${escapeHtml(label)}</td><td style="padding:8px 12px;color:#111827;">${escapeHtml(value)}</td></tr>`;
}

export function buildEmailBody(title: string, rows: string): string {
  return `
    <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;">
      <h2 style="color:#2c84c4;margin-bottom:16px;">${escapeHtml(title)}</h2>
      <table style="width:100%;border-collapse:collapse;border:1px solid #e5e7eb;">
        ${rows}
      </table>
      <p style="margin-top:20px;font-size:12px;color:#6b7280;">Sent from the Smart Sourcing USA website contact form.</p>
    </div>
  `;
}
