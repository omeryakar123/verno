import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Bell,
  Bookmark,
  CircleHelp,
  LogOut,
  MessageSquare,
  Pencil,
  ThumbsUp,
  User,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { proxyImage } from "@/lib/img";
import type { AuthUser } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

type ProfileSnippet = {
  fullName: string | null;
  avatarUrl: string | null;
};

const MENU_ITEMS = [
  { to: "/profile" as const, search: undefined, label: "Редактирай профила", icon: User, ga: "User_Edit_Profile" },
  { to: "/profile" as const, search: { sekme: "complaints" as const }, label: "Моите жалби", icon: Pencil, ga: "User_Complaint" },
  { to: "/bildirimlerim" as const, search: undefined, label: "Известия", icon: Bell, ga: "User_Notification" },
  { to: "/profile" as const, search: { sekme: "supported" as const }, label: "Подкрепени", icon: ThumbsUp, ga: "User_Supported_Complaints" },
  { to: "/profile" as const, search: { sekme: "commented" as const }, label: "Коментирани", icon: MessageSquare, ga: "User_Commented_Complaints" },
  { to: "/profile" as const, search: { sekme: "saved" as const }, label: "Запазени", icon: Bookmark, ga: "User_Saved" },
] as const;

function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function MenuLink({
  to,
  search,
  label,
  icon: Icon,
  ga,
  onNavigate,
}: {
  to: "/profile" | "/bildirimlerim";
  search?: { sekme: "complaints" | "supported" | "commented" | "saved" };
  label: string;
  icon: typeof User;
  ga: string;
  onNavigate?: () => void;
}) {
  return (
    <Link
      to={to}
      search={search}
      onClick={onNavigate}
      data-ga-element={ga}
      className="group flex items-center gap-3 rounded-xl px-4 py-2 text-gray-500 text-sm transition-colors hover:bg-primary/10 hover:text-primary"
    >
      <Icon className="size-4 text-gray-400 transition-colors group-hover:text-primary" aria-hidden />
      {label}
    </Link>
  );
}

type Props = {
  user: AuthUser;
  onSignOut: () => void | Promise<void>;
  /** Compact trigger for narrow headers */
  compact?: boolean;
  className?: string;
};

export function UserMenuPopover({ user, onSignOut, compact, className }: Props) {
  const [open, setOpen] = useState(false);
  const [profile, setProfile] = useState<ProfileSnippet | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/profile", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { profile?: ProfileSnippet | null } | null) => {
        if (!cancelled && data?.profile) setProfile(data.profile);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [user.id]);

  const displayName = profile?.fullName || user.name || user.email.split("@")[0];
  const avatarSrc = proxyImage(profile?.avatarUrl ?? user.image ?? null);
  const initials = initialsOf(displayName);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Потребителско меню"
          aria-expanded={open}
          className={cn(
            "inline-flex items-center gap-2 rounded-full text-[12px] 2xl:text-[13px] font-medium text-navy hover:text-brand transition-colors outline-none focus-visible:ring-2 focus-visible:ring-brand/40",
            className,
          )}
        >
          <span className="grid size-8 shrink-0 place-items-center overflow-hidden rounded-full bg-brand-soft text-brand text-[11px] font-bold ring-1 ring-rule">
            {avatarSrc ? (
              <img src={avatarSrc} alt="" className="size-full object-cover" />
            ) : (
              initials
            )}
          </span>
          {!compact && <span className="max-w-[7rem] truncate hidden 2xl:inline">{displayName}</span>}
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={12}
        className="w-72 rounded-[20px] border-0 bg-white p-0 text-popover-foreground shadow-[0_8px_30px_rgb(0_0_0_/_0.12)] ring-1 ring-black/5"
      >
        <div className="overflow-hidden rounded-[inherit]">
          <div className="flex items-center gap-3 border-b border-gray-100 px-5 py-4.5">
            <div className="flex size-11 shrink-0 overflow-hidden rounded-full bg-brand-soft">
              {avatarSrc ? (
                <img src={avatarSrc} alt="" className="size-full object-cover" />
              ) : (
                <span className="grid size-full place-items-center text-brand text-sm font-bold">{initials}</span>
              )}
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="font-semibold text-[15px] text-gray-900 truncate">{displayName}</span>
              <span className="max-w-full truncate text-gray-400 text-xs" title={user.email}>
                {user.email}
              </span>
            </div>
          </div>

          <div className="border-b border-gray-100 p-2">
            {MENU_ITEMS.map((item) => (
              <MenuLink
                key={item.ga}
                {...item}
                onNavigate={() => setOpen(false)}
              />
            ))}
          </div>

          <div className="flex items-center justify-between bg-gray-50/60 px-4 py-2.5 text-xs">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                void onSignOut();
              }}
              data-ga-element="User_Logout"
              className="flex items-center gap-1.5 text-gray-400 transition-colors hover:text-gray-600"
            >
              <LogOut className="size-3.5" aria-hidden />
              <span>Изход</span>
            </button>
            <Link
              to="/yardim"
              onClick={() => setOpen(false)}
              className="flex items-center gap-1.5 text-gray-400 transition-colors hover:text-gray-600"
            >
              <CircleHelp className="size-3.5" aria-hidden />
              <span>Помощ</span>
            </Link>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export { MENU_ITEMS as USER_MENU_ITEMS };
