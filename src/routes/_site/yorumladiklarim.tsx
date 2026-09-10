import { createFileRoute } from "@tanstack/react-router";
import { MessageSquare } from "lucide-react";
import { ProfileComplaintsList } from "@/components/profile/profile-complaints-list";
import { ProfileEmptyState, ProfilePageShell } from "@/components/profile/profile-page-shell";
import { useProfileData } from "@/hooks/use-profile-data";
import { privateHead, SITE_NAME } from "@/lib/seo";

export const Route = createFileRoute("/_site/yorumladiklarim")({
  head: () => privateHead(`Коментирани жалби — ${SITE_NAME}`, "/yorumladiklarim"),
  component: YorumladiklarimPage,
});

function YorumladiklarimPage() {
  const { loaded, commented, logout } = useProfileData();

  return (
    <ProfilePageShell active="commented" loading={!loaded} onSignOut={logout}>
      {commented.length === 0 ? (
        <ProfileEmptyState
          icon={<MessageSquare className="size-12 text-white xl:size-16" strokeWidth={1.75} />}
          title="Все още не сте коментирали"
          description="Споделете опит или мнение под жалби на други потребители."
        />
      ) : (
        <ProfileComplaintsList
          complaints={commented}
          title="Коментирани жалби"
          emptyMessage="Все още не сте коментирали жалба."
        />
      )}
    </ProfilePageShell>
  );
}
