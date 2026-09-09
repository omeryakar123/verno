/** Kullanıcı rozet tanımları — e-posta doğrulama, şikayet ve çözüm kilometre taşları. */

export type UserBadgeId = "verified" | "first_complaint" | "complaint_10" | "happy_user";

export type UserBadgeStats = {
  emailVerified: boolean;
  complaintCount: number;
  resolvedCount: number;
};

export type UserBadgeDef = {
  id: UserBadgeId;
  title: string;
  description: string;
  tier: number;
  tone: "brand" | "info" | "warning" | "success";
};

export const USER_BADGE_ORDER: UserBadgeId[] = [
  "verified",
  "first_complaint",
  "complaint_10",
  "happy_user",
];

export const USER_BADGE_DEFS: Record<UserBadgeId, UserBadgeDef> = {
  verified: {
    id: "verified",
    title: "Doğrulanmış Kullanıcı",
    description: "E-posta adresini doğruladın.",
    tier: 1,
    tone: "brand",
  },
  first_complaint: {
    id: "first_complaint",
    title: "İlk Ses",
    description: "İlk şikayetini yazdın.",
    tier: 2,
    tone: "info",
  },
  complaint_10: {
    id: "complaint_10",
    title: "Aktif Şikayetçi",
    description: "10 şikayet yazarak toplulukta aktif oldun.",
    tier: 3,
    tone: "warning",
  },
  happy_user: {
    id: "happy_user",
    title: "Mutlu Kullanıcı",
    description: "5'ten fazla şikayetin çözüldü — en üst seviye rozet.",
    tier: 4,
    tone: "success",
  },
};

const THRESHOLDS: Record<UserBadgeId, (s: UserBadgeStats) => boolean> = {
  verified: (s) => s.emailVerified,
  first_complaint: (s) => s.complaintCount >= 1,
  complaint_10: (s) => s.complaintCount >= 10,
  happy_user: (s) => s.resolvedCount > 5,
};

export function computeUserBadges(stats: UserBadgeStats): UserBadgeId[] {
  return USER_BADGE_ORDER.filter((id) => THRESHOLDS[id](stats));
}

export function highestUserBadge(badges: UserBadgeId[]): UserBadgeId | null {
  if (badges.length === 0) return null;
  return badges.reduce((best, id) =>
    USER_BADGE_DEFS[id].tier > USER_BADGE_DEFS[best].tier ? id : best,
  );
}

export type UserBadgeProgress = {
  badge: UserBadgeId;
  current: number;
  target: number;
  label: string;
};

export function nextUserBadgeProgress(stats: UserBadgeStats): UserBadgeProgress | null {
  if (!stats.emailVerified) {
    return { badge: "verified", current: 0, target: 1, label: "E-postanı doğrula" };
  }
  if (stats.complaintCount < 1) {
    return { badge: "first_complaint", current: stats.complaintCount, target: 1, label: "İlk şikayetini yaz" };
  }
  if (stats.complaintCount < 10) {
    return {
      badge: "complaint_10",
      current: stats.complaintCount,
      target: 10,
      label: "Aktif Şikayetçi rozeti",
    };
  }
  if (stats.resolvedCount <= 5) {
    return {
      badge: "happy_user",
      current: stats.resolvedCount,
      target: 6,
      label: "Mutlu Kullanıcı rozeti",
    };
  }
  return null;
}
