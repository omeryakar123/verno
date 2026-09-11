import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { seoHead, jsonLd, absUrl, SITE_NAME } from "@/lib/seo";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Eye,
  FileText,
  MessageCircle,
  Play,
  Shield,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";
import { type Company, type Complaint } from "@/lib/mock-data";
import { formatResolutionRate } from "@/lib/display-brand-metrics";
import {
  fetchBrandsList,
  fetchBrandsTrend,
  fetchHomeAgenda,
  fetchHomeTalked,
  fetchLiveFeed,
  fetchPlatformStats,
} from "@/lib/data";
import type { TrendBrand } from "@/lib/trend-brand";
import { TrendBrandMobileCard } from "@/components/trend-brand-row";
import { PRIORITY_BRAND_LINKS } from "@/lib/featured-brands";
import { publicPlatformStats } from "@/lib/public-stats";
import { SITE_CONTACT_EMAIL, siteContactMailto } from "@/lib/contact";
import { BrandRankLogo } from "@/components/cards";
import { HeroSection } from "@/components/home/hero-section";
import { AgendaMarquee } from "@/components/home/agenda-marquee";
import { TalkedCarousel } from "@/components/home/talked-carousel";
import { LatestResolvedCarousel } from "@/components/home/latest-resolved-carousel";

const HOME_REFRESH_MS = 30 * 60 * 1000;

const PLACEHOLDER_LATEST: Complaint[] = [
  {
    id: "ph-1",
    title: "Поръчката ми беше доставена след ескалация — сумата възстановена",
    body: "",
    companySlug: "emag",
    companyName: "eMAG",
    category: "diger",
    categoryName: "Общо",
    userInitials: "ED",
    userName: "Елена Димитрова",
    createdAgo: "преди 2 часа",
    status: "cozuldu",
    views: 2310,
    comments: 38,
    votes: 143,
    supported: false,
    brandId: "",
  },
  {
    id: "ph-2",
    title: "Таксата беше възстановена по сметката след жалба",
    body: "",
    companySlug: "dsk-bank",
    companyName: "ДСК Банк",
    category: "diger",
    categoryName: "Общо",
    userInitials: "IP",
    userName: "Иван Петров",
    createdAgo: "преди 5 часа",
    status: "cozuldu",
    views: 3120,
    comments: 51,
    votes: 208,
    supported: false,
    brandId: "",
  },
  {
    id: "ph-3",
    title: "Интернет проблемът беше отстранен в рамките на 48 часа",
    body: "",
    companySlug: "telenor",
    companyName: "Теленор",
    category: "diger",
    categoryName: "Общо",
    userInitials: "MG",
    userName: "Мартин Георгиев",
    createdAgo: "преди 1 ден",
    status: "cozuldu",
    views: 1840,
    comments: 24,
    votes: 96,
    supported: false,
    brandId: "",
  },
  {
    id: "ph-4",
    title: "Пратката пристигна след повторна доставка",
    body: "",
    companySlug: "speedy",
    companyName: "Спиди",
    category: "diger",
    categoryName: "Общо",
    userInitials: "SA",
    userName: "София Ангелова",
    createdAgo: "преди 2 дни",
    status: "cozuldu",
    views: 940,
    comments: 11,
    votes: 42,
    supported: false,
    brandId: "",
  },
];

const FALLBACK_STATS = publicPlatformStats({
  totalUsers: 0,
  totalCompanies: 0,
  totalComplaints: 0,
  resolvedComplaints: 0,
  resolutionRate: 0,
});

