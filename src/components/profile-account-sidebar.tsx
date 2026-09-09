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
  User,
} from "lucide-react";
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
  to: "/profile" | "/bildirimlerim";
  search?: { sekme: string };
}[] = [
  { id: "info", label: "Редактирай профила", icon: User, to: "/profile" },
  { id: "complaints", label: "Моите жалби", icon: Pencil, to: "/profile", search: { sekme: "complaints" } },
  { id: "notifications", label: "Известия", icon: Bell, to: "/bildirimlerim" },
  { id: "supported", label: "Подкрепени", icon: ThumbsUp, to: "/profile", search: { sekme: "supported" } },
  { id: "commented", label: "Коментирани", icon: MessageSquare, to: "/profile", search: { sekme: "commented" } },
  { id: "saved", label: "Запазени", icon: Bookmark, to: "/profile", search: { sekme: "saved" } },
  { id: "messages", label: "Съобщения", icon: Mail, to: "/profile", search: { sekme: "mesajlar" } },
  { id: "badges", label: "Значки", icon: Award, to: "/profile", search: { sekme: "badges" } },
  { id: "security", label: "Сигурност", icon: Shield, to: "/profile", search: { sekme: "security" } },
];

type Props = {
  active: ProfileAccountSection;
  onSignOut: () => void | Promise<void>;
  className?: string;
};

export function ProfileAccountSidebar({ active, onSignOut, className }: Props) {
  return (
    <aside className={cn("lg:w-[260px] shrink-0", className)}>
      <div className="lg:sticky lg:top-20 bg-media text-media-foreground rounded-2xl overflow-hidden shadow-lift">
        <nav className="p-3 space-y-0.5">
          {ITEMS.map(({ id, label, icon: Icon, to, search }) => {
            const isActive = active === id;
            return (
              <Link
                key={id}
                to={to}
                search={search}
                className={cn(
                  "w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13.5px] font-medium transition text-left",
                  isActive ? "bg-white/12 text-white" : "text-white/70 hover:bg-white/8 hover:text-white",
                )}
              >
                <Icon className="size-[18px] shrink-0 opacity-90" />
                {label}
                {isActive && <ChevronRight className="size-4 ml-auto opacity-60" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 pt-2 border-t border-white/10 space-y-2">
          <Link
            to="/sikayet-yaz"
            className="flex items-center justify-center gap-2 w-full h-11 rounded-xl bg-accent-purple text-white text-[13px] font-semibold hover:brightness-110 transition shadow-sm"
          >
            <PenLine className="size-4" />
            Напиши жалба
          </Link>
          <button
            type="button"
            onClick={() => void onSignOut()}
            className="flex items-center justify-center gap-2 w-full h-10 rounded-xl text-[13px] font-medium text-white/65 hover:text-white hover:bg-white/8 transition"
          >
            <LogOut className="size-4" />
            Изход
          </button>
        </div>
      </div>
    </aside>
  );
}

export { ITEMS as PROFILE_ACCOUNT_ITEMS };
