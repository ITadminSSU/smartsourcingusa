import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentPortalUser } from "@/lib/portal-auth";
import { listAllInvoices, listInvoicesForUser } from "@/lib/invoices";
import PortalHeader from "../PortalHeader";
import InvoiceStatusBadge from "./InvoiceStatusBadge";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function money(n: string | number): string {
  return Number(n).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
}

export default async function InvoicesPage() {
  const session = await getCurrentPortalUser();
  if (!session) redirect("/portal/login");

  const seeAll = session.role === "accounting" || session.role === "hr_admin";
  const invoices = seeAll
    ? await listAllInvoices()
    : await listInvoicesForUser(session.uid);

  return (
    <div className="min-h-screen">
      <PortalHeader title={seeAll ? "All Invoices" : "My Invoices"} backHref="/portal" />

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        <h2 className="text-xl font-bold text-gray-900">
          Invoices <span className="text-gray-400 font-normal">({invoices.length})</span>
        </h2>

        <div className="rounded-xl bg-white border border-gray-200 overflow-hidden">
          {invoices.length === 0 ? (
            <p className="p-6 text-sm text-gray-500">
              No invoices yet. They&apos;re generated automatically when a timesheet is approved.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 text-left">
                  <tr>
                    <th className="px-4 py-3 font-medium">Invoice #</th>
                    {seeAll && <th className="px-4 py-3 font-medium">Employee</th>}
                    <th className="px-4 py-3 font-medium">Date</th>
                    <th className="px-4 py-3 font-medium">Coverage</th>
                    <th className="px-4 py-3 font-medium">Type</th>
                    <th className="px-4 py-3 font-medium">Total</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-gray-900">{inv.invoice_no}</td>
                      {seeAll && (
                        <td className="px-4 py-3 text-gray-700">{inv.employee_name}</td>
                      )}
                      <td className="px-4 py-3 text-gray-500">{inv.invoice_date}</td>
                      <td className="px-4 py-3 text-gray-700">
                        {inv.coverage_start && inv.coverage_end
                          ? `${inv.coverage_start} → ${inv.coverage_end}`
                          : "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-700 capitalize">{inv.type}</td>
                      <td className="px-4 py-3 text-gray-900 font-medium">{money(inv.total_due)}</td>
                      <td className="px-4 py-3"><InvoiceStatusBadge status={inv.status} /></td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/portal/invoices/${inv.id}`}
                          className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
                        >
                          View →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
