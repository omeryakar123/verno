import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { Bell, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { authClient } from "@/lib/auth-client";
import { ProfileAccountSidebar } from "@/components/profile-account-sidebar";
import { NotificationsPanel, type NotificationItem } from "@/components/notifications-panel";
import { Pagination } from "@/components/pagination";
import { privateHead, SITE_NAME } from "@/lib/seo";

const PAGE_SIZE = 20;

export const Route = createFileRoute("/_site/bildirimlerim")({
  head: () => privateHead(`Известия — ${SITE_NAME}`, "/bildirimlerim"),
  component: BildirimlerimPage,
});

function BildirimlerimPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unread, setUnread] = useState(0);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) navigate({ to: "/login" });
  }, [authLoading, user, navigate]);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/notifications?limit=${PAGE_SIZE * page}`, { credentials: "include" });
      if (!res.ok) return;
      const d = (await res.json()) as { items: NotificationItem[]; unread: number };
      setItems(d.items ?? []);
      setUnread(d.unread ?? 0);
      setTotal((d.items ?? []).length);
    } finally {
      setLoading(false);
    }
  }, [user, page]);

  useEffect(() => {
    load();
  }, [load]);

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

  async function logout() {
    await authClient.signOut();
    navigate({ to: "/" });
  }

  if (authLoading || loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 text-center text-navy-mid">
        <Loader2 className="mx-auto size-7 animate-spin" />
        <p className="mt-3 text-[14px]">Зареждане…</p>
      </div>
    );
  }

  const sliceStart = (page - 1) * PAGE_SIZE;
  const pageItems = items.slice(sliceStart, sliceStart + PAGE_SIZE);

  return (
    <div className="bg-surface/80 min-h-[calc(100vh-4rem)]">
      <div className="mx-auto max-w-7xl px-3 sm:px-6 py-5 sm:py-8">
        <div className="flex flex-col lg:flex-row gap-5 lg:gap-6">
          <ProfileAccountSidebar active="notifications" onSignOut={logout} />

          <div className="flex-1 min-w-0">
            <div className="bg-card rounded-2xl lg:rounded-3xl ring-1 ring-rule/70 shadow-sm overflow-hidden">
              <div className="flex items-center gap-2 px-6 sm:px-8 pt-6 sm:pt-8 pb-2">
                <Bell className="size-5 text-brand" />
                <h1 className="font-display text-xl sm:text-2xl font-bold text-ink">Моите известия</h1>
                {unread > 0 && (
                  <span className="ml-1 inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-danger text-[11px] font-bold text-white tabular-nums">
                    {unread > 99 ? "99+" : unread}
                  </span>
                )}
              </div>

              <NotificationsPanel
                items={pageItems}
                unread={unread}
                onMarkAll={markAll}
                onMarkOne={markOne}
              />

              {total > PAGE_SIZE && (
                <div className="px-6 pb-6">
                  <Pagination page={page} pageSize={PAGE_SIZE} total={total} onChange={setPage} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
