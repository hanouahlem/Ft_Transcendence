import { ProfileView } from "@/components/profile/ProfileView";

type ProfileRouteProps = {
  params: Promise<{ username: string }>;
};

export default async function UserProfilePage({ params }: ProfileRouteProps) {
  const { username } = await params;
  return <ProfileView profileUsername={username} />;
}
