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

function TalkedCard({ complaint }: { complaint: Complaint }) {
  return (
    <article className="flex h-full min-h-[13.5rem] w-[min(86vw,22.5rem)] shrink-0 snap-start flex-col justify-between rounded-[22px] bg-white px-5 py-5 shadow-[0_16px_36px_rgb(16_20_31/0.16)] lg:min-h-[15rem] lg:w-[24rem] lg:px-6 lg:py-6">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-full bg-primary/10 text-[13px] font-bold text-primary">
            {complaint.userInitials.slice(0, 1)}
          </span>
          <div className="min-w-0">
            <p className="truncate font-bold text-[#10141F] lg:text-lg">{complaint.userName}</p>
            <p className="mt-0.5 flex items-center gap-1 text-[12px] text-navy-mid">
              <Eye className="size-3.5 shrink-0" aria-hidden />
              {(complaint.views ?? 0).toLocaleString("bg-BG")}
            </p>
          </div>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-brand-soft px-2.5 py-1 text-[12px] font-bold text-brand">
          <MessageCircle className="size-3.5" />
          {commentLabel(complaint.comments ?? 0)}
        </span>
      </div>

      <Link
        to="/sikayet/$id"
        params={{ id: complaintLinkId(complaint) }}
        className="mt-4 line-clamp-3 font-semibold text-[17px] leading-snug text-[#10141F] lg:text-[20px]"
      >
        {complaint.title}
      </Link>

      <Link
        to="/firma/$slug"
        params={{ slug: complaint.companySlug }}
        className="mt-4 inline-flex max-w-full items-center gap-2 text-[13px] font-semibold text-primary"
      >
        <BrandListLogo
          name={complaint.companyName}
          slug={complaint.companySlug}
          size={32}
          className="rounded-lg ring-1 ring-rule"
        />
        <span className="truncate">{complaint.companyName}</span>
      </Link>
    </article>
  );
}

export function TalkedCarousel({ items, updatedAt }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const visibleRef = useRef(true);
  const [index, setIndex] = useState(0);
  const list = items.slice(0, 8);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        visibleRef.current = entry.isIntersecting;
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (list.length <= 1) return;
    const timer = window.setInterval(() => {
      if (!visibleRef.current) return;
      setIndex((i) => (i + 1) % list.length);
    }, 6000);
    return () => window.clearInterval(timer);
  }, [list.length]);

  useEffect(() => {
    const el = trackRef.current;
    if (!el || list.length === 0) return;
    const child = el.children[index] as HTMLElement | undefined;
    if (!child) return;
    const left =
      child.getBoundingClientRect().left -
      el.getBoundingClientRect().left +
      el.scrollLeft;
    el.scrollTo({ left, behavior: "smooth" });
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
    <section className="relative overflow-hidden bg-primary py-10 lg:py-14">
      <div
        className="pointer-events-none absolute -right-10 -bottom-16 size-56 rounded-full bg-brand/30"
        aria-hidden
      />
      <div className="container relative z-10 mb-6 flex max-w-6xl items-center justify-between px-4 lg:mb-8">
        <h2 className="font-semibold text-white text-xl lg:text-[28px]">Най-обсъждани</h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Предишна"
            onClick={() => scrollBy(-1)}
            className="grid size-10 place-items-center rounded-full border border-white/25 bg-white/10 text-white transition hover:bg-white/20"
          >
            <ChevronLeft className="size-5" aria-hidden />
          </button>
          <button
            type="button"
            aria-label="Следваща"
            onClick={() => scrollBy(1)}
            className="grid size-10 place-items-center rounded-full border border-white/25 bg-white/10 text-white transition hover:bg-white/20"
          >
            <ChevronRight className="size-5" aria-hidden />
          </button>
        </div>
      </div>

      <div
        ref={trackRef}
        role="region"
        aria-live="off"
        className="relative z-10 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-4 pb-2 [scrollbar-width:none] lg:px-[max(1rem,calc((100vw-72rem)/2))] [&::-webkit-scrollbar]:hidden"
      >
        {list.map((c) => (
          <TalkedCard key={c.id} complaint={c} />
        ))}
        {list.length === 0 && (
          <p className="px-4 text-sm text-white/80">Все още няма данни.</p>
        )}
      </div>

      <div className="relative z-10 mt-5 flex justify-center gap-1.5">
        {list.map((c, i) => (
          <button
            key={c.id}
            type="button"
            aria-label={`Слайд ${i + 1}`}
            onClick={() => setIndex(i)}
            className={cn(
              "h-1.5 rounded-full transition-all",
              i === index ? "w-6 bg-white" : "w-1.5 bg-white/40",
            )}
          />
        ))}
      </div>

      {updatedAt ? (
        <p className="container relative z-10 mt-4 max-w-6xl px-4 text-right text-[11px] text-white/55 tabular-nums">
          {updatedAt.toLocaleTimeString("bg-BG", {
            hour: "2-digit",
            minute: "2-digit",
          })}{" "}
          · обновяване на 30 мин
        </p>
      ) : null}
    </section>
  );
}
