import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Eye, MessageCircle } from "lucide-react";
import type { Complaint } from "@/lib/mock-data";
import { complaintLinkId } from "@/lib/complaint-link";
import { BrandListLogo } from "@/components/cards";
import { cn } from "@/lib/utils";

type Props = {
  items: Complaint[];
  updatedAt?: Date;
};

function commentLabel(n: number) {
  if (n === 1) return "1 коментар";
  return `${n} коментара`;
}

function TalkedCard({
  complaint,
  active,
}: {
  complaint: Complaint;
  active: boolean;
}) {
  return (
    <article
      data-first-visible={active ? "true" : undefined}
      className={cn(
        "group relative flex w-full max-w-3xl shrink-0 snap-start flex-col justify-between gap-5 rounded-3xl border-2 border-white px-5 pt-7 pb-9 transition-all duration-300 md:w-[75vw] lg:w-[65vw] lg:px-12 lg:py-8",
        active ? "bg-white" : "bg-transparent",
      )}
    >
      <div className="flex items-center justify-between">
        <div
          className={cn(
            "flex items-center gap-2 text-base lg:gap-3 lg:text-xl",
            active ? "text-neutral-800" : "text-white",
          )}
        >
          <span
            className={cn(
              "relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full text-[13px] font-bold transition-all duration-300 lg:size-20 lg:text-2xl",
              active ? "bg-[#ecfdf5] text-[#059669]" : "bg-white/15 text-white",
            )}
          >
            {complaint.userInitials.slice(0, 1)}
          </span>
          <div className="min-w-0 flex-1">
            <div
              className={cn(
                "flex flex-wrap items-center gap-x-1.5 lg:gap-x-3",
                active ? "text-neutral-800" : "text-white",
              )}
            >
              <span className="font-bold lg:text-2xl">{complaint.userName}</span>
            </div>
            <div
              className={cn(
                "mt-0 flex text-xs",
                active ? "text-[#b9b9b9]" : "text-white",
              )}
            >
              <span className="flex items-center gap-1 lg:text-base">
                <Eye className="size-3.5 shrink-0" aria-hidden />
                {(complaint.views ?? 0).toLocaleString("bg-BG")}
              </span>
            </div>
          </div>
        </div>
        <span
          className={cn(
            "flex items-center gap-1 font-semibold text-base leading-none lg:text-xl",
            active ? "text-[#3ad08f]" : "text-white",
          )}
        >
          <MessageCircle className="size-4" />
          {commentLabel(complaint.comments ?? 0)}
        </span>
      </div>

      <Link
        to="/sikayet/$id"
        params={{ id: complaintLinkId(complaint) }}
        className={cn(
          "line-clamp-3 font-semibold text-xl leading-snug lg:text-3xl",
          active ? "text-neutral-800" : "text-white",
        )}
      >
        {complaint.title}
      </Link>

      <Link
        to="/firma/$slug"
        params={{ slug: complaint.companySlug }}
        className={cn(
          "inline-flex max-w-full items-center gap-2.5 text-[13px] font-semibold lg:text-base",
          active ? "text-[#626692]" : "text-white",
        )}
      >
        <BrandListLogo
          name={complaint.companyName}
          slug={complaint.companySlug}
          size={36}
          className="rounded-lg"
        />
        <span className="truncate">{complaint.companyName}</span>
      </Link>
    </article>
  );
}

export function TalkedCarousel({ items, updatedAt }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const list = items.slice(0, 8);

  useEffect(() => {
    if (list.length <= 1) return;
    const timer = window.setInterval(() => {
      setIndex((i) => (i + 1) % list.length);
    }, 5000);
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
    <div className="relative overflow-hidden pt-13 pb-24 md:pb-48 before:absolute before:right-0 before:bottom-0 before:-z-[1] before:-mr-16 before:h-48 before:w-48 before:rounded-tr-full before:bg-[#3ad08f] md:before:left-[44%] md:before:h-1/2 md:before:w-1/4 after:absolute after:top-0 after:right-0 after:-z-[2] after:h-full after:w-32 after:rounded-tl-[90px] after:bg-[#695de9] md:after:w-[56%]">
      <section aria-roledescription="carousel">
        <div className="container mb-12 flex max-w-6xl items-center justify-between px-4 lg:mb-24 lg:justify-start">
          <h2 className="font-semibold text-[#85878e] text-xl lg:font-medium lg:text-[30px]">
            Най-обсъждани
          </h2>
          <div className="flex items-center gap-3 text-white lg:ml-[15%]">
            <button
              type="button"
              aria-label="Предишна"
              onClick={() => scrollBy(-1)}
              className="inline-flex size-9 shrink-0 items-center justify-center rounded-full border-2 border-current/20 text-sm shadow-sm outline-none transition-all hover:scale-110 hover:bg-current/10 lg:size-13"
            >
              <ChevronLeft className="size-5" aria-hidden />
            </button>
            <button
              type="button"
              aria-label="Следваща"
              onClick={() => scrollBy(1)}
              className="inline-flex size-9 shrink-0 items-center justify-center rounded-full border-2 border-current/20 text-sm shadow-sm outline-none transition-all hover:scale-110 hover:bg-current/10 lg:size-13"
            >
              <ChevronRight className="size-5" aria-hidden />
            </button>
          </div>
        </div>

        <div
          ref={trackRef}
          role="region"
          aria-live="off"
          className="home-talked-track flex snap-x snap-mandatory flex-nowrap gap-x-20 overflow-x-auto scroll-smooth [scrollbar-width:none] md:after:block md:after:w-1/4 md:after:shrink-0 [&::-webkit-scrollbar]:hidden"
        >
          {list.map((c, i) => (
            <TalkedCard key={c.id} complaint={c} active={i === index} />
          ))}
          {list.length === 0 && (
            <p className="px-4 text-sm text-white/70">Все още няма данни.</p>
          )}
        </div>

        {updatedAt ? (
          <p className="container mt-4 max-w-6xl px-4 text-right text-[11px] text-white/50 tabular-nums lg:text-xs">
            {updatedAt.toLocaleTimeString("bg-BG", {
              hour: "2-digit",
              minute: "2-digit",
            })}{" "}
            · обновяване на 30 мин
          </p>
        ) : null}
      </section>
    </div>
  );
}
