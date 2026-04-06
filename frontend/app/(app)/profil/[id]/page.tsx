import { notFound } from "next/navigation";
import { ProfileView } from "@/components/profile/ProfileView";

type ProfileRouteProps = {
  params: Promise<{ id: string }>;
};

export default async function UserProfilePage({ params }: ProfileRouteProps) {
  const { id } = await params;
  const profileId = Number(id);

  if (!Number.isInteger(profileId) || profileId < 1) {
    notFound();
  }

  return <ProfileView profileId={profileId} />;
}
