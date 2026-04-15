export type RightRailSuggestion = {
  id: number;
  username: string;
  displayName?: string | null;
  avatar?: string | null;
};

type SuggestionUser = RightRailSuggestion;

type ProfileSuggestionsOptions = {
  friends: SuggestionUser[];
  currentUserId?: number;
  connectedUserIds?: number[];
  includeConnected?: boolean;
  limit?: number;
};

export function buildProfileSuggestions({
  friends,
  currentUserId,
  connectedUserIds = [],
  includeConnected = false,
  limit = 5,
}: ProfileSuggestionsOptions): RightRailSuggestion[] {
  const connectedSet = new Set(connectedUserIds);

  return friends
    .filter(
      (friend) => !(currentUserId && friend.id === currentUserId),
    )
    .sort((left, right) => {
      if (!includeConnected) {
        const leftConnected = connectedSet.has(left.id);
        const rightConnected = connectedSet.has(right.id);

        if (leftConnected !== rightConnected) {
          return leftConnected ? 1 : -1;
        }
      }

      return left.username.localeCompare(right.username);
    })
    .slice(0, limit);
}

export function getRightRailTitle(options: {
  isOwnProfile?: boolean;
  profileUsername?: string | null;
}): string {
  if (options.isOwnProfile) {
    return "My Friends";
  }

  if (options.profileUsername) {
    return `${toPossessive(options.profileUsername)} Friends`;
  }

  return "You Might Know";
}

function toPossessive(value: string) {
  if (!value) {
    return "Observer's";
  }

  return value.endsWith("s") ? `${value}'` : `${value}'s`;
}
