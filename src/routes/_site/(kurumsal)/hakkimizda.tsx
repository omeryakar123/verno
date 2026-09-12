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
      title: `За нас — ${SITE_NAME} | Независима платформа за жалби`,
      description:
        `${SITE_NAME} е независима платформа за решаване на жалби, която свързва потребители и марки. Подайте жалба, получете официален отговор и проследете процеса прозрачно.`,
      path: "/hakkimizda",
    }),
    scripts: [
      breadcrumbLd([
        { name: "Начало", path: "/" },
        { name: "За нас", path: "/hakkimizda" },
      ]),
    ],
  }),
  component: Page,
});

function Page() {
  const s = Route.useLoaderData().stats;
  const nf = (n: number) => n.toLocaleString("bg-BG");
  const stats = [
    { icon: Users, label: "Регистрирани членове", value: s ? nf(s.totalUsers) : "—" },
    { icon: ShieldCheck, label: "Регистрирани марки", value: s ? nf(s.totalCompanies) : "—" },
    { icon: TrendingUp, label: "Решени жалби", value: s ? nf(s.resolvedComplaints) : "—" },
    { icon: Sparkles, label: "Процент решение", value: s ? `%${Math.round(s.resolutionRate)}` : "—" },
  ];

  const steps = [
    {
      icon: PenLine,
      t: "1. Подайте жалба",
      p: "Опишете проблема за минути; добавете документи и снимки или публикувайте анонимно. След модерация жалбата става публична и получава уникален код за проследяване.",
    },
    {
      icon: MessageCircle,
      t: "2. Марката отговаря",
      p: "Съответната марка вижда жалбата и публикува официален отговор на страницата ви. При нужда може да ви пише и на лични съобщения. Целият процес е прозрачен.",
    },
    {
      icon: CheckCircle2,
      t: "3. Потвърдете решението и оценете",
      p: "Ако проблемът е решен, само ВИЕ маркирате жалбата като решена; оценявате марката и по желание оставяте благодарност. Оценката ви директно влияе на рейтинга на марката.",
    },
  ];

  const values = [
    {
      icon: Scale,
      t: "Независимост",
      p: "Не заемаме страната на никоя марка. Класирането се базира на реални резултати при решаване, не на плащания. Никоя марка не може да плати за премахване на жалби или промяна на оценката си.",
    },
    {
      icon: Eye,
      t: "Прозрачност",
      p: "Оценките на марките, процентът на решение и времето за отговор се изчисляват от реални данни. Редовно публикуваме процесите си в Доклада за прозрачност.",
    },
    {
      icon: HeartHandshake,
      t: "Решение на първо място",
      p: "Целта ни не е да събираме жалби, а да сближим потребители и марки и да приключим проблемите. Успехът измерваме с решени жалби, не с публикувани.",
    },
  ];

  const forConsumers = [
    {
      icon: Megaphone,
      t: "Нека гласът ви се чуе",
      p: "Жалбата ви не изчезва — тя стига директно до марката и остава публична.",
    },
    {
      icon: Search,
      t: "Проучете преди покупка",
      p: "Преди да купите, вижте реални клиентски опити, процент на решение и скорост на отговор.",
    },
    {
      icon: UserX,
      t: "Останете анонимни",
      p: "Можете да подадете анонимно — името ви е скрито от марката и другите потребители.",
    },
    {
      icon: Star,
      t: "Оценете опита си",
      p: "Оценете процеса на решение по 5-звездна скала и помогнете на други потребители.",
    },
  ];

  const forBrands = [
    {
      icon: BadgeCheck,
      t: "Верифициран профил",
      p: "Верифицирайте марката си, отговаряйте официално и изградете доверие със значка за потвърждение.",
    },
    {
      icon: MessageCircle,
      t: "Управление от един панел",
      p: "Вижте всички жалби, отговаряйте и пишете на клиенти от едно табло.",
    },
    {
      icon: BarChart3,
      t: "Статистика в реално време",
      p: "Следете процента на решение, скоростта на отговор и удовлетвореността на клиентите на живо.",
    },
    {
      icon: TrendingUp,
      t: "Изградете репутация",
      p: "Всяка решена жалба подобрява оценката ви; историите за успех се показват на страницата на марката.",
    },
  ];

  const trust = [
    {
      icon: ShieldAlert,
      t: "Предварителна модерация",
      p: "Всяка жалба минава автоматични проверки преди публикуване; злоупотреби, спам и лични данни се блокират; съмнително съдържание отива при човешки модератори.",
    },
    {
      icon: Lock,
      t: "Сигурност на данните",
      p: "Данните се предават по криптирани връзки; достъпът до документи е с права. Чувствителните доказателства са видими само за упълномощени страни.",
    },
    {
      icon: Gavel,
      t: "Справедлив процес на обжалване",
      p: "Всеки, който смята, че съдържанието е незаконно, може да го докладва; екипът ни по модерация преглежда и решава всеки случай.",
    },
  ];

  return (
    <div>
      <div className="relative h-64 bg-gradient-to-br from-dark via-navy to-brand/40 grid place-items-center">
        <div className="text-center px-6">
          <p className="text-white/60 text-xs uppercase tracking-widest mb-2">{SITE_NAME}.</p>
          <h1 className="text-white text-3xl sm:text-5xl font-display font-black">
            Независимата българска
            <br />
            платформа за клиентски опит
          </h1>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-16 space-y-6 text-navy leading-relaxed">
        <p className="text-lg text-center">
          Работим за България, в която потребителите се чуват, марките предлагат решения и всеки може
          да взема решения за покупка на базата на реален опит.
        </p>
        <p>
          {SITE_NAME} е независима платформа, която свързва клиенти и марки. Вярваме, че всеки проблем
          има адресат: жалбите тук не изчезват — стигат до марката; всеки отговор и решение се записват
          публично. Това помага на потребителите и позволява на милиони посетители да видят реалната
          работа на марките преди покупка.
        </p>
        <ul className="space-y-2 pl-6 list-disc">
          <li>
            <b className="text-ink">Потребителите</b> се чуват от марките и проследяват процеса стъпка по стъпка.
          </li>
          <li>
            <b className="text-ink">Марките</b> превръщат жалбите в удовлетворение и укрепват лоялността.
          </li>
          <li>
            <b className="text-ink">Посетителите</b> проверяват процента на решение и реални отзиви преди покупка.
          </li>
        </ul>
      </div>

      <div className="bg-surface border-y border-rule">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 py-16 space-y-6 text-navy leading-relaxed">
          <h2 className="text-center font-display font-bold text-[24px] text-ink">Защо съществуваме</h2>
          <p>
            Всички сме били там: изгубена пратка, възстановяване, което не идва, кол център, до който не
            може да се стигне… Потребителите често са нечутата страна. От страна на марката екипите често
            научават последни и нямат правилния канал, дори когато искат да помогнат.
          </p>
          <p>
            {SITE_NAME} е създаден, за да премахне тази пропаст. Когато публикувате жалба тук, се случват
            две неща: проблемът става <b className="text-ink">публичен запис</b> и стига{" "}
            <b className="text-ink">директно до марката</b>. Прозрачността насърчава решението;
            записаният процес насочва други потребители. Всяка решена жалба е и облекчение за потребителя,
            и реален успех за марката.
          </p>
          <p>
            Виждаме жалбата не като конфликт, а като <b className="text-ink">възможност</b>. Добре
            обработената жалба може да превърне загубен клиент в лоялен защитник. Всяка функция на
            платформата — оценки, процес на решение, панел на марката, модерация — е проектирана за
            тази трансформация.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16">
        <h2 className="text-center font-display font-bold text-[24px] text-ink mb-10">Как работи</h2>
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

      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-card rounded-3xl ring-1 ring-rule p-8">
            <div className="inline-flex items-center gap-2 text-[12px] font-bold uppercase tracking-wider text-brand mb-4">
              <Users className="size-4" /> За потребители
            </div>
            <h3 className="font-display font-bold text-[20px] text-ink mb-6">
              Не сте сами — платформата е зад вас.
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
            <div className="inline-flex items-center gap-2 text-[12px] font-bold uppercase tracking-wider text-primary mb-4">
              <Building2 className="size-4" /> За марки
            </div>
            <h3 className="font-display font-bold text-[20px] text-ink mb-6">
              Превърнете жалбите в най-силния си инструмент за привличане на клиенти.
            </h3>
            <div className="space-y-5">
              {forBrands.map((f) => (
                <div key={f.t} className="flex gap-3">
                  <div className="size-9 rounded-lg bg-primary/10 text-primary grid place-items-center shrink-0">
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

      <div className="bg-surface border-y border-rule">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16">
          <h2 className="text-center font-display font-bold text-[24px] text-ink mb-3">
            Доверието не се оставя на случайност
          </h2>
          <p className="text-center text-[14px] text-navy-mid mb-10 max-w-2xl mx-auto">
            Всяко съдържание и всяка оценка минават през процеси по правила. Отговорни сме да
            гарантираме, че публикуваните жалби отразяват реален опит и страните са представени
            справедливо.
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
            За подробности вижте{" "}
            <Link to="/seffaflik-raporu" className="text-brand hover:underline">
              Доклада за прозрачност
            </Link>
            {", а за правила — "}
            <Link to="/kullanim-kosullari" className="text-brand hover:underline">
              Условията за ползване
            </Link>
            .
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16">
        <h2 className="text-center font-display font-bold text-[24px] text-ink mb-10">Нашите ценности</h2>
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

      <div className="bg-ink text-paper dark:bg-surface dark:text-ink py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center">
          <div className="mx-auto size-14 rounded-full bg-brand grid place-items-center mb-6">
            <ShieldCheck className="size-7 text-white" />
          </div>
          <p className="text-lg">
            95% от хората четат клиентски опити в {SITE_NAME} преди покупка
          </p>
          <div className="text-brand text-5xl font-black mt-4">%95</div>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              to="/sikayet-yaz"
              className="inline-flex items-center gap-2 rounded-full bg-brand text-brand-foreground px-6 h-11 text-[13px] font-semibold hover:brightness-110 transition"
            >
              <PenLine className="size-4" /> Подай жалба
            </Link>
            <Link
              to="/markalar"
              className="inline-flex items-center gap-2 rounded-full ring-1 ring-paper/30 dark:ring-rule px-6 h-11 text-[13px] font-semibold hover:bg-paper/10 dark:hover:bg-surface transition"
            >
              <Search className="size-4" /> Разгледай марки
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
