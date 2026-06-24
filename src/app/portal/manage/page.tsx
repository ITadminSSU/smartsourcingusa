import { redirect } from "next/navigation";
import { getCurrentPortalUser } from "@/lib/portal-auth";
import PortalHeader from "../PortalHeader";
import ManageEmployees from "./ManageEmployees";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function ManagePage() {
  const session = await getCurrentPortalUser();
  if (!session) redirect("/portal/login");
  if (session.role !== "hr_admin") redirect("/portal");

  return (
    <div className="min-h-screen">
      <PortalHeader title="Manage Staff" backHref="/portal" width="max-w-6xl" />

      <main className="max-w-6xl mx-auto px-6 py-8">
        <ManageEmployees />
      </main>
    </div>
  );
}
