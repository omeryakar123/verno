import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Eye, MessageSquare } from "lucide-react";
import { Pagination } from "@/components/pagination";
import { PAGE_SIZE } from "@/lib/data";
import { complaintLinkId } from "@/lib/complaint-link";
import { dbStatusToUi, statusLabel, statusClasses } from "@/lib/complaint-status";
import type { ProfileComplaint } from "@/hooks/use-profile-data";

type ProfileComplaintsListProps = {
  complaints: ProfileComplaint[];
  title: string;
  emptyMessage: string;
  showWriteLink?: boolean;
};

export function ProfileComplaintsList({
  complaints,
  title,
  emptyMessage,
  showWriteLink = false,
}: ProfileComplaintsListProps) {
  const [page, setPage] = useState(1);
  const start = (page - 1) * PAGE_SIZE;
  const slice = complaints.slice(start, start + PAGE_SIZE);

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-6 flex items-center gap-2 text-[16px] font-semibold text-ink">
        <MessageSquare className="size-5 text-brand" />
        {title}
      </div>
      <div className="divide-y divide-rule overflow-hidden rounded-2xl ring-1 ring-rule">
        {complaints.length === 0 && (
          <div className="p-12 text-center text-[14px] text-navy-mid">
            {emptyMessage}{" "}
            {showWriteLink && (
              <Link to="/sikayet-yaz" className="font-semibold text-brand hover:underline">
                Напишете първата си жалба
              </Link>
            )}
          </div>
        )}
        {slice.map((c) => (
          <Link
            key={c.id}
            to="/sikayet/$id"
            params={{ id: complaintLinkId(c) }}
            className="flex items-center gap-4 p-4 transition hover:bg-surface/60 sm:p-5"
          >
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ring-1 ring-inset ${statusClasses(dbStatusToUi(c.status))}`}
                >
                  {statusLabel[dbStatusToUi(c.status)]}
                </span>
                <span className="text-[12px] text-navy-mid">
                  {new Date(c.createdAt).toLocaleDateString("bg-BG")}
                </span>
              </div>
              <div className="mt-1.5 line-clamp-2 text-[15px] font-medium text-ink">{c.title}</div>
            </div>
            <div className="flex shrink-0 items-center gap-1 text-[12px] text-navy-mid">
              <Eye className="size-4" /> {c.views}
            </div>
          </Link>
        ))}
      </div>
      {complaints.length > PAGE_SIZE && (
        <div className="mt-4">
          <Pagination page={page} pageSize={PAGE_SIZE} total={complaints.length} onChange={setPage} />
        </div>
      )}
    </div>
  );
}
