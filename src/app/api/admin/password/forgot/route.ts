import { NextResponse } from "next/server";
import { isDbConfigured } from "@/lib/db";
import { findUserByEmail } from "@/lib/auth";
import { createResetToken, sendResetEmail } from "@/lib/password-reset";

export const runtime = "nodejs";

// Always responds generically so it never reveals whether an account exists.
export async function POST(request: Request) {
  if (!isDbConfigured()) return NextResponse.json({ ok: true });

  try {
    const { email } = (await request.json()) as { email?: string };
    const value = (email ?? "").trim();
    if (value) {
      const user = await findUserByEmail(value);
      if (user) {
        const token = await createResetToken("admin", user.id);
        await sendResetEmail({
          to: user.email,
          name: user.name,
          userType: "admin",
          token,
        });
      }
    }
  } catch (err) {
    console.error("Admin forgot-password error:", err);
  }

  return NextResponse.json({ ok: true });
}
