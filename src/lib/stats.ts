import { isDbConfigured, query } from "./db";

export type CaseStudyStats = {
  totalBids: number;
  exteriorBids: number;
  drywallBids: number;
  exteriorAmount: number;
  drywallAmount: number;
};

// Used when the database is not configured yet (e.g. local preview).
export const DEFAULT_STATS: CaseStudyStats = {
  totalBids: 155,
  exteriorBids: 130,
  drywallBids: 86,
  exteriorAmount: 101118440.07,
  drywallAmount: 54298102.04,
};

type StatsRow = {
  total_bids: number;
  exterior_bids: number;
  drywall_bids: number;
  exterior_amount: string | number;
  drywall_amount: string | number;
};

export async function getStats(): Promise<CaseStudyStats> {
  if (!isDbConfigured()) return DEFAULT_STATS;

  try {
    const rows = await query<StatsRow>(
      "SELECT total_bids, exterior_bids, drywall_bids, exterior_amount, drywall_amount FROM case_study_stats WHERE id = 1 LIMIT 1"
    );
    if (rows.length === 0) return DEFAULT_STATS;
    const r = rows[0];
    return {
      totalBids: Number(r.total_bids),
      exteriorBids: Number(r.exterior_bids),
      drywallBids: Number(r.drywall_bids),
      exteriorAmount: Number(r.exterior_amount),
      drywallAmount: Number(r.drywall_amount),
    };
  } catch (err) {
    console.error("Failed to read case study stats:", err);
    return DEFAULT_STATS;
  }
}

export async function saveStats(
  stats: CaseStudyStats,
  updatedBy: string
): Promise<void> {
  await query(
    `INSERT INTO case_study_stats
      (id, total_bids, exterior_bids, drywall_bids, exterior_amount, drywall_amount, updated_by)
     VALUES
      (1, :totalBids, :exteriorBids, :drywallBids, :exteriorAmount, :drywallAmount, :updatedBy)
     ON DUPLICATE KEY UPDATE
      total_bids = :totalBids,
      exterior_bids = :exteriorBids,
      drywall_bids = :drywallBids,
      exterior_amount = :exteriorAmount,
      drywall_amount = :drywallAmount,
      updated_by = :updatedBy`,
    { ...stats, updatedBy }
  );
}
