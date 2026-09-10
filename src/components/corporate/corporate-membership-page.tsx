import { Link } from "@tanstack/react-router";
import type { Company } from "@/lib/mock-data";
import { SITE_NAME } from "@/lib/seo";
import { siteContactMailto } from "@/lib/contact";
import { CorporateContactCta } from "@/components/corporate/contact-cta";
import { TestimonialCarousel, type TestimonialSlide } from "@/components/corporate/testimonial-carousel";
import { brandCoverUrl } from "@/lib/brand-cover";

const CORP_IMG = "https://files.sikayetvar.com/web-files/public/images/corporate-membership";

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
    const k = Math.round(n / 1000);
    return `${k.toLocaleString("bg-BG")} хил.`;
  }
  return n.toLocaleString("bg-BG");
}

const FEATURE_ROWS = [
  {
    title: "Личен консултант за вашата марка",
    description:
      "С Pro членство получавате специален консултант. На всяка стъпка от управлението на жалбите можете да разчитате на експертна подкрепа.",
    image: `${CORP_IMG}/solution-cosultant.png`,
    height: 552,
    imageSide: "left" as const,
  },
  {
    title: "Директна връзка с клиентите",
    description:
      "verno поисква съгласие от потребителите, преди да сподели контакт с марката. Така можете да се свържете директно и да решите проблема по-бързо.",
    image: `${CORP_IMG}/row-customer-directly-contact.png`,
    height: 650,
    imageSide: "right" as const,
  },
  {
    title: "Управлявайте рекламните си зони",
    description:
      "Достигнете до аудитория, която взима решения за покупка на verno. Управлявайте рекламните блокове на страницата си и представяйте продукти и кампании ефективно.",
    image: `${CORP_IMG}/advertising-space.svg`,
    height: 810,
    imageSide: "left" as const,
  },
  {
    title: "Представете марката си на посетителите",
    description:
      "Добавете контакти и линк към сайта си на фирмената страница. Клиентите ви намират по-лесно, а посетителите отиват директно към вашия сайт.",
    image: `${CORP_IMG}/row-search-result.svg`,
    height: 650,
    imageSide: "right" as const,
  },
  {
    title: "5-звездна марка — водете промяната",
    description:
      "След като отговорите на жалба, можете да напомните на клиента за оценка. Така повишавате рейтинга си и изпреварвате конкуренцията.",
    image: `${CORP_IMG}/row-online-contact.png`,
    height: 552,
    imageSide: "left" as const,
  },
];

const TESTIMONIALS: TestimonialSlide[] = [
  {
    quote:
      "verno е мост между нас и клиентите. Помага ни да поддържаме висока удовлетвореност и да покажем на потенциални клиенти как управляваме опита им.",
    name: "Иван Петров",
    role: "Директор маркетинг",
  },
  {
    quote:
      "Благодарение на платформата виждаме къде клиентите имат проблем и подобряваме услугата в реално време, без да компрометираме качеството.",
    name: "Мария Георгиева",
    role: "Мениджър клиентски отношения",
  },
  {
    quote:
      "Решените жалби и благодарностите изграждат доверие у настоящи и бъдещи клиенти в момента на покупка.",
    name: "Димитър Стоянов",
    role: "Експерт клиентски опит",
  },
  {
    quote:
      "Отговаряме бързо на запитвания и подобряваме вътрешните процеси — така даваме най-доброто обслужване.",
    name: "Елена Димитрова",
    role: "Специалист клиентски отношения",
  },
  {
    quote:
      "verno ни помага системно да управляваме обратната връзка и да се развиваме в конкурентна среда, ориентирана към клиента.",
    name: "Николай Иванов",
    role: "Ръководител клиентски център",
  },
];

