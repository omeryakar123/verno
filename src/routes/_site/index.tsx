import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { seoHead, jsonLd, absUrl, SITE_NAME } from "@/lib/seo";
import { useEffect, useState } from "react";
import {
  StatIconDoc,
  StatIconMembers,
  StatIconResolved,
  StatIconShield,
  StatIconVisitors,
} from "@/components/home/home-stat-icons";
import { type Company, type Complaint } from "@/lib/mock-data";
import {
  fetchBrandsList,
  fetchBrandsTrend,
  fetchHomeAgenda,
  fetchHomeTalked,
  fetchLiveFeed,
  fetchPlatformStats,
} from "@/lib/data";
import { type TrendBrand } from "@/lib/trend-brand";
import { publicPlatformStats } from "@/lib/public-stats";
import { SITE_CONTACT_EMAIL } from "@/lib/contact";
import { BrandListLogo } from "@/components/cards";
import { HeroSection } from "@/components/home/hero-section";
import { AgendaMarquee } from "@/components/home/agenda-marquee";
import { TalkedCarousel } from "@/components/home/talked-carousel";
import { HomeAwardsSeal, HomeDecorBlobs } from "@/components/home/home-media-block";
import { HomeWordmark } from "@/components/home/home-wordmark";
import { TrendStrip } from "@/components/home/trend-strip";
import {
  brandsOrPlaceholders,
  complaintsOrPlaceholders,
  trendOrPlaceholders,
} from "@/lib/placeholder-complaints";

const HOME_REFRESH_MS = 30 * 60 * 1000;

const FALLBACK_STATS = publicPlatformStats({
  totalUsers: 0,
  totalCompanies: 0,
  totalComplaints: 0,
  resolvedComplaints: 0,
  resolutionRate: 0,
});

export const Route = createFileRoute("/_site/")({
  loader: async () => {
    const [liveFeed, agenda, talked, platformStats, topBrands, trendBrands] =
      await Promise.all([
        fetchLiveFeed({ limit: 6 }).catch(() => [] as Complaint[]),
        fetchHomeAgenda({ limit: 10 }).catch(() => [] as Complaint[]),
        fetchHomeTalked({ limit: 8 }).catch(() => [] as Complaint[]),
        fetchPlatformStats().catch(() => FALLBACK_STATS),
        fetchBrandsList({ limit: 8, sortBy: "resolution" }).catch(
          () => [] as Company[],
        ),
        fetchBrandsTrend({ limit: 10 }).catch(() => [] as TrendBrand[]),
      ]);
    return {
      latest: liveFeed,
      agenda,
      talked,
      stats: platformStats,
      topBrands,
      trendBrands,
    };
  },
  head: () => {
    const base = seoHead({
      title: `${SITE_NAME} — Споделете жалбата си, получете официален отговор`,
      description:
        "Независима българска платформа за жалби. Открийте реални потребителски опити, споделете проблема си и получете официален отговор от марките.",
      path: "/",
    });
    return {
      ...base,
      scripts: [
        jsonLd({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: SITE_NAME,
          url: absUrl("/"),
          logo: absUrl("/mainlogo.png"),
          contactPoint: {
            "@type": "ContactPoint",
            contactType: "customer service",
            email: SITE_CONTACT_EMAIL,
          },
        }),
        jsonLd({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: SITE_NAME,
          url: absUrl("/"),
          potentialAction: {
            "@type": "SearchAction",
            target: `${absUrl("/arama")}?q={search_term_string}`,
            "query-input": "required name=search_term_string",
          },
        }),
      ],
    };
  },
  component: Home,
});

