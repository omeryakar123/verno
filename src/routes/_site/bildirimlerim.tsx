import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { authClient } from "@/lib/auth-client";
import { ProfilePageShell } from "@/components/profile/profile-page-shell";
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

  const sliceStart = (page - 1) * PAGE_SIZE;
  const pageItems = items.slice(sliceStart, sliceStart + PAGE_SIZE);

  return (
    <ProfilePageShell active="notifications" loading={authLoading || loading} onSignOut={logout}>
      <div className="flex items-center gap-2 px-6 pb-2 pt-6 sm:px-8 sm:pt-8">
        <Bell className="size-5 text-brand" />
        <h1 className="font-display text-xl font-bold text-ink sm:text-2xl">Моите известия</h1>
        {unread > 0 && (
          <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-danger px-1.5 text-[11px] font-bold tabular-nums text-white">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </div>

      <NotificationsPanel items={pageItems} unread={unread} onMarkAll={markAll} onMarkOne={markOne} />

      {total > PAGE_SIZE && (
        <div className="px-6 pb-6">
          <Pagination page={page} pageSize={PAGE_SIZE} total={total} onChange={setPage} />
        </div>
      )}
    </ProfilePageShell>
  );
}
