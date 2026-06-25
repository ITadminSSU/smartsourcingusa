import { NextResponse } from "next/server";
import { getCurrentPortalUser } from "@/lib/portal-auth";
import { listAllInvoices, listInvoicesForUser } from "@/lib/invoices";

export const runtime = "nodejs";

export async function GET() {
  const session = await getCurrentPortalUser();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const seeAll = session.role === "accounting" || session.role === "hr_admin";
  const items = seeAll
    ? await listAllInvoices()
    : await listInvoicesForUser(session.uid);

  return NextResponse.json({ items });
}