export function CorporateMembershipPage({ stats, proBrands }: CorporateMembershipPageProps) {
  const companies = stats?.totalCompanies ?? 12_000;
  const members = stats?.totalUsers ?? 14_000_000;
  const visitors = 16_000_000;
  const pageViews = 70_000_000;

  const metrics = [
    { value: formatStat(companies), label: "Регистрирани марки" },
    { value: formatStat(members), label: "Индивидуални членове" },
    { value: formatStat(visitors), label: "Посетители за 30 дни" },
    { value: formatStat(pageViews), label: "Месечни показвания" },
  ];

  return (
    <div data-page="corporate" className="bg-white text-[#272635]">
      {/* Hero */}
      <div className="relative flex min-h-[320px] flex-col lg:mx-auto lg:max-w-[1170px] lg:min-h-[420px] lg:flex-row-reverse">
        <div className="w-full overflow-hidden rounded-br-[110px] rounded-bl-[110px] bg-[#695de9] max-[414px]:rounded-br-[110px] max-[414px]:rounded-bl-[110px] min-[415px]:rounded-bl-[180px] lg:absolute lg:top-0 lg:right-0 lg:w-2/5 lg:rounded-bl-[180px] lg:rounded-br-none lg:pt-12">
          <div className="flex w-[217px] items-center justify-start rounded-tr-[110px] rounded-bl-[110px] bg-[#3ad08f] max-[414px]:w-[217px] min-[415px]:w-[350px] min-[415px]:rounded-tr-[180px] min-[415px]:rounded-bl-[180px] lg:w-full lg:justify-start lg:rounded-tl-[180px] lg:rounded-tr-none">
            <img
              alt=""
              width={369}
              height={369}
              decoding="async"
              className="h-[217px] w-full rounded-full bg-[#54e1a4] object-contain pt-4 max-[414px]:h-[217px] min-[415px]:h-[350px] lg:h-[369px] lg:w-[369px]"
              src={`${CORP_IMG}/corporate-entry.png`}
            />
          </div>
        </div>

        <div className="mx-auto w-full max-w-[1170px] px-4 py-12.5 sm:px-6 lg:pr-[40%] lg:pt-[calc(12%-96px)] lg:pb-12.5 xl:pt-15">
          <div className="mt-4.5 mb-9 text-[28px] leading-9 text-[#272635] xl:text-[37px]">
            <h1 className="mb-5 inline font-semibold lg:block lg:leading-9">
              Превърнете жалбите в удовлетворение,
            </h1>{" "}
            изградете лоялност <br /> и спечелете нови клиенти
          </div>
          <p className="mb-8 text-xl font-medium leading-6 text-[#7c7b85]">
            Открийте предимствата на <span className="font-semibold text-[#272635]">Pro членството</span> в {SITE_NAME}.
          </p>
          <CorporateContactCta variant="phone" />
        </div>
      </div>

      {/* Metrics */}
      <section className="py-17.5 lg:py-25">
        <div className="mx-auto max-w-[1170px] px-4 sm:px-6">
          <div className="grid grid-cols-1 gap-16 sm:grid-cols-2 lg:grid-cols-4 lg:gap-12">
            {metrics.map((m) => (
              <div key={m.label} className="flex h-40 flex-col items-center justify-center leading-none">
                <div className="mb-auto size-12 text-[#695de9]" aria-hidden>
                  <svg viewBox="0 0 48 46" fill="none" className="size-full">
                    <path
                      fill="currentColor"
                      d="M46.9 30.5a4.2 4.2 0 0 0-5.4-3l-10.3 3.3q-.5-.5-1.2-.7l-7.8-3.2a11 11 0 0 0-6.9-.4l-5.4 1.4V27q0-1.2-1.3-1.3H1.3q-1.2.1-1.3 1.3v16q.1 1.3 1.3 1.4h7.3q1.2-.1 1.3-1.3v-1l16.5 2.9a9 9 0 0 0 7-1.6L45.3 35c1.4-1 2-2.8 1.6-4.5M7.2 42H2.7V28.5h4.5z"
                    />
                  </svg>
                </div>
                <div className="flex flex-col">
                  <strong className="mb-3 text-center text-[30px] font-bold lg:text-[40px] xl:text-[46px]">{m.value}</strong>
                  <span className="text-center text-[19px] font-medium tracking-[0.5px] text-[#85878e] lg:text-[22px]">
                    {m.label}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Verno Plus intro */}
      <section className="bg-[#695de9] py-15 text-white lg:py-22.5">
        <div className="mx-auto flex max-w-[1170px] flex-col items-center justify-center px-4 sm:px-6 lg:flex-row">
          <div className="mb-12.5 text-[28px] leading-11 lg:mb-0 lg:w-2/5 lg:text-[36px] lg:leading-12">
            Какво ви очаква в платформата за управление на жалби{" "}
            <strong className="text-white">{SITE_NAME} Plus</strong>?
          </div>
          <div className="relative lg:w-3/5">
            <img
              alt=""
              loading="lazy"
              width={1000}
              height={1000}
              className="w-full rounded-xl"
              src={`${CORP_IMG}/sv-plus-video-bg.png`}
            />
            <button
              type="button"
              className="absolute top-1/2 left-1/2 flex size-15 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#3ad08f] transition-transform hover:scale-110 lg:size-20"
              aria-label="Пусни видео"
            >
              <svg viewBox="0 0 376 512" className="size-6 text-white lg:size-7.5" aria-hidden>
                <path
                  fill="currentColor"
                  d="m92.9 23.6.8.6 244.5 177.7c7.1 5.1 13.7 9.9 18.7 14.3 5.3 4.7 11.5 11 15 20.4a55 55 0 0 1 0 38.8 52 52 0 0 1-15 20.4c-5 4.4-11.6 9.2-18.7 14.3L93 488.4c-8.7 6.3-16.5 12-23 15.9a46 46 0 0 1-26.3 7.6c-13.5-.8-26-8.1-34.2-20-6.4-9.1-8-19.8-8.7-28S0 445.6 0 434.2V77.8C0 66.4 0 56.2.7 48c.7-8.2 2.3-18.9 8.7-28A45 45 0 0 1 43.6 0a46 46 0 0 1 26.2 7.6c6.6 4 14.4 9.6 23 15.9"
                />
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* Feature rows */}
      <div className="relative my-25 flex flex-col items-center justify-center">
        {FEATURE_ROWS.map((row, i) => (
          <div
            key={row.title}
            className={`relative flex h-auto w-full flex-col items-center lg:mx-auto lg:mt-30 lg:max-w-[1170px] lg:flex-row lg:items-start lg:justify-end ${i % 2 === 1 ? "lg:flex-row-reverse" : ""}`}
            style={{ minHeight: row.height }}
          >
            <div
              className={`flex w-full lg:absolute lg:w-1/2 ${row.imageSide === "left" ? "lg:left-0 lg:justify-start" : "lg:right-0 lg:justify-end"}`}
            >
              <img
                alt=""
                loading="lazy"
                width={676}
                height={row.height}
                className="h-full max-w-full object-contain"
                src={row.image}
              />
            </div>
            <div
              className={`w-full px-7.5 py-12.5 lg:max-w-[38%] lg:py-12.5 ${row.imageSide === "left" ? "lg:ml-auto" : "lg:mr-auto"} ${row.height >= 810 ? "my-auto" : ""}`}
            >
              <h2 className="mb-7 text-[32px] leading-10 text-[#3a384a] lg:mb-10 lg:text-[42px] lg:leading-14">{row.title}</h2>
              <p className="text-lg leading-6.5 text-[#7c7b85]">{row.description}</p>
            </div>
          </div>
        ))}
      </div>

      <TestimonialCarousel slides={TESTIMONIALS} />

      {/* Competitor analysis */}
      <div className="relative mt-12.5 mb-22.5">
        <div className="relative flex flex-col items-center justify-center lg:mx-auto lg:mt-30 lg:max-w-[1170px] lg:flex-row lg:items-start lg:min-h-[552px]">
          <div className="w-full lg:absolute lg:right-0 lg:w-1/2">
            <img
              alt=""
              loading="lazy"
              className="block w-full lg:hidden"
              src={`${CORP_IMG}/row-opponent-analysis.png`}
            />
            <img
              alt=""
              loading="lazy"
              className="right-0 hidden h-[552px] w-full object-contain lg:block"
              src={`${CORP_IMG}/desktop-row-opponent-analysis.png`}
            />
          </div>
          <div className="mx-auto w-full max-w-[1170px] px-4 py-12.5 sm:px-6 lg:mx-0 lg:mr-auto lg:max-w-[44%] lg:py-12.5">
            <span className="block pb-7.5 text-2xl font-medium leading-8 text-[#afb0b6]">За професионалисти</span>
            <h2 className="mb-7 text-[32px] leading-10 text-[#3a384a]">Анализ на конкуренцията</h2>
            <p className="mb-7 text-lg leading-9 text-[#7c7b85]">
              Сравнете успеха си в управлението на жалби с конкурентите и други марки в сектора. Вижте позицията си с
              числа, анализирайте данни и изградете стратегии за нови клиенти.
            </p>
            <CorporateContactCta variant="phone" />
          </div>
        </div>
      </div>

      {/* Pro brands */}
      <section className="bg-[#272635] py-13 lg:py-27.5">
        <div className="mx-auto flex max-w-[1170px] flex-col items-center justify-center px-4 sm:px-6 lg:items-start">
          <div className="flex flex-col lg:flex-col-reverse">
            <h3 className="mb-6 border-b border-[#b2c1f6] text-[35px] font-medium leading-9 text-[#b2c1f6] lg:mb-20">
              {proBrands.length > 0 ? `${proBrands.length}+ Pro марки` : "Pro марки"}
            </h3>
            <h4 className="mb-11 text-[35px] leading-10 text-white">Марки с Pro членство</h4>
          </div>
          <div className="grid w-full grid-cols-3 lg:grid-cols-5">
            {proBrands.length > 0 ? (
              proBrands.map((brand) => (
                <div key={brand.slug} className="my-6 flex items-center justify-center lg:justify-start">
                  <Link to="/firma/$slug" params={{ slug: brand.slug }} title={brand.name} className="block px-2">
                    <img
                      alt={brand.name}
                      loading="lazy"
                      width={115}
                      height={115}
                      className="h-full max-h-[48px] w-[75px] object-contain py-1 lg:max-h-[64px] lg:w-[115px]"
                      src={brand.logoUrl?.trim() || brandCoverUrl(brand.coverUrl)}
                    />
                  </Link>
                </div>
              ))
            ) : (
              Array.from({ length: 15 }).map((_, i) => (
                <div key={i} className="my-6 flex items-center justify-center lg:justify-start">
                  <div className="flex h-12 w-[75px] items-center justify-center rounded-lg bg-white/10 text-xs font-semibold text-white/50 lg:w-[115px]">
                    {SITE_NAME}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-[#695de9] py-15 lg:py-30">
        <div className="mx-auto flex max-w-[65%] flex-col items-center justify-center px-4 text-center text-white sm:max-w-2xl lg:max-w-3xl">
          <h3 className="mb-15 text-[26px] font-semibold leading-8 lg:text-[38px] lg:leading-15">
            С Pro членство увеличете удовлетвореността и клиентската база
          </h3>
          <p className="mb-12.5 text-base font-medium leading-5 lg:text-xl">
            Присъединете се към марките, които решават проблеми и се възползват от Pro функциите.
          </p>
          <a
            href={siteContactMailto("Pro корпоративно членство")}
            className="rounded-[50px] border border-[#3ad08f] bg-[#3ad08f] px-5 py-3.5 text-base font-semibold leading-4 text-white transition hover:brightness-105 lg:h-15 lg:px-8 lg:text-[19px]"
          >
            Свържете се за Pro членство
          </a>
        </div>
      </section>
    </div>
  );
}
