import { redirect } from "next/navigation";
import { getCurrentPortalUser } from "@/lib/portal-auth";
import { getEmployeeProfile } from "@/lib/payroll";
import {
  getTimesheetEntries,
  getTimesheetRecord,
  isEditable,
} from "@/lib/timesheets";
import PortalHeader from "../../PortalHeader";
import StatusBadge from "../StatusBadge";
import TimesheetEditor, { type EditorEntry } from "../TimesheetEditor";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function TimesheetDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getCurrentPortalUser();
  if (!session) redirect("/portal/login");

  const id = Number((await params).id);
  const record = await getTimesheetRecord(id);
  if (!record || record.user_id !== session.uid) redirect("/portal/timesheets");

  const entries = await getTimesheetEntries(id);
  const editable = isEditable(record.status);

  return (
    <div className="min-h-screen">
      <PortalHeader
        title={`Timesheet #${record.id}`}
        backHref="/portal/timesheets"
        backLabel="All timesheets"
      />

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        <div className="flex items-center gap-3">
          <StatusBadge status={record.status} />
          <span className="text-sm text-gray-500">
            {record.coverage_start} → {record.coverage_end}
          </span>
        </div>

        {record.status === "rejected" && record.review_notes && (
          <div className="rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm px-4 py-3">
            <span className="font-semibold">Sent back: </span>
            {record.review_notes}
          </div>
        )}

        {editable ? (
          <>
            {record.status === "rejected" && (
              <p className="text-sm text-gray-600">
                This timesheet was sent back. Make changes below and submit again.
              </p>
            )}
            <EditableEditor record={record} entries={entries} userId={session.uid} />
          </>
        ) : (
          <ReadOnlyView record={record} entries={entries} />
        )}
      </main>
    </div>
  );
}

async function EditableEditor({
  record,
  entries,
  userId,
}: {
  record: Awaited<ReturnType<typeof getTimesheetRecord>>;
  entries: Awaited<ReturnType<typeof getTimesheetEntries>>;
  userId: number;
}) {
  const profile = await getEmployeeProfile(userId);
  const mapped: EditorEntry[] = entries.map((e) => ({
    work_date: e.work_date ?? "",
    start_mst: e.start_mst ?? "",
    end_mst: e.end_mst ?? "",
    start_ph: e.start_ph ?? "",
    end_ph: e.end_ph ?? "",
    trade: e.trade ?? "",
    client: e.client ?? "",
    hours: e.hours ?? "",
    activity: e.activity ?? "",
  }));

  return (
    <TimesheetEditor
      initial={{
        id: record!.id,
        coverage_start: record!.coverage_start,
        coverage_end: record!.coverage_end,
        notes: record!.notes,
        entries: mapped,
      }}
      defaultTrade={profile?.default_trade ?? null}
      defaultClient={profile?.default_client ?? null}
    />
  );
}

function ReadOnlyView({
  record,
  entries,
}: {
  record: NonNullable<Awaited<ReturnType<typeof getTimesheetRecord>>>;
  entries: Awaited<ReturnType<typeof getTimesheetEntries>>;
}) {
  return (
    <div className="space-y-6">
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
          <h3 className="text-sm font-semibold text-gray-900 mb-1">Notes</h3>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{record.notes}</p>
        </div>
      )}

      <p className="text-xs text-gray-500">
        Submitted timesheets are locked while under review. If you need changes, ask your reviewer to
        send it back.
      </p>
    </div>
  );
}
