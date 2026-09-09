import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Complaint } from "@/lib/mock-data";
import { complaintLinkId } from "@/lib/complaint-link";

type Props = {
  items: Complaint[];
  updatedAt?: Date;
};

export function TalkedCarousel({ items, updatedAt }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const list = items.slice(0, 8);

  useEffect(() => {
    if (list.length <= 1) return;
    const timer = window.setInterval(() => {
      setIndex((i) => (i + 1) % list.length);
    }, 4000);
    return () => window.clearInterval(timer);
  }, [list.length]);

  useEffect(() => {
    const el = trackRef.current;
    if (!el || list.length === 0) return;
    const child = el.children[index] as HTMLElement | undefined;
    child?.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
  }, [index, list.length]);

  const scrollBy = (dir: -1 | 1) => {
    setIndex((i) => {
      const next = i + dir;
      if (next < 0) return list.length - 1;
      if (next >= list.length) return 0;
      return next;
    });
  };

  return (
    <div className="home-talked-shell">
      <section aria-roledescription="carousel">
        <div className="home-container relative z-10 mb-12 flex max-w-6xl items-center justify-between px-4 lg:mb-24 lg:justify-start">
          <h2 className="font-semibold text-xl text-[#85878e] lg:font-medium lg:text-3xl">
            Най-обсъждани
          </h2>
          <div className="flex items-center gap-3 text-white lg:ml-[15%]">
            <button
              type="button"
              aria-label="Предишна"
              onClick={() => scrollBy(-1)}
              className="inline-flex size-9 shrink-0 items-center justify-center rounded-full border-2 border-current/20 text-sm font-medium shadow-sm transition-all hover:scale-110 hover:bg-current/10 lg:size-[3.25rem]"
            >
              <ChevronLeft className="size-5" aria-hidden />
            </button>
            <button
              type="button"
              aria-label="Следваща"
              onClick={() => scrollBy(1)}
              className="inline-flex size-9 shrink-0 items-center justify-center rounded-full border-2 border-current/20 text-sm font-medium shadow-sm transition-all hover:scale-110 hover:bg-current/10 lg:size-[3.25rem]"
            >
              <ChevronRight className="size-5" aria-hidden />
            </button>
          </div>
          {updatedAt && (
            <span className="absolute right-4 top-full mt-2 text-[10px] text-white/60 tabular-nums lg:static lg:ml-auto lg:mt-0 lg:text-xs">
              {updatedAt.toLocaleTimeString("bg-BG", { hour: "2-digit", minute: "2-digit" })} · 30 мин
            </span>
          )}
        </div>

        <div
          ref={trackRef}
          role="region"
          aria-live="off"
          className="relative z-10 flex snap-x snap-mandatory flex-nowrap gap-x-20 overflow-x-auto scroll-smooth [scrollbar-width:none] md:after:block md:after:w-1/4 md:after:shrink-0 [&::-webkit-scrollbar]:hidden"
          style={{ marginInlineStart: "max(1rem, calc((100vw - 72rem) / 2 + 1rem))", paddingInlineEnd: "max(1rem, calc((100vw - 72rem) / 2 + 1rem))" }}
        >
          {list.map((c, i) => (
            <div
              key={c.id}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} от ${list.length}`}
              className={`group relative flex w-full max-w-3xl shrink-0 snap-start flex-col justify-between gap-5 rounded-3xl border-2 border-white px-5 pt-7 pb-9 transition-all duration-300 md:w-[75vw] lg:w-[65vw] lg:px-12 lg:py-8 ${i === index ? "bg-white" : "bg-transparent"}`}
            >
              <div className="flex items-center justify-between">
                <div className={`flex items-center gap-2 lg:gap-3 text-base ${i === index ? "text-neutral-700" : "text-white"}`}>
                  <span className="grid size-10 place-items-center rounded-full bg-brand text-sm font-bold text-white">
                    {c.userInitials}
                  </span>
                  <div>
                    <div className="font-semibold">{c.userName}</div>
                    <div className={`text-xs ${i === index ? "text-neutral-400" : "text-white/70"}`}>{c.createdAgo}</div>
                  </div>
                </div>
              </div>
              <Link
                to="/sikayet/$id"
                params={{ id: complaintLinkId(c) }}
                className={`block ${i === index ? "text-neutral-800" : "text-white"}`}
              >
                <h3 className="mb-2 font-bold text-[17px] leading-snug line-clamp-2 lg:text-[22px]">{c.title}</h3>
                <p className={`text-[13px] leading-relaxed line-clamp-3 ${i === index ? "text-neutral-600" : "text-white/85"}`}>{c.body}</p>
                <div className="mt-3 text-[12px] font-semibold text-brand truncate">▸ {c.companyName}</div>
              </Link>
            </div>
          ))}
          {list.length === 0 && (
            <p className="px-4 text-sm text-white/70">Все още няма данни.</p>
          )}
        </div>
      </section>
    </div>
  );
}
