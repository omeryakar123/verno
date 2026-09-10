import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export type TestimonialSlide = {
  quote: string;
  name: string;
  role: string;
  logoSrc?: string;
  logoAlt?: string;
};

type TestimonialCarouselProps = {
  slides: TestimonialSlide[];
};

export function TestimonialCarousel({ slides }: TestimonialCarouselProps) {
  const [index, setIndex] = useState(0);
  const count = slides.length;

  const go = useCallback(
    (delta: number) => {
      setIndex((i) => (i + delta + count) % count);
    },
    [count],
  );

  useEffect(() => {
    if (count <= 1) return;
    const id = window.setInterval(() => go(1), 8000);
    return () => window.clearInterval(id);
  }, [count, go]);

  if (count === 0) return null;

  const slide = slides[index]!;

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Отзиви от корпоративни клиенти"
      className="relative bg-[#3c007f] bg-cover bg-center pt-12.5 text-white xl:py-30"
      style={{
        backgroundImage:
          "var(--corp-slide-mobile, url('https://files.sikayetvar.com/web-files/public/images/corporate-membership/mobile-slide-bg.png'))",
      }}
    >
      <style>{`
        @media (min-width: 1024px) {
          section[aria-label="Отзиви от корпоративни клиенти"] {
            background-image: url('https://files.sikayetvar.com/web-files/public/images/corporate-membership/desktop-slide-bg.png');
          }
        }
      `}</style>

      <div className="mx-auto max-w-[1170px] px-4 lg:px-10">
        <div className="relative min-h-[420px] overflow-hidden lg:min-h-[360px]">
          {slides.map((s, i) => (
            <div
              key={s.name}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} от ${count}`}
              aria-hidden={i !== index}
              className={`transition-opacity duration-500 ${i === index ? "relative opacity-100" : "pointer-events-none absolute inset-0 opacity-0"}`}
            >
              <div className="flex size-full flex-col items-start justify-start lg:flex-row lg:justify-between">
                <div className="order-2 mt-10 mb-16 flex flex-col lg:order-1 lg:my-0 lg:max-w-[60%]">
                  <p className="text-xl font-semibold leading-7 lg:text-[26px] lg:leading-10 xl:text-[34px] xl:leading-11">
                    {s.quote}
                  </p>
                  <div
                    className="mt-[60px] mb-[50px] h-[17px] w-[135px] bg-[linear-gradient(90deg,#e62667_15%,#bd04d8_50%,#3c007f_100%)]"
                    aria-hidden
                  />
                  <h3 className="mt-12.5 mb-2.5 text-[21px] font-medium leading-7">{s.name}</h3>
                  <p className="text-base leading-5 opacity-60">{s.role}</p>
                </div>

                <div className="order-1 flex w-full flex-row items-start justify-between lg:order-2 lg:w-auto lg:flex-col lg:items-end lg:justify-center">
                  <div className="order-2 mb-10 flex w-fit items-center gap-3 lg:order-1 lg:mb-0 lg:w-full lg:justify-end">
                    <button
                      type="button"
                      aria-label="Предишен"
                      disabled={count <= 1}
                      onClick={() => go(-1)}
                      className="inline-flex size-9 shrink-0 items-center justify-center rounded-full border-2 border-white/20 text-sm font-medium text-white shadow-sm transition hover:scale-110 hover:bg-white/10 disabled:pointer-events-none disabled:opacity-50"
                    >
                      <ChevronLeft className="size-5" />
                    </button>
                    <button
                      type="button"
                      aria-label="Следващ"
                      disabled={count <= 1}
                      onClick={() => go(1)}
                      className="inline-flex size-9 shrink-0 items-center justify-center rounded-full border-2 border-white/20 text-sm font-medium text-white shadow-sm transition hover:scale-110 hover:bg-white/10 disabled:pointer-events-none disabled:opacity-50"
                    >
                      <ChevronRight className="size-5" />
                    </button>
                  </div>
                  {s.logoSrc ? (
                    <div className="order-1 flex h-[170px] w-[161px] items-center justify-center rounded-tl-[60px] rounded-br-[60px] bg-white p-5 lg:order-2 lg:h-[220px] lg:w-[200px] xl:h-[327px] xl:w-[286px]">
                      <img src={s.logoSrc} alt={s.logoAlt ?? s.name} className="max-h-[114px] w-auto object-contain" loading="lazy" />
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
