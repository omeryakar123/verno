import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, Search, SlidersHorizontal } from "lucide-react";
import { Pagination } from "@/components/pagination";
import { AgendaMarquee } from "@/components/home/agenda-marquee";
import { ComplaintFeedCard } from "@/components/home/complaint-feed-card";
import type { Complaint } from "@/lib/mock-data";
import {
  fetchComplaintsPaged,
  fetchCategoriesWithCount,
  fetchHomeAgenda,
  PAGE_SIZE,
  type ComplaintSort,
} from "@/lib/data";
import { seoHead, breadcrumbLd, clamp, SITE_NAME } from "@/lib/seo";

type SP = {
  kategori?: string;
  durum?: string;
  q?: string;
  sirala?: ComplaintSort;
};

const SORT_OPTIONS: { key: ComplaintSort; label: string }[] = [
  { key: "recent", label: "Най-нови" },
  { key: "viewed", label: "Най-гледани" },
  { key: "supported", label: "Най-подкрепени" },
  { key: "trending", label: "Най-коментирани" },
];

function parseSort(value: unknown): ComplaintSort | undefined {
  if (value === "trending" || value === "supported" || value === "viewed") {
    return value;
  }
  return undefined;
}

export const Route = createFileRoute("/_site/sikayetler")({
  validateSearch: (s: Record<string, unknown>): SP => ({
    kategori: typeof s.kategori === "string" ? s.kategori : undefined,
    durum: typeof s.durum === "string" ? s.durum : undefined,
    q: typeof s.q === "string" ? s.q : undefined,
    sirala: parseSort(s.sirala),
  }),
  loader: async () => {
    const [first, agenda] = await Promise.all([
      fetchComplaintsPaged({ page: 1, pageSize: PAGE_SIZE }).catch(() => ({
        items: [] as Complaint[],
        total: 0,
        page: 1,
        pageSize: PAGE_SIZE,
      })),
      fetchHomeAgenda({ limit: 10 }).catch(() => [] as Complaint[]),
    ]);
    return { first, agenda };
  },
  head: ({ loaderData }) => {
    const total = loaderData?.first?.total ?? 0;
    const title = `Жалби — актуални потребителски жалби | ${SITE_NAME}`;
    const description = clamp(
      `Най-актуалните ${total > 0 ? total + " " : ""}потребителски жалби. Филтрирайте по категория, статус и марка; следете отговорите и процеса на решаване.`,
      155,
    );
    return {
      ...seoHead({ title, description, path: "/sikayetler" }),
      scripts: [
        breadcrumbLd([
          { name: "Начало", path: "/" },
          { name: "Жалби", path: "/sikayetler" },
        ]),
      ],
    };
  },
  component: SikayetlerPage,
});

