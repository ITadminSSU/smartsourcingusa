import { NextResponse } from "next/server";
import { logActivity } from "@/lib/auth";
import { getCurrentPortalUser } from "@/lib/portal-auth";
import { getPayrollRollup, rollupToCsv } from "@/lib/invoices";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const session = await getCurrentPortalUser();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== "accounting" && session.role !== "hr_admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const url = new URL(request.url);
  const rollup = await getPayrollRollup({
    from: url.searchParams.get("from"),
    to: url.searchParams.get("to"),
    status: url.searchParams.get("status"),
  });

  const csv = rollupToCsv(rollup);
  const f = rollup.filters;
  const namePart = [f.from ?? "all", f.to ?? "all"].join("_");

  await logActivity(
    session,
    "payroll_export",
    `Exported payroll CSV (${rollup.totals.count} invoices, ${f.from ?? "all"}..${f.to ?? "all"}, status ${f.status})`
  );

  // Prepend a BOM so Excel opens UTF-8 correctly.
  return new NextResponse("\uFEFF" + csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="payroll-${namePart}.csv"`,
      "Cache-Control": "private, no-store",
    },
  });
}
