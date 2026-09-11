import { Link } from "@tanstack/react-router";
import {
  Award,
  Bell,
  Bookmark,
  ChevronRight,
  LogOut,
  Mail,
  MessageSquare,
  PenLine,
  Pencil,
  Shield,
  ThumbsUp,
  Trash2,
  User,
} from "lucide-react";
import { SiteLogoMark } from "@/components/site-logo-mark";
import { cn } from "@/lib/utils";

export type ProfileAccountSection =
  | "info"
  | "complaints"
  | "notifications"
  | "supported"
  | "commented"
  | "saved"
  | "messages"
  | "badges"
  | "security";

const ITEMS: {
  id: ProfileAccountSection;
  label: string;
  icon: typeof User;
  to: string;
}[] = [
  { id: "info", label: "Редактирай профила", icon: User, to: "/profilim" },
  { id: "complaints", label: "Моите жалби", icon: Pencil, to: "/sikayetlerim" },
  { id: "notifications", label: "Известия", icon: Bell, to: "/bildirimlerim" },
  {
    id: "supported",
    label: "Подкрепени",
    icon: ThumbsUp,
    to: "/desteklediklerim",
  },
  {
    id: "commented",
    label: "Коментирани",
    icon: MessageSquare,
    to: "/yorumladiklarim",
  },
  { id: "saved", label: "Запазени", icon: Bookmark, to: "/profile" },
  { id: "messages", label: "Съобщения", icon: Mail, to: "/profile" },
  { id: "badges", label: "Значки", icon: Award, to: "/profile" },
  { id: "security", label: "Сигурност", icon: Shield, to: "/profile" },
];

type Props = {
  active: ProfileAccountSection;
  onSignOut: () => void | Promise<void>;
  className?: string;
};

export function ProfileAccountSidebar({ active, onSignOut, className }: Props) {
  const primaryItems = ITEMS.filter((i) =>
    [
      "info",
      "complaints",
      "notifications",
      "supported",
      "commented",
      "saved",
    ].includes(i.id),
  );
  const secondaryItems = ITEMS.filter((i) =>
    ["messages", "badges", "security"].includes(i.id),
  );

  return (
    <aside className={cn("shrink-0 lg:w-72", className)}>
      <div className="overflow-hidden rounded-b-4xl bg-[#272635] text-white lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto lg:rounded-3xl">
        <div className="hidden px-6 pt-8 pb-4 lg:block">
          <Link to="/" title="Начало">
            <SiteLogoMark size={22} tone="on-dark" />
          </Link>
        </div>

        <nav className="space-y-0.5 p-3 pt-4 lg:pt-2">
          {primaryItems.map(({ id, label, icon: Icon, to }) => {
            const isActive = active === id;
            return (
              <Link
                key={id}
                to={to}
                search={
                  id === "saved"
                    ? { sekme: "saved" }
                    : id === "messages"
                      ? { sekme: "mesajlar" }
                      : id === "badges"
                        ? { sekme: "badges" }
                        : id === "security"
                          ? { sekme: "security" }
                          : undefined
                }
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-[13.5px] font-medium transition",
                  isActive
                    ? "bg-white/12 text-white"
                    : "text-white/70 hover:bg-white/8 hover:text-white",
                )}
              >
                <Icon className="size-[18px] shrink-0 opacity-90" />
                {label}
                {isActive && (
                  <ChevronRight className="ml-auto size-4 opacity-60" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="mx-3 my-2 hidden border-t border-white/10 lg:block" />

        <nav className="hidden space-y-0.5 p-3 lg:block">
          {secondaryItems.map(({ id, label, icon: Icon, to }) => {
            const isActive = active === id;
            const search =
              id === "messages"
                ? { sekme: "mesajlar" as const }
                : id === "badges"
                  ? { sekme: "badges" as const }
                  : id === "security"
                    ? { sekme: "security" as const }
                    : undefined;
            return (
              <Link
                key={id}
                to={to}
                search={search}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-[13.5px] font-medium transition",
                  isActive
                    ? "bg-white/12 text-white"
                    : "text-white/65 hover:bg-white/8 hover:text-white",
                )}
              >
                <Icon className="size-[18px] shrink-0 opacity-90" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="space-y-2 border-t border-white/10 p-3">
          <Link
            to="/sikayet-yaz"
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#695de9] text-[13px] font-semibold text-white shadow-sm transition hover:brightness-110"
          >
            <PenLine className="size-4" />
            Напиши жалба
          </Link>
          <button
            type="button"
            onClick={() => void onSignOut()}
            className="flex h-10 w-full items-center justify-center gap-2 rounded-xl text-[13px] font-medium text-white/65 transition hover:bg-white/8 hover:text-white"
          >
            <LogOut className="size-4" />
            Изход
          </button>
        </div>

        <div className="border-t border-white/10 p-3 lg:hidden">
          <Link
            to="/profile"
            search={{ sekme: "security" }}
            className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13px] text-white/60"
          >
            <Trash2 className="size-4" />
            Изтриване на акаунта
          </Link>
        </div>
      </div>
    </aside>
  );
}

export { ITEMS as PROFILE_ACCOUNT_ITEMS };
