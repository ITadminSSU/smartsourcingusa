import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentPortalUser } from "@/lib/portal-auth";
import { getPayrollRollup } from "@/lib/invoices";
import PortalHeader from "../PortalHeader";
import InvoiceStatusBadge from "../invoices/InvoiceStatusBadge";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function money(n: string | number): string {
  return Number(n).toLocaleString("en-US", { style: "currency", currency: "USD" });
}

export default async function PayrollPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string; status?: string }>;
}) {
  const session = await getCurrentPortalUser();
  if (!session) redirect("/portal/login");
  if (session.role !== "accounting" && session.role !== "hr_admin") {
    redirect("/portal");
  }

  const sp = await searchParams;
  const rollup = await getPayrollRollup({
    from: sp.from,
    to: sp.to,
    status: sp.status,
  });
  const { rows, totals, filters } = rollup;

  const csvQuery = new URLSearchParams();
  if (filters.from) csvQuery.set("from", filters.from);
  if (filters.to) csvQuery.set("to", filters.to);
  if (filters.status !== "all") csvQuery.set("status", filters.status);
  const csvHref = `/api/portal/payroll/csv${csvQuery.toString() ? `?${csvQuery}` : ""}`;

  return (
    <div className="min-h-screen">
      <PortalHeader title="Payroll" backHref="/portal" width="max-w-6xl" />

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        {/* Filters */}
        <form method="get" className="rounded-xl bg-white border border-gray-200 p-5 flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">From</label>
            <input
              type="date"
              name="from"
              defaultValue={filters.from ?? ""}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">To</label>
            <input
              type="date"
              name="to"
              defaultValue={filters.to ?? ""}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
            <select
              name="status"
              defaultValue={filters.status}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="paid">Paid</option>
            </select>
          </div>
          <button
            type="submit"
            className="bg-emerald-600 text-white rounded-lg px-4 py-2 text-sm font-semibold hover:bg-emerald-700 transition-colors"
          >
            Apply
          </button>
          <Link
            href="/portal/payroll"
            className="text-sm font-medium text-gray-500 hover:text-gray-800 px-2 py-2"
          >
            Reset
          </Link>
          <div className="ml-auto">
            <a
              href={csvHref}
              className="inline-flex items-center bg-white text-emerald-700 border border-emerald-600 rounded-lg px-4 py-2 text-sm font-semibold hover:bg-emerald-50 transition-colors"
            >
              Export CSV
            </a>
          </div>
        </form>

        {/* Summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <SummaryCard label="Invoices" value={String(totals.count)} />
          <SummaryCard label="Total hours" value={totals.hours.toFixed(2)} />
          <SummaryCard label="Subtotal" value={money(totals.subtotal)} />
          <SummaryCard label="Total due" value={money(totals.totalDue)} highlight />
        </div>

        {/* Table */}
        <div className="rounded-xl bg-white border border-gray-200 overflow-hidden">
          {rows.length === 0 ? (
            <p className="p-6 text-sm text-gray-500">No invoices match these filters.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 text-left">
                  <tr>
                    <th className="px-4 py-3 font-medium">Invoice #</th>
                    <th className="px-4 py-3 font-medium">Employee</th>
                    <th className="px-4 py-3 font-medium">Date</th>
                    <th className="px-4 py-3 font-medium">Coverage</th>
                    <th className="px-4 py-3 font-medium text-right">Hours</th>
                    <th className="px-4 py-3 font-medium text-right">Total</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {rows.map((r) => (
                    <tr key={r.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-gray-900">{r.invoice_no}</td>
                      <td className="px-4 py-3 text-gray-700">{r.employee_name}</td>
                      <td className="px-4 py-3 text-gray-500">{r.invoice_date}</td>
                      <td className="px-4 py-3 text-gray-700">
                        {r.coverage_start && r.coverage_end
                          ? `${r.coverage_start} → ${r.coverage_end}`
                          : "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-700 text-right">
                        {Number(r.hours ?? 0).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-gray-900 font-medium text-right">
                        {money(r.total_due)}
                      </td>
                      <td className="px-4 py-3"><InvoiceStatusBadge status={r.status} /></td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/portal/invoices/${r.id}`}
                          className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
                        >
                          View →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-50 font-semibold text-gray-800">
                    <td className="px-4 py-3" colSpan={4}>
                      Total ({totals.count})
                    </td>
                    <td className="px-4 py-3 text-right">{totals.hours.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right">{money(totals.totalDue)}</td>
                    <td colSpan={2} />
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        highlight ? "bg-emerald-600 border-emerald-600 text-white" : "bg-white border-gray-200"
      }`}
    >
      <p className={`text-xs ${highlight ? "text-emerald-100" : "text-gray-500"}`}>{label}</p>
      <p className={`mt-1 text-xl font-bold ${highlight ? "text-white" : "text-gray-900"}`}>
        {value}
      </p>
    </div>
  );
}
