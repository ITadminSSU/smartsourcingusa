import { NextResponse } from "next/server";
import { logActivity } from "@/lib/auth";
import {
  createPortalUser,
  findPortalUserByEmail,
  findPortalUserByUsername,
  fullName,
  generateTempPassword,
  getCurrentPortalUser,
  isValidUsername,
  normalizeUsername,
} from "@/lib/portal-auth";
import { normalizePayType, upsertEmployeeProfile } from "@/lib/payroll";
import { normalizePortalRole } from "@/lib/portal-session";

export const runtime = "nodejs";

// Maps flexible CSV header names to our canonical field keys.
const HEADER_MAP: Record<string, string> = {
  username: "username",
  firstname: "firstName",
  first: "firstName",
  middlename: "middleName",
  middle: "middleName",
  lastname: "lastName",
  last: "lastName",
  email: "email",
  role: "role",
  paytype: "payType",
  hourlyrate: "hourlyRate",
  monthlyrate: "monthlyRate",
  overtimerate: "overtimeRate",
  leadusername: "leadUsername",
  lead: "leadUsername",
  defaulttrade: "defaultTrade",
  trade: "defaultTrade",
  defaultclient: "defaultClient",
  client: "defaultClient",
};

function normKey(h: string): string {
  return h.trim().toLowerCase().replace(/[\s_]+/g, "");
}

// Minimal CSV line splitter supporting quoted fields and "" escapes.
function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (inQuotes) {
      if (c === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cur += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      out.push(cur);
      cur = "";
    } else {
      cur += c;
    }
  }
  out.push(cur);
  return out.map((s) => s.trim());
}

function toNum(v: string | undefined): number | null {
  if (v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type RowResult =
  | { row: number; status: "created"; username: string; email: string; tempPassword: string }
  | { row: number; status: "error"; error: string; username?: string };

export async function POST(request: Request) {
  const session = await getCurrentPortalUser();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== "hr_admin") {
    return NextResponse.json({ error: "Admins only." }, { status: 403 });
  }

  try {
    const { csv } = (await request.json()) as { csv?: string };
    if (!csv || !csv.trim()) {
      return NextResponse.json({ error: "Paste some CSV data first." }, { status: 400 });
    }

    const lines = csv
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lines.length < 2) {
      return NextResponse.json(
        { error: "Need a header row plus at least one data row." },
        { status: 400 }
      );
    }

    const headers = splitCsvLine(lines[0]).map(normKey);
    const colIndex: Record<string, number> = {};
    headers.forEach((h, i) => {
      const key = HEADER_MAP[h];
      if (key && !(key in colIndex)) colIndex[key] = i;
    });

    if (!("username" in colIndex) || !("email" in colIndex)) {
      return NextResponse.json(
        { error: "CSV must include at least 'username' and 'email' columns." },
        { status: 400 }
      );
    }

    const results: RowResult[] = [];
    const seenUsernames = new Set<string>();
    const seenEmails = new Set<string>();
    let createdCount = 0;

    const cell = (cols: string[], key: string): string =>
      key in colIndex ? (cols[colIndex[key]] ?? "").trim() : "";

    for (let r = 1; r < lines.length; r++) {
      const cols = splitCsvLine(lines[r]);
      const rowNo = r + 1; // human-friendly (1-based incl. header)

      const username = normalizeUsername(cell(cols, "username"));
      const firstName = cell(cols, "firstName");
      const middleName = cell(cols, "middleName");
      const lastName = cell(cols, "lastName");
      const email = cell(cols, "email").toLowerCase();
      const role = normalizePortalRole(cell(cols, "role") || "employee");
      const payType = normalizePayType(cell(cols, "payType") || "hourly");
      const hourlyRate = toNum(cell(cols, "hourlyRate"));
      const monthlyRate = toNum(cell(cols, "monthlyRate"));
      const overtimeRate = toNum(cell(cols, "overtimeRate"));
      const leadUsername = normalizeUsername(cell(cols, "leadUsername"));
      const defaultTrade = cell(cols, "defaultTrade") || null;
      const defaultClient = cell(cols, "defaultClient") || null;

      // --- validation ---
      if (!username || !firstName || !lastName || !email) {
        results.push({ row: rowNo, status: "error", error: "Missing username, first name, last name, or email.", username });
        continue;
      }
      if (!isValidUsername(username)) {
        results.push({ row: rowNo, status: "error", error: "Invalid username (letters, numbers, . _ - ; 3+ chars).", username });
        continue;
      }
      if (!EMAIL_RE.test(email)) {
        results.push({ row: rowNo, status: "error", error: "Invalid email.", username });
        continue;
      }
      if (payType === "hourly" && (!hourlyRate || hourlyRate <= 0)) {
        results.push({ row: rowNo, status: "error", error: "Hourly rate > 0 required for hourly pay.", username });
        continue;
      }
      if (payType === "monthly" && (!monthlyRate || monthlyRate <= 0)) {
        results.push({ row: rowNo, status: "error", error: "Monthly rate > 0 required for monthly pay.", username });
        continue;
      }
      if (seenUsernames.has(username)) {
        results.push({ row: rowNo, status: "error", error: "Duplicate username within this file.", username });
        continue;
      }
      if (seenEmails.has(email)) {
        results.push({ row: rowNo, status: "error", error: "Duplicate email within this file.", username });
        continue;
      }
      if (await findPortalUserByUsername(username)) {
        results.push({ row: rowNo, status: "error", error: "Username already exists.", username });
        continue;
      }
      if (await findPortalUserByEmail(email)) {
        results.push({ row: rowNo, status: "error", error: "Email already exists.", username });
        continue;
      }

      // Resolve optional team lead by username (must already exist).
      let leadUserId: number | null = null;
      if (leadUsername) {
        const lead = await findPortalUserByUsername(leadUsername);
        if (!lead) {
          results.push({ row: rowNo, status: "error", error: `Team lead '${leadUsername}' not found.`, username });
          continue;
        }
        leadUserId = lead.id;
      }

      try {
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

        seenUsernames.add(username);
        seenEmails.add(email);
        createdCount++;
        results.push({ row: rowNo, status: "created", username, email, tempPassword });
      } catch (err) {
        console.error(`Bulk row ${rowNo} failed:`, err);
        results.push({ row: rowNo, status: "error", error: "Could not create (server error).", username });
      }
    }

    await logActivity(
      session,
      "portal_bulk_import",
      `Bulk import: ${createdCount} created, ${results.length - createdCount} skipped`
    );

    return NextResponse.json({
      ok: true,
      createdCount,
      errorCount: results.length - createdCount,
      results,
    });
  } catch (err) {
    console.error("Bulk import error:", err);
    return NextResponse.json({ error: "Unable to process the import." }, { status: 500 });
  }
}
