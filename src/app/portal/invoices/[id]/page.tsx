import { redirect } from "next/navigation";
import { getCurrentPortalUser } from "@/lib/portal-auth";
import { getInvoiceForViewer, getInvoiceLines } from "@/lib/invoices";
import PortalHeader from "../../PortalHeader";
import InvoiceStatusBadge from "../InvoiceStatusBadge";
import PayButton from "./PayButton";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function money(n: string | number | null): string {
  if (n === null) return "—";
  return Number(n).toLocaleString("en-US", { style: "currency", currency: "USD" });
}

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getCurrentPortalUser();
  if (!session) redirect("/portal/login");

  const id = Number((await params).id);
  const invoice = await getInvoiceForViewer(id, session);
  if (!invoice) redirect("/portal/invoices");

  const lines = await getInvoiceLines(id);
  const canMarkPaid =
    (session.role === "accounting" || session.role === "hr_admin") &&
    invoice.status !== "paid";

  return (
    <div className="min-h-screen">
      <div className="print:hidden">
        <PortalHeader
          title={`Invoice ${invoice.invoice_no}`}
          backHref="/portal/invoices"
          backLabel="All invoices"
          width="max-w-4xl"
        />
      </div>

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        <div className="flex items-center justify-between gap-4 print:hidden">
          <InvoiceStatusBadge status={invoice.status} />
          <div className="flex items-center gap-3">
            <a
              href={`/api/portal/invoices/${invoice.id}/pdf`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center bg-white text-emerald-700 border border-emerald-600 rounded-lg px-4 py-2 text-sm font-semibold hover:bg-emerald-50 transition-colors"
            >
              Download PDF
            </a>
            {canMarkPaid && <PayButton id={invoice.id} />}
          </div>
        </div>

        {/* Invoice document */}
        <div className="rounded-xl bg-white border border-gray-200 p-8 space-y-8">
          <div className="flex items-start justify-between gap-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">INVOICE</h2>
              <p className="mt-1 font-mono text-sm text-gray-600">{invoice.invoice_no}</p>
            </div>
            <div className="text-right text-sm text-gray-600">
              <p><span className="text-gray-400">Invoice date:</span> {invoice.invoice_date}</p>
              {invoice.coverage_start && invoice.coverage_end && (
                <p>
                  <span className="text-gray-400">Coverage:</span> {invoice.coverage_start} → {invoice.coverage_end}
                </p>
              )}
              {invoice.pay_date && (
                <p><span className="text-gray-400">Pay date:</span> {invoice.pay_date}</p>
              )}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-6 text-sm">
            <div>
              <p className="text-gray-400 uppercase text-xs font-semibold mb-1">Bill to</p>
              <p className="font-semibold text-gray-900">{invoice.bill_to}</p>
            </div>
            <div className="sm:text-right">
              <p className="text-gray-400 uppercase text-xs font-semibold mb-1">Remit to</p>
              {invoice.bank_name_snap ? (
                <>
                  <p className="text-gray-900">{invoice.bank_name_snap}</p>
                  <p className="font-mono text-gray-700">{invoice.bank_account_snap ?? "—"}</p>
                </>
              ) : (
                <p className="text-amber-700">Bank details not on file</p>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-left">
                <tr>
                  <th className="px-3 py-2 font-medium">Description</th>
                  <th className="px-3 py-2 font-medium">Trade</th>
                  <th className="px-3 py-2 font-medium">Client</th>
                  <th className="px-3 py-2 font-medium text-right">Hours</th>
                  <th className="px-3 py-2 font-medium text-right">Rate</th>
                  <th className="px-3 py-2 font-medium text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {lines.map((l) => (
                  <tr key={l.id}>
                    <td className="px-3 py-2 text-gray-900">
                      {l.description ?? "—"}
                      {l.line_type !== "regular" && (
                        <span className="ml-2 text-xs text-gray-400 capitalize">({l.line_type})</span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-gray-700">{l.trade ?? "—"}</td>
                    <td className="px-3 py-2 text-gray-700">{l.client ?? "—"}</td>
                    <td className="px-3 py-2 text-gray-700 text-right">
                      {l.hours != null ? Number(l.hours).toFixed(2) : "—"}
                    </td>
                    <td className="px-3 py-2 text-gray-700 text-right">{money(l.rate)}</td>
                    <td className="px-3 py-2 text-gray-900 text-right">{money(l.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end">
            <div className="w-full sm:w-72 space-y-2 text-sm">
              <div className="flex justify-between text-gray-700">
                <span>Subtotal</span>
                <span>{money(invoice.subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>Bank fee (1%)</span>
                <span>{money(invoice.bank_fee)}</span>
              </div>
              <div className="flex justify-between border-t border-gray-200 pt-2 text-base font-bold text-gray-900">
                <span>Total due</span>
                <span>{money(invoice.total_due)}</span>
              </div>
            </div>
          </div>
        </div>

        <p className="text-xs text-gray-500 print:hidden">
          Use “Download PDF” for the official invoice document with full payment details.
        </p>
      </main>
    </div>
  );
}
