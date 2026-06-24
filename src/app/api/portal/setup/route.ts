import { NextResponse } from "next/server";
import { isDbConfigured } from "@/lib/db";
import { logActivity } from "@/lib/auth";
import {
  countPortalUsers,
  createPortalUser,
  findPortalUserByUsername,
  fullName,
  isValidUsername,
  normalizeUsername,
  startPortalSession,
  verifyPortalCredentials,
} from "@/lib/portal-auth";
import { upsertEmployeeProfile } from "@/lib/payroll";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isDbConfigured()) {
    return NextResponse.json({ error: "Database is not configured yet." }, { status: 503 });
  }

  try {
    // First-run only: creates the first hr_admin account.
    if ((await countPortalUsers()) > 0) {
      return NextResponse.json(
        { error: "Setup is already complete. Please log in." },
        { status: 403 }
      );
    }

    const { username, firstName, middleName, lastName, email, password } =
      (await request.json()) as {
        username?: string;
        firstName?: string;
        middleName?: string;
        lastName?: string;
        email?: string;
        password?: string;
      };

    if (!username || !firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { error: "Username, first name, last name, email and password are required." },
        { status: 400 }
      );
    }
    if (!isValidUsername(username)) {
      return NextResponse.json(
        { error: "Username must be 3+ characters (letters, numbers, . _ - only)." },
        { status: 400 }
      );
    }
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters." },
        { status: 400 }
      );
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email." }, { status: 400 });
    }
    if (await findPortalUserByUsername(username)) {
      return NextResponse.json({ error: "That username is already taken." }, { status: 409 });
    }

    const id = await createPortalUser({
      username,
      firstName,
      middleName,
      lastName,
      email,
      password,
      role: "hr_admin",
      mustChange: false,
    });
    await upsertEmployeeProfile(id, { payType: "hourly" });

    const session = await verifyPortalCredentials(normalizeUsername(username), password);
    if (session) {
      await startPortalSession(session);
      await logActivity(
        { name: fullName({ first_name: firstName, middle_name: middleName, last_name: lastName }), email },
        "portal_setup",
        "Created the first staff portal admin (hr_admin)"
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Portal setup error:", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
