import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getStats } from "@/lib/stats";
import Dashboard from "./Dashboard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function AdminHomePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");

  const stats = await getStats();

  return (
    <Dashboard
      user={{ name: user.name, email: user.email, role: user.role }}
      initialStats={stats}
    />
  );
}
