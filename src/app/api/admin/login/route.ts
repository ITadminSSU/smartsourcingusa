import { NextResponse } from "next/server";
import { attemptAdminLogin, logActivity, startSession } from "@/lib/auth";
import { isDbConfigured } from "@/lib/db";
import { lockMessage } from "@/lib/lockout";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isDbConfigured()) {
    return NextResponse.json({ error: "Database is not configured yet." }, { status: 503 });
  }

  try {
    const { email, password } = (await request.json()) as {
      email?: string;
      password?: string;
    };

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    const result = await attemptAdminLogin(email, password);
    if (result.status === "locked") {
      return NextResponse.json({ error: lockMessage(result.until) }, { status: 429 });
    }
    if (result.status !== "ok") {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    await startSession(result.session);
    await logActivity(result.session, "login", "Signed in");
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
