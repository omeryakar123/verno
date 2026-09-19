import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import type { Company } from "@/lib/mock-data";
import { SITE_NAME } from "@/lib/seo";
import { siteContactMailto } from "@/lib/contact";
import { BrandListLogo } from "@/components/cards";
import { HomeWordmark } from "@/components/home/home-wordmark";

type PlatformStats = {
  totalUsers: number;
  totalCompanies: number;
  resolvedComplaints: number;
  resolutionRate: number;
};

type CorporateMembershipPageProps = {
  stats: PlatformStats | null;
  proBrands: Company[];
};

function formatStat(n: number): string {
  if (n >= 1_000_000) {
    const m = n / 1_000_000;
    return Number.isInteger(m) ? `${m} млн.` : `${m.toFixed(1).replace(".", ",")} млн.`;
  }
  if (n >= 1000) {
    return `${Math.round(n / 1000).toLocaleString("bg-BG")} хил.`;
  }
  return n.toLocaleString("bg-BG");
}

const FEATURES = [
  {
    n: "01",
    title: "Личен консултант за марката",
    body: "Специалист от екипа ви помага на всяка стъпка — от първия отговор до затваряне на случая.",
  },
  {
    n: "02",
    title: "Директна връзка с клиентите",
    body: "Със съгласие на потребителя можете да се свържете директно и да решите проблема по-бързо.",
  },
  {
    n: "03",
    title: "Рекламни зони на профила",
    body: "Показвайте оферти пред хора, които вече сравняват марки преди покупка.",
  },
  {
    n: "04",
    title: "Видимост и доверие",
    body: "Контакти, сайт и оценка на фирмената страница — клиентите ви намират по-лесно.",
  },
  {
    n: "05",
    title: "Оценки след решение",
    body: "Напомняйте за оценка след отговор и покажете как подобрявате клиентския опит.",
  },
  {
    n: "06",
    title: "Анализ на конкуренцията",
    body: "Сравнете процент решени, време за отговор и активност с марки в същия сектор.",
  },
];