function SikayetlerPage() {
  const sp = Route.useSearch();
  const nav = Route.useNavigate();
  const loaded = Route.useLoaderData();
  const [items, setItems] = useState<Complaint[]>(loaded?.first?.items ?? []);
  const [total, setTotal] = useState(loaded?.first?.total ?? 0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [cats, setCats] = useState<{ slug: string; name: string }[]>([]);
  const [search, setSearch] = useState(sp.q ?? "");
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    fetchCategoriesWithCount().then((c) =>
      setCats(c.map((x) => ({ slug: x.slug, name: x.name }))),
    );
  }, []);
  useEffect(() => {
    setPage(1);
  }, [sp.kategori, sp.durum, sp.sirala, sp.q]);

  useEffect(() => {
    setLoading(true);
    fetchComplaintsPaged({
      page,
      pageSize: PAGE_SIZE,
      categorySlug: sp.kategori || undefined,
      sortBy: sp.sirala ?? "recent",
      search: sp.q || undefined,
      durum: sp.durum || undefined,
    })
      .then((r) => {
        setItems(r.items);
        setTotal(r.total);
      })
      .finally(() => setLoading(false));
  }, [page, sp.kategori, sp.durum, sp.sirala, sp.q]);

  const setParam = (patch: Partial<SP>) =>
    nav({ search: (prev: SP) => ({ ...prev, ...patch }) });

  const resolved = sp.durum === "cozuldu";

  return (
    <div className="listing-page">
      <div className="container max-w-6xl px-4 pt-10 pb-4 lg:pt-16">
        <h1 className="font-medium text-3xl text-[#272635] leading-tight lg:text-5xl">
          Всички жалби
        </h1>
      </div>

      <AgendaMarquee
        compact
        items={
          loaded.agenda.length > 0
            ? loaded.agenda
            : loaded.first.items.slice(0, 8)
        }
      />

      <div className="container max-w-6xl px-4 pb-16">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3 lg:mb-8">
          <h2 className="font-medium text-2xl text-[#85878e] lg:text-3xl">
            Последни жалби
          </h2>
          <p className="text-sm font-semibold text-[#afb0b6]">
            {total.toLocaleString("bg-BG")} жалби
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            setParam({ q: search || undefined });
          }}
          className="mb-5 flex flex-wrap items-center gap-3"
        >
          <div className="relative min-w-[220px] flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-[#85878e]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Търси в резултатите…"
              className="h-12 w-full rounded-full border-0 bg-white pr-4 pl-11 text-sm shadow-[0_4px_20px_rgba(47,44,105,0.06)] outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-[#3ad08f]/30"
            />
          </div>
          <button
            type="button"
            onClick={() => setFiltersOpen((o) => !o)}
            className="inline-flex h-12 items-center gap-2 rounded-full bg-white px-4 text-sm font-semibold text-[#626692] shadow-[0_4px_20px_rgba(47,44,105,0.06)]"
            aria-expanded={filtersOpen}
          >
            <SlidersHorizontal className="size-4" />
            Филтри
          </button>
          <button
            type="button"
            onClick={() => setParam({ durum: resolved ? undefined : "cozuldu" })}
            className={`inline-flex h-12 items-center gap-2 rounded-full px-4 text-sm font-semibold transition ${
              resolved
                ? "bg-[#3ad08f] text-white"
                : "bg-white text-[#626692] shadow-[0_4px_20px_rgba(47,44,105,0.06)]"
            }`}
          >
            <CheckCircle2 className="size-4" />
            Решени
          </button>
          <select
            value={sp.sirala ?? "recent"}
            onChange={(e) =>
              setParam({ sirala: parseSort(e.target.value) })
            }
            className="h-12 rounded-full border-0 bg-white px-4 text-sm font-semibold text-[#626692] shadow-[0_4px_20px_rgba(47,44,105,0.06)] outline-none"
            aria-label="Сортиране"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.key} value={o.key}>
                {o.label}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="h-12 rounded-full bg-[#3ad08f] px-6 text-sm font-semibold text-white hover:bg-[#42e29d]"
          >
            Търси
          </button>
        </form>

        {filtersOpen ? (
          <div className="mb-6 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setParam({ kategori: undefined })}
              className={`h-9 rounded-full px-3.5 text-xs font-semibold ${
                !sp.kategori
                  ? "bg-[#272635] text-white"
                  : "bg-white text-[#626692] ring-1 ring-[#e6e8f0]"
              }`}
            >
              Всички категории
            </button>
            {cats.map((c) => (
              <button
                key={c.slug}
                type="button"
                onClick={() =>
                  setParam({
                    kategori: sp.kategori === c.slug ? undefined : c.slug,
                  })
                }
                className={`h-9 rounded-full px-3.5 text-xs font-semibold ${
                  sp.kategori === c.slug
                    ? "bg-[#272635] text-white"
                    : "bg-white text-[#626692] ring-1 ring-[#e6e8f0]"
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        ) : null}

        {loading && items.length === 0 ? (
          <div className="rounded-2xl bg-white px-6 py-16 text-center text-[#85878e] shadow-[0_4px_20px_rgba(47,44,105,0.06)]">
            Зареждане…
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl bg-white px-6 py-16 text-center text-[#85878e] shadow-[0_4px_20px_rgba(47,44,105,0.06)]">
            Няма намерени резултати.
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-3 lg:gap-4">
              {items.map((c) => (
                <ComplaintFeedCard key={c.id} complaint={c} />
              ))}
            </div>
            <Pagination
              page={page}
              pageSize={PAGE_SIZE}
              total={total}
              onChange={setPage}
            />
          </>
        )}
      </div>
    </div>
  );
}
