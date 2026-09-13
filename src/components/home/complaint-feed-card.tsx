import { Link } from "@tanstack/react-router";
import { Eye, MessageCircle } from "lucide-react";
import type { Complaint } from "@/lib/mock-data";
import { statusLabel } from "@/lib/mock-data";
import { complaintLinkId } from "@/lib/complaint-link";
import { displayComplaintViews } from "@/lib/display-views";
import { ComplaintSupportButton } from "@/components/complaint-support-button";

function commentLabel(n: number) {
  if (n === 1) return "1 коментар";
  return `${n} коментара`;
}

export function ComplaintFeedCard({ complaint }: { complaint: Complaint }) {
  const views = displayComplaintViews(complaint.id, complaint.views ?? 0);

  return (
    <article className="listing-card">
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-brand-soft text-[12px] font-bold text-brand lg:size-11">
          {complaint.userInitials}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <span className="truncate font-bold text-ink lg:text-lg">
              {complaint.userName}
            </span>
            <Link
              to="/firma/$slug"
              params={{ slug: complaint.companySlug }}
              className="truncate font-semibold text-brand hover:underline"
            >
              {complaint.companyName}
            </Link>
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                complaint.status === "cozuldu"
                  ? "bg-brand-soft text-brand"
                  : complaint.status === "yanitlandi"
                    ? "bg-primary/10 text-primary"
                    : "bg-surface text-navy-mid"
              }`}
            >
              {statusLabel[complaint.status]}
            </span>
          </div>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-3 text-[12px] text-navy-mid">
            <span className="inline-flex items-center gap-1">
              <Eye className="size-3.5" aria-hidden />
              {views.toLocaleString("bg-BG")}
            </span>
            <span>{complaint.createdAgo}</span>
          </div>
        </div>
      </div>

      <Link
        to="/sikayet/$id"
        params={{ id: complaintLinkId(complaint) }}
        className="mt-3 block font-semibold text-[17px] leading-snug text-ink transition-colors hover:text-primary lg:text-xl"
      >
        {complaint.title}
      </Link>

      {complaint.body ? (
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-navy">
          {complaint.body}
        </p>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <ComplaintSupportButton
          complaintId={complaint.id}
          initialVotes={complaint.votes}
          initialSupported={complaint.supported}
          size="sm"
        />
        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy-mid">
          <MessageCircle className="size-4" aria-hidden />
          {commentLabel(complaint.comments ?? 0)}
        </span>
      </div>
    </article>
  );
}
