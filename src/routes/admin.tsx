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
  Building2,
  MessageSquare,
  Users,
  FileText,
  ImageIcon,
  Layers,
  Settings,
  LogOut,
  ShieldCheck,
  ShieldAlert,
  BadgeCheck,
  AlertTriangle,
  Crown,
  Tags,
  Bot,
  Menu,
  X,
  Sparkles,
} from "lucide-react";
import { useAuth, type AppRole } from "@/hooks/use-auth";
import { fetchMe } from "@/lib/me";
import { AdminModerationAlert } from "@/components/admin-moderation-alert";
import { privateHead } from "@/lib/seo";
import { SiteLogoMark } from "@/components/site-logo-mark";

export const Route = createFileRoute("/admin")({
  head: () => privateHead("Админ панел — verno.bg", "/admin"),
  beforeLoad: async ({ location }) => {
    if (location.pathname === "/admin/login") return;
    const { user, roles } = await fetchMe();
    if (!user) throw redirect({ to: "/admin/login" });
    if (
      !roles.includes("admin" as AppRole) &&
      !roles.includes("super_admin" as AppRole)
    ) {
      throw redirect({ to: "/admin/login" });
    }
  },
  component: AdminLayout,
});

const NAV = [
  { to: "/admin", icon: LayoutDashboard, label: "Табло", exact: true },
  { to: "/admin/firmalar", icon: Building2, label: "Марки" },
  { to: "/admin/kategoriler", icon: Tags, label: "Категории" },
  { to: "/admin/sikayetler", icon: MessageSquare, label: "Жалби" },
  { to: "/admin/sikayet-asistani", icon: Sparkles, label: "AI Асистент" },
  { to: "/admin/bot", icon: Bot, label: "Complaint Bot" },
  { to: "/admin/kullanicilar", icon: Users, label: "Потребители" },
  { to: "/admin/moderasyon", icon: ShieldAlert, label: "Модерация" },
  { to: "/admin/escalations", icon: AlertTriangle, label: "Ескалации" },
  { to: "/admin/dogrulama", icon: BadgeCheck, label: "Верификация" },
  { to: "/admin/premium", icon: Crown, label: "Премиум" },
  { to: "/admin/blog", icon: FileText, label: "Блог" },
  { to: "/admin/medya", icon: ImageIcon, label: "Медия" },
  { to: "/admin/cms", icon: Layers, label: "CMS" },
  {
    to: "/admin/ayarlar",
    icon: Settings,
    label: "Система",
    superOnly: true as boolean | undefined,
  },
] as {
  to: string;
  icon: typeof LayoutDashboard;
  label: string;
  exact?: boolean;
  superOnly?: boolean;
}[];

/** Panel rozeti — verno moru üzerine beyaz, tüm kabuklarda ortak görsel dil. */
function PanelBadge({ label }: { label: string }) {
  return (
    <span className="ml-auto text-[9px] uppercase tracking-wider font-bold bg-gradient-to-r from-primary to-accent-purple text-white px-2 py-0.5 rounded-full shadow-sm shrink-0">
      {label}
    </span>
  );
}

function AdminLayout() {
  const { user, roles, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const path = useLocation({ select: (l) => l.pathname });
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user && path !== "/admin/login")
      navigate({ to: "/admin/login" });
  }, [loading, user, navigate, path]);

  useEffect(() => {
    setMenuOpen(false);
  }, [path]);

  if (path === "/admin/login") return <Outlet />;

  const isSuper = roles.includes("super_admin");

  return (
    <div className="min-h-screen bg-canvas flex flex-col lg:flex-row">
      {/* Mobil üst bar */}
      <header className="lg:hidden sticky top-0 z-40 flex items-center gap-3 px-4 h-14 bg-card border-b border-rule">
        <button
          type="button"
          onClick={() => setMenuOpen((o) => !o)}
          className="size-10 grid place-items-center rounded-lg ring-1 ring-rule"
          aria-label="Меню"
        >
          {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
        <Link to="/" className="flex items-center" aria-label="Начало">
          <SiteLogoMark size={20} />
        </Link>
        <PanelBadge label="Админ" />
      </header>

      {/* Mobil menü */}
      {menuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-30 bg-ink/40"
          onClick={() => setMenuOpen(false)}
        >
          <aside
            className="absolute left-0 top-14 bottom-0 w-[min(100%,280px)] bg-card border-r border-rule flex flex-col overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <AdminModerationAlert />
            <nav className="p-3 space-y-1 text-[13.5px] flex-1">
              {NAV.filter((n) => !n.superOnly || isSuper).map((n) => (
                <NavItem key={n.to} {...n} />
              ))}
            </nav>
            <PanelUserFooter
              user={user}
              roleLabel={isSuper ? "Супер админ" : "Админ"}
              signOut={signOut}
              navigate={navigate}
            />
          </aside>
        </div>
      )}

      {/* Masaüstü sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col bg-card border-r border-rule sticky top-0 h-screen">
        <Link
          to="/"
          className="relative flex items-center px-5 h-16 border-b border-rule overflow-hidden"
        >
          {/* Verno dekoratif blob'ları */}
          <span
            className="absolute -top-6 -right-6 size-20 rounded-full bg-primary/10 pointer-events-none"
            aria-hidden
          />
          <SiteLogoMark size={22} />
          <PanelBadge label="Админ" />
        </Link>
        <AdminModerationAlert />
        <nav className="flex-1 p-3 space-y-1 text-[13.5px] overflow-y-auto">
          {NAV.filter((n) => !n.superOnly || isSuper).map((n) => (
            <NavItem key={n.to} {...n} />
          ))}
        </nav>
        <PanelUserFooter
          user={user}
          roleLabel={isSuper ? "Супер админ" : "Админ"}
          signOut={signOut}
          navigate={navigate}
        />
      </aside>

      <main className="flex-1 min-w-0 pb-6 lg:pb-0">
        <Outlet />
      </main>
    </div>
  );
}

function PanelUserFooter({
  user,
  roleLabel,
  signOut,
  navigate,
}: {
  user: { email?: string | null } | null;
  roleLabel: string;
  signOut: () => Promise<void>;
  navigate: ReturnType<typeof useNavigate>;
}) {
  return (
    <div className="border-t border-rule p-3">
      <div className="flex items-center gap-2 px-2 py-2">
        <div className="grid place-items-center size-9 rounded-full bg-gradient-to-br from-brand to-primary text-white text-sm font-bold">
          {user?.email?.[0]?.toUpperCase() ?? "A"}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[12.5px] font-semibold text-ink truncate">
            {user?.email}
          </div>
          <div className="text-[11px] text-navy-mid flex items-center gap-1">
            <ShieldCheck className="size-3 text-brand" />
            {roleLabel}
          </div>
        </div>
      </div>
      <button
        onClick={async () => {
          await signOut();
          navigate({ to: "/admin/login" });
        }}
        className="mt-1 w-full inline-flex items-center gap-2 rounded-lg px-3 py-2 text-[13px] text-navy hover:bg-surface"
      >
        <LogOut className="size-4" /> Изход
      </button>
    </div>
  );
}

function NavItem({
  to,
  icon: Icon,
  label,
  exact,
}: {
  to: string;
  icon: typeof LayoutDashboard;
  label: string;
  exact?: boolean;
}) {
  return (
    <Link
      to={to}
      activeOptions={{ exact: !!exact }}
      activeProps={{
        className: "bg-primary/10 text-primary font-semibold",
      }}
      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-navy hover:bg-surface transition"
    >
      <Icon className="size-4 shrink-0" />
      {label}
    </Link>
  );
}
