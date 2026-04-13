export type UserPreviewIdentity = {
  id: number;
  username: string;
  displayName?: string | null;
  avatar?: string | null;
  banner?: string | null;
  bio?: string | null;
  status?: string | null;
  location?: string | null;
  createdAt?: string;
  friendCount?: number;
  postCount?: number;
  totalLikes?: number;
  totalComments?: number;
};

export function buildProfileHref(username: string) {
  return `/profile/${encodeURIComponent(username)}`;
}

export function getUserPreviewDisplayName(user: UserPreviewIdentity) {
  return user.displayName?.trim() || user.username;
}

export function getUserPreviewBio(user: UserPreviewIdentity) {
  return (
    user.bio?.trim() ||
    user.status?.trim() ||
    "Field observer contributing fresh records to the archive."
  );
}

export function formatUserPreviewCompactCount(value: number) {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export function formatUserPreviewJoinedDate(dateString?: string) {
  if (!dateString) {
    return "Recently";
  }

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "Recently";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
  }).format(date);
}
