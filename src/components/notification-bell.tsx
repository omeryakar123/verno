import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Bell } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { NotificationsPanel, type NotificationItem } from "@/components/notifications-panel";

export function NotificationBell() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unread, setUnread] = useState(0);
  const boxRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch("/api/notifications?limit=15", { credentials: "include" });
      if (!res.ok) return;
      const d = (await res.json()) as { items: NotificationItem[]; unread: number };
      setItems(d.items ?? []);
      setUnread(d.unread ?? 0);
    } catch {
      /* ignore */
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      setItems([]);
      setUnread(0);
      return;
    }
    load();
    const t = setInterval(load, 30_000);
    return () => clearInterval(t);
  }, [user, load]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  async function markAll() {
    setUnread(0);
    setItems((prev) => prev.map((n) => ({ ...n, read_at: n.read_at ?? new Date().toISOString() })));
    await fetch("/api/notifications", {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ all: true }),
    }).catch(() => {});
  }

  async function markOne(id: string) {
    setUnread((u) => Math.max(0, u - 1));
    setItems((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read_at: n.read_at ?? new Date().toISOString() } : n)),
    );
    await fetch("/api/notifications", {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    }).catch(() => {});
  }

  if (!user) return null;

  return (
    <div className="relative shrink-0" ref={boxRef}>
      <button
        type="button"
        onClick={() => {
          setOpen((o) => !o);
          if (!open) load();
        }}
        aria-label={unread > 0 ? `${unread} непрочетени известия` : "Известия"}
        className="relative grid place-items-center size-9 rounded-full text-navy hover:text-ink hover:bg-surface transition"
      >
        <Bell className="size-[18px]" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 grid place-items-center rounded-full bg-danger text-[10px] font-bold text-white tabular-nums">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40 sm:hidden bg-black/20" onClick={() => setOpen(false)} aria-hidden />
          <div className="fixed left-3 right-3 top-[4.25rem] z-50 sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-2 sm:w-[360px] rounded-[20px] bg-white shadow-[0_8px_30px_rgb(0_0_0_/_0.12)] ring-1 ring-black/5 overflow-hidden max-h-[min(70vh,440px)] flex flex-col">
            <NotificationsPanel
              items={items}
              unread={unread}
              onMarkAll={markAll}
              onMarkOne={markOne}
              onNavigate={() => setOpen(false)}
              compact
            />
            <div className="border-t border-rule px-4 py-2.5 shrink-0 bg-gray-50/60">
              <Link
                to="/bildirimlerim"
                onClick={() => setOpen(false)}
                className="block text-center text-[12px] font-semibold text-brand hover:underline"
              >
                Виж всички известия
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