export function CorporateMembershipPage({ stats, proBrands }: CorporateMembershipPageProps) {
  const companies = stats?.totalCompanies ?? 0;
  const members = stats?.totalUsers ?? 0;
  const resolved = stats?.resolvedComplaints ?? 0;
  const rate = stats ? Math.round(stats.resolutionRate) : 0;

  const metrics = [
    { value: formatStat(companies || 1200), label: "Регистрирани марки" },
    { value: formatStat(members || 48000), label: "Потребители" },
    { value: formatStat(resolved || 9200), label: "Решени жалби" },
    { value: `${rate || 84}%`, label: "Процент решение" },
  ];

  return (
    <div data-page="corporate" className="listing-page">
      <section className="relative overflow-hidden bg-white">
        <div className="pointer-events-none absolute -top-24 right-0 size-80 rounded-full bg-[#695de9]/14" aria-hidden />
        <div className="pointer-events-none absolute -bottom-16 left-10 size-48 rounded-full bg-[#3ad08f]/20" aria-hidden />
        <div className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:py-20">
          <span className="inline-flex h-8 items-center rounded-full bg-[#695de9]/10 px-3 text-[12px] font-semibold text-[#695de9]">
            {SITE_NAME} Pro
          </span>
          <h1 className="mt-5 max-w-3xl font-display text-3xl font-black leading-tight text-ink sm:text-5xl">
            Превърнете жалбите в удовлетворение и нови клиенти
          </h1>
          <p className="mt-4 max-w-2xl text-[16px] leading-relaxed text-navy-mid">
            С Pro членство управлявате жалби на едно място, отговаряте по-бързо и показвате как марката ви решава проблеми публично.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href={siteContactMailto("Pro корпоративно членство")}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#3ad08f] px-6 text-[14px] font-semibold text-white shadow-[0_10px_24px_rgb(58_208_143/0.32)] hover:bg-[#42e29d]"
            >
              Запитване за Pro <ArrowRight className="size-4" />
            </a>
            <Link
              to="/register/marka-basvuru"
              className="inline-flex h-12 items-center justify-center rounded-full bg-white px-6 text-[14px] font-semibold text-ink shadow-[0_8px_24px_rgb(16_20_31/0.08)]"
            >
              Заявка от марка
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {metrics.map((m) => (
            <div key={m.label} className="rounded-3xl bg-white px-5 py-7 text-center shadow-[0_12px_32px_rgb(16_20_31/0.07)]">
              <div className="text-3xl font-black tabular-nums text-ink lg:text-4xl">{m.value}</div>
              <div className="mt-2 text-sm font-medium text-navy-mid">{m.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-[#272635] py-14 text-white lg:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="max-w-2xl text-2xl font-semibold leading-snug lg:text-4xl">
            Какво получавате в платформата за управление на жалби{" "}
            <span className="text-[#3ad08f]">{SITE_NAME} Plus</span>
          </h2>
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <article key={f.title} className="rounded-3xl bg-white/6 p-6 ring-1 ring-white/10">
                <span className="text-2xl font-semibold tabular-nums text-brand">{f.n}</span>
                <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/70">{f.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#afb0b6]">За професионалисти</p>
            <h2 className="mt-3 text-3xl font-semibold text-ink lg:text-4xl">Анализ на конкуренцията</h2>
            <p className="mt-4 text-[16px] leading-relaxed text-navy-mid">
              Сравнете успеха си в управлението на жалби с конкурентите. Вижте позицията си с числа и изградете стратегия за нови клиенти.
            </p>
            <a
              href={siteContactMailto("Анализ на конкуренцията")}
              className="mt-6 inline-flex h-12 items-center rounded-full bg-[#695de9] px-6 text-[14px] font-semibold text-white hover:bg-[#5a4fd9]"
            >
              Поискайте демо
            </a>
          </div>
          <div className="rounded-3xl bg-white p-8 shadow-[0_18px_40px_rgb(16_20_31/0.1)]">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-[#10141F]">Секторно сравнение</span>
            </div>
            <ul className="mt-6 space-y-4">
              {[
                { n: "Решени жалби", v: "91%" },
                { n: "Средно време за отговор", v: "18 ч." },
                { n: "Trust Score", v: "86" },
              ].map((row) => (
                <li key={row.n} className="flex items-center justify-between rounded-2xl bg-[#f4f6fb] px-4 py-3">
                  <span className="text-sm text-navy-mid">{row.n}</span>
                  <span className="text-lg font-bold tabular-nums text-ink">{row.v}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-3xl font-semibold text-ink">Марки с Pro членство</h2>
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {(proBrands.length > 0 ? proBrands.slice(0, 10) : []).map((brand) => (
              <Link
                key={brand.slug}
                to="/firma/$slug"
                params={{ slug: brand.slug }}
                className="flex h-28 items-center justify-center rounded-2xl bg-white px-5 ring-1 ring-black/5"
              >
                <BrandListLogo
                  name={brand.name}
                  slug={brand.slug}
                  logoUrl={brand.logoUrl}
                  website={brand.website}
                  size={80}
                  className="bg-transparent"
                />
              </Link>
            ))}
            {proBrands.length === 0
              ? Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex h-24 items-center justify-center rounded-2xl bg-[#f4f6fb] text-sm font-semibold text-navy-mid"
                  >
                    {SITE_NAME}
                  </div>
                ))
              : null}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-primary py-16 text-center text-white">
        <div className="pointer-events-none absolute -top-10 right-8 size-32 rounded-full bg-brand/40" aria-hidden />
        <div className="pointer-events-none absolute -bottom-12 left-10 size-24 rounded-full bg-white/10" aria-hidden />
        <div className="relative mx-auto max-w-3xl px-4">
          <HomeWordmark heightClass="mx-auto h-8 brightness-0 invert" />
          <h2 className="mt-6 text-3xl font-semibold leading-snug">
            Увеличете удовлетвореността и клиентската база
          </h2>
          <p className="mt-4 text-white/80">
            Присъединете се към марките, които решават проблеми публично и използват Pro функциите на {SITE_NAME}.
          </p>
          <a
            href={siteContactMailto("Pro корпоративно членство")}
            className="mt-8 inline-flex h-12 items-center rounded-full bg-brand px-7 text-[14px] font-semibold text-white hover:bg-brand-hover"
          >
            Свържете се за Pro членство
          </a>
        </div>
      </section>
    </div>
  );
}
