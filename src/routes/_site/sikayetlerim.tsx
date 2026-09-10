import { createFileRoute } from "@tanstack/react-router";
import { Pencil, Plus } from "lucide-react";
import { ProfileComplaintsList } from "@/components/profile/profile-complaints-list";
import { ProfileEmptyState, ProfilePageShell } from "@/components/profile/profile-page-shell";
import { useProfileData } from "@/hooks/use-profile-data";
import { privateHead, SITE_NAME } from "@/lib/seo";

export const Route = createFileRoute("/_site/sikayetlerim")({
  head: () => privateHead(`Моите жалби — ${SITE_NAME}`, "/sikayetlerim"),
  component: SikayetlerimPage,
});

function SikayetlerimPage() {
  const { loaded, complaints, logout } = useProfileData();

  return (
    <ProfilePageShell active="complaints" loading={!loaded} onSignOut={logout}>
      {complaints.length === 0 ? (
        <ProfileEmptyState
          icon={<Pencil className="size-12 text-white xl:size-16" strokeWidth={1.75} />}
          title="Все още нямате жалби"
          description="Създайте жалба, за да бъде чут гласът ви и да търсите решение."
          actionLabel={
            <>
              <Plus className="size-5" aria-hidden />
              Напиши жалба
            </>
          }
          actionTo="/sikayet-yaz"
        />
      ) : (
        <ProfileComplaintsList
          complaints={complaints}
          title="Моите жалби"
          emptyMessage="Все още нямате жалби."
          showWriteLink
        />
      )}
    </ProfilePageShell>
  );
}
