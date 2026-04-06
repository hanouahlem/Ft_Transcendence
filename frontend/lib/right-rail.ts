export type RightRailSuggestion = {
  id: number;
  username: string;
  avatar?: string | null;
};

type SuggestionUser = RightRailSuggestion;

type FeedSuggestionsOptions = {
  allUsers: SuggestionUser[];
  currentUserId: number;
  connectedUserIds: number[];
  friendNetworks: SuggestionUser[][];
  limit?: number;
};

type ProfileSuggestionsOptions = {
  friends: SuggestionUser[];
  currentUserId?: number;
  connectedUserIds?: number[];
  includeConnected?: boolean;
  limit?: number;
};

export function buildFeedSuggestions({
  allUsers,
  currentUserId,
  connectedUserIds,
  friendNetworks,
  limit = 5,
}: FeedSuggestionsOptions): RightRailSuggestion[] {
  const connectedSet = new Set(connectedUserIds);
  const mutualCounts = new Map<number, number>();
  const candidates = new Map<number, SuggestionUser>();

  for (const network of friendNetworks) {
    const seenInNetwork = new Set<number>();

    for (const user of network) {
      if (user.id === currentUserId || connectedSet.has(user.id)) {
        continue;
      }

      if (seenInNetwork.has(user.id)) {
        continue;
      }

      seenInNetwork.add(user.id);
      candidates.set(user.id, user);
      mutualCounts.set(user.id, (mutualCounts.get(user.id) ?? 0) + 1);
    }
  }

  const rankedByMutuals = [...candidates.values()]
    .sort((left, right) => {
      const mutualDiff = (mutualCounts.get(right.id) ?? 0) - (mutualCounts.get(left.id) ?? 0);

      if (mutualDiff !== 0) {
        return mutualDiff;
      }

      return left.username.localeCompare(right.username);
    })
    .slice(0, limit);

  if (rankedByMutuals.length >= limit) {
    return rankedByMutuals;
  }

  const selectedIds = new Set(rankedByMutuals.map((user) => user.id));
  const fallbackUsers = allUsers
    .filter(
      (user) =>
        user.id !== currentUserId &&
        !connectedSet.has(user.id) &&
        !selectedIds.has(user.id),
    )
    .sort((left, right) => left.username.localeCompare(right.username))
    .slice(0, limit - rankedByMutuals.length);

  return [...rankedByMutuals, ...fallbackUsers];
}

export function buildProfileSuggestions({
  friends,
  currentUserId,
  connectedUserIds = [],
  includeConnected = false,
  limit = 5,
}: ProfileSuggestionsOptions): RightRailSuggestion[] {
  const connectedSet = new Set(connectedUserIds);

  return friends
    .filter((friend) => {
      if (currentUserId && friend.id === currentUserId) {
        return false;
      }

      if (!includeConnected && connectedSet.has(friend.id)) {
        return false;
      }

      return true;
    })
    .sort((left, right) => left.username.localeCompare(right.username))
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
