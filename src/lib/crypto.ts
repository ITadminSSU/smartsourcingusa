import crypto from "crypto";

// AES-256-GCM encryption for sensitive fields (employee bank info) at rest.
// The key is derived from PAYROLL_ENC_KEY so any sufficiently long string works.

function getKey(): Buffer {
  const secret = process.env.PAYROLL_ENC_KEY;
  if (!secret || secret.length < 16) {
    throw new Error(
      "PAYROLL_ENC_KEY is missing or too short (use at least 16 characters)."
    );
  }
  return crypto.createHash("sha256").update(secret).digest();
}

export function isEncryptionConfigured(): boolean {
  return Boolean(process.env.PAYROLL_ENC_KEY && process.env.PAYROLL_ENC_KEY.length >= 16);
}

export function encrypt(plain: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", getKey(), iv);
  const enc = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  // Layout: [12-byte iv][16-byte tag][ciphertext], base64-encoded.
  return Buffer.concat([iv, tag, enc]).toString("base64");
}

export function decrypt(payload: string): string {
  const raw = Buffer.from(payload, "base64");
  const iv = raw.subarray(0, 12);
  const tag = raw.subarray(12, 28);
  const data = raw.subarray(28);
  const decipher = crypto.createDecipheriv("aes-256-gcm", getKey(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(data), decipher.final()]).toString("utf8");
}

// Shows only the last 4 characters of an account number for display.
export function maskAccount(account: string): string {
  const trimmed = account.replace(/\s+/g, "");
  if (trimmed.length <= 4) return "****";
  return "****" + trimmed.slice(-4);
}
