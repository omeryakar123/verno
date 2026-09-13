import type { Company } from "@/lib/mock-data";
import { formatCompactCount } from "@/lib/mock-data";

export type TrendBrand = Company & {
  recentComplaints: number;
  priorComplaints: number;
  recentViews: number;
  recentSupports: number;
  trendScore: number;
};

export type TrendBadge = "hot" | "rising" | "views" | "support" | "active";

export function trendGrowthPct(recent: number, prior: number): number | null {
  if (prior <= 0) return recent > 0 ? 100 : null;
  return Math.round(((recent - prior) / prior) * 100);
}

export function trendBadge(
  brand: Pick<TrendBrand, "recentComplaints" | "priorComplaints" | "recentViews" | "recentSupports">,
  rank: number,
): TrendBadge {
  if (rank <= 3 && brand.recentComplaints >= 3) return "hot";
  const growth = trendGrowthPct(brand.recentComplaints, brand.priorComplaints);
  if (growth != null && growth >= 40 && brand.recentComplaints >= 2) return "rising";
  if (brand.recentViews >= 500) return "views";
  if (brand.recentSupports >= 5) return "support";
  return "active";
}

export const TREND_BADGE_LABEL: Record<TrendBadge, string> = {
  hot: "Най-обсъждана",
  rising: "Във възход",
  views: "Висок интерес",
  support: "С подкрепа",
  active: "Активна",
};

export function trendPrimaryReason(
  brand: Pick<TrendBrand, "recentComplaints" | "recentViews" | "recentSupports">,
): string {
  if (brand.recentComplaints >= 1) {
    return `${formatCompactCount(brand.recentComplaints)} нови жалби за 7 дни`;
  }
  if (brand.recentViews >= 100) {
    return `${formatCompactCount(brand.recentViews)} прегледа`;
  }
  if (brand.recentSupports >= 1) {
    return `${formatCompactCount(brand.recentSupports)} подкрепи от общността`;
  }
  return "В дневния ред тази седмица";
}

export function trendSecondaryDetail(
  brand: Pick<TrendBrand, "recentComplaints" | "priorComplaints" | "recentViews" | "recentSupports">,
): string | null {
  const growth = trendGrowthPct(brand.recentComplaints, brand.priorComplaints);
  if (growth != null && brand.recentComplaints > 0) {
    const sign = growth >= 0 ? "+" : "";
    return `${sign}${growth}% жалби спрямо миналата седмица`;
  }
  if (brand.recentViews >= 50 && brand.recentComplaints > 0) {
    return `${formatCompactCount(brand.recentViews)} прегледа`;
  }
  if (brand.recentSupports > 0 && brand.recentComplaints === 0) {
    return `${formatCompactCount(brand.recentSupports)} гласа подкрепа`;
  }
  return null;
}
