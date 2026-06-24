import { redirect } from "next/navigation";
import { isDbConfigured } from "@/lib/db";
import { countPortalUsers } from "@/lib/portal-auth";
import PortalSetupForm from "./PortalSetupForm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function PortalSetupPage() {
  if (!isDbConfigured()) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
          <h1 className="text-xl font-bold text-gray-900 mb-2">Database not connected</h1>
          <p className="text-sm text-gray-600">
            Add your MySQL environment variables, then reload this page to create the first
            admin account.
          </p>
        </div>
      </div>
    );
  }

  let userCount = 0;
  try {
    userCount = await countPortalUsers();
  } catch {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
          <h1 className="text-xl font-bold text-gray-900 mb-2">Database not ready</h1>
          <p className="text-sm text-gray-600">
            Could not reach the database or the portal tables don&apos;t exist yet. Run{" "}
            <code className="bg-gray-100 px-1 rounded">database/migration-payroll.sql</code> first.
          </p>
        </div>
      </div>
    );
  }

  if (userCount > 0) redirect("/portal/login");

  return <PortalSetupForm />;
}
