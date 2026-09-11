import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  PenLine,
  User,
  Menu,
  X,
  LogOut,
  LayoutDashboard,
  Building2,
} from "lucide-react";
import { useAuth, highestRoleRedirect } from "@/hooks/use-auth";
import {
  GlobalSearchIconTrigger,
  GlobalSearchTrigger,
} from "@/components/global-search";
import { SiteLogoMark, SiteLogoNav } from "@/components/site-logo-mark";
import {
  USER_MENU_ITEMS,
  UserMenuPopover,
} from "@/components/user-menu-popover";

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

  // Router rotaları ve hash bağlantısı ayrı: `Link to` yalnızca gerçek rotaları kabul eder.
  const navLinks = [
    { to: "/sikayetler" as const, label: "Жалби" },
    { to: "/trendler" as const, label: "Trend", badge: "100" },
  ];
  const videoLink = { href: "/#video", label: "Видео" };

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-[#ebecef] bg-white">
        <div className="mx-auto flex h-[60px] max-w-[1170px] items-center px-4 sm:h-[70px] sm:px-6">
          {/* Mobile — logo + compact CTA + search + menu */}
          <div className="flex min-w-0 flex-1 items-center gap-2.5 md:hidden">
            <SiteLogoNav className="h-[24px]" />
            <Link
              to="/sikayet-yaz"
              className="inline-flex h-9 shrink-0 items-center justify-center rounded-full bg-[#695de9] px-3.5 text-[13px] font-semibold text-white transition hover:bg-[#5a4fd9]"
            >
              + Жалба
            </Link>
            <div className="flex-1" aria-hidden />
            <GlobalSearchIconTrigger />
            <button
              type="button"
              aria-label={menuOpen ? "Затвори менюто" : "Отвори менюто"}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((o) => !o)}
              className="grid size-10 shrink-0 place-items-center rounded-lg border border-[#e8eaef] text-[#272635]"
            >
              {menuOpen ? (
                <X className="size-5" />
              ) : (
                <Menu className="size-5" />
              )}
            </button>
          </div>

          {/* Desktop — logo + nav | spacer | login + CTA */}
          <div className="hidden min-w-0 flex-1 items-center md:flex md:flex-initial">
            <SiteLogoNav className="h-[28px] lg:h-[32px]" />
            <nav className="ml-6 hidden items-center gap-8 text-[15px] font-medium tracking-[0.01em] text-[#626692] md:flex lg:ml-9 lg:gap-10">
              {navLinks.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  className="inline-flex items-baseline gap-0.5 whitespace-nowrap transition-colors hover:text-[#272635]"
                >
                  <span>{l.label}</span>
                  {l.badge ? (
                    <span className="font-bold text-[#272635]">{l.badge}</span>
                  ) : null}
                </Link>
              ))}
              <a
                href={videoLink.href}
                className="whitespace-nowrap transition-colors hover:text-[#272635]"
              >
                {videoLink.label}
              </a>
            </nav>
          </div>

          <div className="hidden flex-1 md:block" aria-hidden />

          <div className="hidden shrink-0 items-center gap-4 md:flex lg:gap-5">
            {user ? (
              <div className="flex items-center gap-3">
                {panelHref !== "/" && (
                  <Link
                    to={panelHref}
                    className="whitespace-nowrap text-[14px] font-medium text-[#626692] hover:text-[#272635]"
                  >
                    Панел
                  </Link>
                )}
                <UserMenuPopover user={user} onSignOut={handleSignOut} />
              </div>
            ) : (
              <Link
                to="/login"
                className="whitespace-nowrap text-[14px] font-medium text-[#626692] transition-colors hover:text-[#272635]"
              >
                Вход / Регистрация
              </Link>
            )}

            <Link
              to="/sikayet-yaz"
              className="inline-flex h-[42px] shrink-0 items-center justify-center rounded-full bg-[#695de9] px-6 text-[14px] font-semibold text-white transition hover:bg-[#5a4fd9]"
            >
              + Напиши жалба
            </Link>
          </div>
        </div>
      </header>

      {menuOpen && (
        <>
          <button
            type="button"
            aria-label="Затвори менюто"
            className="fixed inset-0 z-40 bg-black/40 md:hidden"
            onClick={closeMenu}
          />
          <div className="fixed inset-y-0 right-0 z-50 flex w-[min(100vw-3rem,320px)] flex-col border-l border-rule bg-paper shadow-lift md:hidden">
            <div className="flex h-16 items-center justify-between border-b border-rule px-4">
              <span className="font-display text-lg font-black text-ink">
                Меню
              </span>
              <button
                type="button"
                onClick={closeMenu}
                className="grid size-9 place-items-center rounded-lg hover:bg-surface"
              >
                <X className="size-5" />
              </button>
            </div>

            <nav className="flex-1 space-y-1 overflow-y-auto p-4">
              {navLinks.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={closeMenu}
                  className="flex h-11 items-center gap-2 rounded-lg px-3 text-[14px] font-medium text-ink hover:bg-surface"
                >
                  {l.label}
                  {l.badge ? (
                    <span className="rounded-full bg-brand-soft px-1.5 py-px text-[10px] font-bold text-brand">
                      {l.badge}
                    </span>
                  ) : null}
                </Link>
              ))}
              <a
                href={videoLink.href}
                onClick={closeMenu}
                className="flex h-11 items-center gap-2 rounded-lg px-3 text-[14px] font-medium text-ink hover:bg-surface"
              >
                {videoLink.label}
              </a>
              <Link
                to="/sikayet-yaz"
                onClick={closeMenu}
                className="flex h-11 items-center gap-2 rounded-lg px-3 text-[14px] font-semibold text-brand hover:bg-brand-soft"
              >
                <PenLine className="size-4" /> Напиши жалба
              </Link>
              <Link
                to="/register/marka-basvuru"
                onClick={closeMenu}
                className="flex h-11 items-center gap-2 rounded-lg px-3 text-[14px] font-medium text-navy hover:bg-surface"
              >
                <Building2 className="size-4" /> Кандидатствай като марка
              </Link>
              <div className="mt-3 border-t border-rule pt-3">
                <GlobalSearchTrigger className="inline-flex h-10 w-full items-center gap-2 rounded-lg bg-card px-3 text-[13px] text-navy-mid ring-1 ring-rule" />
              </div>
            </nav>

            <div className="space-y-1 border-t border-rule p-4">
              {user ? (
                <>
                  {panelHref !== "/" && (
                    <Link
                      to={panelHref}
                      onClick={closeMenu}
                      className="flex h-11 items-center gap-2 rounded-lg px-3 text-[14px] font-medium text-ink hover:bg-surface"
                    >
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
                        className="flex h-11 items-center gap-2 rounded-lg px-3 text-[14px] font-medium text-ink hover:bg-surface"
                      >
                        <Icon className="size-4" /> {item.label}
                      </Link>
                    );
                  })}
                  <button
                    onClick={handleSignOut}
                    className="flex h-11 w-full items-center gap-2 rounded-lg px-3 text-[14px] font-medium text-ink hover:bg-surface"
                  >
                    <LogOut className="size-4" /> Изход
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={closeMenu}
                    className="flex h-11 items-center gap-2 rounded-lg px-3 text-[14px] font-medium text-ink hover:bg-surface"
                  >
                    <User className="size-4" /> Вход
                  </Link>
                  <Link
                    to="/register"
                    onClick={closeMenu}
                    className="flex h-11 items-center gap-2 rounded-lg px-3 text-[14px] font-semibold text-brand hover:bg-brand-soft"
                  >
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
    {
      t: "Жалби",
      l: [
        ["Последни жалби", "/sikayetler"],
        ["Trend жалби", "/trendler"],
        ["Решени жалби", "/sikayetler", { durum: "cozuldu" }],
        ["Анонимна жалба", "/sikayet-yaz"],
        ["Помощ", "/yardim"],
        ["ЧЗВ", "/yardim"],
      ],
    },
    {
      t: "Марки",
      l: [
        ["Всички марки", "/markalar"],
        ["Потвърдени марки", "/markalar", { dogrulanmis: true }],
        ["Premium марки", "/markalar", { premium: true }],
        ["Кандидатстване", "/register/marka-basvuru"],
        ["Управление", "/brand"],
      ],
    },
    {
      t: "Trend 100",
      l: [
        ["Общо", "/trend-100"],
        ["Банки", "/trend-100", { kategori: "bankacilik" }],
        ["E-commerce", "/trend-100", { kategori: "e-ticaret" }],
        ["Телеком", "/trend-100", { kategori: "telekom" }],
        ["Куриери", "/trend-100", { kategori: "kargo" }],
        ["Транспорт", "/trend-100", { kategori: "ulasim" }],
      ],
    },
    {
      t: "Теми",
      l: [
        ["Банки", "/sikayetler", { kategori: "bankacilik" }],
        ["Застраховане", "/sikayetler", { kategori: "sigorta" }],
        ["Крипто", "/sikayetler", { kategori: "kripto" }],
        ["Куриери", "/sikayetler", { kategori: "kargo" }],
        ["Храна", "/sikayetler", { kategori: "yemek" }],
        ["Телефон", "/sikayetler", { kategori: "telefon" }],
      ],
    },
  ] as const;

  const topLinks = [
    ["За нас", "/hakkimizda"],
    ["Verno SEAL", "/hakkimizda"],
    ["Pro членство", "/kurumsal-uyelik"],
    ["Рекламни решения", "/reklam-cozumleri"],
    ["Блог", "/blog"],
    ["Отчет за прозрачност", "/seffaflik-raporu"],
    ["Контакт", "/iletisim"],
  ] as const;

  return (
    <footer className="mt-0 border-t border-white/10 bg-media text-media-foreground/80">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="mb-10 flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-2.5"
            aria-label="Начало"
          >
            <SiteLogoMark size={28} tone="on-dark" />
          </Link>
          <div className="hidden items-center gap-4 text-[13px] md:flex">
            {topLinks.map(([t, to]) => (
              <Link
                key={t}
                to={to}
                className="hover:text-paper dark:hover:text-ink"
              >
                {t}
              </Link>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {columns.map((g) => (
            <div key={g.t}>
              <h4 className="mb-3 text-[13px] font-semibold text-paper dark:text-ink">
                {g.t}
              </h4>
              <ul className="space-y-2 text-[12.5px]">
                {g.l.map(([label, to, search]) => (
                  <li key={label}>
                    <Link
                      to={to}
                      search={search as never}
                      className="text-paper/60 transition-colors hover:text-paper dark:text-navy-mid dark:hover:text-ink"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col justify-between gap-3 border-t border-paper/10 pt-6 text-[12px] text-paper/60 dark:border-rule dark:text-navy-mid md:flex-row">
          <span>© 2026 verno.bg — Всички права запазени</span>
          <div className="flex gap-6">
            <Link
              to="/kullanim-kosullari"
              className="hover:text-paper dark:hover:text-ink"
            >
              Условия за ползване
            </Link>
            <Link
              to="/gizlilik"
              className="hover:text-paper dark:hover:text-ink"
            >
              Поверителност
            </Link>
            <Link to="/kvkk" className="hover:text-paper dark:hover:text-ink">
              GDPR
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
