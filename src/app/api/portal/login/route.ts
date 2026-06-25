import { NextResponse } from "next/server";
import { isDbConfigured } from "@/lib/db";
import { logActivity } from "@/lib/auth";
import { attemptPortalLogin, startPortalSession } from "@/lib/portal-auth";
import { lockMessage } from "@/lib/lockout";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isDbConfigured()) {
    return NextResponse.json({ error: "Database is not configured yet." }, { status: 503 });
  }

  try {
    const { username, password } = (await request.json()) as {
      username?: string;
      password?: string;
    };

    if (!username || !password) {
      return NextResponse.json({ error: "Username and password are required." }, { status: 400 });
    }

    const result = await attemptPortalLogin(username, password);
    if (result.status === "locked") {
      return NextResponse.json({ error: lockMessage(result.until) }, { status: 429 });
    }
    if (result.status !== "ok") {
      return NextResponse.json({ error: "Invalid username or password." }, { status: 401 });
    }

    const session = result.session;
    await startPortalSession(session);
    await logActivity(session, "portal_login", "Signed in to the staff portal");
    return NextResponse.json({ ok: true, mustChange: session.mustChange });
  } catch (err) {
    console.error("Portal login error:", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
