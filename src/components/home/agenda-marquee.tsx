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
    <article className="relative mr-4 flex h-auto min-h-[9.5rem] w-[min(86vw,22rem)] shrink-0 flex-col justify-between rounded-2xl bg-white p-4 shadow-[0_10px_28px_rgb(16_20_31/0.08)] ring-1 ring-black/4 md:mr-5 md:w-[20rem] lg:min-h-[10.5rem] lg:w-[22rem] lg:p-5">
      <div className="flex items-center gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand-soft text-[11px] font-bold text-brand lg:size-10">
          {complaint.userInitials}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2 text-[13px] leading-tight lg:text-[15px]">
            <span className="truncate font-bold text-[#10141F]">{complaint.userName}</span>
            <Link
              to="/firma/$slug"
              params={{ slug: complaint.companySlug }}
              className="truncate font-semibold text-brand"
              title={complaint.companyName}
            >
              {complaint.companyName}
            </Link>
          </div>
          <span className="mt-0.5 flex items-center gap-1 text-[11px] text-navy-mid">
            <Eye className="size-3 shrink-0" aria-hidden />
            {(complaint.views ?? 0).toLocaleString("bg-BG")}
          </span>
        </div>
      </div>
      <Link
        to="/sikayet/$id"
        params={{ id: complaintLinkId(complaint) }}
        className="mt-3 line-clamp-2 font-semibold text-[15px] leading-snug text-[#10141F] lg:text-[17px]"
        title={complaint.title}
      >
        {complaint.title}
      </Link>
      <div className="mt-3">
        <ComplaintSupportButton
          complaintId={complaint.id}
          initialVotes={complaint.votes}
          initialSupported={complaint.supported}
          size="sm"
        />
      </div>
    </article>
  );
}

export function AgendaMarquee({ items, compact = false }: Props) {
  const list = items.length > 0 ? items : [];
  const doubled = [...list, ...list];

  return (
    <section className={compact ? "bg-[#F4F6FB] py-8" : "bg-[#F4F6FB] py-10 lg:py-14"}>
      <div className="container mb-5 max-w-6xl px-4 lg:mb-8">
        <h2 className="font-semibold text-[#10141F] text-xl lg:text-[28px]">
          Жалби в дневния ред
        </h2>
      </div>

      <div className="relative overflow-hidden">
        {list.length === 0 ? (
          <p className="container px-4 text-sm text-navy-mid">Все още няма жалби.</p>
        ) : (
          <div
            className="flex w-max animate-home-marquee py-1"
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
    </section>
  );
}
