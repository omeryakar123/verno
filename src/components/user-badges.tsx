import { BadgeCheck, MessageSquare, Flame, Smile, Lock } from "lucide-react";
import {
  USER_BADGE_DEFS,
  USER_BADGE_ORDER,
  type UserBadgeId,
  type UserBadgeProgress,
} from "@/lib/user-badges";

const ICONS = {
  verified: BadgeCheck,
  first_complaint: MessageSquare,
  complaint_10: Flame,
  happy_user: Smile,
} as const;

const TONE_CLASS = {
  brand: "bg-brand-soft text-brand ring-brand/25",
  info: "bg-info/10 text-info ring-info/25",
  warning: "bg-warning-soft text-warning ring-warning/30",
  success: "bg-success-soft text-success ring-success/25",
  locked: "bg-surface text-navy-mid ring-rule",
} as const;

function badgeTone(id: UserBadgeId, earned: boolean) {
  if (!earned) return TONE_CLASS.locked;
  return TONE_CLASS[USER_BADGE_DEFS[id].tone];
}

export function UserBadgeChip({
  id,
  earned = true,
  size = "sm",
  showLabel = true,
}: {
  id: UserBadgeId;
  earned?: boolean;
  size?: "sm" | "md";
  showLabel?: boolean;
}) {
  const def = USER_BADGE_DEFS[id];
  const Icon = earned ? ICONS[id] : Lock;
  const pad = size === "md" ? "px-2.5 py-1 text-[11px]" : "px-2 py-0.5 text-[10px]";
  return (
    <span
      title={def.description}
      className={`inline-flex items-center gap-1 rounded-full font-semibold ring-1 ring-inset ${pad} ${badgeTone(id, earned)}`}
    >
      <Icon className={size === "md" ? "size-3.5" : "size-3"} />
      {showLabel ? def.title : null}
    </span>
  );
}

export function UserBadgeRow({ badges, limit = 4 }: { badges: UserBadgeId[]; limit?: number }) {
  if (badges.length === 0) return null;
  const shown = badges.slice(-limit);
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {shown.map((id) => (
        <UserBadgeChip key={id} id={id} size="sm" />
      ))}
    </div>
  );
}

export function UserBadgeGrid({
  earned,
  stats,
  next,
}: {
  earned: UserBadgeId[];
  stats: { complaintCount: number; resolvedCount: number };
  next: UserBadgeProgress | null;
}) {
  const earnedSet = new Set(earned);
  return (
    <div className="space-y-4">
      {next && (
        <div className="rounded-xl bg-surface ring-1 ring-rule p-4">
          <div className="flex items-center justify-between gap-3 text-[12px]">
            <span className="font-medium text-ink">Sıradaki rozet: {USER_BADGE_DEFS[next.badge].title}</span>
            <span className="text-navy-mid tabular-nums">
              {next.current}/{next.target}
            </span>
          </div>
          <div className="mt-2 h-2 rounded-full bg-rule overflow-hidden">
            <div
              className="h-full rounded-full bg-brand transition-all"
              style={{ width: `${Math.min(100, Math.round((next.current / next.target) * 100))}%` }}
            />
          </div>
          <p className="mt-2 text-[11px] text-navy-mid">{next.label}</p>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-3">
        {USER_BADGE_ORDER.map((id) => {
          const def = USER_BADGE_DEFS[id];
          const has = earnedSet.has(id);
          const Icon = has ? ICONS[id] : Lock;
          let hint = def.description;
          if (id === "complaint_10") hint = `${stats.complaintCount}/10 şikayet`;
          if (id === "happy_user") hint = `${stats.resolvedCount}/6 çözülen şikayet`;

          return (
            <div
              key={id}
              className={`rounded-xl ring-1 p-4 flex items-start gap-3 ${has ? "bg-card ring-rule" : "bg-surface/60 ring-rule opacity-80"}`}
            >
              <div className={`size-10 shrink-0 rounded-xl grid place-items-center ring-1 ring-inset ${badgeTone(id, has)}`}>
                <Icon className="size-5" />
              </div>
              <div className="min-w-0">
                <div className="text-[13px] font-semibold text-ink">{def.title}</div>
                <div className="mt-0.5 text-[11px] text-navy-mid leading-snug">{hint}</div>
                <div className="mt-1.5 text-[10px] font-bold uppercase tracking-wider text-navy-mid">
                  {has ? "Kazanıldı" : "Kilitli"} · Seviye {def.tier}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
