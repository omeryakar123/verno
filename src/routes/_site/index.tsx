import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { seoHead, jsonLd, absUrl, SITE_NAME } from "@/lib/seo";
import { useEffect, useState } from "react";
import { Eye, FileText, MessageCircle, Users } from "lucide-react";
import { type Company, type Complaint } from "@/lib/mock-data";
import {
  fetchBrandsList,
  fetchBrandsTrend,
  fetchHomeAgenda,
  fetchHomeTalked,
  fetchLiveFeed,
  fetchPlatformStats,
} from "@/lib/data";
import { trendGrowthPct, type TrendBrand } from "@/lib/trend-brand";
import { publicPlatformStats } from "@/lib/public-stats";
import { SITE_CONTACT_EMAIL } from "@/lib/contact";
import { BrandListLogo } from "@/components/cards";
import { HeroSection } from "@/components/home/hero-section";
import { AgendaMarquee } from "@/components/home/agenda-marquee";
import { TalkedCarousel } from "@/components/home/talked-carousel";
import {
  HomeDecorBlobs,
  HomeMediaBlock,
} from "@/components/home/home-media-block";
import { TrendSparkline } from "@/components/home/trend-sparkline";

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

      <AgendaMarquee
        items={agenda.length > 0 ? agenda : latest.length > 0 ? latest : PLACEHOLDER_LATEST}
      />
      <TalkedCarousel
        items={talked.length > 0 ? talked : latest}
        updatedAt={talkedUpdatedAt}
      />

      <section className="bg-[#272635]">
        <div className="container pt-17.5 pb-24 lg:max-w-6xl lg:px-35 lg:pt-27 lg:pb-26">
          <h2 className="text-center font-medium text-3xl text-white leading-snug lg:text-6xl">
            Успех в решаването
          </h2>
          <p className="mx-auto mt-7.5 max-w-3xl px-2.5 text-center text-sm leading-5.5 tracking-wide text-zinc-500 lg:mt-15">
            Класирането се базира единствено на удовлетвореността на
            потребителите — независимо от размера на фирмата или броя жалби.
          </p>
          <ul className="mt-10 space-y-5 lg:mt-12 lg:space-y-2.5 lg:px-2.5">
            {top.map((b, i) => (
              <li key={b.slug}>
                <Link
                  to="/firma/$slug"
                  params={{ slug: b.slug }}
                  className="relative flex w-full rounded-2xl bg-gray-100 lg:rounded-3xl"
                >
                  <div
                    className={`flex w-max min-w-7.5 flex-col items-center justify-center gap-0.5 rounded-3xl px-0.5 font-bold text-neutral-700 text-xs leading-3.5 tracking-tight lg:min-w-11 lg:gap-1 lg:text-[13px] ${i === 0 ? "bg-blue-100" : ""}`}
                  >
                    <span className="block h-3 w-3 rounded-[1px] bg-[#4C698C]" />
                  </div>
                  <div className="ml-2.5 flex flex-1 items-center py-4 pr-2.5 lg:ml-7 lg:pr-7.5">
                    <div className="flex h-16 w-19 items-center justify-center rounded-xl bg-white px-1 py-2.5 lg:h-22 lg:w-27">
                      <BrandListLogo
                        name={b.name}
                        slug={b.slug}
                        logoUrl={b.logoUrl}
                        website={b.website}
                        size={64}
                        className="size-full object-contain"
                      />
                    </div>
                    <div className="ml-3.5 flex w-full flex-col gap-1.5 text-neutral-700 lg:ml-7 lg:flex-row lg:items-center lg:justify-between lg:gap-0">
                      <div className="lg:grow">
                        <span className="mr-1 align-baseline font-bold lg:text-xl">
                          {i + 1}.
                        </span>
                        <h3 className="mr-1 inline align-baseline font-medium leading-tight [word-break:break-word] lg:max-w-72 lg:truncate lg:text-xl">
                          {b.name}
                        </h3>
                      </div>
                      <div className="text-sm text-zinc-500 lg:text-base">
                        {b.categoryName}
                      </div>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section
        id="video"
        className="relative overflow-hidden bg-white pt-10 lg:pt-33 lg:pb-48"
      >
        <div className="relative flex flex-col lg:container lg:z-10 lg:max-w-6xl lg:flex-row lg:justify-center lg:gap-10">
          <div className="container flex flex-col justify-center text-zinc-500">
            <h2 className="font-semibold text-2xl leading-7 lg:text-[42px] lg:leading-[52px]">
              <span className="font-normal">{SITE_NAME}</span>
              <br className="hidden lg:block" /> Награди
            </h2>
            <p className="mt-7.5 text-lg leading-6.5 lg:pr-10">
              Всяка година награждаваме марките, които правят разлика в
              удовлетвореността на клиентите. {SITE_NAME} продължава да свързва
              марки и потребители с фокус върху решенията.
            </p>
          </div>
          <HomeMediaBlock
            src="/home/video-cover-awards.jpg"
            alt={`${SITE_NAME} награди`}
          />
        </div>
        <HomeDecorBlobs />
      </section>

      <section className="container pt-12 pb-15 lg:pt-36 lg:pb-50">
        <h2 className="text-center font-semibold text-2xl text-zinc-500 leading-none lg:font-medium">
          {SITE_NAME} в цифри
        </h2>
        <ul className="mt-12 grid grid-cols-1 gap-5 lg:mt-25 lg:grid-cols-5 lg:gap-7.5">
          {[
            { k: "Потребители", v: stats.totalUsers.toLocaleString("bg-BG"), i: Users },
            { k: "Жалби", v: stats.totalComplaints.toLocaleString("bg-BG"), i: FileText },
            { k: "Марки", v: stats.totalCompanies.toLocaleString("bg-BG"), i: MessageCircle },
            { k: "Решени жалби", v: stats.resolvedComplaints.toLocaleString("bg-BG"), i: Eye },
            {
              k: "Процент решение",
              v: `${Math.round(stats.resolutionRate)}%`,
              i: Eye,
            },
          ].map((s) => {
            const Icon = s.i;
            return (
              <li
                key={s.k}
                className="flex items-center gap-4 rounded-3xl bg-white py-7.5 pr-4 pl-6 lg:flex-col lg:items-start lg:justify-between lg:px-7.5 lg:pt-9 lg:pb-9.5"
              >
                <Icon className="h-16 w-11 text-[#3ad08f] lg:mb-9 lg:w-25" />
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
      </section>

      <section className="bg-white py-15 md:py-20 lg:py-25">
        <header className="container text-center">
          <h2 className="inline-flex items-center font-semibold text-3xl text-slate-800 leading-snug lg:text-6xl lg:tracking-wide">
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
          </h2>
          <p className="mt-[35px] mb-5.5 font-normal text-lg text-neutral-400 leading-6.5 lg:mt-9 lg:text-xl">
            Марки с растяща посещаемост и популярност — следвайте тренда днес.
          </p>
        </header>
        <ul className="container mt-15 hidden font-semibold text-[#afb0b6] text-sm leading-none lg:flex">
          <li className="w-5/10 lg:ml-10 lg:w-[46%] xl:w-[50%]">Марка</li>
          <li className="ml-6.5 w-1/6 lg:ml-0 lg:w-[12%]">Тренд</li>
          <li className="ml-5.5 w-[14.5%] lg:ml-15 lg:w-[10%]">Ръст</li>
        </ul>
        <section className="mt-8 rounded-[40px] bg-gray-100 px-2 py-8 lg:container lg:mt-12 lg:rounded-[64px] lg:p-8">
          <ul className="flex flex-col gap-2.5 lg:max-w-none lg:gap-1.5">
            {trend100.slice(0, 8).map((b, i) => {
              const growth = trendGrowthPct(b.recentComplaints, b.priorComplaints);
              return (
                <li
                  key={b.slug}
                  className="group rounded-4xl transition-colors hover:bg-gray-50"
                >
                  <Link
                    to="/firma/$slug"
                    params={{ slug: b.slug }}
                    className="relative flex rounded-4xl bg-white p-5 transition-colors group-hover:bg-gray-50 lg:p-6"
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
                        <TrendSparkline
                          seed={b.slug}
                          rising={(growth ?? 0) >= 0}
                        />
                      </div>
                      <div className="hidden items-center lg:ml-24 lg:flex lg:w-[14.5%]">
                        <span className="font-semibold text-[#7c7b85] text-lg leading-none">
                          {growth != null ? `% ${growth}` : "—"}
                        </span>
                      </div>
                      <div className="mt-12 flex flex-col gap-3 lg:hidden">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-sm text-zinc-400 leading-6.5">
                            Ръст
                          </span>
                          <span className="font-semibold text-[#7c7b85] text-lg leading-none">
                            {growth != null ? `% ${growth}` : "—"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
        <Link
          to="/trend-100"
          className="mx-auto mt-20 block w-fit rounded-full border border-emerald-400 px-12 py-5 text-center font-semibold text-emerald-400 leading-none tracking-wide hover:bg-emerald-400 hover:text-white lg:min-w-77 lg:py-6"
        >
          Виж повече
        </Link>
      </section>

      <section className="bg-[#695de9] pt-15 pb-20 lg:py-28">
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

      <section className="relative overflow-hidden bg-white pt-10 lg:pt-33 lg:pb-48">
        <div className="relative flex flex-col lg:container lg:z-10 lg:max-w-6xl lg:flex-row lg:justify-center lg:gap-10">
          <div className="container flex flex-col justify-center text-zinc-500">
            <h2 className="font-semibold text-2xl leading-7 lg:text-3xl lg:leading-9">
              Проверете Trust Score на марката преди покупка
            </h2>
            <div className="mt-7.5 space-y-3 text-lg leading-6.5 lg:mt-6 lg:space-y-2.5 lg:pr-10 lg:text-base lg:leading-6">
              <p>{SITE_NAME} е адресът на потребителското доверие в България.</p>
              <p>
                <strong>Trust Score</strong> прави нивото на доверие на марките
                видимо за вас.
              </p>
              <p>
                Преди да пазарувате, проверете оценката, скоростта на отговор и
                реалните отзиви.
              </p>
              <p>
                <strong>Открийте новия стандарт за сигурни покупки.</strong>
              </p>
            </div>
          </div>
          <HomeMediaBlock
            src="/home/video-cover-trust.jpg"
            alt="Trust Score"
          />
        </div>
        <HomeDecorBlobs />
      </section>
    </div>
  );
}