function Home() {
  const loaderData = Route.useLoaderData();
  const [latest, setLatest] = useState<Complaint[]>(loaderData.latest ?? []);
  const [agenda, setAgenda] = useState<Complaint[]>(loaderData.agenda ?? []);
  const [talked, setTalked] = useState<Complaint[]>(loaderData.talked ?? []);
  const [top, setTop] = useState<Company[]>(loaderData.topBrands ?? []);
  const [trend100, setTrend100] = useState<TrendBrand[]>(
    loaderData.trendBrands ?? [],
  );
  const [stats, setStats] = useState(loaderData.stats ?? FALLBACK_STATS);
  const [talkedUpdatedAt, setTalkedUpdatedAt] = useState<Date>(
    () => new Date(),
  );
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    async function loadHomeData() {
      const results = await Promise.allSettled([
        fetchLiveFeed({ limit: 6 }),
        fetchHomeAgenda({ limit: 10 }),
        fetchHomeTalked({ limit: 8 }),
        fetchBrandsList({ limit: 8, sortBy: "resolution" }),
        fetchBrandsTrend({ limit: 10 }),
        fetchPlatformStats(),
      ]);

      if (cancelled) return;

      const [latestR, agendaR, talkedR, topR, trendR, statsR] = results;
      if (latestR.status === "fulfilled") setLatest(latestR.value);
      if (agendaR.status === "fulfilled") setAgenda(agendaR.value);
      if (talkedR.status === "fulfilled") {
        setTalked(talkedR.value);
        setTalkedUpdatedAt(new Date());
      }
      if (topR.status === "fulfilled") setTop(topR.value);
      if (trendR.status === "fulfilled") setTrend100(trendR.value);
      if (statsR.status === "fulfilled") setStats(statsR.value);
      else setStats(FALLBACK_STATS);
    }

    loadHomeData();
    const timer = window.setInterval(loadHomeData, HOME_REFRESH_MS);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, []);

  function doSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = search.trim();
    if (!q) return;
    navigate({ to: "/arama", search: { q } });
  }

  return (
    <div
      data-page="home"
      className="isolate min-h-screen overflow-x-hidden bg-white"
    >
      <HeroSection
        search={search}
        onSearchChange={setSearch}
        onSubmit={doSearch}
      />

      <AgendaMarquee items={complaintsOrPlaceholders(agenda.length > 0 ? agenda : latest)} />
      <TalkedCarousel
        items={complaintsOrPlaceholders(talked.length > 0 ? talked : latest)}
        updatedAt={talkedUpdatedAt}
      />

      <section className="relative overflow-hidden bg-ink-deep">
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
          <div className="absolute -top-16 -left-10 size-40 rounded-full bg-primary/22" />
          <div className="absolute -top-8 -right-12 size-28 rounded-full bg-brand/40" />
          <div className="absolute bottom-24 -left-8 size-20 rounded-full bg-primary/28" />
          <div className="absolute -bottom-10 right-0 size-44 rounded-full bg-brand/16" />
          <div className="absolute bottom-[38%] left-[5%] size-5 rounded-full bg-[#F5D76E]" />
        </div>
        <div className="container relative z-10 pt-17.5 pb-24 lg:max-w-6xl lg:px-35 lg:pt-27 lg:pb-26">
          <h2 className="text-center font-medium text-3xl text-white leading-snug lg:text-6xl">
            Успех в решаването
          </h2>
          <div className="mt-7.5 flex flex-col items-center gap-7 lg:relative lg:mt-15 lg:flex-row">
            <span className="relative pl-7 font-medium text-sm leading-none text-gray-100 before:absolute before:-top-0.5 before:left-1 before:size-3 before:rounded-full before:bg-emerald-400 before:content-[''] after:absolute after:-top-1.5 after:left-0 after:size-5 after:rounded-full after:border after:border-emerald-400 after:content-[''] lg:mx-auto lg:pl-7.5">
              Последни 12 месеца
            </span>
          </div>
          <p className="mx-auto mt-8.5 max-w-3xl px-2.5 text-center text-sm leading-5.5 tracking-wide text-zinc-500 lg:mt-16 lg:w-4/5">
            Класирането се базира единствено на удовлетвореността на
            потребителите — независимо от размера на фирмата или броя жалби.
          </p>
          <ul className="mt-10 space-y-3 lg:mt-12">
            {brandsOrPlaceholders(top).map((b, i) => {
              const rate = Math.min(100, Math.max(0, Math.round(b.resolutionRate)));
              return (
                <li key={b.slug}>
                  <Link
                    to="/firma/$slug"
                    params={{ slug: b.slug }}
                    className="flex items-center gap-3 rounded-2xl bg-white/95 px-3 py-3 shadow-[0_10px_28px_rgb(0_0_0/0.16)] transition hover:bg-white lg:gap-5 lg:rounded-3xl lg:px-5 lg:py-4"
                  >
                    <span
                      className={`grid size-10 shrink-0 place-items-center rounded-2xl text-[15px] font-bold lg:size-12 lg:text-lg ${
                        i === 0
                          ? "bg-primary text-white"
                          : i === 1
                            ? "bg-brand text-white"
                            : i === 2
                              ? "bg-ink-deep text-white"
                              : "bg-paper text-navy"
                      }`}
                    >
                      {i + 1}
                    </span>
                    <div className="grid size-14 shrink-0 place-items-center rounded-xl bg-white ring-1 ring-black/6 lg:size-16">
                      <BrandListLogo
                        name={b.name}
                        slug={b.slug}
                        logoUrl={b.logoUrl}
                        website={b.website}
                        size={56}
                        className="size-full object-contain p-1"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-semibold text-ink lg:text-xl">{b.name}</h3>
                      <p className="mt-0.5 truncate text-[13px] text-navy-mid">{b.categoryName}</p>
                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-200">
                        <div
                          className="h-full rounded-full bg-brand"
                          style={{ width: `${rate}%` }}
                        />
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="font-black tabular-nums text-brand text-2xl leading-none lg:text-[30px]">
                        {rate}%
                      </div>
                      <div className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-navy-mid">
                        решени
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <section
        id="awards"
        className="relative overflow-hidden bg-white py-12 lg:py-20"
      >
        <div className="relative z-10 flex flex-col lg:container lg:max-w-6xl lg:flex-row lg:items-center lg:justify-center lg:gap-10">
          <div className="container flex flex-col justify-center text-navy-mid">
            <h2 className="flex flex-col items-start gap-2 text-left font-semibold text-2xl leading-7 text-[#10141F] lg:text-[42px] lg:leading-[52px]">
              <HomeWordmark />
              <span>Награди</span>
            </h2>
            <p className="mt-7.5 text-lg leading-6.5 lg:pr-10">
              Всяка година награждаваме марките, които правят разлика в
              удовлетвореността на клиентите. {SITE_NAME} продължава да свързва
              марки и потребители с фокус върху решенията.
            </p>
          </div>
          <HomeAwardsSeal />
        </div>
        <HomeDecorBlobs />
      </section>

      <section className="home-stats-band">
        <div className="container py-12 lg:py-20">
          <h2 className="flex items-center justify-start gap-2.5 font-semibold text-2xl text-[#10141F] leading-none lg:text-4xl">
            <HomeWordmark heightClass="h-6 lg:h-9" />
            <span>в цифри</span>
          </h2>
          <ul className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:mt-25 lg:grid-cols-5 lg:gap-7.5">
            {[
              { k: "Потребители", v: stats.totalUsers.toLocaleString("bg-BG"), i: StatIconMembers },
              { k: "Марки", v: stats.totalCompanies.toLocaleString("bg-BG"), i: StatIconShield },
              { k: "Жалби", v: stats.totalComplaints.toLocaleString("bg-BG"), i: StatIconDoc },
              { k: "Решени жалби", v: stats.resolvedComplaints.toLocaleString("bg-BG"), i: StatIconResolved },
              {
                k: "Процент решение",
                v: `${Math.round(stats.resolutionRate)}%`,
                i: StatIconVisitors,
              },
            ].map((s) => {
              const Icon = s.i;
              return (
                <li
                  key={s.k}
                  className="flex items-center gap-4 rounded-3xl bg-white py-7.5 pr-4 pl-6 shadow-[0_12px_32px_rgb(16_20_31/0.08)] lg:flex-col lg:items-start lg:justify-between lg:px-7.5 lg:pt-9 lg:pb-9.5"
                >
                  <Icon />
                  <div className="flex flex-col gap-2 font-medium text-xs text-zinc-500 leading-tight lg:text-base">
                    <span>{s.k}</span>
                    <span className="font-bold text-2xl text-neutral-700 leading-tight lg:text-3xl">
                      {s.v}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <TrendStrip items={trendOrPlaceholders(trend100)} />

      <section className="bg-primary pt-15 pb-20 lg:py-28">
        <div className="container">
          <div className="mx-auto text-center text-white">
            <h2 className="font-semibold text-4xl leading-tight tracking-wide lg:font-medium">
              Потребителско изживяване, вашият бранд
            </h2>
            <p className="mt-11 px-2 font-medium leading-tight tracking-wide lg:mt-7.5 lg:px-0 lg:text-xl">
              Негативният опит се споделя сред средно 250 души.
              <br />
              Станете част от култура, ориентирана към клиента:
            </p>
            <Link
              to="/register/marka-basvuru"
              className="mx-auto mt-16 block w-max rounded-[50px] border border-zinc-400 bg-white px-5 py-3.5 font-semibold text-slate-800 leading-none hover:border-slate-800 hover:bg-slate-800 hover:text-white lg:mt-13 lg:px-7.5 lg:py-5 lg:text-xl"
            >
              Нека работим заедно
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
