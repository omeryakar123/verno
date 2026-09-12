import { Link } from "@tanstack/react-router";
import { Eye } from "lucide-react";
import { complaintLinkId } from "@/lib/complaint-link";
import { type Complaint } from "@/lib/mock-data";
import { BrandAvatar } from "@/components/cards";
import { MobileCarousel } from "@/components/mobile-carousel";

type Props = {
  items: Complaint[];
};

function ComplaintSlide({ c }: { c: Complaint }) {
  const logoPath = c.companySlug ? `/brand-logos/${c.companySlug}.png` : null;

  return (
    <Link
      to="/sikayet/$id"
      params={{ id: complaintLinkId(c) }}
      className="home-feed-card group flex h-full min-h-[8.75rem] flex-col justify-between"
    >
      <div className="flex items-start gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand-soft text-[11px] font-bold text-brand lg:size-10">
          {c.userInitials}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[13px] leading-tight lg:text-[14px]">
            <span className="truncate font-bold text-[#272635]">{c.userName}</span>
            {c.companySlug ? (
              <span className="truncate font-semibold text-brand">{c.companyName}</span>
            ) : null}
          </div>
          <span className="mt-0.5 inline-flex items-center gap-1 text-[10px] text-[#85878e] lg:text-[11px]">
            <Eye className="size-3 shrink-0" aria-hidden />
            {(c.views ?? 0).toLocaleString("bg-BG")} · {c.createdAgo}
          </span>
        </div>
      </div>

      <p className="mt-3 line-clamp-2 font-semibold text-[15px] leading-snug text-[#272635] lg:text-[17px]">
        {c.title}
      </p>

      {c.companySlug ? (
        <div className="mt-3 flex items-center gap-2 opacity-80 transition group-hover:opacity-100">
          <BrandAvatar
            name={c.companyName}
            slug={c.companySlug}
            logoUrl={logoPath}
            size={28}
          />
          <span className="truncate text-[12px] font-medium text-[#626692]">
            {c.companyName}
          </span>
        </div>
      ) : null}
    </Link>
  );
}

export function LatestResolvedCarousel({ items }: Props) {
  if (items.length === 0) return null;

  const slides = items.slice(0, 6);

  return (
    <section className="home-container max-w-6xl px-4 pb-10 lg:pb-16">
      <div className="lg:hidden">
        <MobileCarousel
          ariaLabel="Последни жалби"
          slideClassName="w-[min(calc(100vw-3rem),340px)] snap-start shrink-0"
        >
          {slides.map((c) => (
            <ComplaintSlide key={c.id} c={c} />
          ))}
        </MobileCarousel>
      </div>

      <ul className="hidden lg:grid lg:grid-cols-3 lg:gap-4">
        {slides.map((c) => (
          <li key={c.id}>
            <ComplaintSlide c={c} />
          </li>
        ))}
      </ul>
    </section>
  );
}
