import { query } from "./db";
import { decrypt, encrypt } from "./crypto";
import type { PortalRole } from "./portal-session";

export type PayType = "hourly" | "monthly";

export function normalizePayType(value: unknown): PayType {
  return value === "monthly" ? "monthly" : "hourly";
}

// One row per employee in the HR management list (user joined with profile + lead).
export type EmployeeRow = {
  id: number;
  username: string;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  email: string;
  role: PortalRole;
  active: number;
  must_change_password: number;
  created_at: string;
  pay_type: PayType | null;
  hourly_rate: string | null;
  monthly_rate: string | null;
  overtime_rate: string | null;
  default_trade: string | null;
  default_client: string | null;
  bank_set: number | null;
  lead_user_id: number | null;
  lead_name: string | null;
};

export async function listEmployees(): Promise<EmployeeRow[]> {
  return query<EmployeeRow>(
    `SELECT
       u.id, u.username, u.first_name, u.middle_name, u.last_name, u.email, u.role, u.active,
       u.must_change_password, u.created_at,
       p.pay_type, p.hourly_rate, p.monthly_rate, p.overtime_rate,
       p.default_trade, p.default_client, p.bank_set, p.lead_user_id,
       TRIM(CONCAT_WS(' ', l.first_name, l.middle_name, l.last_name)) AS lead_name
     FROM portal_users u
     LEFT JOIN employee_profiles p ON p.user_id = u.id
     LEFT JOIN portal_users l ON l.id = p.lead_user_id
     ORDER BY u.created_at ASC`
  );
}

// People who can be assigned as a team lead (anyone above plain employee).
export type LeadOption = { id: number; name: string; role: PortalRole };

export async function listLeadOptions(): Promise<LeadOption[]> {
  const rows = await query<{
    id: number;
    first_name: string;
    middle_name: string | null;
    last_name: string;
    role: PortalRole;
  }>(
    `SELECT id, first_name, middle_name, last_name, role
     FROM portal_users
     WHERE role IN ('lead','accounting','hr_admin') AND active = 1
     ORDER BY first_name ASC, last_name ASC`
  );
  return rows.map((r) => ({
    id: r.id,
    role: r.role,
    name: [r.first_name, r.middle_name, r.last_name]
      .filter((p) => p && String(p).trim().length > 0)
      .join(" "),
  }));
}

export async function upsertEmployeeProfile(
  userId: number,
  data: {
    payType: PayType;
    hourlyRate?: number | null;
    monthlyRate?: number | null;
    overtimeRate?: number | null;
    leadUserId?: number | null;
    defaultTrade?: string | null;
    defaultClient?: string | null;
  }
): Promise<void> {
  await query(
    `INSERT INTO employee_profiles
       (user_id, pay_type, hourly_rate, monthly_rate, overtime_rate, lead_user_id, default_trade, default_client)
     VALUES
       (:user_id, :pay_type, :hourly_rate, :monthly_rate, :overtime_rate, :lead_user_id, :default_trade, :default_client)
     ON DUPLICATE KEY UPDATE
       pay_type = :pay_type,
       hourly_rate = :hourly_rate,
       monthly_rate = :monthly_rate,
       overtime_rate = :overtime_rate,
       lead_user_id = :lead_user_id,
       default_trade = :default_trade,
       default_client = :default_client`,
    {
      user_id: userId,
      pay_type: data.payType,
      hourly_rate: data.hourlyRate ?? null,
      monthly_rate: data.monthlyRate ?? null,
      overtime_rate: data.overtimeRate ?? null,
      lead_user_id: data.leadUserId ?? null,
      default_trade: data.defaultTrade?.trim() || null,
      default_client: data.defaultClient?.trim() || null,
    }
  );
}

export type EmployeeProfile = {
  user_id: number;
  pay_type: PayType;
  hourly_rate: string | null;
  monthly_rate: string | null;
  overtime_rate: string | null;
  bank_set: number;
  lead_user_id: number | null;
  default_trade: string | null;
  default_client: string | null;
};

export async function getEmployeeProfile(
  userId: number
): Promise<EmployeeProfile | null> {
  const rows = await query<EmployeeProfile>(
    `SELECT user_id, pay_type, hourly_rate, monthly_rate, overtime_rate, bank_set,
            lead_user_id, default_trade, default_client
     FROM employee_profiles WHERE user_id = :id LIMIT 1`,
    { id: userId }
  );
  return rows[0] ?? null;
}

// Employee sets their own bank info; stored encrypted at rest.
export async function setBankInfo(
  userId: number,
  bankName: string,
  bankAccount: string
): Promise<void> {
  await query(
    `INSERT INTO employee_profiles (user_id, bank_name_enc, bank_account_enc, bank_set)
     VALUES (:user_id, :bn, :ba, 1)
     ON DUPLICATE KEY UPDATE bank_name_enc = :bn, bank_account_enc = :ba, bank_set = 1`,
    {
      user_id: userId,
      bn: encrypt(bankName.trim()),
      ba: encrypt(bankAccount.trim()),
    }
  );
}

export type BankInfo = { bankName: string; bankAccount: string } | null;

// Decrypts bank info (only call for the owner or accounting/hr_admin roles).
export async function getBankInfo(userId: number): Promise<BankInfo> {
  const rows = await query<{
    bank_name_enc: string | null;
    bank_account_enc: string | null;
  }>(
    `SELECT bank_name_enc, bank_account_enc FROM employee_profiles WHERE user_id = :id LIMIT 1`,
    { id: userId }
  );
  const row = rows[0];
  if (!row || !row.bank_name_enc || !row.bank_account_enc) return null;
  return {
    bankName: decrypt(row.bank_name_enc),
    bankAccount: decrypt(row.bank_account_enc),
  };
}
