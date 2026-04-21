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
}, labels?: {
  myFriends: string;
  youMightKnow: string;
  friendsSuffix: string;
}): string {
  const resolvedLabels = labels ?? {
    myFriends: "My Friends",
    youMightKnow: "You Might Know",
    friendsSuffix: "Friends",
  };

  if (options.isOwnProfile) {
    return resolvedLabels.myFriends;
  }

  if (options.profileUsername) {
    return `${toPossessive(options.profileUsername)} ${resolvedLabels.friendsSuffix}`;
  }

  return resolvedLabels.youMightKnow;
}

function toPossessive(value: string) {
  if (!value) {
    return "Observer's";
  }

  return value.endsWith("s") ? `${value}'` : `${value}'s`;
}
