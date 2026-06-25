import { redirect } from "next/navigation";
import { getCurrentPortalUser, getPortalUserById } from "@/lib/portal-auth";
import { getBankInfo, getEmployeeProfile } from "@/lib/payroll";
import { maskAccount } from "@/lib/crypto";
import PortalHeader from "../PortalHeader";
import ProfileForm from "./ProfileForm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await getCurrentPortalUser();
  if (!session) redirect("/portal/login");

  const [user, profile, bank] = await Promise.all([
    getPortalUserById(session.uid),
    getEmployeeProfile(session.uid),
    getBankInfo(session.uid),
  ]);
  if (!user) redirect("/portal/login");

  return (
    <div className="min-h-screen">
      <PortalHeader title="My Profile" backHref="/portal" />

      <main className="max-w-3xl mx-auto px-6 py-8">
        <ProfileForm
          initialAccount={{
            username: user.username,
            firstName: user.first_name,
            middleName: user.middle_name ?? "",
            lastName: user.last_name,
            email: user.email,
            role: user.role,
          }}
          initialBank={{
            set: Boolean(profile?.bank_set),
            bankName: bank?.bankName ?? null,
            accountMasked: bank ? maskAccount(bank.bankAccount) : null,
          }}
        />
      </main>
    </div>
  );
}
