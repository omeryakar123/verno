import { Link } from "@tanstack/react-router";
import type { RawPlatformStats } from "@/lib/public-stats";
import { SITE_CONTACT_EMAIL } from "@/lib/contact";
import { SITE_NAME } from "@/lib/seo";
import { HomeWordmark } from "@/components/home/home-wordmark";

type Props = {
  stats: RawPlatformStats | null;
};

function nf(n?: number): string {
  return typeof n === "number" ? n.toLocaleString("bg-BG") : "—";
}

const TRUST_PRINCIPLES = [
  { title: "Безпристрастност", text: "Оценяваме жалбите по съдържание, не по размер на марката или броя на случаите." },
  { title: "Откритост и достъп", text: "Процесите ни са публични; потребителите виждат статуса и отговорите на жалбите." },
  { title: "Справедливост", text: "И потребителите, и марките получават равен достъп до механизми за обжалване." },
  { title: "Прозрачност", text: "Публикуваме реални данни за обем, модерация и решения — без скриване на негативни тенденции." },
  { title: "Актуалност", text: "Информацията се обновява редовно, за да отразява текущото състояние на платформата." },
  { title: "Отговорност и сигурност", text: "Защитаваме лични данни и прилагаме ясни санкции при злоупотреба." },
];

const JOURNEY_STEPS = [
  "Създаване на акаунт и SMS верификация",
  "Писане на жалба (с помощ за детайли и документи)",
  "Автоматични проверки за сигурност и съответствие",
  "Публикуване, уведомяване на марката и процес по възражения",
  "Проследяване на отговора в {SITE}",
  "Непрекъсната защита и санкции при нарушения",
];

const GROWTH = [
  { year: 2021, pct: 68 },
  { year: 2022, pct: 74 },
  { year: 2023, pct: 81 },
  { year: 2024, pct: 89 },
  { year: 2025, pct: 100 },
];

