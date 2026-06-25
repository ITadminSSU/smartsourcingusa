import { NextResponse } from "next/server";
import { logActivity } from "@/lib/auth";
import { validatePassword } from "@/lib/password";
import {
  changePortalPassword,
  getCurrentPortalUser,
  startPortalSession,
  verifyPortalCredentials,
} from "@/lib/portal-auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await getCurrentPortalUser();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { currentPassword, newPassword } = (await request.json()) as {
      currentPassword?: string;
      newPassword?: string;
    };

    const pwError = validatePassword(newPassword);
    if (pwError) {
      return NextResponse.json({ error: pwError }, { status: 400 });
    }

    // Voluntary changes require the current password; first-login (mustChange) does not.
    if (!session.mustChange) {
      if (!currentPassword) {
        return NextResponse.json(
          { error: "Your current password is required." },
          { status: 400 }
        );
      }
      const ok = await verifyPortalCredentials(session.username, currentPassword);
      if (!ok) {
        return NextResponse.json({ error: "Current password is incorrect." }, { status: 400 });
      }
    }

    await changePortalPassword(session.uid, newPassword as string);
    // Re-issue the session so mustChange is cleared.
    await startPortalSession({ ...session, mustChange: false });
    await logActivity(session, "portal_password_change", "Changed their portal password");

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Portal password change error:", err);
    return NextResponse.json({ error: "Unable to change password. Please try again." }, { status: 500 });
  }
}
