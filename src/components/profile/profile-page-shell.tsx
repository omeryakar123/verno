import { Link } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { ProfileAccountSidebar, type ProfileAccountSection } from "@/components/profile-account-sidebar";

type ProfilePageShellProps = {
  active: ProfileAccountSection;
  loading?: boolean;
  onSignOut: () => void | Promise<void>;
  children: React.ReactNode;
};

export function ProfilePageShell({ active, loading, onSignOut, children }: ProfilePageShellProps) {
  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 text-center text-navy-mid">
        <Loader2 className="mx-auto size-7 animate-spin" />
        <p className="mt-3 text-[14px]">Зареждане на профила…</p>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#f0f3fe]">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 px-3 py-5 sm:px-6 sm:py-8 lg:flex-row lg:gap-8">
        <ProfileAccountSidebar active={active} onSignOut={onSignOut} />

        <div className="min-w-0 flex-1">
          <div className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-rule/60">{children}</div>
        </div>
      </div>
    </div>
  );
}

type ProfileEmptyStateProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: React.ReactNode;
  actionTo?: string;
};

export function ProfileEmptyState({ icon, title, description, actionLabel, actionTo }: ProfileEmptyStateProps) {
  return (
    <div className="px-4 py-16 text-center lg:py-24">
      <div className="relative mx-auto mb-9 flex w-full max-w-md justify-center">
        <div className="flex size-44 shrink-0 items-center justify-center rounded-full bg-zinc-300 xl:size-56" aria-hidden>
          {icon}
        </div>
      </div>
      <h2 className="mb-4 px-4 text-2xl font-semibold tracking-wide text-zinc-900 lg:text-4xl">{title}</h2>
      <p className="mx-auto mb-6 max-w-lg px-6 text-lg leading-relaxed text-zinc-600 lg:text-2xl">{description}</p>
      {actionLabel && actionTo ? (
        <Link
          to={actionTo}
          className="mt-2 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-brand px-8 text-base font-semibold text-white transition hover:bg-brand-hover"
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
