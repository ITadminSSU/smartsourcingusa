import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentPortalUser } from "@/lib/portal-auth";
import { canReviewAtAll, listReviewQueue } from "@/lib/approvals";
import PortalHeader from "../PortalHeader";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function ApprovalsPage() {
  const session = await getCurrentPortalUser();
  if (!session) redirect("/portal/login");
  if (!canReviewAtAll(session.role)) redirect("/portal");

  const items = await listReviewQueue(session);

  return (
    <div className="min-h-screen">
      <PortalHeader title="Approvals" backHref="/portal" />

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            Pending review <span className="text-gray-400 font-normal">({items.length})</span>
          </h2>
        </div>

        <div className="rounded-xl bg-white border border-gray-200 overflow-hidden">
          {items.length === 0 ? (
            <p className="p-6 text-sm text-gray-500">
              Nothing waiting for review right now. Submitted timesheets will show up here.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 text-left">
                  <tr>
                    <th className="px-4 py-3 font-medium">Employee</th>
                    <th className="px-4 py-3 font-medium">Coverage</th>
                    <th className="px-4 py-3 font-medium">Hours</th>
                    <th className="px-4 py-3 font-medium">Entries</th>
                    <th className="px-4 py-3 font-medium">Submitted</th>
                    <th className="px-4 py-3 font-medium">Routed to</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {items.map((t) => (
                    <tr key={t.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-900 font-medium">{t.employee_name}</td>
                      <td className="px-4 py-3 text-gray-700">
                        {t.coverage_start} → {t.coverage_end}
                      </td>
                      <td className="px-4 py-3 text-gray-700">{Number(t.total_hours).toFixed(2)}</td>
                      <td className="px-4 py-3 text-gray-700">{t.entry_count}</td>
                      <td className="px-4 py-3 text-gray-500">{t.submitted_at ?? "—"}</td>
                      <td className="px-4 py-3 text-gray-700">
                        {t.lead_name ? t.lead_name : <span className="text-gray-400">Accounting</span>}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/portal/approvals/${t.id}`}
                          className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
                        >
                          Review →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <p className="text-xs text-gray-500">
          {session.role === "lead"
            ? "You see timesheets from the people who report to you."
            : "You see every submitted timesheet across the team."}
        </p>
      </main>
    </div>
  );
}
