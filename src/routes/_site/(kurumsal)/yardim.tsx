import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Mail, MessageCircle, Search } from "lucide-react";
import { seoHead, jsonLd } from "@/lib/seo";
import { SITE_CONTACT_EMAIL } from "@/lib/contact";
import {
  HELP_CATEGORIES,
  flattenHelpFaqs,
  getHelpCategory,
  type HelpCategory,
  type HelpFaqItem,
} from "@/lib/help-faq-data";
import { cn } from "@/lib/utils";

const DEFAULT_CATEGORY_ID = "membership";

export const Route = createFileRoute("/_site/(kurumsal)/yardim")({
  head: () => ({
    ...seoHead({
      title: "Помощ и ЧЗВ — verno.bg",
      description:
        "Център за помощ на verno.bg: членство, подаване на жалби, процес на решение и акаунти на марки.",
      path: "/yardim",
    }),
    scripts: [
      jsonLd({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: flattenHelpFaqs().map((it) => ({
          "@type": "Question",
          name: it.q,
          acceptedAnswer: { "@type": "Answer", text: it.a },
        })),
      }),
    ],
  }),
  component: Page,
});

function parseHash(hash: string): { categoryId: string; itemId: string | null } {
  const raw = hash.replace(/^#/, "").trim();
  if (!raw) return { categoryId: DEFAULT_CATEGORY_ID, itemId: null };
  if (HELP_CATEGORIES.some((c) => c.id === raw)) return { categoryId: raw, itemId: null };
  for (const cat of HELP_CATEGORIES) {
    const hit = cat.items.find((it) => it.id === raw);
    if (hit) return { categoryId: cat.id, itemId: hit.id };
  }
  return { categoryId: DEFAULT_CATEGORY_ID, itemId: null };
}

function Page() {
  const [activeCategoryId, setActiveCategoryId] = useState(DEFAULT_CATEGORY_ID);
  const [openItemId, setOpenItemId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const syncFromHash = useCallback(() => {
    const { categoryId, itemId } = parseHash(window.location.hash);
    setActiveCategoryId(categoryId);
    setOpenItemId(itemId);
    if (itemId) {
      requestAnimationFrame(() => {
        itemRefs.current[itemId]?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    }
  }, []);

  useEffect(() => {
    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    return () => window.removeEventListener("hashchange", syncFromHash);
  }, [syncFromHash]);

  const activeCategory = useMemo(
    () => getHelpCategory(activeCategoryId) ?? HELP_CATEGORIES[0]!,
    [activeCategoryId],
  );

  const shown = useMemo((): HelpFaqItem[] => {
    const q = query.trim().toLowerCase();
    if (!q) return activeCategory.items;
    return flattenHelpFaqs().filter(
      (it) => it.q.toLowerCase().includes(q) || it.a.toLowerCase().includes(q),
    );
  }, [query, activeCategory]);

  function selectCategory(cat: HelpCategory) {
    setQuery("");
    setActiveCategoryId(cat.id);
    setOpenItemId(null);
    window.history.replaceState(null, "", `#${cat.id}`);
  }

  function toggleItem(item: HelpFaqItem) {
    const next = openItemId === item.id ? null : item.id;
    setOpenItemId(next);
    window.history.replaceState(null, "", next ? `#${item.id}` : `#${activeCategoryId}`);
  }

  return (
    <div className="min-h-screen bg-paper">
      <section className="relative overflow-hidden border-b border-rule bg-white">
        <div className="absolute -top-10 right-0 size-40 rounded-full bg-primary/10 pointer-events-none" aria-hidden />
        <div className="absolute bottom-0 left-0 size-28 rounded-full bg-brand/10 pointer-events-none" aria-hidden />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 py-12 lg:py-16">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-navy-mid mb-3">Помощ</p>
          <h1 className="font-display text-3xl sm:text-4xl lg:text-[2.35rem] font-black text-ink leading-tight mb-8 lg:mb-10">
            Как можем да ви помогнем?
          </h1>
          <div className="relative max-w-3xl">
            <Search
              className="pointer-events-none absolute left-5 top-1/2 size-5 -translate-y-1/2 text-navy-mid"
              aria-hidden
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Търсене в помощния център…"
              className="h-14 w-full rounded-full bg-card pl-12 pr-5 text-[15px] text-ink shadow-soft ring-1 ring-rule placeholder:text-navy-mid focus:outline-none focus:ring-2 focus:ring-brand/35"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-10 lg:py-14">
        <h2 className="mb-8 text-xl font-display font-bold text-ink lg:mb-10">Често задавани въпроси</h2>

        <div className="flex flex-col gap-10 lg:flex-row lg:justify-between lg:gap-12">
          <aside className="hidden shrink-0 lg:block lg:w-[220px]">
            <nav className="flex flex-col gap-3.5" aria-label="Категории помощ">
              {HELP_CATEGORIES.map((cat) => {
                const active = !query && activeCategoryId === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => selectCategory(cat)}
                    className={cn(
                      "text-left text-[15px] leading-snug transition-colors",
                      active ? "font-semibold text-primary" : "text-navy-mid hover:text-ink",
                    )}
                  >
                    {cat.title}
                  </button>
                );
              })}
            </nav>
          </aside>

          <div className="flex gap-2 overflow-x-auto pb-1 lg:hidden scrollbar-none">
            {HELP_CATEGORIES.map((cat) => {
              const active = !query && activeCategoryId === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => selectCategory(cat)}
                  className={cn(
                    "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-primary text-white"
                      : "bg-surface text-navy-mid ring-1 ring-rule",
                  )}
                >
                  {cat.title}
                </button>
              );
            })}
          </div>

          <div className="flex min-w-0 flex-col gap-3 lg:w-[calc(100%-275px)]">
            {query && (
              <p className="text-sm text-navy-mid mb-1">
                {shown.length} резултата за „{query}"
              </p>
            )}

            {shown.length === 0 ? (
              <EmptyResults query={query} />
            ) : (
              shown.map((item) => {
                const open = openItemId === item.id;
                return (
                  <div
                    key={item.id}
                    ref={(el) => {
                      itemRefs.current[item.id] = el;
                    }}
                    id={item.id}
                    className="scroll-mt-28"
                  >
                    <button
                      type="button"
                      onClick={() => toggleItem(item)}
                      aria-expanded={open}
                      className={cn(
                        "flex w-full items-center justify-between gap-4 rounded-xl px-5 py-4 text-left transition-colors lg:px-11 lg:py-5",
                        open ? "bg-brand/8 ring-1 ring-brand/20" : "bg-surface hover:bg-elevated",
                      )}
                    >
                      <span className="text-[15px] font-medium leading-snug text-ink lg:text-base">
                        {item.q}
                      </span>
                      <ChevronDown
                        className={cn(
                          "size-5 shrink-0 text-navy-mid transition-transform duration-200",
                          open && "rotate-180 text-brand",
                        )}
                        aria-hidden
                      />
                    </button>
                    <div
                      className={cn(
                        "grid transition-[grid-template-rows] duration-200 ease-out",
                        open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                      )}
                    >
                      <div className="overflow-hidden">
                        <div className="rounded-b-xl bg-surface px-5 pb-5 pt-0 text-sm leading-relaxed text-navy lg:px-11 lg:pb-6 lg:text-[15px]">
                          <AnswerText text={item.a} />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>

      <section className="border-t border-rule bg-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12 lg:py-14">
          <h2 className="text-xl font-display font-bold text-ink mb-6">Ръководства</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { t: "Как работи Verno.bg?", slug: "how-it-works" },
              { t: "Как да подам жалба?", slug: "how-to-complain" },
              { t: "Избор на надеждна марка", slug: "choose-brand" },
              { t: "Съвети за потребители", slug: "consumer-tips" },
            ].map((g) => (
              <Link
                key={g.slug}
                to="/info/$slug"
                params={{ slug: g.slug }}
                className="rounded-2xl bg-surface ring-1 ring-rule px-4 py-4 text-[14px] font-medium text-ink hover:ring-brand/35 hover:bg-brand-soft/30 transition"
              >
                {g.t}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-rule bg-surface/60">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12 lg:py-16">
          <p className="text-center text-navy-mid text-sm sm:text-base max-w-2xl mx-auto mb-8">
            Ако не намерихте отговор, свържете се с нас по имейл или телефон.
          </p>
          <div className="grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
            <Link
              to="/iletisim"
              className="flex items-center gap-4 rounded-2xl bg-card ring-1 ring-rule p-5 hover:ring-brand/35 transition group"
            >
              <div className="size-11 rounded-xl bg-brand-soft text-brand grid place-items-center shrink-0 group-hover:bg-brand/15 transition">
                <Mail className="size-5" />
              </div>
              <div className="min-w-0 text-left">
                <div className="text-xs uppercase tracking-widest text-navy-mid">Имейл</div>
                <div className="mt-0.5 font-semibold text-ink truncate">{SITE_CONTACT_EMAIL}</div>
              </div>
            </Link>
            <Link
              to="/iletisim"
              className="flex items-center gap-4 rounded-2xl bg-card ring-1 ring-rule p-5 hover:ring-brand/35 transition group"
            >
              <div className="size-11 rounded-xl bg-brand-soft text-brand grid place-items-center shrink-0 group-hover:bg-brand/15 transition">
                <MessageCircle className="size-5" />
              </div>
              <div className="text-left">
                <div className="text-xs uppercase tracking-widest text-navy-mid">Поддръжка</div>
                <div className="mt-0.5 font-semibold text-ink">0888420988</div>
              </div>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function AnswerText({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <p className="whitespace-pre-line">
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={i} className="font-semibold text-ink">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </p>
  );
}

function EmptyResults({ query }: { query: string }) {
  return (
    <div className="rounded-xl bg-surface px-6 py-10 text-center ring-1 ring-rule">
      <p className="text-navy-mid text-sm mb-4">
        Няма резултати за „{query}".
      </p>
      <Link to="/iletisim" className="text-brand font-semibold text-sm hover:underline">
        Свържете се с нас →
      </Link>
    </div>
  );
}
