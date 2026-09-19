import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { BrandListLogo } from "@/components/cards";
import { trendGrowthPct, type TrendBrand } from "@/lib/trend-brand";
import { TrendSparkline } from "@/components/home/trend-sparkline";
import { cn } from "@/lib/utils";

export function TrendStrip({ items }: { items: TrendBrand[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const list = items.slice(0, 8);

  useEffect(() => {
    const el = trackRef.current;
    if (!el || list.length === 0) return;
    const child = el.children[index] as HTMLElement | undefined;
    if (!child) return;
    const left =
      child.getBoundingClientRect().left -
      el.getBoundingClientRect().left +
      el.scrollLeft;
    el.scrollTo({ left, behavior: "smooth" });
  }, [index, list.length]);

  const go = (dir: -1 | 1) => {
    setIndex((i) => Math.min(list.length - 1, Math.max(0, i + dir)));
  };

  return (
    <section className="bg-white py-12 lg:py-16">
      <header className="container mb-6 flex items-end justify-between gap-4 px-4 lg:mb-8">
        <div>
          <h2 className="inline-flex items-center text-left font-semibold text-2xl text-[#10141F] lg:text-4xl">
            Trend
            <span className="sr-only">100</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 42 21"
              className="ml-1 w-8 lg:w-12"
              aria-hidden
            >
              <path fill="#1EC9B8" d="M3.8.4V21h3V.4z" />
              <path
                fill="#1EC9B8"
                d="M3.5.4 0 5.7h3.5L6.9.4zM23 20.6a10.3 10.3 0 1 1 7.4-8.8l-3.1-.4a7.2 7.2 0 1 0-5.2 6.2z"
              />
              <path
                fill="#1EC9B8"
                d="M28.1 1A10.3 10.3 0 1 1 22 7.3l3.4 1.2a6.7 6.7 0 1 0 4-4.1z"
              />
            </svg>
          </h2>
          <p className="mt-2 max-w-xl text-sm text-navy-mid lg:text-base">
            Марки с растяща посещаемост — следвайте тренда днес.
          </p>
        </div>
        <div className="hidden shrink-0 items-center gap-2 sm:flex">
          <button
            type="button"
            aria-label="Предишна"
            onClick={() => go(-1)}
            className="grid size-10 place-items-center rounded-full border border-rule bg-white text-ink transition hover:bg-paper"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            type="button"
            aria-label="Следваща"
            onClick={() => go(1)}
            className="grid size-10 place-items-center rounded-full border border-rule bg-white text-ink transition hover:bg-paper"
          >
            <ChevronRight className="size-5" />
          </button>
        </div>
      </header>

      <div
        ref={trackRef}
        role="region"
        aria-label="Trend 100"
        className="flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth px-4 pb-2 [scrollbar-width:none] lg:gap-4 lg:px-[max(1rem,calc((100vw-72rem)/2))] [&::-webkit-scrollbar]:hidden"
      >
        {list.map((b, i) => {
          const growth = trendGrowthPct(b.recentComplaints, b.priorComplaints);
          return (
            <Link
              key={b.slug}
              to="/firma/$slug"
              params={{ slug: b.slug }}
              className="w-[min(78vw,18.5rem)] shrink-0 snap-start rounded-3xl bg-paper p-4 ring-1 ring-black/4 transition hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgb(16_20_31/0.1)] lg:w-[17.5rem] lg:p-5"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="grid size-8 place-items-center rounded-full bg-white text-[13px] font-bold text-navy">
                  {i + 1}
                </span>
                <div className="grid size-14 place-items-center rounded-2xl bg-white ring-1 ring-rule">
                  <BrandListLogo
                    name={b.name}
                    slug={b.slug}
                    logoUrl={b.logoUrl}
                    website={b.website}
                    size={44}
                    className="size-10 object-contain"
                  />
                </div>
              </div>
              <h3 className="mt-4 truncate font-semibold text-ink lg:text-lg">{b.name}</h3>
              <p className="mt-0.5 truncate text-[13px] text-navy-mid">{b.categoryName}</p>
              <div className="mt-4 flex items-end justify-between gap-3">
                <TrendSparkline seed={b.slug} rising={(growth ?? 0) >= 0} />
                <span
                  className={cn(
                    "text-[15px] font-bold tabular-nums",
                    (growth ?? 0) >= 0 ? "text-brand" : "text-danger",
                  )}
                >
                  {growth != null ? `${growth > 0 ? "+" : ""}${growth}%` : "—"}
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      <Link
        to="/trend-100"
        className="mx-auto mt-8 block w-fit rounded-full bg-brand px-8 py-3.5 text-center font-semibold text-white transition hover:bg-brand-hover"
      >
        Виж повече
      </Link>
    </section>
  );
}
