import { redirect } from "next/navigation";
import { isDbConfigured } from "@/lib/db";
import { countUsers } from "@/lib/auth";
import SetupForm from "./SetupForm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function AdminSetupPage() {
  if (!isDbConfigured()) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
          <h1 className="text-xl font-bold text-gray-900 mb-2">Database not connected</h1>
          <p className="text-sm text-gray-600">
            Add your MySQL environment variables, then reload this page to create the first admin
            account.
          </p>
        </div>
      </div>
    );
  }

  let userCount = 0;
  try {
    userCount = await countUsers();
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Unknown error";
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
          <h1 className="text-xl font-bold text-gray-900 mb-2">Database not ready</h1>
          <p className="text-sm text-gray-600 mb-3">
            Could not reach the database or the tables don&apos;t exist yet. Run{" "}
            <code className="bg-gray-100 px-1 rounded">database/schema.sql</code> first.
          </p>
          <p className="text-xs text-left bg-gray-50 border border-gray-200 rounded-lg p-3 font-mono text-red-700 break-words">
            {message}
          </p>
        </div>
      </div>
    );
  }

  if (userCount > 0) redirect("/admin/login");

  return <SetupForm />;
}
