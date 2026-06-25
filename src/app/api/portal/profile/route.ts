import { NextResponse } from "next/server";
import { logActivity } from "@/lib/auth";
import {
  findPortalUserByEmail,
  fullName,
  getCurrentPortalUser,
  getPortalUserById,
  startPortalSession,
  updatePortalUser,
} from "@/lib/portal-auth";
import { getBankInfo, getEmployeeProfile, setBankInfo } from "@/lib/payroll";
import { isEncryptionConfigured, maskAccount } from "@/lib/crypto";

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function GET() {
  const session = await getCurrentPortalUser();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [user, profile, bank] = await Promise.all([
    getPortalUserById(session.uid),
    getEmployeeProfile(session.uid),
    getBankInfo(session.uid),
  ]);

  return NextResponse.json({
    account: user
      ? {
          username: user.username,
          firstName: user.first_name,
          middleName: user.middle_name ?? "",
          lastName: user.last_name,
          email: user.email,
          role: user.role,
        }
      : null,
    bank: {
      set: Boolean(profile?.bank_set),
      bankName: bank?.bankName ?? null,
      accountMasked: bank ? maskAccount(bank.bankAccount) : null,
    },
    payType: profile?.pay_type ?? null,
  });
}

// Employee updates their own personal info (name + email). Username & role are
// fixed here — those are managed by an admin.
export async function PUT(request: Request) {
  const session = await getCurrentPortalUser();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const firstName = String(body.firstName ?? "").trim();
    const middleName = String(body.middleName ?? "").trim();
    const lastName = String(body.lastName ?? "").trim();
    const email = String(body.email ?? "").trim().toLowerCase();

    if (!firstName || !lastName) {
      return NextResponse.json({ error: "First and last name are required." }, { status: 400 });
    }
    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }

    const current = await getPortalUserById(session.uid);
    if (!current) return NextResponse.json({ error: "Account not found." }, { status: 404 });

    // Email must stay unique across portal users.
    const existing = await findPortalUserByEmail(email);
    if (existing && existing.id !== session.uid) {
      return NextResponse.json({ error: "That email is already in use." }, { status: 409 });
    }

    await updatePortalUser(session.uid, {
      username: current.username,
      firstName,
      middleName: middleName || null,
      lastName,
      email,
      role: current.role,
    });

    const name = fullName({ first_name: firstName, middle_name: middleName || null, last_name: lastName });
    // Re-issue the session so the header/name and email reflect the change.
    await startPortalSession({ ...session, name, email });
    await logActivity(session, "portal_profile_update", "Updated their profile info");

    return NextResponse.json({ ok: true, name, email });
  } catch (err) {
    console.error("Portal profile update error:", err);
    return NextResponse.json({ error: "Unable to update profile. Please try again." }, { status: 500 });
  }
}

// Employee sets their own bank info (stored encrypted).
export async function POST(request: Request) {
  const session = await getCurrentPortalUser();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!isEncryptionConfigured()) {
    return NextResponse.json(
      { error: "Bank encryption is not configured. Ask IT to set PAYROLL_ENC_KEY." },
      { status: 503 }
    );
  }

  try {
    const { bankName, bankAccount } = (await request.json()) as {
      bankName?: string;
      bankAccount?: string;
    };

    if (!bankName?.trim() || !bankAccount?.trim()) {
      return NextResponse.json(
        { error: "Bank name and account number are required." },
        { status: 400 }
      );
    }

    await setBankInfo(session.uid, bankName, bankAccount);
    // Note: never log the actual bank values.
    await logActivity(session, "portal_bank_update", "Updated their bank details");

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Portal bank update error:", err);
    return NextResponse.json({ error: "Unable to save bank details. Please try again." }, { status: 500 });
  }
}
