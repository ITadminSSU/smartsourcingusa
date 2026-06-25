import { NextResponse } from "next/server";
import { isDbConfigured } from "@/lib/db";
import {
  findPortalUserByEmail,
  findPortalUserByUsername,
  fullName,
} from "@/lib/portal-auth";
import { createResetToken, sendResetEmail } from "@/lib/password-reset";

export const runtime = "nodejs";

// Accepts a username OR email. Always responds with a generic success so it
// never reveals whether an account exists (prevents account enumeration).
export async function POST(request: Request) {
  if (!isDbConfigured()) return NextResponse.json({ ok: true });

  try {
    const { identifier } = (await request.json()) as { identifier?: string };
    const value = (identifier ?? "").trim();
    if (value) {
      const user = value.includes("@")
        ? await findPortalUserByEmail(value)
        : await findPortalUserByUsername(value);
      if (user && user.active) {
        const token = await createResetToken("portal", user.id);
        await sendResetEmail({
          to: user.email,
          name: fullName(user),
          userType: "portal",
          token,
        });
      }
    }
  } catch (err) {
    console.error("Portal forgot-password error:", err);
  }

  return NextResponse.json({ ok: true });
}
