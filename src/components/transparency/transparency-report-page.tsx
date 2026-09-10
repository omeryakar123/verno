import { Link } from "@tanstack/react-router";
import {
  CheckCircle2,
  Eye,
  Scale,
  Shield,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import type { RawPlatformStats } from "@/lib/public-stats";
import { SITE_NAME } from "@/lib/seo";

type Props = {
  stats: RawPlatformStats | null;
};

function nf(n?: number): string {
  return typeof n === "number" ? n.toLocaleString("bg-BG") : "—";
}

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-rule">
      <div className="text-xs uppercase tracking-widest text-navy-mid">{label}</div>
      <div className="mt-2 text-3xl font-black tabular-nums text-ink">{value}</div>
      {sub ? <div className="mt-1 text-xs text-navy-mid">{sub}</div> : null}
    </div>
  );
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
  "Писане на жалба (с AI помощ за детайли и документи)",
  "Автоматични проверки за сигурност и съответствие",
  "Публикуване, уведомяване на марката и процес по възражения",
  "Публикуване на verno и проследяване на отговора",
  "Непрекъсната защита и санкции при нарушения",
];

export function TransparencyReportPage({ stats }: Props) {
  const resolutionPct = stats ? Math.round(stats.resolutionRate) : null;

  return (
    <div data-page="transparency" className="bg-white text-[#272635]">
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#272635] text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-[#695de9]/30 via-transparent to-[#3ad08f]/20" aria-hidden />
        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
          <p className="mb-1.5 text-[32px] font-semibold leading-11 lg:text-[68px] lg:leading-tight">Добре дошли</p>
          <h1 className="text-[30px] font-bold leading-8 lg:text-[98px] lg:leading-[1.1]">
            2025 Доклад
            <br />
            за прозрачност
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/75 lg:text-lg">
            Както всяка година, споделяме открито данни за потребителите, марките и процесите на модерация в {SITE_NAME}.
          </p>
        </div>
      </section>

      {/* Intro */}
      <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:py-16">
        <p className="text-lg leading-relaxed text-[#626692]">
          Доверието е в основата на {SITE_NAME}. За да го направим{" "}
          <strong className="text-[#272635]">измеримо, проследимо и отчетимо</strong>, от 2025 г. публикуваме
          ежегоден доклад за прозрачност. Целта ни остава да бъдем символ на доверие между потребители и марки в
          България.
        </p>
        <div className="mt-10 grid gap-8 sm:grid-cols-3">
          <div>
            <h2 className="text-2xl font-semibold leading-8">Мисия</h2>
            <p className="mt-3 text-[15px] leading-relaxed text-[#626692]">
              Свързваме потребители и марки чрез прозрачен процес за решаване на проблеми.
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-semibold leading-8">Подход</h2>
            <p className="mt-3 text-[15px] leading-relaxed text-[#626692]">
              Комбинираме технология, човешка модерация и общностна обратна връзка.
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-semibold leading-8">Какво предлага докладът?</h2>
            <p className="mt-3 text-[15px] leading-relaxed text-[#626692]">
              Реални числа, процеси, принципи на доверие и мерки срещу злоупотреби.
            </p>
          </div>
        </div>
      </section>

      {/* Live stats */}
      <section className="bg-[#f0f3fe] py-12 lg:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-semibold text-[#272635] lg:text-3xl">Платформата в цифри</h2>
            <p className="mt-2 text-[#626692]">Актуални данни от {SITE_NAME}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Регистрирани потребители" value={nf(stats?.totalUsers)} />
            <StatCard label="Регистрирани марки" value={nf(stats?.totalCompanies)} />
            <StatCard label="Общо жалби" value={nf(stats?.totalComplaints)} />
            <StatCard
              label="Решени жалби"
              value={nf(stats?.resolvedComplaints)}
              sub={resolutionPct != null ? `Процент решение ${resolutionPct}%` : undefined}
            />
          </div>
        </div>
      </section>

      {/* Key findings */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="text-center text-[32px] font-medium leading-10 lg:text-[72px] lg:leading-tight">
          Основни изводи
        </h2>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { label: "Годишен брой решения", value: nf(stats?.resolvedComplaints) },
            { label: "Общо жалби", value: nf(stats?.totalComplaints) },
            { label: "Процент решение", value: resolutionPct != null ? `${resolutionPct}%` : "—" },
            { label: "AI предварителен преглед", value: "100%" },
            { label: "Автоматично премахване на фалшиво съдържание", value: "Активно" },
            { label: "Защита с предупреждения", value: "Активна" },
          ].map((item) => (
            <div
              key={item.label}
              className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#695de9]/10 to-[#3ad08f]/10 p-6 ring-1 ring-[#695de9]/20"
            >
              <div className="relative z-1 mb-4.5 text-center text-xl font-medium">{item.label}</div>
              <div className="relative z-1 text-center text-3xl font-black tabular-nums text-[#272635]">{item.value}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Trust + scale */}
      <section className="bg-[#272635] py-16 text-white lg:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <h2 className="text-2xl font-semibold leading-8 lg:text-3xl">Укрепваме доверието с мащаб</h2>
          <p className="mt-4 text-lg font-semibold leading-7 text-[#3ad08f]">
            С нарастване на обема данни намаляват фалшивите публикации, а прозрачността расте.
          </p>
          <p className="mt-6 leading-relaxed text-white/75">
            Използвахме изкуствен интелект не само за автоматизация, а като инструмент за доверие — всяко AI решение
            минава през човешки преглед. За нас доверието се гради с етичен надзор, не само с технология.
          </p>
        </div>
      </section>

      {/* Trust principles */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="mb-8 text-center text-[32px] font-medium leading-10 tracking-wide lg:text-5xl">
          Принципи на доверие
        </h2>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {TRUST_PRINCIPLES.map((p) => (
            <article key={p.title}>
              <h3 className="mb-4 mt-8 text-2xl font-semibold">{p.title}</h3>
              <p className="text-[15px] leading-relaxed text-[#626692]">{p.text}</p>
            </article>
          ))}
        </div>
      </section>

      {/* How we work */}
      <section className="bg-[#f0f3fe] py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="my-4 text-center text-[32px] font-medium leading-10 lg:text-5xl">Как работим?</h2>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {["Безпристрастно", "Открито", "Справедливо", "Прозрачно"].map((tag) => (
              <span
                key={tag}
                className="bg-[#1e1d2e] px-6 py-3 text-lg font-semibold text-[#f9f8f5]"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {[
              { icon: Users, title: "Freemium модел", desc: "Безплатно за потребители и базов достъп за марки." },
              { icon: Shield, title: "Pro корпоративно членство", desc: "Разширени инструменти за управление на жалби и анализ." },
              { icon: Scale, title: "Еднакви правила", desc: "Политиките се прилагат еднакво за всички участници." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-rule">
                <div className="mb-3 grid size-10 place-items-center rounded-xl bg-brand/10 text-brand">
                  <Icon className="size-5" />
                </div>
                <h3 className="font-semibold text-lg">{title}</h3>
                <p className="mt-2 text-sm text-[#626692]">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Complaint journey */}
      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <h2 className="text-center text-2xl font-semibold lg:text-4xl">Пътят на жалбата</h2>
        <ol className="mt-10 space-y-6">
          {JOURNEY_STEPS.map((step, i) => (
            <li key={step} className="flex gap-4">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-brand text-sm font-bold text-white">
                {i + 1}
              </span>
              <p className="pt-2 text-lg font-semibold leading-7 lg:text-2xl">{step}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Moderation */}
      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <div className="rounded-2xl bg-white p-8 ring-1 ring-rule">
          <h2 className="mb-6 text-xl font-bold">Процес на модерация</h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              { i: ShieldCheck, t: "Автоматична предварителна проверка", d: "Откриване на обиди, лични данни и спам" },
              { i: Users, t: "Ръчен преглед", d: "Съмнително съдържание се предава на екипа" },
              { i: CheckCircle2, t: "Решение за публикуване", d: "Чисто съдържание — веднага; останалото — след преглед" },
            ].map((s) => (
              <div key={s.t}>
                <div className="mb-3 grid size-10 place-items-center rounded-xl bg-brand-soft text-brand">
                  <s.i className="size-5" />
                </div>
                <div className="font-semibold text-ink">{s.t}</div>
                <div className="mt-1 text-sm text-navy-mid">{s.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform protection */}
      <section className="bg-[#272635] py-16 text-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="mb-4 text-[32px] font-medium leading-10 lg:text-5xl">Защита на платформата</h2>
          <p className="max-w-3xl text-white/75">
            За да запазим {SITE_NAME} полезен и безопасен, използваме трислойен подход: технология, общност и
            човешки екип.
          </p>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {[
              { icon: Sparkles, title: "Технология", desc: "AI и автоматични филтри за рисково съдържание." },
              { icon: Users, title: "Общност", desc: "Докладване и обратна връзка от потребители и марки." },
              { icon: Eye, title: "Екип", desc: "Модератори и специалисти по съдържание и измами." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-2xl bg-white/5 p-6 ring-1 ring-white/10">
                <Icon className="mb-3 size-8 text-[#3ad08f]" />
                <h3 className="text-xl font-semibold">{title}</h3>
                <p className="mt-2 text-sm text-white/70">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Brand appeals */}
      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <h2 className="text-[32px] font-medium leading-10 lg:text-4xl">Възражения от марки</h2>
        <p className="mt-6 leading-relaxed text-[#626692]">
          Марките могат да оспорят публикация, когато съдържанието е неточно или нарушава политиките. Всяко
          възражение се преглежда от екип; решението се комуникира прозрачно и може да бъде обжалвано.
        </p>
      </section>

      {/* Growth chart */}
      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <div className="rounded-2xl bg-white p-8 ring-1 ring-rule">
          <h2 className="mb-6 flex items-center gap-2 text-xl font-bold">
            <TrendingUp className="size-5 text-brand" /> Годишен растеж
          </h2>
          <div className="grid h-40 grid-cols-5 items-end gap-2">
            {[68, 74, 81, 89, 100].map((h, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-2">
                <div className="text-[11px] font-semibold tabular-nums text-brand">
                  {i === 4 ? "48K+" : `${Math.round((h / 100) * 48)}K`}
                </div>
                <div
                  className="w-full rounded-t-md bg-gradient-to-t from-brand to-[#695de9]"
                  style={{ height: `${h}%` }}
                />
                <div className="text-xs text-navy-mid">{2021 + i}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#695de9] py-12 text-center text-white">
        <p className="text-lg font-medium">Искате повече информация?</p>
        <Link
          to="/iletisim"
          className="mt-4 inline-flex rounded-full bg-white px-8 py-3 text-sm font-semibold text-[#272635] transition hover:bg-white/90"
        >
          Свържете се с нас
        </Link>
      </section>
    </div>
  );
}