function formatCounter(n: number): string {
  return n.toLocaleString("bg-BG").replace(/\s/g, ".");
}

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
      {/* Горна лента — общ брой решения */}
      <Link
        to="/sikayetler"
        className="home-top-bar z-10 flex h-[4.125rem] items-center lg:h-[4.375rem]"
      >
        <div className="home-container flex h-full w-full max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-1 lg:gap-7">
            <p className="font-medium text-[13px] text-white max-[361px]:text-[11px] lg:text-lg">
              Общ брой решения
            </p>
            <div className="font-bold text-[#3ad08f] text-[15px] tabular-nums max-[361px]:text-[13px] lg:text-[26px]">
              {formatCounter(stats.resolvedComplaints)}
            </div>
          </div>
          <span className="hidden text-[13px] text-white/70 sm:inline lg:text-base">
            Проверете оценката на марката преди покупка →
          </span>
        </div>
      </Link>

      <HeroSection
        search={search}
        onSearchChange={setSearch}
        onSubmit={doSearch}
      />

      {/* Популярни марки */}
      <div className="home-container max-w-6xl px-4 pb-8 lg:pb-12">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-[#626692] lg:text-[13px]">
          <span className="font-semibold text-[#85878e]">Популярни:</span>
          {PRIORITY_BRAND_LINKS.slice(0, 6).map((b) => (
            <Link
              key={b.slug}
              to="/firma/$slug"
              params={{ slug: b.slug }}
              className="hover:text-brand transition-colors"
            >
              {b.name}
            </Link>
          ))}
        </div>
      </div>

      <LatestResolvedCarousel
        items={(latest.length > 0 ? latest : PLACEHOLDER_LATEST).slice(0, 8)}
      />

      <AgendaMarquee items={agenda} />
      <TalkedCarousel items={talked} updatedAt={talkedUpdatedAt} />

      {/* Успех в решаването */}
      <section className="home-solution-shell">
        <div className="home-container max-w-6xl px-4 pt-[4.375rem] pb-24 lg:px-[8.75rem] lg:pt-[6.75rem] lg:pb-[6.5rem]">
          <h2 className="text-center font-medium text-3xl leading-snug text-white lg:text-6xl">
            Успех в решаването
          </h2>
          <p className="mx-auto mt-8.5 max-w-3xl px-2.5 text-center text-sm leading-5.5 tracking-wide text-zinc-500 lg:mt-16">
            Класирането се базира единствено на удовлетвореността на
            потребителите — независимо от размера на фирмата или броя жалби.
          </p>
          <ul className="mt-10 space-y-5 lg:mt-12 lg:space-y-2.5 lg:px-2.5">
            {top.map((b, i) => (
              <li key={b.slug}>
                <Link
                  to="/firma/$slug"
                  params={{ slug: b.slug }}
                  className="relative flex w-full rounded-2xl bg-gray-100 lg:rounded-3xl hover:bg-gray-50 transition"
                >
                  <div
                    className={`flex w-max min-w-7.5 flex-col items-center justify-center gap-0.5 rounded-3xl px-0.5 py-3 font-bold text-xs leading-3.5 tracking-tight text-neutral-700 lg:min-w-11 lg:gap-1 lg:text-[13px] ${i === 0 ? "bg-blue-100" : "bg-transparent"}`}
                  >
                    {i + 1}
                  </div>
                  <div className="ml-2.5 flex flex-1 items-center py-4 pr-2.5 lg:ml-7 lg:pr-7.5">
                    <BrandRankLogo
                      name={b.name}
                      slug={b.slug}
                      logoUrl={b.logoUrl}
                      website={b.website}
                    />
                    <div className="ml-3 min-w-0 flex-1 lg:ml-5">
                      <div className="truncate font-semibold text-[14px] text-neutral-800 lg:text-[16px]">
                        {b.name}
                      </div>
                      <div className="truncate text-[11px] text-neutral-500 lg:text-[12px]">
                        {b.categoryName}
                      </div>
                    </div>
                    <div className="shrink-0 pr-3 text-right lg:pr-5">
                      <div className="font-bold text-[#3ad08f] text-[13px] tabular-nums lg:text-[15px]">
                        {formatResolutionRate(
                          b.resolutionRate,
                          b.totalComplaints,
                        )}
                      </div>
                      <div className="text-[10px] text-neutral-500">
                        решение
                      </div>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-8 text-center">
            <Link
              to="/markalar"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10 transition"
            >
              Всички марки <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Video — navbar link hedefi */}
      <section
        id="video"
        className="home-container max-w-6xl scroll-mt-24 px-4 py-12 lg:py-20"
      >
        <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
          <div>
            <h2 className="font-semibold text-2xl text-[#383838] lg:text-4xl">
              Мнения
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-[#85878e] lg:text-base">
              Гледайте потребителски истории на видео. Verno изгражда прозрачен
              мост между марки и потребители.
            </p>
          </div>
          <div className="relative aspect-video overflow-hidden rounded-3xl bg-[#272635] shadow-lift">
            <div className="absolute inset-0 bg-gradient-to-br from-[#695de9]/40 to-[#3ad08f]/30" />
            <div className="absolute inset-0 grid place-items-center">
              <span className="grid size-16 place-items-center rounded-full bg-white/95 text-[#695de9] shadow-lg">
                <Play className="size-7 fill-current ml-1" />
              </span>
            </div>
            <span className="absolute bottom-4 left-4 text-[12px] font-medium text-white/80">
              Видео — скоро
            </span>
          </div>
        </div>
      </section>

      {/* Özellik ikonları */}
      <section className="home-container max-w-6xl px-4 pb-12 lg:pb-20">
        <ul className="grid grid-cols-2 gap-4 lg:grid-cols-5 lg:gap-6">
          {[
            { icon: Shield, label: "Сигурна услуга" },
            { icon: Zap, label: "Бързо решение" },
            { icon: Sparkles, label: "Прозрачен процес" },
            { icon: MessageCircle, label: "Официален отговор" },
            { icon: Users, label: "Общност" },
          ].map(({ icon: Icon, label }) => (
            <li
              key={label}
              className="flex flex-col items-center rounded-2xl bg-white px-4 py-6 text-center shadow-sm ring-1 ring-gray-100"
            >
              <span className="mb-3 grid size-12 place-items-center rounded-xl bg-brand/10 text-brand">
                <Icon className="size-6" />
              </span>
              <span className="text-[13px] font-semibold text-[#383838]">
                {label}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* Награди */}
      <section className="relative overflow-hidden bg-white pt-10 lg:pt-[8.25rem] lg:pb-48">
        <div className="relative flex flex-col lg:container lg:z-10 lg:mx-auto lg:max-w-6xl lg:flex-row lg:justify-center lg:gap-10">
          <div className="home-container flex flex-col justify-center text-zinc-500">
            <h2 className="font-semibold text-2xl leading-7 lg:text-[42px] lg:leading-[52px]">
              <span className="font-normal">Наградите на</span>
              <br className="hidden lg:block" /> {SITE_NAME}
            </h2>
            <p className="mt-7.5 text-lg leading-6.5 lg:pr-10">
              Всяка година награждаваме марките, които правят разлика в
              удовлетвореността на клиентите.
              {SITE_NAME} продължава да свързва марки и потребители с фокус
              върху решенията.
            </p>
            <Link
              to="/hakkimizda"
              className="mt-6 inline-flex items-center gap-2 text-[13px] font-semibold text-brand hover:gap-3 transition-all"
            >
              Verno SEAL & Верификация <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="relative mx-auto mt-[4.5rem] w-full max-w-[420px] px-4 lg:mt-0 lg:w-[420px] lg:shrink-0 lg:px-0">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#272635] via-[#3a384a] to-brand/30 p-1.5 shadow-lift ring-1 ring-white/10">
              <div className="overflow-hidden rounded-[14px] bg-[#272635] p-8 text-center text-white ring-1 ring-white/10">
                <div className="mx-auto mb-4 grid size-20 place-items-center rounded-full bg-brand/20 text-brand text-3xl font-black">
                  ✓
                </div>
                <p className="font-semibold text-lg">Верифицирана марка</p>
                <p className="mt-2 text-sm text-white/70">
                  QR код · Оценка на доверие · Официален отговор
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Статистика */}
      <section className="home-container max-w-6xl pt-12 pb-[3.75rem] lg:pt-36 lg:pb-[12.5rem]">
        <h2 className="text-center font-semibold text-2xl leading-none text-zinc-500 lg:font-medium lg:text-3xl">
          {SITE_NAME} в цифри
        </h2>
        <ul className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:mt-25 lg:grid-cols-4 lg:gap-7.5">
          {[
            { k: "Потребители", v: stats.totalUsers, i: Users },
            { k: "Жалби", v: stats.totalComplaints, i: FileText },
            {
              k: "Регистрирани марки",
              v: stats.totalCompanies,
              i: MessageCircle,
            },
            { k: "Решени жалби", v: stats.resolvedComplaints, i: Eye },
          ].map((s) => {
            const Icon = s.i;
            return (
              <li
                key={s.k}
                className="flex items-center gap-4 rounded-3xl bg-white py-7.5 pr-4 pl-6 shadow-sm ring-1 ring-gray-100 lg:flex-col lg:items-start lg:justify-between lg:px-7.5 lg:pt-9 lg:pb-9.5"
              >
                <span className="grid size-10 place-items-center rounded-xl bg-brand/10 text-brand lg:mb-4">
                  <Icon className="size-5" />
                </span>
                <div>
                  <div className="font-black text-[26px] text-[#383838] tabular-nums lg:text-[32px]">
                    {s.v.toLocaleString("bg-BG")}
                  </div>
                  <div className="mt-1 text-[13px] text-[#85878e]">{s.k}</div>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Trend 100 */}
      <section className="bg-white py-[3.75rem] md:py-20 lg:py-[6.25rem]">
        <header className="home-container text-center">
          <h2 className="inline-flex items-center font-semibold text-3xl leading-snug text-slate-800 lg:text-6xl lg:tracking-wide">
            Trend<span className="sr-only">100</span>
            <span className="ml-1 inline-flex text-brand lg:ml-2">
              <span className="font-black">100</span>
            </span>
          </h2>
          <p className="mx-auto mt-[35px] mb-5.5 max-w-xl font-normal text-lg leading-6.5 text-neutral-400 lg:mt-9 lg:text-xl">
            Марки с най-голям ръст през последните 7 дни — изчислено от реални
            данни.
          </p>
        </header>

        <div className="home-container mt-8 rounded-[40px] bg-gray-100 px-2 py-8 lg:mt-12 lg:rounded-[64px] lg:p-8">
          <ul className="flex flex-col gap-2.5 lg:gap-1.5">
            {trend100.slice(0, 6).map((b, i) => (
              <li key={b.slug}>
                <TrendBrandMobileCard brand={b} rank={i + 1} />
              </li>
            ))}
          </ul>
          <div className="mt-6 text-center">
            <Link
              to="/trend-100"
              className="inline-flex items-center gap-2 rounded-full border border-brand px-5 py-2.5 text-[13px] font-semibold text-brand hover:bg-brand/5 transition"
            >
              Виж повече
            </Link>
          </div>
        </div>
      </section>

      {/* Марка CTA */}
      <section className="home-brand-cta py-[3.75rem] lg:py-28">
        <div className="home-container text-center">
          <h2 className="font-semibold text-4xl leading-tight tracking-wide lg:font-medium lg:text-5xl">
            Потребителско изживяване, вашият бранд
          </h2>
          <p className="mx-auto mt-11 max-w-2xl px-2 font-medium leading-tight tracking-wide lg:mt-7.5 lg:text-xl">
            Негативният опит се споделя сред средно 250 души.
            <br className="hidden sm:block" />
            Станете част от култура, ориентирана към клиента:
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row lg:mt-13">
            <a
              href={siteContactMailto("Pro membership")}
              className="inline-flex w-max items-center justify-center rounded-[50px] border border-zinc-400 bg-white px-5 py-3.5 font-semibold text-slate-800 leading-none hover:border-slate-800 hover:bg-slate-800 hover:text-white transition"
            >
              Свържете се за Pro
            </a>
            <Link
              to="/register/marka-basvuru"
              className="inline-flex w-max items-center justify-center rounded-[50px] border border-white/30 px-5 py-3.5 font-semibold leading-none hover:bg-white/10 transition"
            >
              Кандидатствай като марка
            </Link>
          </div>
        </div>
      </section>

      {/* Trust / Seal CTA */}
      <section className="relative overflow-hidden bg-white pt-10 lg:pt-[8.25rem] lg:pb-48">
        <div className="relative flex flex-col lg:container lg:z-10 lg:mx-auto lg:max-w-6xl lg:flex-row lg:justify-center lg:gap-10">
          <div className="home-container flex flex-col justify-center text-zinc-500">
            <h2 className="font-semibold text-2xl leading-7 lg:text-3xl lg:leading-9">
              Проверете Trust Score на марката преди покупка
            </h2>
            <div className="mt-7.5 space-y-3 text-lg leading-6.5 lg:mt-6 lg:space-y-2.5 lg:pr-10 lg:text-base lg:leading-6">
              <p>
                {SITE_NAME} е адресът на потребителското доверие в България.
              </p>
              <p>
                <strong>Trust Score</strong> прави нивото на доверие на марките
                видимо за вас.
              </p>
              <p>
                Преди да пазарувате, проверете оценката, скоростта на отговор и
                реалните отзиви.
              </p>
            </div>
            <Link
              to="/markalar"
              className="mt-8 inline-flex w-max items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white hover:bg-brand-hover transition"
            >
              Без колебание — провери <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="home-container mt-12 lg:mt-0 lg:max-w-md">
            <div className="rounded-3xl bg-gradient-to-br from-brand/10 to-[#695de9]/10 p-6 ring-1 ring-brand/20">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Решени жалби", value: stats.resolvedComplaints },
                  { label: "Марки", value: stats.totalCompanies },
                  {
                    label: "Процент решение",
                    value: `${Math.round(stats.resolutionRate)}%`,
                  },
                  { label: "Жалби", value: stats.totalComplaints },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl bg-white p-4 text-center shadow-sm"
                  >
                    <div className="font-black text-xl text-[#383838] tabular-nums">
                      {typeof item.value === "number"
                        ? item.value.toLocaleString("bg-BG")
                        : item.value}
                    </div>
                    <div className="mt-1 text-[11px] text-[#85878e]">
                      {item.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
