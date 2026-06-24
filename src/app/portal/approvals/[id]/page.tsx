import { redirect } from "next/navigation";
import { getCurrentPortalUser } from "@/lib/portal-auth";
import { canReview, canReviewAtAll, getReviewContext } from "@/lib/approvals";
import { getTimesheetEntries } from "@/lib/timesheets";
import PortalHeader from "../../PortalHeader";
import StatusBadge from "../../timesheets/StatusBadge";
import ReviewActions from "./ReviewActions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function ReviewDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getCurrentPortalUser();
  if (!session) redirect("/portal/login");
  if (!canReviewAtAll(session.role)) redirect("/portal");

  const id = Number((await params).id);
  const ctx = await getReviewContext(id);
  if (!ctx) redirect("/portal/approvals");

  // A lead can only open their own reports; accounting/hr_admin can open anyone.
  const actionable = canReview(session, ctx);
  if (
    !actionable &&
    !(session.role === "accounting" || session.role === "hr_admin")
  ) {
    redirect("/portal/approvals");
  }

  const record = ctx.record;
  const entries = await getTimesheetEntries(id);

  return (
    <div className="min-h-screen">
      <PortalHeader
        title={`Review timesheet #${record.id}`}
        backHref="/portal/approvals"
        backLabel="Approvals"
      />

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        <div className="rounded-xl bg-white border border-gray-200 p-5">
          <div className="grid sm:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Employee</p>
              <p className="font-semibold text-gray-900">{ctx.employee.name}</p>
              <p className="text-gray-500 text-xs">{ctx.employee.email}</p>
            </div>
            <div>
              <p className="text-gray-500">Coverage</p>
              <p className="font-semibold text-gray-900">
                {record.coverage_start} → {record.coverage_end}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Status</p>
              <StatusBadge status={record.status} />
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-left">
                <tr>
                  <th className="px-3 py-2 font-medium">Date</th>
                  <th className="px-3 py-2 font-medium">Start (MST)</th>
                  <th className="px-3 py-2 font-medium">End (MST)</th>
                  <th className="px-3 py-2 font-medium">Start (PH)</th>
                  <th className="px-3 py-2 font-medium">End (PH)</th>
                  <th className="px-3 py-2 font-medium">Trade</th>
                  <th className="px-3 py-2 font-medium">Client</th>
                  <th className="px-3 py-2 font-medium">Hours</th>
                  <th className="px-3 py-2 font-medium">Activity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {entries.map((e) => (
                  <tr key={e.id}>
                    <td className="px-3 py-2 text-gray-900">{e.work_date}</td>
                    <td className="px-3 py-2 text-gray-700">{e.start_mst ?? "—"}</td>
                    <td className="px-3 py-2 text-gray-700">{e.end_mst ?? "—"}</td>
                    <td className="px-3 py-2 text-gray-700">{e.start_ph ?? "—"}</td>
                    <td className="px-3 py-2 text-gray-700">{e.end_ph ?? "—"}</td>
                    <td className="px-3 py-2 text-gray-700">{e.trade ?? "—"}</td>
                    <td className="px-3 py-2 text-gray-700">{e.client ?? "—"}</td>
                    <td className="px-3 py-2 text-gray-700">{Number(e.hours).toFixed(2)}</td>
                    <td className="px-3 py-2 text-gray-700">{e.activity ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-50 font-semibold text-gray-800">
                  <td className="px-3 py-2" colSpan={7}>Total hours</td>
                  <td className="px-3 py-2">{Number(record.total_hours).toFixed(2)}</td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {record.notes && (
          <div className="rounded-xl bg-white border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-1">Employee notes</h3>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{record.notes}</p>
          </div>
        )}

        {actionable ? (
          <ReviewActions id={record.id} />
        ) : (
          <p className="rounded-lg bg-gray-50 border border-gray-200 px-4 py-3 text-sm text-gray-600">
            This timesheet is no longer pending review, so there are no actions to take.
          </p>
        )}
      </main>
    </div>
  );
}
