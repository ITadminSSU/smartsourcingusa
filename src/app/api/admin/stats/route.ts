import { NextResponse } from "next/server";
import { getCurrentUser, logActivity } from "@/lib/auth";
import { getStats, saveStats, type CaseStudyStats } from "@/lib/stats";

const STAT_LABELS: Record<keyof CaseStudyStats, string> = {
  totalBids: "Total bids",
  exteriorBids: "Exterior bids",
  drywallBids: "Drywall bids",
  exteriorAmount: "Exterior amount",
  drywallAmount: "Drywall amount",
};

export const runtime = "nodejs";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const stats = await getStats();
  return NextResponse.json(stats);
}

function toNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value.replace(/,/g, ""));
    if (Number.isFinite(n)) return n;
  }
  return null;
}

export async function PUT(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = (await request.json()) as Record<string, unknown>;

    const fields: (keyof CaseStudyStats)[] = [
      "totalBids",
      "exteriorBids",
      "drywallBids",
      "exteriorAmount",
      "drywallAmount",
    ];

    const stats = {} as CaseStudyStats;
    for (const field of fields) {
      const n = toNumber(body[field]);
      if (n === null || n < 0) {
        return NextResponse.json(
          { error: `Please enter a valid number for "${field}".` },
          { status: 400 }
        );
      }
      stats[field] = n;
    }

    const previous = await getStats();
    const changes = fields
      .filter((f) => previous[f] !== stats[f])
      .map((f) => `${STAT_LABELS[f]}: ${previous[f]} → ${stats[f]}`);

    await saveStats(stats, user.email);
    await logActivity(
      user,
      "stats_update",
      changes.length ? changes.join("; ") : "Saved numbers (no values changed)"
    );
    return NextResponse.json({ ok: true, stats });
  } catch (err) {
    console.error("Save stats error:", err);
    return NextResponse.json({ error: "Unable to save. Please try again." }, { status: 500 });
  }
}
