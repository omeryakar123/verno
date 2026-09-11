import { Link } from "@tanstack/react-router";
import {
  CheckCircle2,
  ChevronRight,
  Clock,
  Eye,
  MessageCircle,
  ThumbsUp,
} from "lucide-react";
import { complaintLinkId } from "@/lib/complaint-link";
import { type Complaint } from "@/lib/mock-data";
import { BrandAvatar } from "@/components/cards";
import { MobileCarousel } from "@/components/mobile-carousel";

type Props = {
  items: Complaint[];
};

function ResolvedSlide({ c }: { c: Complaint }) {
  const logoPath = c.companySlug ? `/brand-logos/${c.companySlug}.png` : null;

  return (
    <Link
      to="/sikayet/$id"
      params={{ id: complaintLinkId(c) }}
      className="flex h-full flex-col overflow-hidden rounded-[22px] bg-white shadow-[0_8px_32px_rgba(39,38,53,0.08)] ring-1 ring-gray-100 transition hover:shadow-[0_12px_40px_rgba(39,38,53,0.12)]"
    >
      <div className="flex items-center justify-between bg-success/10 px-4 py-2.5">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-success">
          <CheckCircle2 className="size-3.5" />
          Решена
        </span>
        <span className="inline-flex items-center gap-1 text-[11px] text-[#85878e]">
          <Clock className="size-3" />
          {c.createdAgo}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="mb-3 flex items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-brand-soft text-[12px] font-bold text-brand">
            {c.userInitials}
          </span>
          <div className="min-w-0">
            <div className="truncate text-[14px] font-bold text-[#272635]">
              {c.userName}
            </div>
            <div className="text-[11px] text-[#85878e]">
              Сподели опит · получи решение
            </div>
          </div>
        </div>

        <p className="line-clamp-3 flex-1 text-[17px] font-bold leading-snug text-[#272635]">
          {c.title}
        </p>

        {c.companySlug ? (
          <div className="mt-4 flex items-center gap-2.5 rounded-xl border border-gray-100 bg-gray-50 px-3 py-2.5">
            <BrandAvatar
              name={c.companyName}
              slug={c.companySlug}
              logoUrl={logoPath}
              size={36}
            />
            <div className="min-w-0 flex-1">
              <div className="truncate text-[13px] font-semibold text-brand">
                {c.companyName}
              </div>
              <div className="text-[10px] text-[#85878e]">Виж марката</div>
            </div>
            <ChevronRight className="size-4 shrink-0 text-[#85878e]" />
          </div>
        ) : null}

        <div className="mt-3 flex items-center gap-4 text-[11px] text-[#85878e]">
          <span className="inline-flex items-center gap-1 tabular-nums">
            <Eye className="size-3" />
            {(c.views ?? 0).toLocaleString("bg-BG")}
          </span>
          <span className="inline-flex items-center gap-1 tabular-nums">
            <ThumbsUp className="size-3 text-brand" />
            {c.votes ?? 0}
          </span>
          {(c.comments ?? 0) > 0 ? (
            <span className="inline-flex items-center gap-1 tabular-nums">
              <MessageCircle className="size-3" />
              {c.comments}
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}

/** Последно решени жалби — yatay swiper (mobil + dar ekran). */
export function LatestResolvedCarousel({ items }: Props) {
  if (items.length === 0) return null;

  return (
    <section className="home-container max-w-6xl px-4 pb-10 lg:pb-16">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-semibold text-2xl tracking-tight text-[#85878e] lg:text-3xl">
            Последно решени жалби
          </h2>
          <p className="mt-1 text-[13px] text-[#85878e]">
            Реални истории с успешен край
          </p>
        </div>
      </div>

      {/* Mobil / tablet: swiper */}
      <div className="lg:hidden">
        <MobileCarousel
          ariaLabel="Последно решени жалби"
          slideClassName="w-[min(calc(100vw-3rem),340px)] snap-start shrink-0"
        >
          {items.map((c) => (
            <ResolvedSlide key={c.id} c={c} />
          ))}
        </MobileCarousel>
      </div>

      {/* Geniş ekran: 3 sütun grid */}
      <ul className="hidden lg:grid lg:grid-cols-3 lg:gap-4">
        {items.slice(0, 6).map((c) => (
          <li key={c.id}>
            <ResolvedSlide c={c} />
          </li>
        ))}
      </ul>
    </section>
  );
}
