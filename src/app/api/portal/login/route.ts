import { NextResponse } from "next/server";
import { isDbConfigured } from "@/lib/db";
import { logActivity } from "@/lib/auth";
import { startPortalSession, verifyPortalCredentials } from "@/lib/portal-auth";

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

    const session = await verifyPortalCredentials(username, password);
    if (!session) {
      return NextResponse.json({ error: "Invalid username or password." }, { status: 401 });
    }

    await startPortalSession(session);
    await logActivity(session, "portal_login", "Signed in to the staff portal");
    return NextResponse.json({ ok: true, mustChange: session.mustChange });
  } catch (err) {
    console.error("Portal login error:", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
