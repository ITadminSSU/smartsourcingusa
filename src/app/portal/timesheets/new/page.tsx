import { redirect } from "next/navigation";
import { getCurrentPortalUser } from "@/lib/portal-auth";
import { getEmployeeProfile } from "@/lib/payroll";
import PortalHeader from "../../PortalHeader";
import TimesheetEditor from "../TimesheetEditor";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function NewTimesheetPage() {
  const session = await getCurrentPortalUser();
  if (!session) redirect("/portal/login");

  const profile = await getEmployeeProfile(session.uid);

  return (
    <div className="min-h-screen">
      <PortalHeader title="New Timesheet" backHref="/portal/timesheets" backLabel="All timesheets" />

      <main className="max-w-5xl mx-auto px-6 py-8">
        <TimesheetEditor
          initial={null}
          defaultTrade={profile?.default_trade ?? null}
          defaultClient={profile?.default_client ?? null}
        />
      </main>
    </div>
  );
}
