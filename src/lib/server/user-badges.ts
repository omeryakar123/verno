import { inArray, sql } from "drizzle-orm";
import { db, schema } from "@/db";
import { COMPLAINT_COUNTED } from "@/lib/server/brand-stats";
import {
  computeUserBadges,
  highestUserBadge,
  nextUserBadgeProgress,
  type UserBadgeId,
  type UserBadgeStats,
  USER_BADGE_DEFS,
} from "@/lib/user-badges";

export type UserBadgePayload = {
  earned: UserBadgeId[];
  highest: UserBadgeId | null;
  stats: UserBadgeStats;
  next: ReturnType<typeof nextUserBadgeProgress>;
  defs: typeof USER_BADGE_DEFS;
};

async function complaintStatsForUsers(
  userIds: string[],
): Promise<Map<string, Pick<UserBadgeStats, "complaintCount" | "resolvedCount">>> {
  const map = new Map<string, Pick<UserBadgeStats, "complaintCount" | "resolvedCount">>();
  if (userIds.length === 0) return map;

  const rows = await db
    .select({
      userId: schema.complaints.userId,
      complaintCount: sql<number>`count(*) FILTER (WHERE ${COMPLAINT_COUNTED})::int`,
      resolvedCount: sql<number>`count(*) FILTER (WHERE ${schema.complaints.status} = 'resolved')::int`,
    })
    .from(schema.complaints)
    .where(inArray(schema.complaints.userId, userIds))
    .groupBy(schema.complaints.userId);

  for (const row of rows) {
    if (!row.userId) continue;
    map.set(row.userId, {
      complaintCount: row.complaintCount ?? 0,
      resolvedCount: row.resolvedCount ?? 0,
    });
  }
  return map;
}

async function emailVerifiedForUsers(userIds: string[]): Promise<Map<string, boolean>> {
  const map = new Map<string, boolean>();
  if (userIds.length === 0) return map;

  const rows = await db
    .select({ id: schema.user.id, emailVerified: schema.user.emailVerified })
    .from(schema.user)
    .where(inArray(schema.user.id, userIds));

  for (const row of rows) {
    map.set(row.id, !!row.emailVerified);
  }
  return map;
}

function buildStats(
  userId: string,
  verifiedMap: Map<string, boolean>,
  complaintMap: Map<string, Pick<UserBadgeStats, "complaintCount" | "resolvedCount">>,
): UserBadgeStats {
  const counts = complaintMap.get(userId);
  return {
    emailVerified: verifiedMap.get(userId) ?? false,
    complaintCount: counts?.complaintCount ?? 0,
    resolvedCount: counts?.resolvedCount ?? 0,
  };
}

export function badgesFromStats(stats: UserBadgeStats): UserBadgePayload {
  const earned = computeUserBadges(stats);
  return {
    earned,
    highest: highestUserBadge(earned),
    stats,
    next: nextUserBadgeProgress(stats),
    defs: USER_BADGE_DEFS,
  };
}

export async function loadUserBadgePayload(userId: string): Promise<UserBadgePayload> {
  const [verifiedMap, complaintMap] = await Promise.all([
    emailVerifiedForUsers([userId]),
    complaintStatsForUsers([userId]),
  ]);
  return badgesFromStats(buildStats(userId, verifiedMap, complaintMap));
}

export async function loadUserBadgesBatch(
  userIds: string[],
): Promise<Map<string, UserBadgeId[]>> {
  const unique = [...new Set(userIds.filter(Boolean))];
  const map = new Map<string, UserBadgeId[]>();
  if (unique.length === 0) return map;

  const [verifiedMap, complaintMap] = await Promise.all([
    emailVerifiedForUsers(unique),
    complaintStatsForUsers(unique),
  ]);

  for (const id of unique) {
    map.set(id, computeUserBadges(buildStats(id, verifiedMap, complaintMap)));
  }
  return map;
}

/** Profil / şikayet yazarının en yüksek rozeti. */
export async function loadHighestUserBadge(userId: string): Promise<UserBadgeId | null> {
  const payload = await loadUserBadgePayload(userId);
  return payload.highest;
}
