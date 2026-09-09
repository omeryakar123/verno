import { Link } from "@tanstack/react-router";
import { Bell, Check, ClipboardList, MessageSquare, RefreshCw, Reply } from "lucide-react";
import { cn } from "@/lib/utils";

export type NotificationItem = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  read_at: string | null;
  created_at: string;
};

const ICONS: Record<string, typeof Bell> = {
  brand_reply: Reply,
  comment: MessageSquare,
  status_change: RefreshCw,
  resolution: Check,
  system: ClipboardList,
};

export function agoBg(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "току що";
  if (m < 60) return `преди ${m} мин.`;
  const h = Math.floor(m / 60);
  if (h < 24) return `преди ${h} ч.`;
  const d = Math.floor(h / 24);
  if (d < 7) return `преди ${d} д.`;
  return new Date(iso).toLocaleDateString("bg-BG");
}

type Props = {
  items: NotificationItem[];
  unread: number;
  onMarkAll?: () => void;
  onMarkOne?: (id: string) => void;
  onNavigate?: () => void;
  compact?: boolean;
  className?: string;
};

export function NotificationsPanel({
  items,
  unread,
  onMarkAll,
  onMarkOne,
  onNavigate,
  compact,
  className,
}: Props) {
  return (
    <div className={cn("flex flex-col", className)}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-rule shrink-0">
        <span className="text-[13px] font-semibold text-ink">Известия</span>
        {unread > 0 && onMarkAll && (
          <button type="button" onClick={onMarkAll} className="text-[12px] font-medium text-brand hover:underline">
            Маркирай всички като прочетени
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <p className="px-4 py-10 text-center text-[13px] text-navy-mid">Нямате известия.</p>
      ) : (
        <ul className={cn("divide-y divide-rule", compact ? "overflow-y-auto flex-1 min-h-0" : "")}>
          {items.map((n) => {
            const Icon = ICONS[n.type] ?? Bell;
            const unreadItem = !n.read_at;
            const content = (
              <div className={cn("flex gap-3 px-4 py-3.5", unreadItem && "bg-brand-soft/35")}>
                <span className="mt-0.5 grid place-items-center size-9 shrink-0 rounded-full bg-brand-soft text-brand">
                  <Icon className="size-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[13px] font-medium text-ink break-words">{n.title}</span>
                  {n.body && (
                    <span className="mt-0.5 block text-[12px] text-navy-mid line-clamp-2 break-words">{n.body}</span>
                  )}
                  <span className="mt-1 block text-[11px] text-navy-mid">{agoBg(n.created_at)}</span>
                </span>
                {unreadItem && <span className="mt-2 size-2 shrink-0 rounded-full bg-brand" />}
              </div>
            );

            return (
              <li key={n.id}>
                {n.link ? (
                  <Link
                    to={n.link}
                    onClick={() => {
                      if (unreadItem) onMarkOne?.(n.id);
                      onNavigate?.();
                    }}
                    className="block hover:bg-surface/70 transition-colors"
                  >
                    {content}
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => unreadItem && onMarkOne?.(n.id)}
                    className="block w-full text-left hover:bg-surface/70 transition-colors"
                  >
                    {content}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
