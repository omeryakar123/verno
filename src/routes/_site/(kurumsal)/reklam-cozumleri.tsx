import { createFileRoute, Link } from "@tanstack/react-router";
import { seoHead, SITE_NAME } from "@/lib/seo";
import { siteContactMailto } from "@/lib/contact";
import { ArrowRight, Target, Sparkles, BarChart3, Users, Globe, ShieldCheck, MessageCircle } from "lucide-react";

export const Route = createFileRoute("/_site/(kurumsal)/reklam-cozumleri")({
  head: () => ({
    ...seoHead({
      title: `Рекламни решения — ${SITE_NAME}`,
      description:
        `Достигнете до потребители, които активно вземат решения за покупка на ${SITE_NAME}. Premium, таргетирани и programmatic модели.`,
      path: "/reklam-cozumleri",
    }),
  }),
  component: AdsPage,
});

function AdsPage() {
  const metrics = [
    { v: "120M+", k: "Рекламен инвентар", icon: BarChart3 },
    { v: "%88", k: "Органичен трафик", icon: Globe },
    { v: "14M+", k: "Регистрирани членове", icon: Users },
    { v: "21M+", k: "Месечни посещения", icon: Sparkles },
  ];

  return (
    <div className="listing-page">
      <section className="relative overflow-hidden bg-white">
        <div className="pointer-events-none absolute -top-24 right-0 size-80 rounded-full bg-[#695de9]/12" aria-hidden />
        <div className="pointer-events-none absolute -bottom-16 left-8 size-48 rounded-full bg-[#3ad08f]/18" aria-hidden />
        <div className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:py-20">
          <div className="max-w-2xl">
            <span className="mb-5 inline-flex h-8 items-center gap-2 rounded-full bg-[#695de9]/10 px-3 text-[12px] font-semibold text-[#695de9]">
              <Sparkles className="size-3.5" /> Корпоративни решения
            </span>
            <h1 className="font-display text-3xl font-black leading-tight tracking-[-0.02em] text-ink sm:text-5xl">
              Достигнете до хора, които вземат решения на{" "}
              <span className="text-[#695de9]">{SITE_NAME}</span>
            </h1>
            <p className="mt-4 text-[16px] leading-relaxed text-navy-mid">
              Premium и таргетирани формати — покажете марката си в момента, в който потребителят сравнява преди покупка.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <a
                href={siteContactMailto("Рекламни решения")}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#3ad08f] px-6 text-[14px] font-semibold text-white shadow-[0_10px_24px_rgb(58_208_143/0.32)] hover:bg-[#42e29d]"
              >
                Свържете се с нас <ArrowRight className="size-4" />
              </a>
              <Link
                to="/register/marka-basvuru"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white px-6 text-[14px] font-semibold text-ink shadow-[0_8px_24px_rgb(16_20_31/0.08)]"
              >
                Заявка от марка
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {metrics.map((m) => {
              const Icon = m.icon;
              return (
                <div key={m.k} className="rounded-3xl bg-white p-5 shadow-[0_12px_32px_rgb(16_20_31/0.07)]">
                  <span className="mb-3 inline-grid size-10 place-items-center rounded-2xl bg-[#3ad08f]/12 text-[#1f9d6a]">
                    <Icon className="size-4" />
                  </span>
                  <div className="font-display text-[22px] font-black tabular-nums text-ink sm:text-[26px]">{m.v}</div>
                  <div className="mt-1 text-[12px] text-navy-mid">{m.k}</div>
                </div>
              );
            })}
          </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-6 pb-16 sm:px-6">
        <div className="grid items-center gap-8 md:grid-cols-2">
          <div className="flex min-h-[220px] flex-col justify-end rounded-3xl bg-[#272635] p-8 text-white sm:p-10">
            <ShieldCheck className="mb-4 size-10 text-[#3ad08f]" />
            <h2 className="font-display text-[22px] font-bold leading-snug sm:text-[26px]">
              Защо да рекламирате на {SITE_NAME}?
            </h2>
            <p className="mt-3 text-[14px] leading-relaxed text-white/75">
              Потребителите проучват опита с марките преди покупка. Правилната видимост изгражда доверие и конверсии.
            </p>
          </div>
          <ul className="space-y-4">
            {[
              { icon: MessageCircle, t: "Аудитория с намерение", d: "Активни потребители близо до решение за покупка." },
              { icon: Target, t: "Видимост на профила", d: "Появявайте се директно на страницата на компанията." },
              { icon: ShieldCheck, t: "Управление на репутацията", d: "Обработвайте жалби и благодарности с фокус върху решението." },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.t} className="flex gap-4 rounded-2xl bg-white p-4 shadow-[0_10px_28px_rgb(16_20_31/0.06)]">
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#695de9]/10 text-[#695de9]">
                    <Icon className="size-5" />
                  </span>
                  <div>
                    <div className="text-[14px] font-semibold text-ink">{item.t}</div>
                    <div className="mt-0.5 text-[13px] text-navy-mid">{item.d}</div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#695de9] text-white">
        <div
          className="pointer-events-none absolute -right-24 -top-24 size-80 rounded-full bg-brand/14 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -left-20 bottom-0 size-64 rounded-full bg-primary/14 blur-3xl"
          aria-hidden
        />
        <div className="relative mx-auto max-w-3xl px-4 py-14 text-center sm:px-6 sm:py-16">
          <span className="mb-5 inline-flex h-7 items-center gap-1.5 rounded-full bg-white/12 px-3 text-[11px] font-bold uppercase tracking-wider text-white">
            <ShieldCheck className="size-3.5" />
            {SITE_NAME} Pro
          </span>
          <h2 className="font-display text-[22px] font-bold leading-snug sm:text-[28px]">
            Разширете клиентската си база с {SITE_NAME} Pro
          </h2>
          <p className="mx-auto mt-3 max-w-md text-[14px] leading-relaxed text-white/75">
            Присъединете се към марки, които предлагат решения и се възползват от Pro членство.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <a
              href={siteContactMailto("Pro членство")}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white px-6 text-[14px] font-semibold text-ink"
            >
              Запитване за Pro
            </a>
            <Link
              to="/register/marka-basvuru"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/30 px-6 text-[14px] font-semibold text-white hover:bg-white/10"
            >
              Заявка от марка
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
