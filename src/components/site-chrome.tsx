import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { PenLine, Menu, X, LogOut, LayoutDashboard, Building2 } from "lucide-react";
import { useAuth, highestRoleRedirect } from "@/hooks/use-auth";
import { GlobalSearchTrigger } from "@/components/global-search";
import { ThemeToggle } from "@/components/theme-toggle";
import { NotificationBell } from "@/components/notification-bell";
import { SiteLogoMark, SiteLogoNav } from "@/components/site-logo-mark";
import { USER_MENU_ITEMS, UserMenuPopover } from "@/components/user-menu-popover";

export function SiteNav() {
  const { user, roles, signOut } = useAuth();
  const navigate = useNavigate();
  const panelHref = highestRoleRedirect(roles);
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleSignOut() {
    setMenuOpen(false);
    await signOut();
    navigate({ to: "/" });
  }

  function closeMenu() {
    setMenuOpen(false);
  }

  const navLinks = [
    { to: "/sikayetler" as const, label: "Şikayetler", short: "Şikayetler" },
    { to: "/trendler" as const, label: "Trend 100", short: "Trend", badge: "100" },
    { to: "/#video" as const, label: "Video", short: "Video", hash: true },
  ] as const;

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#f8f9fb]/95 backdrop-blur border-b border-rule overflow-x-clip">
        <div className="mx-auto max-w-7xl px-3 sm:px-6 h-[4.25rem] flex items-center gap-3 sm:gap-4 min-w-0">
          <SiteLogoNav size={52} />

          <nav className="hidden lg:flex items-center gap-6 xl:gap-8 shrink-0 text-[15px] font-medium text-[#626692] whitespace-nowrap">
            {navLinks.map((l) => (
              "hash" in l && l.hash ? (
                <a key={l.to} href={l.to} className="hover:text-[#272635] transition-colors inline-flex items-center gap-1">
                  {l.label}
                </a>
              ) : (
                <Link key={l.to} to={l.to} className="hover:text-[#272635] transition-colors inline-flex items-center gap-1">
                  <span>{l.short}</span>
                  {"badge" in l && l.badge && (
                    <span className="ml-0.5 font-bold text-[#272635]">{l.badge}</span>
                  )}
                </Link>
              )
            ))}
          </nav>

          <div className="flex-1 flex justify-end xl:justify-center min-w-0">
            <GlobalSearchTrigger className="hidden md:inline-flex items-center gap-2 rounded-full ring-1 ring-rule bg-card/70 backdrop-blur px-3 h-9 text-[13px] text-navy-mid hover:ring-brand/40 transition w-full max-w-[10rem] lg:max-w-[11rem] xl:max-w-[13rem] 2xl:max-w-xs min-w-0" />
          </div>

          <div className="hidden xl:flex items-center gap-1.5 2xl:gap-2 shrink-0">
            <NotificationBell />
            <ThemeToggle compact />
          </div>

          {user ? (
            <div className="hidden xl:flex items-center gap-2 2xl:gap-3 shrink-0">
              {panelHref !== "/" && (
                <Link to={panelHref} className="inline-flex items-center gap-1.5 text-[12px] 2xl:text-[13px] font-medium text-navy hover:text-brand whitespace-nowrap">
                  <LayoutDashboard className="size-4 shrink-0" /> Панел
                </Link>
              )}
              <UserMenuPopover user={user} onSignOut={handleSignOut} />
            </div>
          ) : (
            <Link to="/login" className="hidden lg:inline-flex items-center text-[14px] font-medium text-[#626692] hover:text-[#272635] whitespace-nowrap shrink-0">
              Giriş Yap / Üye Ol
            </Link>
          )}

          <div className="flex lg:hidden items-center gap-1 shrink-0">
            <NotificationBell />
            <ThemeToggle compact />
          </div>

          <Link to="/sikayet-yaz" className="inline-flex items-center gap-1.5 rounded-full bg-[#695de9] text-white px-3 sm:px-5 h-9 sm:h-10 text-[12px] sm:text-[14px] font-semibold shadow-sm hover:bg-[#6a5de9] active:brightness-95 transition shrink-0">
            <PenLine className="size-4 shrink-0" />
            <span className="hidden min-[400px]:inline">+ Şikayet Yaz</span>
            <span className="min-[400px]:hidden">+ Yaz</span>
          </Link>

          <button
            type="button"
            aria-label={menuOpen ? "Затвори менюто" : "Отвори менюто"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
            className="xl:hidden grid place-items-center size-10 rounded-lg border border-rule shrink-0"
          >
            {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </header>

      {menuOpen && (
        <>
          <button
            type="button"
            aria-label="Затвори менюто"
            className="fixed inset-0 z-40 bg-black/40 xl:hidden"
            onClick={closeMenu}
          />
          <div className="fixed inset-y-0 right-0 z-50 w-[min(100vw-3rem,320px)] bg-paper border-l border-rule shadow-lift xl:hidden flex flex-col">
            <div className="flex items-center justify-between px-4 h-16 border-b border-rule">
              <span className="font-display font-black text-lg text-ink">Меню</span>
              <button type="button" onClick={closeMenu} className="grid place-items-center size-9 rounded-lg hover:bg-surface">
                <X className="size-5" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto p-4 space-y-1">
              {navLinks.map((l) =>
                "hash" in l && l.hash ? (
                  <a
                    key={l.to}
                    href={l.to}
                    onClick={closeMenu}
                    className="flex items-center gap-2 h-11 px-3 rounded-lg text-[14px] font-medium text-ink hover:bg-surface"
                  >
                    {l.label}
                  </a>
                ) : (
                  <Link
                    key={l.to}
                    to={l.to}
                    onClick={closeMenu}
                    className="flex items-center gap-2 h-11 px-3 rounded-lg text-[14px] font-medium text-ink hover:bg-surface"
                  >
                    {l.label}
                    {"badge" in l && l.badge && (
                      <span className="text-[10px] font-bold bg-brand-soft text-brand rounded-full px-1.5 py-px">{l.badge}</span>
                    )}
                  </Link>
                ),
              )}
              <Link to="/sikayet-yaz" onClick={closeMenu} className="flex items-center gap-2 h-11 px-3 rounded-lg text-[14px] font-semibold text-brand hover:bg-brand-soft">
                <PenLine className="size-4" /> Напиши жалба
              </Link>
              <Link to="/register/marka-basvuru" onClick={closeMenu} className="flex items-center gap-2 h-11 px-3 rounded-lg text-[14px] font-medium text-navy hover:bg-surface">
                <Building2 className="size-4" /> Кандидатствай като марка
              </Link>
              <Link to="/register/kurumsal" onClick={closeMenu} className="flex items-center gap-2 h-11 px-3 rounded-lg text-[14px] font-medium text-navy hover:bg-surface">
                <Building2 className="size-4" /> Корпоративна регистрация
              </Link>
              <div className="pt-3 mt-3 border-t border-rule md:hidden">
                <GlobalSearchTrigger className="w-full inline-flex items-center gap-2 rounded-lg ring-1 ring-rule bg-card px-3 h-10 text-[13px] text-navy-mid" />
              </div>
            </nav>

            <div className="p-4 border-t border-rule space-y-1">
              {user ? (
                <>
                  {panelHref !== "/" && (
                    <Link to={panelHref} onClick={closeMenu} className="flex items-center gap-2 h-11 px-3 rounded-lg text-[14px] font-medium text-ink hover:bg-surface">
                      <LayoutDashboard className="size-4" /> Панел
                    </Link>
                  )}
                  {USER_MENU_ITEMS.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.ga}
                        to={item.to}
                        search={item.search}
                        onClick={closeMenu}
                        className="flex items-center gap-2 h-11 px-3 rounded-lg text-[14px] font-medium text-ink hover:bg-surface"
                      >
                        <Icon className="size-4" /> {item.label}
                      </Link>
                    );
                  })}
                  <button onClick={handleSignOut} className="w-full flex items-center gap-2 h-11 px-3 rounded-lg text-[14px] font-medium text-ink hover:bg-surface">
                    <LogOut className="size-4" /> Изход
                  </button>
                  <Link to="/yardim" onClick={closeMenu} className="flex items-center gap-2 h-11 px-3 rounded-lg text-[14px] font-medium text-navy-mid hover:bg-surface">
                    Помощ
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={closeMenu} className="flex items-center gap-2 h-11 px-3 rounded-lg text-[14px] font-medium text-ink hover:bg-surface">
                    <User className="size-4" /> Вход
                  </Link>
                  <Link to="/register" onClick={closeMenu} className="flex items-center gap-2 h-11 px-3 rounded-lg text-[14px] font-semibold text-brand hover:bg-brand-soft">
                    Регистрация
                  </Link>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}

export function SiteFooter() {
  const columns = [
    { t: "Şikayetler", l: [
      ["Son Şikayetler", "/sikayetler"],
      ["Trend Şikayetler", "/trendler"],
      ["Çözülen Şikayetler", "/sikayetler", { durum: "cozuldu" }],
      ["Anonim Şikayet", "/sikayet-yaz"],
      ["Yardım", "/yardim"],
      ["SSS", "/yardim"],
    ] },
    { t: "Markalar", l: [
      ["Tüm Markalar", "/markalar"],
      ["Doğrulanmış Markalar", "/markalar", { dogrulanmis: true }],
      ["Premium Markalar", "/markalar", { premium: true }],
      ["Marka Başvurusu", "/register/marka-basvuru"],
      ["Marka Yönetim", "/brand"],
    ] },
    { t: "Trend 100", l: [
      ["Genel", "/trend-100"],
      ["Bankacılık", "/trend-100", { kategori: "bankacilik" }],
      ["E-Ticaret", "/trend-100", { kategori: "e-ticaret" }],
      ["Telekom", "/trend-100", { kategori: "telekom" }],
      ["Kargo", "/trend-100", { kategori: "kargo" }],
      ["Ulaşım", "/trend-100", { kategori: "ulasim" }],
    ] },
    { t: "Konular", l: [
      ["Bankacılık", "/sikayetler", { kategori: "bankacilik" }],
      ["Sigorta", "/sikayetler", { kategori: "sigorta" }],
      ["Kripto", "/sikayetler", { kategori: "kripto" }],
      ["Kargo", "/sikayetler", { kategori: "kargo" }],
      ["Yemek", "/sikayetler", { kategori: "yemek" }],
      ["Telefon", "/sikayetler", { kategori: "telefon" }],
    ] },
  ] as const;
  const topLinks = [
    ["Hakkımızda", "/hakkimizda"],
    ["Verno SEAL", "/hakkimizda"],
    ["Markalar İçin", "/reklam-cozumleri"],
    ["Blog", "/blog"],
    ["Şeffaflık Raporu", "/seffaflik-raporu"],
    ["İletişim", "/iletisim"],
  ] as const;
  return (
    <footer className="mt-0 bg-media text-media-foreground/80 border-t border-white/10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14">
        <div className="flex items-center justify-between mb-10">
          <Link to="/" className="inline-flex items-center gap-2.5" aria-label="Ana sayfa">
            <SiteLogoMark size={36} tone="on-dark" />
          </Link>
          <div className="hidden md:flex items-center gap-4 text-[13px]">
            {topLinks.map(([t, to]) => (
              <Link key={t} to={to} className="hover:text-paper dark:hover:text-ink">{t}</Link>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {columns.map((g) => (
            <div key={g.t}>
              <h4 className="text-paper dark:text-ink font-semibold text-[13px] mb-3">{g.t}</h4>
              <ul className="space-y-2 text-[12.5px]">
                {g.l.map(([label, to, search, params]) => (
                  <li key={label}>
                    <Link
                      to={to}
                      search={search as never}
                      params={params as never}
                      className="text-paper/60 dark:text-navy-mid hover:text-paper dark:hover:text-ink transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 pt-6 border-t border-paper/10 dark:border-rule flex flex-col md:flex-row gap-3 justify-between text-[12px] text-paper/60 dark:text-navy-mid">
          <span>© 2026 verno.bg — Всички права запазени</span>
          <div className="flex gap-6">
            <Link to="/kullanim-kosullari" className="hover:text-paper dark:hover:text-ink">Kullanım Koşulları</Link>
            <Link to="/gizlilik" className="hover:text-paper dark:hover:text-ink">Gizlilik</Link>
            <Link to="/kvkk" className="hover:text-paper dark:hover:text-ink">KVKK</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}