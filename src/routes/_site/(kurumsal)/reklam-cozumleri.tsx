import { createFileRoute, Link } from "@tanstack/react-router";
import { seoHead, SITE_NAME } from "@/lib/seo";
import { siteContactMailto } from "@/lib/contact";
import { ArrowRight, Target, Sparkles, BarChart3, Users, Globe, ShieldCheck, MessageCircle } from "lucide-react";

export const Route = createFileRoute("/_site/(kurumsal)/reklam-cozumleri")({
  head: () => ({
    ...seoHead({
      title: `Advertising Solutions — ${SITE_NAME}`,
      description:
        `Reach shoppers who are actively making purchase decisions on ${SITE_NAME}. Premium, targeted, and programmatic advertising models.`,
      path: "/reklam-cozumleri",
    }),
  }),
  component: AdsPage,
});

function AdsPage() {
  const metrics = [
    { v: "120M+", k: "Ad inventory", icon: BarChart3 },
    { v: "%88", k: "Organic traffic", icon: Globe },
    { v: "14M+", k: "Registered members", icon: Users },
    { v: "21M+", k: "Monthly visits", icon: Sparkles },
  ];

  return (
    <div className="min-h-screen bg-paper">
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-rule bg-gradient-to-b from-brand-soft/40 to-paper">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-20">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-card text-brand px-3 h-8 text-[12px] font-semibold ring-1 ring-brand/20 mb-5">
              <Sparkles className="size-3.5" /> Enterprise solutions
            </span>
            <h1 className="font-display font-black text-[26px] sm:text-[42px] leading-[1.08] tracking-[-0.02em] text-ink">
              Reach millions making purchase decisions on{" "}
              <span className="text-brand">{SITE_NAME}</span>
            </h1>
            <p className="mt-4 text-[14px] sm:text-[16px] text-navy leading-relaxed">
              Premium, targeted, and programmatic models — show your brand at the right moment
              to the right audience.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <a
                href={siteContactMailto("Advertising solutions")}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-brand text-brand-foreground px-6 h-11 text-[13px] font-semibold hover:bg-brand-hover transition"
              >
                Contact sales <ArrowRight className="size-4" />
              </a>
              <Link
                to="/register/marka-basvuru"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-card ring-1 ring-rule px-6 h-11 text-[13px] font-semibold hover:bg-surface transition"
              >
                Brand application
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* METRICS */}
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

      {/* WHY */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 grid md:grid-cols-2 gap-8 items-center">
          <div className="rounded-3xl bg-gradient-to-br from-ink to-brand p-8 sm:p-10 text-paper min-h-[220px] flex flex-col justify-end">
            <ShieldCheck className="size-10 text-brand mb-4" />
            <h2 className="font-display font-bold text-[22px] sm:text-[26px] leading-snug">
              Why advertise on {SITE_NAME}?
            </h2>
            <p className="mt-3 text-[13px] sm:text-[14px] text-paper/80 leading-relaxed">
              Users research brand experiences before buying. The right visibility builds trust and conversions.
            </p>
          </div>
          <ul className="space-y-4">
            {[
              { icon: MessageCircle, t: "High-intent audience", d: "Active users close to a purchase decision." },
              { icon: Target, t: "Brand page visibility", d: "Appear directly on your company profile." },
              { icon: ShieldCheck, t: "Reputation management", d: "Handle complaints and thank-yous with a resolution-first approach." },
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

      {/* CTA — site-cta-shell: tema bağımsız koyu gradyan */}
      <section className="relative overflow-hidden site-cta-shell">
        <div
          className="pointer-events-none absolute -right-24 -top-24 size-80 rounded-full bg-brand/14 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -left-20 bottom-0 size-64 rounded-full bg-accent-purple/14 blur-3xl"
          aria-hidden
        />
        <div className="relative mx-auto max-w-3xl px-4 sm:px-6 py-12 sm:py-16 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand/15 text-brand px-3 h-7 text-[11px] font-bold uppercase tracking-wider ring-1 ring-brand/30 mb-5">
            <ShieldCheck className="size-3.5" />
            {SITE_NAME} Pro
          </span>
          <h2 className="font-display font-bold text-[20px] sm:text-[26px] leading-snug">
            Grow your customer base with {SITE_NAME} Pro
          </h2>
          <p className="mt-3 text-[13px] sm:text-[14px] site-cta-muted max-w-md mx-auto leading-relaxed">
            Join brands that deliver solutions and benefit from Pro membership.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href={siteContactMailto("Pro membership")}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-brand text-brand-foreground px-6 h-11 text-[13px] font-semibold hover:bg-brand-hover transition shadow-soft"
            >
              Contact for Pro membership
            </a>
            <Link
              to="/register/marka-basvuru"
              className="inline-flex items-center justify-center gap-2 rounded-full ring-1 ring-brand/45 px-6 h-11 text-[13px] font-semibold hover:bg-brand/15 transition"
            >
              Brand application
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
