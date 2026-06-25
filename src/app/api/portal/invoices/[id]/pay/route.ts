import { NextResponse } from "next/server";
import { logActivity } from "@/lib/auth";
import { getCurrentPortalUser } from "@/lib/portal-auth";
import { getInvoice, markInvoicePaid } from "@/lib/invoices";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(_request: Request, ctx: Ctx) {
  const session = await getCurrentPortalUser();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== "accounting" && session.role !== "hr_admin") {
    return NextResponse.json(
      { error: "Only accounting can mark invoices paid." },
      { status: 403 }
    );
  }

  const id = Number((await ctx.params).id);
  const invoice = await getInvoice(id);
  if (!invoice) return NextResponse.json({ error: "Not found." }, { status: 404 });
  if (invoice.status === "paid") {
    return NextResponse.json({ error: "This invoice is already paid." }, { status: 409 });
  }

  await markInvoicePaid(id);
  await logActivity(
    session,
    "invoice_paid",
    `Marked invoice ${invoice.invoice_no} paid ($${invoice.total_due})`
  );
  return NextResponse.json({ ok: true });
}