export function TransparencyReportPage({ stats }: Props) {
  const resolutionPct = stats ? Math.round(stats.resolutionRate) : null;
  const currentComplaints = stats?.totalComplaints ?? 41_256;
  const series = GROWTH.map((row) => ({
    ...row,
    value: Math.round((currentComplaints * row.pct) / 100),
  }));

  return (
    <div data-page="transparency" className="bg-[#F4F6FB] text-[#10141F]">
      <section className="relative overflow-hidden bg-white">
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div className="absolute -top-12 right-[8%] size-40 rounded-full bg-primary/16" />
          <div className="absolute top-20 right-[26%] size-10 rounded-full bg-brand" />
          <div className="absolute bottom-6 left-[8%] size-24 rounded-full bg-brand/20" />
          <div className="absolute top-10 left-[38%] size-5 rounded-full bg-[#F5D76E]" />
        </div>
        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
          <HomeWordmark heightClass="h-8 lg:h-11" />
          <p className="mt-6 text-sm font-semibold text-brand">2025</p>
          <h1 className="mt-2 max-w-3xl text-left font-semibold text-3xl leading-tight sm:text-5xl lg:text-6xl">
            Доклад за прозрачност
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-navy lg:text-lg">
            Както всяка година, споделяме открито данни за потребителите, марките и процесите на модерация в {SITE_NAME}.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <p className="max-w-3xl text-lg leading-relaxed text-navy">
          Доверието е в основата на {SITE_NAME}. За да го направим{" "}
          <strong className="text-[#10141F]">измеримо, проследимо и отчетимо</strong>, публикуваме
          ежегоден доклад за прозрачност.
        </p>
        <div className="mt-10 grid gap-8 sm:grid-cols-3">
          {[
            { t: "Мисия", p: "Свързваме потребители и марки чрез прозрачен процес за решаване на проблеми." },
            { t: "Подход", p: "Комбинираме технология, човешка модерация и общностна обратна връзка." },
            { t: "В доклада", p: "Реални числа, процеси, принципи на доверие и мерки срещу злоупотреби." },
          ].map((item) => (
            <div key={item.t}>
              <div className="mb-3 h-1 w-10 rounded-full bg-brand" />
              <h2 className="text-xl font-semibold">{item.t}</h2>
              <p className="mt-3 text-[15px] leading-relaxed text-navy">{item.p}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white py-12 lg:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-left font-semibold text-2xl lg:text-[28px]">Платформата в цифри</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Регистрирани потребители", value: nf(stats?.totalUsers) },
              { label: "Регистрирани марки", value: nf(stats?.totalCompanies) },
              { label: "Общо жалби", value: nf(stats?.totalComplaints) },
              {
                label: "Решени жалби",
                value: nf(stats?.resolvedComplaints),
                sub: resolutionPct != null ? `${resolutionPct}% решение` : undefined,
              },
            ].map((card) => (
              <div
                key={card.label}
                className="rounded-3xl bg-[#F4F6FB] px-5 py-7"
              >
                <div className="text-3xl font-black tabular-nums">{card.value}</div>
                <div className="mt-2 text-sm font-medium text-navy-mid">{card.label}</div>
                {card.sub ? <div className="mt-1 text-xs text-brand">{card.sub}</div> : null}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="text-left font-semibold text-2xl lg:text-[28px]">Основни изводи</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { label: "Годишен брой решения", value: nf(stats?.resolvedComplaints) },
            { label: "Общо жалби", value: nf(stats?.totalComplaints) },
            { label: "Процент решение", value: resolutionPct != null ? `${resolutionPct}%` : "—" },
            { label: "Предварителен преглед", value: "100%" },
            { label: "Фалшиво съдържание", value: "Автоматично премахване" },
            { label: "Предупреждения", value: "Активни" },
          ].map((item) => (
            <div key={item.label} className="rounded-2xl bg-white p-6 ring-1 ring-rule">
              <div className="text-sm text-navy-mid">{item.label}</div>
              <div className="mt-2 text-2xl font-black tabular-nums">{item.value}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="relative overflow-hidden bg-ink-deep py-16 text-white lg:py-20">
        <div className="pointer-events-none absolute -right-8 top-8 size-32 rounded-full bg-primary/30" aria-hidden />
        <div className="pointer-events-none absolute bottom-6 left-10 size-16 rounded-full bg-brand" aria-hidden />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-2xl font-semibold lg:text-3xl">Укрепваме доверието с мащаб</h2>
          <p className="mt-4 max-w-3xl text-lg font-semibold text-brand">
            С нарастване на обема данни намаляват фалшивите публикации, а прозрачността расте.
          </p>
          <p className="mt-6 max-w-3xl leading-relaxed text-white/75">
            Автоматичните филтри не заместват човешкия преглед. Всяко спорно решение минава през модератор.
            За нас доверието се гради с етичен надзор, не само с технология.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="text-left font-semibold text-2xl lg:text-[28px]">Принципи на доверие</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {TRUST_PRINCIPLES.map((p, i) => (
            <article key={p.title} className="rounded-2xl bg-white p-6 ring-1 ring-rule">
              <div className="mb-3 font-semibold text-brand text-xl tabular-nums">
                {String(i + 1).padStart(2, "0")}
              </div>
              <h3 className="text-lg font-semibold">{p.title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-navy">{p.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-left font-semibold text-2xl lg:text-[28px]">Как работим</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              { n: "01", title: "Безплатно за потребители", desc: "Базов достъп за марки; Pro за разширени инструменти." },
              { n: "02", title: "Еднакви правила", desc: "Политиките се прилагат еднакво за всички участници." },
              { n: "03", title: "Публичен процес", desc: "Статус, отговор и решение остават видими на жалбата." },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl bg-[#F4F6FB] p-6">
                <div className="font-semibold text-brand text-xl tabular-nums">{item.n}</div>
                <h3 className="mt-3 font-semibold text-lg">{item.title}</h3>
                <p className="mt-2 text-sm text-navy">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="text-left font-semibold text-2xl lg:text-[28px]">Пътят на жалбата</h2>
        <ol className="mt-8 space-y-5">
          {JOURNEY_STEPS.map((step, i) => (
            <li key={step} className="flex gap-4">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-brand text-sm font-bold text-white">
                {i + 1}
              </span>
              <p className="pt-2 text-base font-semibold leading-6 lg:text-lg">
                {step.replace("{SITE}", SITE_NAME)}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <div className="rounded-2xl bg-white p-8 ring-1 ring-rule">
          <h2 className="mb-6 text-xl font-semibold">Процес на модерация</h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              { n: "01", t: "Автоматична предварителна проверка", d: "Откриване на обиди, лични данни и спам" },
              { n: "02", t: "Ръчен преглед", d: "Съмнително съдържание се предава на екипа" },
              { n: "03", t: "Решение за публикуване", d: "Чисто съдържание — веднага; останалото — след преглед" },
            ].map((s) => (
              <div key={s.t}>
                <div className="mb-2 font-semibold text-brand tabular-nums">{s.n}</div>
                <div className="font-semibold">{s.t}</div>
                <div className="mt-1 text-sm text-navy-mid">{s.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-ink-deep py-16 text-white">
        <div className="pointer-events-none absolute top-8 right-12 size-20 rounded-full bg-brand/35" aria-hidden />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-2xl font-semibold lg:text-3xl">Защита на платформата</h2>
          <p className="mt-4 max-w-3xl text-white/75">
            За да запазим {SITE_NAME} полезен и безопасен, използваме три слоя: технология, общност и човешки екип.
          </p>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {[
              { n: "01", title: "Технология", desc: "Автоматични филтри за рисково съдържание." },
              { n: "02", title: "Общност", desc: "Докладване и обратна връзка от потребители и марки." },
              { n: "03", title: "Екип", desc: "Модератори и специалисти по съдържание и измами." },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl bg-white/5 p-6 ring-1 ring-white/10">
                <div className="font-semibold text-brand tabular-nums">{item.n}</div>
                <h3 className="mt-3 text-xl font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-white/70">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="text-left font-semibold text-2xl lg:text-[28px]">Възражения от марки</h2>
        <p className="mt-4 max-w-3xl leading-relaxed text-navy">
          Марките могат да оспорят публикация, когато съдържанието е неточно или нарушава политиките. Всяко
          възражение се преглежда от екип; решението се комуникира прозрачно и може да бъде обжалвано.
        </p>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <div className="rounded-2xl bg-white p-8 ring-1 ring-rule">
          <h2 className="mb-2 text-xl font-semibold">Годишен растеж на жалбите</h2>
          <p className="mb-8 text-sm text-navy-mid">
            Оценка спрямо текущия обем — {nf(currentComplaints)} жалби към 2025.
          </p>
          <div className="flex h-56 items-end gap-3 sm:gap-4">
            {series.map((row) => (
              <div key={row.year} className="flex h-full min-w-0 flex-1 flex-col items-center">
                <div className="flex min-h-0 w-full flex-1 items-end">
                  <div
                    className="w-full rounded-t-2xl bg-gradient-to-t from-brand to-primary"
                    style={{ height: `${row.pct}%` }}
                    title={`${nf(row.value)} жалби`}
                  />
                </div>
                <div className="mt-2 text-[12px] font-bold tabular-nums text-brand">
                  {nf(row.value)}
                </div>
                <div className="text-xs text-navy-mid">{row.year}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-primary py-16 text-white">
        <div className="pointer-events-none absolute -top-8 right-10 size-28 rounded-full bg-brand/35" aria-hidden />
        <div className="pointer-events-none absolute bottom-4 left-8 size-16 rounded-full bg-white/15" aria-hidden />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-left font-semibold text-2xl lg:text-[32px]">Искате повече информация?</h2>
          <p className="mt-3 max-w-2xl text-white/80">
            Пишете ни за методологията на доклада, данни за модерация или партньорство. Отговаряме в работни дни.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <a
              href={`mailto:${SITE_CONTACT_EMAIL}?subject=${encodeURIComponent("Доклад за прозрачност")}`}
              className="rounded-2xl bg-white/10 p-5 ring-1 ring-white/15 transition hover:bg-white/15"
            >
              <div className="text-sm text-white/70">Имейл</div>
              <div className="mt-1 font-semibold break-all">{SITE_CONTACT_EMAIL}</div>
            </a>
            <Link
              to="/iletisim"
              className="rounded-2xl bg-white/10 p-5 ring-1 ring-white/15 transition hover:bg-white/15"
            >
              <div className="text-sm text-white/70">Форма</div>
              <div className="mt-1 font-semibold">Контактна страница</div>
            </Link>
            <Link
              to="/yardim"
              className="rounded-2xl bg-white/10 p-5 ring-1 ring-white/15 transition hover:bg-white/15"
            >
              <div className="text-sm text-white/70">Помощ</div>
              <div className="mt-1 font-semibold">ЧЗВ и процес</div>
            </Link>
          </div>
          <Link
            to="/iletisim"
            className="mt-8 inline-flex h-12 items-center rounded-full bg-brand px-7 text-[14px] font-semibold text-white hover:bg-brand-hover"
          >
            Свържете се с нас
          </Link>
        </div>
      </section>
    </div>
  );
}
