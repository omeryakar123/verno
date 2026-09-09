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

const AVATAR_TONES = [
  "bg-[#dbeafe] text-[#3b82c4]",
  "bg-[#d1fae5] text-[#059669]",
  "bg-[#ede9fe] text-[#7c3aed]",
  "bg-[#ffedd5] text-[#ea580c]",
] as const;

function commentLabel(n: number) {
  if (n === 1) return "1 коментар";
  return `${n} коментара`;
}

function TalkedCard({ complaint, active, toneIdx }: { complaint: Complaint; active: boolean; toneIdx: number }) {
  const avatarTone = AVATAR_TONES[toneIdx % AVATAR_TONES.length];

  return (
    <article
      className={cn(
        "relative flex w-[min(88vw,540px)] shrink-0 snap-start flex-col justify-between rounded-[20px] px-6 py-7 transition-all duration-300 lg:w-[540px] lg:min-h-[300px] lg:px-8 lg:py-8",
        active
          ? "bg-white shadow-[0_8px_40px_rgba(39,38,53,0.12)]"
          : "border-2 border-white/90 bg-transparent",
      )}
    >
      {active ? (
        <span className="pointer-events-none absolute left-0 top-0 h-14 w-1.5 rounded-br-md rounded-tl-[20px] bg-[#3ad08f]" aria-hidden />
      ) : null}
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className={cn("grid size-11 shrink-0 place-items-center rounded-full text-[13px] font-bold lg:size-12", avatarTone)}>
            {complaint.userInitials.slice(0, 1)}
          </span>
          <div className="min-w-0">
            <div className={cn("truncate font-bold text-[15px] lg:text-base", active ? "text-[#272635]" : "text-white")}>
              {complaint.userName}
            </div>
            <div className={cn("mt-0.5 flex items-center gap-1 text-[12px]", active ? "text-[#a0a4b8]" : "text-white/65")}>
              <Eye className="size-3.5 shrink-0" aria-hidden />
              {(complaint.views ?? 0).toLocaleString("bg-BG")}
            </div>
          </div>
        </div>

        <span
          className={cn(
            "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-semibold",
            active ? "bg-[#ecfdf5] text-[#059669]" : "bg-white/12 text-white",
          )}
        >
          <MessageCircle className={cn("size-3.5", active ? "fill-[#059669]/20" : "fill-white/20")} />
          {commentLabel(complaint.comments ?? 0)}
        </span>
      </div>

      <Link
        to="/sikayet/$id"
        params={{ id: complaintLinkId(complaint) }}
        className={cn("block flex-1", active ? "text-[#272635]" : "text-white")}
      >
        <h3 className="line-clamp-2 font-bold text-[18px] leading-snug lg:text-[22px] lg:leading-tight">{complaint.title}</h3>
      </Link>

      <Link
        to="/firma/$slug"
        params={{ slug: complaint.companySlug }}
        className={cn(
          "mt-6 inline-flex max-w-full items-center gap-2.5 text-[13px] font-semibold transition-opacity hover:opacity-80",
          active ? "text-[#626692]" : "text-white/90",
        )}
      >
        <span
          className={cn(
            "grid size-8 shrink-0 place-items-center rounded-lg",
            active ? "bg-[#f3f4f8] text-[#85878e]" : "bg-white/10 text-white/80",
          )}
        >
          <ChevronRight className="size-4" aria-hidden />
        </span>
        <BrandListLogo name={complaint.companyName} slug={complaint.companySlug} size={32} className="rounded-lg" />
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
    <div className="home-talked-shell">
      <div className="home-talked-green" aria-hidden />
      <section aria-roledescription="carousel" className="relative z-10">
        <div className="home-talked-header mx-auto flex max-w-[1170px] items-center justify-between px-4 pb-8 pt-6 lg:pb-12 lg:pt-10">
          <h2 className="font-medium text-2xl text-[#85878e] lg:text-[30px]">Най-обсъждани</h2>
          <div className="flex items-center gap-2.5 lg:gap-3">
            <button
              type="button"
              aria-label="Предишна"
              onClick={() => scrollBy(-1)}
              className="inline-flex size-10 shrink-0 items-center justify-center rounded-full border-2 border-[#e8eaef] text-[#626692] transition hover:bg-[#f3f4f8] lg:size-[52px] lg:border-white/25 lg:text-white lg:hover:bg-white/10"
            >
              <ChevronLeft className="size-5" aria-hidden />
            </button>
            <button
              type="button"
              aria-label="Следваща"
              onClick={() => scrollBy(1)}
              className="inline-flex size-10 shrink-0 items-center justify-center rounded-full border-2 border-[#e8eaef] text-[#626692] transition hover:bg-[#f3f4f8] lg:size-[52px] lg:border-white/25 lg:text-white lg:hover:bg-white/10"
            >
              <ChevronRight className="size-5" aria-hidden />
            </button>
          </div>
        </div>

        <div
          ref={trackRef}
          role="region"
          aria-live="off"
          className="home-talked-track flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth pb-4 [scrollbar-width:none] lg:gap-6 [&::-webkit-scrollbar]:hidden"
        >
          {list.map((c, i) => (
            <TalkedCard key={c.id} complaint={c} active={i === index} toneIdx={i} />
          ))}
          {list.length === 0 && (
            <p className="px-4 text-sm text-white/70">Все още няма данни.</p>
          )}
        </div>

        {updatedAt && (
          <p className="relative z-10 mx-auto mt-4 max-w-[1170px] px-4 text-right text-[11px] text-white/50 tabular-nums lg:text-xs">
            {updatedAt.toLocaleTimeString("bg-BG", { hour: "2-digit", minute: "2-digit" })} · обновяване на 30 мин
          </p>
        )}
      </section>
    </div>
  );
}
