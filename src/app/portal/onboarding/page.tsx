import { redirect } from "next/navigation";
import { getCurrentPortalUser } from "@/lib/portal-auth";
import { getEmployeeProfile } from "@/lib/payroll";
import OnboardingForm from "./OnboardingForm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const session = await getCurrentPortalUser();
  if (!session) redirect("/portal/login");

  const profile = await getEmployeeProfile(session.uid);
  const bankAlreadySet = Boolean(profile?.bank_set);

  // Nothing left to do — go to the dashboard.
  if (!session.mustChange && bankAlreadySet) redirect("/portal");

  return (
    <OnboardingForm
      name={session.name}
      needsPassword={session.mustChange}
      bankAlreadySet={bankAlreadySet}
    />
  );
}
