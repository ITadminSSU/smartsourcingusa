import { NextResponse } from "next/server";
import { logActivity } from "@/lib/auth";
import {
  countByRole,
  createPortalUser,
  deletePortalUser,
  findPortalUserByEmail,
  findPortalUserByUsername,
  fullName,
  generateTempPassword,
  getCurrentPortalUser,
  getPortalUserById,
  isValidUsername,
  updatePortalUser,
} from "@/lib/portal-auth";
import {
  listEmployees,
  listLeadOptions,
  normalizePayType,
  upsertEmployeeProfile,
} from "@/lib/payroll";
import { normalizePortalRole, type PortalRole } from "@/lib/portal-session";

export const runtime = "nodejs";

async function requireHrAdmin() {
  const session = await getCurrentPortalUser();
  if (!session) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  if (session.role !== "hr_admin") {
    return { error: NextResponse.json({ error: "Admins only." }, { status: 403 }) };
  }
  return { session };
}

export async function GET() {
  const { session, error } = await requireHrAdmin();
  if (error) return error;

  const [employees, leads] = await Promise.all([listEmployees(), listLeadOptions()]);
  return NextResponse.json({ employees, leads, currentUserId: session!.uid });
}

function toNumberOrNull(value: unknown): number | null {
  if (value === undefined || value === null || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export async function POST(request: Request) {
  const { session, error } = await requireHrAdmin();
  if (error) return error;

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const username = String(body.username ?? "").trim();
    const firstName = String(body.firstName ?? "").trim();
    const middleName = String(body.middleName ?? "").trim();
    const lastName = String(body.lastName ?? "").trim();
    const email = String(body.email ?? "").trim();
    const role: PortalRole = normalizePortalRole(body.role);
    const payType = normalizePayType(body.payType);
    const hourlyRate = toNumberOrNull(body.hourlyRate);
    const monthlyRate = toNumberOrNull(body.monthlyRate);
    const overtimeRate = toNumberOrNull(body.overtimeRate);
    const leadUserId = toNumberOrNull(body.leadUserId);
    const defaultTrade = String(body.defaultTrade ?? "").trim() || null;
    const defaultClient = String(body.defaultClient ?? "").trim() || null;

    if (!username || !firstName || !lastName || !email) {
      return NextResponse.json(
        { error: "Username, first name, last name and email are required." },
        { status: 400 }
      );
    }
    if (!isValidUsername(username)) {
      return NextResponse.json(
        { error: "Username must be 3+ characters (letters, numbers, . _ - only)." },
        { status: 400 }
      );
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email." }, { status: 400 });
    }
    if (payType === "hourly" && (!hourlyRate || hourlyRate <= 0)) {
      return NextResponse.json(
        { error: "An hourly rate greater than 0 is required for hourly employees." },
        { status: 400 }
      );
    }
    if (payType === "monthly" && (!monthlyRate || monthlyRate <= 0)) {
      return NextResponse.json(
        { error: "A monthly rate greater than 0 is required for monthly employees." },
        { status: 400 }
      );
    }
    if (await findPortalUserByUsername(username)) {
      return NextResponse.json(
        { error: "That username is already taken." },
        { status: 409 }
      );
    }
    if (await findPortalUserByEmail(email)) {
      return NextResponse.json(
        { error: "A portal user with that email already exists." },
        { status: 409 }
      );
    }

    const tempPassword = generateTempPassword();
    const userId = await createPortalUser({
      username,
      firstName,
      middleName,
      lastName,
      email,
      password: tempPassword,
      role,
      mustChange: true,
    });

    await upsertEmployeeProfile(userId, {
      payType,
      hourlyRate: payType === "hourly" ? hourlyRate : null,
      monthlyRate: payType === "monthly" ? monthlyRate : null,
      overtimeRate: payType === "monthly" ? overtimeRate : null,
      leadUserId,
      defaultTrade,
      defaultClient,
    });

    await logActivity(
      session!,
      "portal_account_created",
      `Created ${fullName({ first_name: firstName, middle_name: middleName, last_name: lastName })} (${email.toLowerCase()}) as ${role}`
    );

    // The temp password is returned ONCE so HR can hand it to the employee.
    return NextResponse.json({
      ok: true,
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      tempPassword,
    });
  } catch (err) {
    console.error("Create portal employee error:", err);
    return NextResponse.json({ error: "Unable to create account. Please try again." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const { session, error } = await requireHrAdmin();
  if (error) return error;

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const id = toNumberOrNull(body.id);
    if (!id) return NextResponse.json({ error: "User id is required." }, { status: 400 });

    const target = await getPortalUserById(id);
    if (!target) return NextResponse.json({ error: "User not found." }, { status: 404 });

    const username = String(body.username ?? "").trim();
    const firstName = String(body.firstName ?? "").trim();
    const middleName = String(body.middleName ?? "").trim();
    const lastName = String(body.lastName ?? "").trim();
    const email = String(body.email ?? "").trim();
    const role: PortalRole = normalizePortalRole(body.role);
    const payType = normalizePayType(body.payType);
    const hourlyRate = toNumberOrNull(body.hourlyRate);
    const monthlyRate = toNumberOrNull(body.monthlyRate);
    const overtimeRate = toNumberOrNull(body.overtimeRate);
    const leadUserId = toNumberOrNull(body.leadUserId);
    const defaultTrade = String(body.defaultTrade ?? "").trim() || null;
    const defaultClient = String(body.defaultClient ?? "").trim() || null;

    if (!username || !firstName || !lastName || !email) {
      return NextResponse.json(
        { error: "Username, first name, last name and email are required." },
        { status: 400 }
      );
    }
    if (!isValidUsername(username)) {
      return NextResponse.json(
        { error: "Username must be 3+ characters (letters, numbers, . _ - only)." },
        { status: 400 }
      );
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email." }, { status: 400 });
    }
    if (payType === "hourly" && (!hourlyRate || hourlyRate <= 0)) {
      return NextResponse.json(
        { error: "An hourly rate greater than 0 is required for hourly employees." },
        { status: 400 }
      );
    }
    if (payType === "monthly" && (!monthlyRate || monthlyRate <= 0)) {
      return NextResponse.json(
        { error: "A monthly rate greater than 0 is required for monthly employees." },
        { status: 400 }
      );
    }

    // Username/email must stay unique (ignoring this same user).
    const byUsername = await findPortalUserByUsername(username);
    if (byUsername && byUsername.id !== id) {
      return NextResponse.json({ error: "That username is already taken." }, { status: 409 });
    }
    const byEmail = await findPortalUserByEmail(email);
    if (byEmail && byEmail.id !== id) {
      return NextResponse.json(
        { error: "A portal user with that email already exists." },
        { status: 409 }
      );
    }

    // Don't allow demoting the last remaining admin (would lock everyone out).
    if (target.role === "hr_admin" && role !== "hr_admin" && (await countByRole("hr_admin")) <= 1) {
      return NextResponse.json(
        { error: "You can't change the only admin's role. Add another admin first." },
        { status: 400 }
      );
    }

    await updatePortalUser(id, { username, firstName, middleName, lastName, email, role });
    await upsertEmployeeProfile(id, {
      payType,
      hourlyRate: payType === "hourly" ? hourlyRate : null,
      monthlyRate: payType === "monthly" ? monthlyRate : null,
      overtimeRate: payType === "monthly" ? overtimeRate : null,
      leadUserId,
      defaultTrade,
      defaultClient,
    });

    await logActivity(
      session!,
      "portal_account_updated",
      `Updated ${fullName({ first_name: firstName, middle_name: middleName, last_name: lastName })} (${email.toLowerCase()})`
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Update portal employee error:", err);
    return NextResponse.json({ error: "Unable to update account. Please try again." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { session, error } = await requireHrAdmin();
  if (error) return error;

  try {
    const { id } = (await request.json()) as { id?: number };
    if (!id) return NextResponse.json({ error: "User id is required." }, { status: 400 });
    if (id === session!.uid) {
      return NextResponse.json(
        { error: "You cannot delete your own account while logged in." },
        { status: 400 }
      );
    }

    const target = await getPortalUserById(id);
    if (!target) return NextResponse.json({ error: "User not found." }, { status: 404 });

    if (target.role === "hr_admin" && (await countByRole("hr_admin")) <= 1) {
      return NextResponse.json(
        { error: "You can't remove the only admin. Add another first." },
        { status: 400 }
      );
    }

    await deletePortalUser(id);
    await logActivity(
      session!,
      "portal_account_removed",
      `Removed ${fullName(target)} (${target.email})`
    );
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Delete portal employee error:", err);
    return NextResponse.json({ error: "Unable to delete account. Please try again." }, { status: 500 });
  }
}
