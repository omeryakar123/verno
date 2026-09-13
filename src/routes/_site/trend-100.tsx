import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { fetchBrandsTrend, fetchCategoriesWithCount } from "@/lib/data";
import type { TrendBrand } from "@/lib/trend-brand";
import { trendGrowthPct } from "@/lib/trend-brand";
import { seoHead, SITE_NAME } from "@/lib/seo";
import { BrandListLogo } from "@/components/cards";
import { TrendSparkline } from "@/components/home/trend-sparkline";
import { trendOrPlaceholders } from "@/lib/placeholder-complaints";

type Search = { kategori?: string };

export const Route = createFileRoute("/_site/trend-100")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    kategori: typeof s.kategori === "string" ? s.kategori : undefined,
  }),
  loader: async ({ location }) => {
    const kategori = new URLSearchParams(location.searchStr).get("kategori") ?? undefined;
    const brands = await fetchBrandsTrend({ limit: 100, categorySlug: kategori }).catch(() => [] as TrendBrand[]);
    return { brands };
  },
  head: () =>
    seoHead({
      title: `Тренд 100 — най-обсъжданите марки за 7 дни | ${SITE_NAME}`,
      description:
        "Марките с най-много нови жалби, прегледи и подкрепа за последните 7 дни. Класиране от реални данни.",
      path: "/trend-100",
    }),
  component: Trend100Page,
});

function Trend100Page() {
  const sp = Route.useSearch();
  const nav = Route.useNavigate();
  const loaderBrands = Route.useLoaderData().brands;
  const [brands, setBrands] = useState<TrendBrand[]>(loaderBrands);
  const [cats, setCats] = useState<{ slug: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCategoriesWithCount().then((c) => setCats(c.map((x) => ({ slug: x.slug, name: x.name }))));
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchBrandsTrend({ limit: 100, categorySlug: sp.kategori || undefined })
      .then(setBrands)
      .finally(() => setLoading(false));
  }, [sp.kategori]);

  const rows = trendOrPlaceholders(brands);

  return (
    <div className="listing-page pb-20">
      <header className="container pt-10 pb-6 text-center lg:pt-16">
        <h1 className="inline-flex items-center font-semibold text-3xl text-slate-800 leading-snug lg:text-6xl lg:tracking-wide">
          Trend
          <span className="sr-only">100</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 42 21"
            className="w-8 lg:ml-1 lg:w-15"
            aria-hidden
          >
            <path fill="#03E5B6" d="M3.8.4V21h3V.4z" />
            <path
              fill="#03E5B6"
              d="M3.5.4 0 5.7h3.5L6.9.4zM23 20.6a10.3 10.3 0 1 1 7.4-8.8l-3.1-.4a7.2 7.2 0 1 0-5.2 6.2z"
            />
            <path
              fill="#03E5B6"
              d="M28.1 1A10.3 10.3 0 1 1 22 7.3l3.4 1.2a6.7 6.7 0 1 0 4-4.1z"
            />
          </svg>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-neutral-400 leading-6.5 lg:mt-9 lg:text-xl">
          Марки с растяща посещаемост и популярност за последните 7 дни — следвайте тренда днес.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          <button
            type="button"
            onClick={() => nav({ search: {} })}
            className={`h-9 rounded-full px-4 text-xs font-semibold transition ${
              !sp.kategori
                ? "bg-ink-deep text-white"
                : "bg-white text-navy shadow-[0_4px_20px_rgb(16_20_31/0.06)]"
            }`}
          >
            Всички
          </button>
          {cats.map((c) => {
            const active = sp.kategori === c.slug;
            return (
              <button
                key={c.slug}
                type="button"
                onClick={() => nav({ search: { kategori: c.slug } })}
                className={`h-9 rounded-full px-4 text-xs font-semibold transition ${
                  active
                    ? "bg-ink-deep text-white"
                    : "bg-white text-navy shadow-[0_4px_20px_rgb(16_20_31/0.06)]"
                }`}
              >
                {c.name}
              </button>
            );
          })}
        </div>
      </header>

      <ul className="container mt-8 hidden font-semibold text-[#afb0b6] text-sm leading-none lg:flex">
        <li className="w-5/10 lg:ml-10 lg:w-[46%] xl:w-[50%]">Марка</li>
        <li className="ml-6.5 w-1/6 lg:ml-0 lg:w-[12%]">Тренд</li>
        <li className="ml-5.5 w-[14.5%] lg:ml-15 lg:w-[10%]">Ръст</li>
      </ul>

      <section className="mt-6 rounded-[40px] bg-gray-100 px-2 py-8 lg:container lg:mt-10 lg:rounded-[64px] lg:p-8">
        {loading && brands.length === 0 ? (
          <div className="rounded-3xl bg-white px-6 py-16 text-center text-navy-mid">Зареждане…</div>
        ) : (
          <ul className="flex flex-col gap-2.5 lg:gap-1.5">
            {rows.map((b, i) => {
              const growth = trendGrowthPct(b.recentComplaints, b.priorComplaints);
              return (
                <li key={b.slug} className="group rounded-4xl transition-colors hover:bg-gray-50">
                  <Link
                    to="/firma/$slug"
                    params={{ slug: b.slug }}
                    className="relative flex rounded-4xl bg-white p-5 shadow-[0_8px_24px_rgb(16_20_31/0.06)] transition-colors group-hover:bg-gray-50 lg:p-6"
                  >
                    <div className="mt-4 min-w-9 font-semibold text-lg text-zinc-400 leading-6 lg:text-2xl">
                      {i + 1}.
                    </div>
                    <div className="ml-5 flex w-full flex-col overflow-hidden lg:flex-row lg:items-center lg:gap-2">
                      <div className="flex w-full justify-between lg:w-1/2 lg:flex-row-reverse lg:items-center lg:gap-5">
                        <div className="mt-3.5 w-[calc(100%-105px)] lg:mt-0">
                          <div className="inline-flex w-full items-center gap-0.5 font-semibold text-lg text-neutral-700 leading-5.5">
                            <span className="truncate">{b.name}</span>
                          </div>
                          <div className="mt-1.5 truncate text-sm text-zinc-500 leading-4">
                            {b.categoryName}
                          </div>
                        </div>
                        <div className="inline-flex h-18 w-23 items-center justify-center rounded-2xl border border-[#dcdde1] bg-white px-3.5 py-3 lg:h-22 lg:w-27 lg:p-4">
                          <BrandListLogo
                            name={b.name}
                            slug={b.slug}
                            logoUrl={b.logoUrl}
                            website={b.website}
                            size={56}
                            className="size-full object-contain"
                          />
                        </div>
                      </div>
                      <div className="mt-2.5 h-11 w-28 lg:mt-0">
                        <TrendSparkline seed={b.slug} rising={(growth ?? 0) >= 0} />
                      </div>
                      <div className="hidden items-center lg:ml-24 lg:flex lg:w-[14.5%]">
                        <span className="font-semibold text-[#7c7b85] text-lg leading-none">
                          {growth != null ? `% ${growth}` : "—"}
                        </span>
                      </div>
                      <div className="mt-8 flex items-center justify-between lg:hidden">
                        <span className="font-semibold text-sm text-zinc-400">Ръст</span>
                        <span className="font-semibold text-[#7c7b85] text-lg leading-none">
                          {growth != null ? `% ${growth}` : "—"}
                        </span>
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
