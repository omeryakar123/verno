import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ShieldCheck,
  Users,
  Sparkles,
  TrendingUp,
  PenLine,
  MessageCircle,
  CheckCircle2,
  Scale,
  Eye,
  HeartHandshake,
  Megaphone,
  BadgeCheck,
  Star,
  Search,
  Building2,
  BarChart3,
  ShieldAlert,
  Lock,
  UserX,
  Gavel,
} from "lucide-react";
import { fetchPlatformStats } from "@/lib/data";
import { seoHead, breadcrumbLd, SITE_NAME } from "@/lib/seo";

export const Route = createFileRoute("/_site/(kurumsal)/hakkimizda")({
  loader: async () => ({ stats: await fetchPlatformStats().catch(() => null) }),
  head: () => ({
    ...seoHead({
      title: `About Us — ${SITE_NAME} | Independent Complaint Platform`,
      description:
        `${SITE_NAME} is an independent complaint resolution platform connecting consumers and brands. Submit a complaint, get an official response, and track the process transparently.`,
      path: "/hakkimizda",
    }),
    scripts: [
      breadcrumbLd([
        { name: "Home", path: "/" },
        { name: "About Us", path: "/hakkimizda" },
      ]),
    ],
  }),
  component: Page,
});

function Page() {
  // Gerçek platform verisi; uydurma sayı kullanılmıyor.
  const s = Route.useLoaderData().stats;
  const nf = (n: number) => n.toLocaleString("en-GB");
  const stats = [
    { icon: Users, label: "Registered members", value: s ? nf(s.totalUsers) : "—" },
    { icon: ShieldCheck, label: "Registered brands", value: s ? nf(s.totalCompanies) : "—" },
    { icon: TrendingUp, label: "Resolved complaints", value: s ? nf(s.resolvedComplaints) : "—" },
    { icon: Sparkles, label: "Resolution rate", value: s ? `%${Math.round(s.resolutionRate)}` : "—" },
  ];

  const steps = [
    {
      icon: PenLine,
      t: "1. Submit your complaint",
      p: "Describe your issue in minutes; add documents and photos, or post anonymously if you prefer. After moderation, your complaint goes public and receives a unique tracking code.",
    },
    {
      icon: MessageCircle,
      t: "2. The brand responds",
      p: "The relevant brand sees your complaint and posts an official reply on your page. They can also reach you via private messages when needed. The entire process is transparent.",
    },
    {
      icon: CheckCircle2,
      t: "3. Confirm resolution and rate",
      p: "If your issue is resolved, only YOU can mark the complaint as resolved; rate the brand and optionally leave a thank-you note. Your rating directly affects the brand score.",
    },
  ];

  const values = [
    {
      icon: Scale,
      t: "Independence",
      p: "We do not take any brand's side. Rankings are driven by real resolution performance, not payments. No brand can pay to remove complaints or change their score.",
    },
    {
      icon: Eye,
      t: "Transparency",
      p: "Brand scores, resolution rates, and response times are calculated from real data. We publish our processes regularly in the Transparency Report.",
    },
    {
      icon: HeartHandshake,
      t: "Resolution-first",
      p: "Our goal is not to collect complaints but to bring consumers and brands together and close issues. We measure success by resolved complaints, not published ones.",
    },
  ];

  const forConsumers = [
    { icon: Megaphone, t: "Make your voice heard", p: "Your complaint does not disappear — it lands directly in front of the brand and stays public." },
    { icon: Search, t: "Research before you buy", p: "Before purchasing, see real customer experiences, resolution rates, and response speed." },
    { icon: UserX, t: "Stay anonymous", p: "You can submit anonymously — your name is hidden from the brand and other users." },
    { icon: Star, t: "Rate your experience", p: "Rate the resolution process on a 5-star scale and help other consumers decide." },
  ];

  const forBrands = [
    { icon: BadgeCheck, t: "Verified profile", p: "Verify your brand, reply officially, and build trust with a verified badge." },
    { icon: MessageCircle, t: "Single-panel management", p: "View all complaints, respond, and message customers from one dashboard." },
    { icon: BarChart3, t: "Real-time statistics", p: "Track resolution rate, response speed, and customer satisfaction live." },
    { icon: TrendingUp, t: "Grow your reputation", p: "Every resolved complaint improves your score; success stories appear on your brand page." },
  ];

  const trust = [
    {
      icon: ShieldAlert,
      t: "Pre-moderation",
      p: "Every complaint passes automated checks before publication; abuse, spam, and personal data are blocked; suspicious content goes to human moderators.",
    },
    {
      icon: Lock,
      t: "Data security",
      p: "Data is transmitted over encrypted connections; document access is permission-controlled. Sensitive evidence is visible only to authorized parties.",
    },
    {
      icon: Gavel,
      t: "Fair appeal process",
      p: "Anyone who believes content is unlawful can report it; our moderation team reviews and resolves each case.",
    },
  ];

  return (
    <div>
      {/* HERO */}
      <div className="relative h-64 bg-gradient-to-br from-dark via-navy to-brand/40 grid place-items-center">
        <div className="text-center px-6">
          <p className="text-white/60 text-xs uppercase tracking-widest mb-2">{SITE_NAME}.</p>
          <h1 className="text-white text-3xl sm:text-5xl font-display font-black">
            Bulgaria&apos;s independent
            <br />
            customer experience platform
          </h1>
        </div>
      </div>

      {/* MİSYON */}
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-16 space-y-6 text-navy leading-relaxed">
        <p className="text-lg text-center">
          We work for a Bulgaria where consumers are heard, brands deliver solutions,
          and everyone can make purchase decisions based on real experiences.
        </p>
        <p>
          {SITE_NAME} is an independent platform connecting customers and brands. We believe every
          problem has an addressee: complaints here do not vanish — they reach the brand; every
          reply and resolution is recorded publicly. This helps consumers and lets millions of
          visitors see brands&apos; real performance before they buy.
        </p>
        <ul className="space-y-2 pl-6 list-disc">
          <li><b className="text-ink">Consumers</b> are heard by brands and track the process step by step.</li>
          <li><b className="text-ink">Brands</b> turn complaints into satisfaction and strengthen loyalty.</li>
          <li><b className="text-ink">Visitors</b> check resolution rates and real reviews before purchasing.</li>
        </ul>
      </div>

      {/* NEDEN VARIZ */}
      <div className="bg-surface border-y border-rule">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 py-16 space-y-6 text-navy leading-relaxed">
          <h2 className="text-center font-display font-bold text-[24px] text-ink">
            Why we exist
          </h2>
          <p>
            We have all been there: a lost parcel, a refund that never arrives, a call center
            you cannot reach… Consumers are often the unheard party. On the brand side, teams
            often learn last and lack the right channel even when they want to help.
          </p>
          <p>
            {SITE_NAME} was built to remove that gap. When you post a complaint here, two things
            happen: the issue becomes a <b className="text-ink">public record</b> and lands{" "}
            <b className="text-ink">directly in front of the brand</b>. Transparency encourages
            resolution; the recorded process guides other consumers. Every resolved complaint is
            both relief for the consumer and a real success for the brand.
          </p>
          <p>
            We see a complaint not as a fight but as an <b className="text-ink">opportunity</b>.
            A well-handled complaint can turn a lost customer into a loyal advocate. Every tool on
            the platform — ratings, resolution flow, brand panel, moderation — is designed for
            that transformation.
          </p>
        </div>
      </div>

      {/* NASIL ÇALIŞIR */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16">
        <h2 className="text-center font-display font-bold text-[24px] text-ink mb-10">
          How it works
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {steps.map((st) => (
            <div key={st.t} className="bg-card rounded-2xl p-6 ring-1 ring-rule">
              <div className="size-11 rounded-xl bg-brand-soft text-brand grid place-items-center mb-4">
                <st.icon className="size-5" />
              </div>
              <h3 className="font-display font-bold text-[16px] text-ink">{st.t}</h3>
              <p className="mt-2 text-[13.5px] text-navy leading-relaxed">{st.p}</p>
            </div>
          ))}
        </div>
      </div>

      {/* GERÇEK SAYILAR */}
      <div className="bg-card border-y border-rule">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((st) => (
            <div key={st.label} className="text-center">
              <div className="mx-auto size-12 rounded-2xl bg-brand-soft grid place-items-center mb-3">
                <st.icon className="size-6 text-brand" />
              </div>
              <div className="text-2xl font-black text-ink tabular-nums">{st.value}</div>
              <div className="text-xs text-navy-mid mt-1">{st.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* TÜKETİCİLER + MARKALAR İÇİN */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-card rounded-3xl ring-1 ring-rule p-8">
            <div className="inline-flex items-center gap-2 text-[12px] font-bold uppercase tracking-wider text-brand mb-4">
              <Users className="size-4" /> For consumers
            </div>
            <h3 className="font-display font-bold text-[20px] text-ink mb-6">
              You are not alone — a platform stands behind you.
            </h3>
            <div className="space-y-5">
              {forConsumers.map((f) => (
                <div key={f.t} className="flex gap-3">
                  <div className="size-9 rounded-lg bg-brand-soft text-brand grid place-items-center shrink-0">
                    <f.icon className="size-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-[14px] text-ink">{f.t}</div>
                    <p className="text-[13px] text-navy leading-relaxed mt-0.5">{f.p}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card rounded-3xl ring-1 ring-rule p-8">
            <div className="inline-flex items-center gap-2 text-[12px] font-bold uppercase tracking-wider text-accent-purple mb-4">
              <Building2 className="size-4" /> For brands
            </div>
            <h3 className="font-display font-bold text-[20px] text-ink mb-6">
              Turn complaints into your strongest customer acquisition tool.
            </h3>
            <div className="space-y-5">
              {forBrands.map((f) => (
                <div key={f.t} className="flex gap-3">
                  <div className="size-9 rounded-lg bg-accent-purple/10 text-accent-purple grid place-items-center shrink-0">
                    <f.icon className="size-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-[14px] text-ink">{f.t}</div>
                    <p className="text-[13px] text-navy leading-relaxed mt-0.5">{f.p}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* GÜVEN VE MODERASYON */}
      <div className="bg-surface border-y border-rule">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16">
          <h2 className="text-center font-display font-bold text-[24px] text-ink mb-3">
            Trust is not left to chance
          </h2>
          <p className="text-center text-[14px] text-navy-mid mb-10 max-w-2xl mx-auto">
            Every piece of content and every rating goes through rule-based processes. We are
            responsible for ensuring published complaints reflect real experiences and parties
            are represented fairly.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {trust.map((t) => (
              <div key={t.t} className="bg-card rounded-2xl p-6 ring-1 ring-rule">
                <div className="size-11 rounded-xl bg-brand-soft text-brand grid place-items-center mb-4">
                  <t.icon className="size-5" />
                </div>
                <h3 className="font-display font-bold text-[16px] text-ink">{t.t}</h3>
                <p className="mt-2 text-[13.5px] text-navy leading-relaxed">{t.p}</p>
              </div>
            ))}
          </div>
          <p className="text-center mt-8 text-[13px] text-navy-mid">
            For details see our{" "}
            <Link to="/seffaflik-raporu" className="text-brand hover:underline">Transparency Report</Link>
            {", and for rules see "}
            <Link to="/kullanim-kosullari" className="text-brand hover:underline">Terms of Use</Link>
            {"."}
          </p>
        </div>
      </div>

      {/* DEĞERLER */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16">
        <h2 className="text-center font-display font-bold text-[24px] text-ink mb-10">
          Our values
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {values.map((v) => (
            <div key={v.t} className="text-center px-4">
              <div className="mx-auto size-12 rounded-full bg-brand-soft text-brand grid place-items-center mb-4">
                <v.icon className="size-6" />
              </div>
              <h3 className="font-display font-bold text-[16px] text-ink">{v.t}</h3>
              <p className="mt-2 text-[13.5px] text-navy leading-relaxed">{v.p}</p>
            </div>
          ))}
        </div>
      </div>

      {/* KAPANIŞ CTA */}
      <div className="bg-ink text-paper dark:bg-surface dark:text-ink py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center">
          <div className="mx-auto size-14 rounded-full bg-brand grid place-items-center mb-6">
            <ShieldCheck className="size-7 text-white" />
          </div>
          <p className="text-lg">
            95% of people read customer experiences on {SITE_NAME} before buying
          </p>
          <div className="text-brand text-5xl font-black mt-4">%95</div>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              to="/sikayet-yaz"
              className="inline-flex items-center gap-2 rounded-full bg-brand text-brand-foreground px-6 h-11 text-[13px] font-semibold hover:brightness-110 transition"
            >
              <PenLine className="size-4" /> Submit a complaint
            </Link>
            <Link
              to="/markalar"
              className="inline-flex items-center gap-2 rounded-full ring-1 ring-paper/30 dark:ring-rule px-6 h-11 text-[13px] font-semibold hover:bg-paper/10 dark:hover:bg-surface transition"
            >
              <Search className="size-4" /> Explore brands
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
