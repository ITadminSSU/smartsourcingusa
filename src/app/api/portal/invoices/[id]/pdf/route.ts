import { NextResponse } from "next/server";
import { getCurrentPortalUser, getPortalUserById, fullName } from "@/lib/portal-auth";
import { getBankInfo } from "@/lib/payroll";
import { getInvoiceForViewer, getInvoiceLines } from "@/lib/invoices";
import { renderInvoicePdf } from "@/lib/invoice-pdf";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_request: Request, ctx: Ctx) {
  const session = await getCurrentPortalUser();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = Number((await ctx.params).id);
  const invoice = await getInvoiceForViewer(id, session);
  if (!invoice) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const lines = await getInvoiceLines(id);

  const user = await getPortalUserById(invoice.user_id);
  const employeeName = user ? fullName(user) : "";

  // Full bank details are only included on the payment PDF. Fall back to the
  // masked snapshot if live decryption isn't possible (e.g. key not configured).
  let bankName = invoice.bank_name_snap;
  let bankAccount = invoice.bank_account_snap;
  try {
    const bank = await getBankInfo(invoice.user_id);
    if (bank) {
      bankName = bank.bankName;
      bankAccount = bank.bankAccount;
    }
  } catch {
    // keep snapshot fallback
  }

  const pdf = await renderInvoicePdf({
    invoice,
    lines,
    employeeName,
    bankName,
    bankAccount,
  });

  return new NextResponse(new Uint8Array(pdf), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${invoice.invoice_no}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
