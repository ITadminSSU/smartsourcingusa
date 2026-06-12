import nodemailer from "nodemailer";

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
    from: from ?? user,
    to,
    replyTo,
    subject,
    text,
    html,
  });
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
      <p style="margin-top:20px;font-size:12px;color:#6b7280;">Sent from the SmartSourcing USA website contact form.</p>
    </div>
  `;
}
