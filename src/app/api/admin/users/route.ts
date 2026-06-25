import { NextResponse } from "next/server";
import {
  countAdmins,
  createUser,
  deleteUser,
  findUserByEmail,
  getCurrentUser,
  getUserById,
  listUsers,
  logActivity,
} from "@/lib/auth";
import type { UserRole } from "@/lib/session";
import { validatePassword } from "@/lib/password";

export const runtime = "nodejs";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "admin") {
    return NextResponse.json({ error: "Admins only." }, { status: 403 });
  }

  const users = await listUsers();
  return NextResponse.json({ users, currentUserId: user.uid });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "admin") {
    return NextResponse.json({ error: "Admins only." }, { status: 403 });
  }

  try {
    const { name, email, password, role } = (await request.json()) as {
      name?: string;
      email?: string;
      password?: string;
      role?: string;
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
    if (await findUserByEmail(email)) {
      return NextResponse.json({ error: "A user with that email already exists." }, { status: 409 });
    }

    const newRole: UserRole = role === "admin" ? "admin" : "editor";
    await createUser(name, email, password, newRole);
    await logActivity(
      user,
      "user_added",
      `Added ${name} (${email.toLowerCase()}) as ${newRole}`
    );
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Create user error:", err);
    return NextResponse.json({ error: "Unable to add user. Please try again." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "admin") {
    return NextResponse.json({ error: "Admins only." }, { status: 403 });
  }

  try {
    const { id } = (await request.json()) as { id?: number };
    if (!id) return NextResponse.json({ error: "User id is required." }, { status: 400 });
    if (id === user.uid) {
      return NextResponse.json(
        { error: "You cannot delete your own account while logged in." },
        { status: 400 }
      );
    }

    const target = await getUserById(id);
    if (!target) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }
    // Never allow removing the last admin.
    if (target.role === "admin" && (await countAdmins()) <= 1) {
      return NextResponse.json(
        { error: "You can't remove the only admin. Add another admin first." },
        { status: 400 }
      );
    }

    await deleteUser(id);
    await logActivity(user, "user_removed", `Removed ${target.name} (${target.email})`);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Delete user error:", err);
    return NextResponse.json({ error: "Unable to delete user. Please try again." }, { status: 500 });
  }
}
