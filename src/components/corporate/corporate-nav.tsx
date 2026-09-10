import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { SiteLogoMark } from "@/components/site-logo-mark";

const CORP_LINKS = [
  { to: "/kurumsal-uyelik" as const, label: "Pro членство", exact: true },
  { to: "/reklam-cozumleri" as const, label: "Рекламни решения", exact: false },
  { to: "/hakkimizda" as const, label: "За verno", exact: false },
] as const;

type CorporateNavProps = {
  activePath?: string;
};

export function CorporateNav({ activePath = "/kurumsal-uyelik" }: CorporateNavProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <>
      <header className="sticky top-0 z-50 bg-[#695de9] text-white shadow-sm">
        <nav className="mx-auto flex h-[67px] max-w-[1170px] items-center justify-between px-4 sm:px-6 lg:h-[72px]">
          <Link to="/" title="Начало" className="shrink-0">
            <SiteLogoMark size={40} tone="on-dark" />
          </Link>

          <ul className="hidden items-center gap-6 whitespace-nowrap text-[15px] font-semibold lg:flex xl:gap-9">
            {CORP_LINKS.map((link) => {
              const active = link.exact ? activePath === link.to : activePath.startsWith(link.to);
              return (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className={active ? "text-white" : "text-white/70 transition-colors hover:text-white"}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="hidden items-center gap-2 lg:flex">
            <Link
              to="/login"
              className="inline-flex h-12 shrink-0 items-center justify-center rounded-md px-4 text-[15px] font-semibold text-white transition hover:underline"
            >
              Вход
            </Link>
            <Link
              to="/register/kurumsal"
              className="inline-flex h-12 shrink-0 items-center justify-center rounded-full border border-white px-6 text-[15px] font-semibold text-white transition hover:bg-white/10"
            >
              Корпоративна регистрация
            </Link>
          </div>

          <button
            type="button"
            aria-label={menuOpen ? "Затвори менюто" : "Отвори менюто"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
            className="grid size-10 place-items-center rounded-lg text-white lg:hidden"
          >
            {menuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </nav>
      </header>

      {menuOpen && (
        <>
          <button
            type="button"
            aria-label="Затвори менюто"
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={closeMenu}
          />
          <div className="fixed inset-y-0 right-0 z-50 flex w-[min(100vw-3rem,320px)] flex-col bg-[#695de9] text-white shadow-xl lg:hidden">
            <div className="flex h-16 items-center justify-between border-b border-white/20 px-4">
              <span className="text-lg font-semibold">Меню</span>
              <button type="button" onClick={closeMenu} className="grid size-9 place-items-center rounded-lg hover:bg-white/10">
                <X className="size-5" />
              </button>
            </div>
            <nav className="flex-1 space-y-1 overflow-y-auto p-4">
              {CORP_LINKS.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={closeMenu}
                  className="flex h-11 items-center rounded-lg px-3 text-[15px] font-medium hover:bg-white/10"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="space-y-2 border-t border-white/20 p-4">
              <Link
                to="/login"
                onClick={closeMenu}
                className="flex h-11 items-center justify-center rounded-lg text-[15px] font-medium hover:bg-white/10"
              >
                Вход
              </Link>
              <Link
                to="/register/kurumsal"
                onClick={closeMenu}
                className="flex h-11 items-center justify-center rounded-full border border-white text-[15px] font-semibold hover:bg-white/10"
              >
                Корпоративна регистрация
              </Link>
            </div>
          </div>
        </>
      )}
    </>
  );
}
