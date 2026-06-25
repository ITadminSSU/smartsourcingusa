import { NextResponse } from "next/server";
import { countUsers, createUser, logActivity, startSession, verifyCredentials } from "@/lib/auth";
import { isDbConfigured } from "@/lib/db";
import { validatePassword } from "@/lib/password";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isDbConfigured()) {
    return NextResponse.json({ error: "Database is not configured yet." }, { status: 503 });
  }

  try {
    // Setup is only allowed when there are no users yet (first-run bootstrap).
    if ((await countUsers()) > 0) {
      return NextResponse.json(
        { error: "Setup is already complete. Please log in." },
        { status: 403 }
      );
    }

    const { name, email, password } = (await request.json()) as {
      name?: string;
      email?: string;
      password?: string;
    };

    if (!name || !email || !password) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    }
    const pwError = validatePassword(password);
    if (pwError) {
      return NextResponse.json({ error: pwError }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email." }, { status: 400 });
    }

    // The very first account is always an admin.
    await createUser(name, email, password, "admin");
    const user = await verifyCredentials(email, password);
    if (user) {
      await startSession(user);
      await logActivity(user, "setup", "Created the first admin account");
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Setup error:", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
