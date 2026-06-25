import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentPortalUser } from "@/lib/portal-auth";
import { listTimesheetsForUser } from "@/lib/timesheets";
import PortalHeader from "../PortalHeader";
import StatusBadge from "./StatusBadge";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function TimesheetsListPage() {
  const session = await getCurrentPortalUser();
  if (!session) redirect("/portal/login");

  const timesheets = await listTimesheetsForUser(session.uid);

  return (
    <div className="min-h-screen">
      <PortalHeader title="My Timesheets" backHref="/portal" />

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            Timesheets <span className="text-gray-400 font-normal">({timesheets.length})</span>
          </h2>
          <Link
            href="/portal/timesheets/new"
            className="bg-emerald-600 text-white rounded-lg px-4 py-2 text-sm font-semibold hover:bg-emerald-700 transition-colors"
          >
            + New timesheet
          </Link>
        </div>

        <div className="rounded-xl bg-white border border-gray-200 overflow-hidden">
          {timesheets.length === 0 ? (
            <p className="p-6 text-sm text-gray-500">
              No timesheets yet. Click “New timesheet” to create your first one.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 text-left">
                  <tr>
                    <th className="px-4 py-3 font-medium">Coverage</th>
                    <th className="px-4 py-3 font-medium">Hours</th>
                    <th className="px-4 py-3 font-medium">Entries</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Submitted</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {timesheets.map((t) => (
                    <tr key={t.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-900 font-medium">
                        {t.coverage_start} → {t.coverage_end}
                      </td>
                      <td className="px-4 py-3 text-gray-700">{Number(t.total_hours).toFixed(2)}</td>
                      <td className="px-4 py-3 text-gray-700">{t.entry_count}</td>
                      <td className="px-4 py-3"><StatusBadge status={t.status} /></td>
                      <td className="px-4 py-3 text-gray-500">{t.submitted_at ?? "—"}</td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/portal/timesheets/${t.id}`}
                          className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
                        >
                          {["draft", "rejected"].includes(t.status) ? "Edit" : "View"} →
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
