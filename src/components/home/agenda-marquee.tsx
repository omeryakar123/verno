import { Link } from "@tanstack/react-router";
import { Eye } from "lucide-react";
import type { Complaint } from "@/lib/mock-data";
import { complaintLinkId } from "@/lib/complaint-link";
import { ComplaintSupportButton } from "@/components/complaint-support-button";

type Props = {
  items: Complaint[];
};

function AgendaCard({ complaint }: { complaint: Complaint }) {
  return (
    <article className="relative flex h-[8.75rem] shrink-0 gap-4 rounded-xl bg-white p-[1.125rem] mr-8 w-full md:mr-8 md:w-1/2 lg:mr-10 lg:w-[31vw] lg:h-[11.25rem]">
      <div className="flex flex-1 flex-col justify-center min-w-0">
        <div className="flex items-center gap-2 lg:gap-3 mb-2 text-sm lg:mb-4 lg:text-base">
          <span className="grid size-8 shrink-0 place-items-center rounded-full bg-brand-soft text-brand text-[11px] font-bold lg:size-10">
            {complaint.userInitials}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-1.5 leading-none text-neutral-700 lg:gap-x-3">
              <span className="font-bold xl:text-xl truncate">{complaint.userName}</span>
              <Link
                to="/firma/$slug"
                params={{ slug: complaint.companySlug }}
                className="flex items-center gap-0.5 overflow-hidden text-xs font-semibold text-brand xl:gap-1 xl:text-sm"
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

export function AgendaMarquee({ items }: Props) {
  const list = items.length > 0 ? items : [];
  const doubled = [...list, ...list];

  return (
    <div className="space-y-6 pb-12 md:space-y-8 lg:pb-[8.25rem]">
      <div className="home-container mb-6 max-w-6xl px-4">
        <h2 className="mb-8 font-semibold text-2xl text-[#85878e] lg:mb-28 lg:font-medium lg:text-3xl">
          Жалби в дневния ред
        </h2>
      </div>

      <div className="relative overflow-hidden mb-8 lg:mb-10">
        {list.length === 0 ? (
          <p className="home-container px-4 text-sm text-[#85878e]">Все още няма жалби.</p>
        ) : (
          <div
            className="flex w-max animate-home-marquee"
            style={{ "--marquee-duration": `${Math.max(list.length * 14, 60)}s` } as React.CSSProperties}
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
