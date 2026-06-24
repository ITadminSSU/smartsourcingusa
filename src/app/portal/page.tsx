import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentPortalUser } from "@/lib/portal-auth";
import { getEmployeeProfile } from "@/lib/payroll";
import { canReviewAtAll, countReviewQueue } from "@/lib/approvals";
import PortalHeader from "./PortalHeader";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ROLE_LABELS: Record<string, string> = {
  employee: "Employee",
  lead: "Team Lead",
  accounting: "Accounting",
  hr_admin: "Admin",
};

export default async function PortalDashboard() {
  const session = await getCurrentPortalUser();
  if (!session) redirect("/portal/login");

  const profile = await getEmployeeProfile(session.uid);
  const bankSet = Boolean(profile?.bank_set);

  const isReviewer = canReviewAtAll(session.role);
  const pendingReviews = isReviewer ? await countReviewQueue(session) : 0;
  const isAccounting = session.role === "accounting" || session.role === "hr_admin";

  return (
    <div className="min-h-screen">
      <PortalHeader
        title="Dashboard"
        meta={`${session.name} · ${ROLE_LABELS[session.role] ?? session.role}`}
      />

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Welcome, {session.name.split(" ")[0]}</h2>
          <p className="text-gray-600">Manage your timesheets and invoices here.</p>
        </div>

        {!bankSet && (
          <div className="rounded-lg bg-amber-50 border border-amber-200 px-5 py-4 text-sm text-amber-900 flex items-center justify-between gap-4">
            <span>Your bank details aren&apos;t set yet. They&apos;re needed for invoice payments.</span>
            <Link
              href="/portal/profile"
              className="font-semibold underline hover:no-underline whitespace-nowrap"
            >
              Add bank info
            </Link>
          </div>
        )}

        <div className="grid sm:grid-cols-2 gap-4">
          <Link
            href="/portal/timesheets"
            className="rounded-xl bg-white border border-gray-200 p-6 hover:border-emerald-500 transition-colors"
          >
            <h3 className="font-semibold text-gray-900 mb-1">Timesheets</h3>
            <p className="text-sm text-gray-500">
              Create and submit your hours for a pay period.
            </p>
            <span className="inline-block mt-3 text-xs font-semibold text-emerald-700">Open →</span>
          </Link>

          {isReviewer && (
            <Link
              href="/portal/approvals"
              className="rounded-xl bg-white border border-gray-200 p-6 hover:border-emerald-500 transition-colors"
            >
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-semibold text-gray-900">Approvals</h3>
                {pendingReviews > 0 && (
                  <span className="inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded-full bg-red-500 text-white text-xs font-bold">
                    {pendingReviews}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500">
                {session.role === "lead"
                  ? "Review and approve timesheets from your team."
                  : "Review and approve submitted timesheets."}
              </p>
              <span className="inline-block mt-3 text-xs font-semibold text-emerald-700">
                {pendingReviews > 0 ? `${pendingReviews} waiting →` : "Open →"}
              </span>
            </Link>
          )}

          <Link
            href="/portal/profile"
            className="rounded-xl bg-white border border-gray-200 p-6 hover:border-emerald-500 transition-colors"
          >
            <h3 className="font-semibold text-gray-900 mb-1">My Profile</h3>
            <p className="text-sm text-gray-500">
              Update your info, change your password, and manage bank details.
            </p>
            <span className="inline-block mt-3 text-xs font-semibold text-emerald-700">Open →</span>
          </Link>

          <Link
            href="/portal/invoices"
            className="rounded-xl bg-white border border-gray-200 p-6 hover:border-emerald-500 transition-colors"
          >
            <h3 className="font-semibold text-gray-900 mb-1">Invoices</h3>
            <p className="text-sm text-gray-500">
              {isReviewer
                ? "View invoices auto-generated from approved timesheets."
                : "View your invoices, generated when timesheets are approved."}
            </p>
            <span className="inline-block mt-3 text-xs font-semibold text-emerald-700">Open →</span>
          </Link>

          {isAccounting && (
            <Link
              href="/portal/payroll"
              className="rounded-xl bg-white border border-gray-200 p-6 hover:border-emerald-500 transition-colors"
            >
              <h3 className="font-semibold text-gray-900 mb-1">Payroll</h3>
              <p className="text-sm text-gray-500">
                Roll up invoices by pay period and export CSV for payments.
              </p>
              <span className="inline-block mt-3 text-xs font-semibold text-emerald-700">Open →</span>
            </Link>
          )}

          {session.role === "hr_admin" && (
            <Link
              href="/portal/manage"
              className="rounded-xl bg-white border border-gray-200 p-6 hover:border-emerald-500 transition-colors"
            >
              <h3 className="font-semibold text-gray-900 mb-1">Manage staff accounts</h3>
              <p className="text-sm text-gray-500">
                Create employee accounts, set pay rates, and assign team leads.
              </p>
              <span className="inline-block mt-3 text-xs font-semibold text-emerald-700">Open →</span>
            </Link>
          )}
        </div>
      </main>
    </div>
  );
}
