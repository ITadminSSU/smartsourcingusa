import { NextResponse } from "next/server";
import { isDbConfigured } from "@/lib/db";
import { changeAdminPassword } from "@/lib/auth";
import { consumeResetToken } from "@/lib/password-reset";
import { validatePassword } from "@/lib/password";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isDbConfigured()) {
    return NextResponse.json({ error: "Database is not configured yet." }, { status: 503 });
  }

  try {
    const { token, newPassword } = (await request.json()) as {
      token?: string;
      newPassword?: string;
    };

    const pwError = validatePassword(newPassword);
    if (pwError) {
      return NextResponse.json({ error: pwError }, { status: 400 });
    }

    const userId = await consumeResetToken("admin", token ?? "");
    if (!userId) {
      return NextResponse.json(
        { error: "This reset link is invalid or has expired. Please request a new one." },
        { status: 400 }
      );
    }

    await changeAdminPassword(userId, newPassword as string);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Admin reset-password error:", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
