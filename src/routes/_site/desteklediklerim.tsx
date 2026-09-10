import { createFileRoute } from "@tanstack/react-router";
import { ThumbsUp } from "lucide-react";
import { ProfileComplaintsList } from "@/components/profile/profile-complaints-list";
import { ProfileEmptyState, ProfilePageShell } from "@/components/profile/profile-page-shell";
import { useProfileData } from "@/hooks/use-profile-data";
import { privateHead, SITE_NAME } from "@/lib/seo";

export const Route = createFileRoute("/_site/desteklediklerim")({
  head: () => privateHead(`Подкрепени жалби — ${SITE_NAME}`, "/desteklediklerim"),
  component: DesteklediklerimPage,
});

function DesteklediklerimPage() {
  const { loaded, supported, logout } = useProfileData();

  return (
    <ProfilePageShell active="supported" loading={!loaded} onSignOut={logout}>
      {supported.length === 0 ? (
        <ProfileEmptyState
          icon={<ThumbsUp className="size-12 text-white xl:size-16" strokeWidth={1.75} />}
          title="Все още не сте подкрепили жалба"
          description="Подкрепете жалби на други потребители, за да помогнете на общността."
        />
      ) : (
        <ProfileComplaintsList
          complaints={supported}
          title="Подкрепени жалби"
          emptyMessage="Все още не сте подкрепили жалба."
        />
      )}
    </ProfilePageShell>
  );
}
