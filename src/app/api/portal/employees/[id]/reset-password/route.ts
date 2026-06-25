import { NextResponse } from "next/server";
import { logActivity } from "@/lib/auth";
import {
  fullName,
  getCurrentPortalUser,
  getPortalUserById,
  resetPortalPassword,
} from "@/lib/portal-auth";

export const runtime = "nodejs";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getCurrentPortalUser();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.role !== "hr_admin") {
    return NextResponse.json({ error: "Admins only." }, { status: 403 });
  }

  const id = Number((await params).id);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: "Invalid user id." }, { status: 400 });
  }

  const user = await getPortalUserById(id);
  if (!user) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  const tempPassword = await resetPortalPassword(id);

  await logActivity(
    { name: session.name, email: session.email },
    "portal_password_reset",
    `Reset password for ${fullName(user)} (@${user.username})`
  );

  return NextResponse.json({
    ok: true,
    username: user.username,
    email: user.email,
    name: fullName(user),
    tempPassword,
  });
}
