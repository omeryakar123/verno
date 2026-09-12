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
    <div className="min-h-screen bg-paper">
      <section className="relative overflow-hidden border-b border-rule bg-gradient-to-b from-brand-soft/40 to-paper">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-20">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-card text-brand px-3 h-8 text-[12px] font-semibold ring-1 ring-brand/20 mb-5">
              <Sparkles className="size-3.5" /> Корпоративни решения
            </span>
            <h1 className="font-display font-black text-[26px] sm:text-[42px] leading-[1.08] tracking-[-0.02em] text-ink">
              Достигнете до милиони, които вземат решения на{" "}
              <span className="text-brand">{SITE_NAME}</span>
            </h1>
            <p className="mt-4 text-[14px] sm:text-[16px] text-navy leading-relaxed">
              Premium, таргетирани и programmatic модели — покажете марката си в правилния момент
              пред правилната аудитория.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <a
                href={siteContactMailto("Рекламни решения")}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-brand text-brand-foreground px-6 h-11 text-[13px] font-semibold hover:bg-brand-hover transition"
              >
                Свържете се с нас <ArrowRight className="size-4" />
              </a>
              <Link
                to="/register/marka-basvuru"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-card ring-1 ring-rule px-6 h-11 text-[13px] font-semibold hover:bg-surface transition"
              >
                Заявка от марка
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-rule bg-surface">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {metrics.map((m) => {
              const Icon = m.icon;
              return (
                <div key={m.k} className="bg-card rounded-2xl p-4 sm:p-5 ring-1 ring-rule">
                  <span className="inline-grid place-items-center size-9 rounded-xl bg-brand-soft text-brand mb-3">
                    <Icon className="size-4" />
                  </span>
                  <div className="font-display font-black text-[20px] sm:text-[26px] text-ink tabular-nums">{m.v}</div>
                  <div className="text-[11px] sm:text-[12px] text-navy-mid mt-1">{m.k}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 grid md:grid-cols-2 gap-8 items-center">
          <div className="rounded-3xl bg-gradient-to-br from-ink to-brand p-8 sm:p-10 text-paper min-h-[220px] flex flex-col justify-end">
            <ShieldCheck className="size-10 text-brand mb-4" />
            <h2 className="font-display font-bold text-[22px] sm:text-[26px] leading-snug">
              Защо да рекламирате на {SITE_NAME}?
            </h2>
            <p className="mt-3 text-[13px] sm:text-[14px] text-paper/80 leading-relaxed">
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
                <li key={item.t} className="flex gap-4 bg-card rounded-2xl p-4 ring-1 ring-rule">
                  <span className="grid place-items-center size-10 rounded-xl bg-brand-soft text-brand shrink-0">
                    <Icon className="size-5" />
                  </span>
                  <div>
                    <div className="font-semibold text-[14px] text-ink">{item.t}</div>
                    <div className="text-[13px] text-navy-mid mt-0.5">{item.d}</div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <section className="relative overflow-hidden site-cta-shell">
        <div
          className="pointer-events-none absolute -right-24 -top-24 size-80 rounded-full bg-brand/14 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -left-20 bottom-0 size-64 rounded-full bg-primary/14 blur-3xl"
          aria-hidden
        />
        <div className="relative mx-auto max-w-3xl px-4 sm:px-6 py-12 sm:py-16 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand/15 text-brand px-3 h-7 text-[11px] font-bold uppercase tracking-wider ring-1 ring-brand/30 mb-5">
            <ShieldCheck className="size-3.5" />
            {SITE_NAME} Pro
          </span>
          <h2 className="font-display font-bold text-[20px] sm:text-[26px] leading-snug">
            Разширете клиентската си база с {SITE_NAME} Pro
          </h2>
          <p className="mt-3 text-[13px] sm:text-[14px] site-cta-muted max-w-md mx-auto leading-relaxed">
            Присъединете се към марки, които предлагат решения и се възползват от Pro членство.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href={siteContactMailto("Pro членство")}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-brand text-brand-foreground px-6 h-11 text-[13px] font-semibold hover:bg-brand-hover transition shadow-soft"
            >
              Запитване за Pro
            </a>
            <Link
              to="/register/marka-basvuru"
              className="inline-flex items-center justify-center gap-2 rounded-full ring-1 ring-brand/45 px-6 h-11 text-[13px] font-semibold hover:bg-brand/15 transition"
            >
              Заявка от марка
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
