import { Link } from "@tanstack/react-router";
import { Eye } from "lucide-react";
import type { Complaint } from "@/lib/mock-data";
import { complaintLinkId } from "@/lib/complaint-link";
import { ComplaintSupportButton } from "@/components/complaint-support-button";

type Props = {
  items: Complaint[];
  compact?: boolean;
};

function AgendaCard({ complaint }: { complaint: Complaint }) {
  return (
    <article className="home-feed-card relative mr-8 h-35 w-full shrink-0 md:mr-8 md:w-1/2 lg:mr-10 lg:h-45 lg:w-[31vw]">
      <div className="flex flex-1 flex-col justify-center">
        <div className="pointer-events-none relative z-20 mb-2 flex items-center gap-2 text-sm lg:mb-4 lg:gap-3 lg:text-base [&_a]:pointer-events-auto">
          <span className="relative flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#ecfdf5] text-[11px] font-bold text-[#3ad08f] lg:size-10">
            {complaint.userInitials}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-1.5 leading-none text-neutral-700 lg:gap-x-3">
              <span className="truncate font-bold xl:text-xl">{complaint.userName}</span>
              <Link
                to="/firma/$slug"
                params={{ slug: complaint.companySlug }}
                className="flex items-center gap-0.5 overflow-hidden text-xs font-semibold text-[#3ad08f] xl:gap-1 xl:text-sm"
                title={complaint.companyName}
              >
                <span className="line-clamp-2 min-w-0 truncate">{complaint.companyName}</span>
              </Link>
            </div>
            <span className="mt-0.5 flex items-center gap-1 text-[10px] leading-none text-neutral-400 xl:text-sm">
              <Eye className="size-3 shrink-0" aria-hidden />
              {(complaint.views ?? 0).toLocaleString("bg-BG")}
            </span>
          </div>
        </div>
        <Link
          to="/sikayet/$id"
          params={{ id: complaintLinkId(complaint) }}
          className="line-clamp-2 h-10 font-semibold text-base leading-snug text-neutral-700 lg:h-14 lg:text-xl"
          title={complaint.title}
        >
          {complaint.title}
        </Link>
        <div className="relative z-20 mt-3">
          <ComplaintSupportButton
            complaintId={complaint.id}
            initialVotes={complaint.votes}
            initialSupported={complaint.supported}
            size="sm"
          />
        </div>
      </div>
    </article>
  );
}

export function AgendaMarquee({ items, compact = false }: Props) {
  const list = items.length > 0 ? items : [];
  const doubled = [...list, ...list];

  return (
    <div
      className={
        compact
          ? "space-y-5 pb-8 md:space-y-6 lg:pb-12"
          : "space-y-6 pb-12 md:space-y-8 lg:pb-33"
      }
    >
      <div className="container mb-6 max-w-6xl px-4">
        <h2
          className={
            compact
              ? "mb-4 font-semibold text-xl text-[#85878e] lg:mb-8 lg:font-medium lg:text-2xl"
              : "mb-8 font-semibold text-2xl text-[#85878e] lg:mb-28 lg:font-medium lg:text-3xl"
          }
        >
          Жалби в дневния ред
        </h2>
      </div>

      <div className="relative mb-8 overflow-hidden lg:mb-10">
        {list.length === 0 ? (
          <p className="container px-4 text-sm text-[#85878e]">Все още няма жалби.</p>
        ) : (
          <div
            className="flex w-max animate-home-marquee"
            style={
              {
                "--marquee-duration": `${Math.max(list.length * 14, 60)}s`,
              } as React.CSSProperties
            }
          >
            {doubled.map((c, i) => (
              <AgendaCard key={`${c.id}-${i}`} complaint={c} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
