import CaseStudiesPage from "@/components/pages/CaseStudiesPage";
import { getStats } from "@/lib/stats";

export const dynamic = "force-dynamic";

export default async function Page() {
  const stats = await getStats();
  return <CaseStudiesPage stats={stats} />;
}
