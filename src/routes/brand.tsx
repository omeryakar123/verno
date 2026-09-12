import {
  createFileRoute,
  Outlet,
  Link,
  useNavigate,
  redirect,
  useLocation,
} from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  MessageSquare,
  Building2,
  LogOut,
  MessagesSquare,
  Menu,
  X,
} from "lucide-react";
import { useAuth, type AppRole } from "@/hooks/use-auth";
import { fetchMe } from "@/lib/me";
import { privateHead } from "@/lib/seo";
import { SiteLogoMark } from "@/components/site-logo-mark";

export const Route = createFileRoute("/brand")({
  head: () => privateHead("Панел за марки — verno.bg", "/brand"),
  // UX guard; gerçek yetki /api/brand/* uçlarında marka üyeliğiyle doğrulanır.
  beforeLoad: async ({ location }) => {
    if (location.pathname === "/brand/login") return;
    const { user, roles } = await fetchMe();
    if (!user) throw redirect({ to: "/brand/login" });
    const ok = (["brand", "admin", "super_admin"] as AppRole[]).some((r) =>
      roles.includes(r),
    );
    if (!ok) throw redirect({ to: "/brand/login" });
  },
  component: BrandLayout,
});

export type BrandMembership = { brand_id: string; name: string; slug: string };

function BrandLayout() {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const path = useLocation({ select: (l) => l.pathname });
  const [memberships, setMemberships] = useState<BrandMembership[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user && path !== "/brand/login")
      navigate({ to: "/brand/login" });
  }, [loading, user, navigate, path]);

  useEffect(() => {
    setMenuOpen(false);
  }, [path]);

  useEffect(() => {
    if (!user) return;
    fetch("/api/brand/memberships", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : { memberships: [] }))
      .then((j: { memberships?: BrandMembership[] }) =>
        setMemberships(j.memberships ?? []),
      )
      .catch(() => setMemberships([]));
  }, [user]);

  if (path === "/brand/login") return <Outlet />;

  const sidebar = (
    <>
      <Link
        to="/"
        className="relative flex items-center gap-2 px-5 h-16 border-b border-rule overflow-hidden"
        onClick={() => setMenuOpen(false)}
      >
        {/* Verno dekoratif blob'u */}
        <span
          className="absolute -top-6 -right-6 size-20 rounded-full bg-brand/10 pointer-events-none"
          aria-hidden
        />
        <SiteLogoMark size={22} />
        <span className="ml-auto text-[9px] uppercase tracking-wider font-bold bg-gradient-to-r from-brand to-[#2bb47c] text-white px-2 py-0.5 rounded-full shadow-sm shrink-0">
          Марка
        </span>
      </Link>
      <div className="px-5 py-3 border-b border-rule bg-brand/5">
        <div className="text-[10px] uppercase tracking-wider text-navy-mid font-semibold">
          Марка
        </div>
        <div className="mt-1 text-[13.5px] font-semibold text-ink truncate">
          {memberships[0]?.name ?? "Няма свързана марка"}
        </div>
      </div>
      <nav className="flex-1 p-3 space-y-1 text-[13.5px]">
        <NavItem
          to="/brand"
          icon={LayoutDashboard}
          label="Табло"
          exact
          onNavigate={() => setMenuOpen(false)}
        />
        <NavItem
          to="/brand/sikayetler"
          icon={MessageSquare}
          label="Жалби"
          onNavigate={() => setMenuOpen(false)}
        />
        <NavItem
          to="/brand/mesajlar"
          icon={MessagesSquare}
          label="Съобщения"
          onNavigate={() => setMenuOpen(false)}
        />
        <NavItem
          to="/brand/profil"
          icon={Building2}
          label="Профил"
          onNavigate={() => setMenuOpen(false)}
        />
      </nav>
      <div className="border-t border-rule p-3">
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="grid place-items-center size-9 rounded-full bg-gradient-to-br from-brand to-primary text-white text-sm font-bold">
            {user?.email?.[0]?.toUpperCase() ?? "B"}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[12.5px] font-semibold text-ink truncate">
              {user?.email}
            </div>
            <div className="text-[11px] text-navy-mid">
              Представител на марка
            </div>
          </div>
        </div>
        <button
          onClick={async () => {
            await signOut();
            navigate({ to: "/brand/login" });
          }}
          className="mt-1 w-full inline-flex items-center gap-2 rounded-lg px-3 py-2 text-[13px] text-navy hover:bg-surface"
        >
          <LogOut className="size-4" /> Изход
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-canvas flex flex-col lg:flex-row">
      <header className="lg:hidden sticky top-0 z-40 flex items-center gap-3 px-4 h-14 bg-card border-b border-rule">
        <button
          type="button"
          onClick={() => setMenuOpen((o) => !o)}
          className="size-10 grid place-items-center rounded-lg ring-1 ring-rule"
          aria-label="Меню"
        >
          {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
        <Link to="/brand" className="flex items-center gap-2 min-w-0">
          <SiteLogoMark size={20} />
        </Link>
        <span className="ml-auto text-[9px] uppercase tracking-wider font-bold bg-gradient-to-r from-brand to-[#2bb47c] text-white px-2 py-0.5 rounded-full shadow-sm shrink-0">
          Марка
        </span>
      </header>

      {menuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-30 bg-ink/40"
          onClick={() => setMenuOpen(false)}
        >
          <aside
            className="absolute left-0 top-14 bottom-0 w-[min(100%,280px)] bg-card border-r border-rule flex flex-col overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {sidebar}
          </aside>
        </div>
      )}

      <aside className="hidden lg:flex w-64 shrink-0 flex-col bg-card border-r border-rule sticky top-0 h-screen">
        {sidebar}
      </aside>
      <main className="flex-1 min-w-0">
        <Outlet />
      </main>
    </div>
  );
}

function NavItem({
  to,
  icon: Icon,
  label,
  exact,
  onNavigate,
}: {
  to: string;
  icon: typeof LayoutDashboard;
  label: string;
  exact?: boolean;
  onNavigate?: () => void;
}) {
  return (
    <Link
      to={to}
      onClick={onNavigate}
      activeOptions={{ exact: !!exact }}
      activeProps={{ className: "bg-brand/10 text-brand font-semibold" }}
      className="flex items-center gap-3 rounded-lg px-3 py-2 text-navy hover:bg-surface transition"
    >
      <Icon className="size-4" />
      {label}
    </Link>
  );
}
