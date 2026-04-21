import type { NotificationItem, NotificationType } from "@/lib/api";

export type NotificationCategory = "social" | "post" | "message";

export type NotificationFilterState = {
  social: boolean;
  post: boolean;
  message: boolean;
};

type NotificationCopy = {
  eyebrow: string;
  body: string;
  helper: string;
  actionLabel: string;
  quote?: string | null;
  inlineQuote?: boolean;
};

export type SingleNotificationLedgerItem = {
  kind: "single";
  id: string;
  notification: NotificationItem;
};

export type LikeNotificationGroupLedgerItem = {
  kind: "like-group";
  id: string;
  notifications: NotificationItem[];
  latestNotification: NotificationItem;
  actors: NotificationItem["actor"][];
  likeCount: number;
  unread: boolean;
  createdAt: string;
  postId: number;
};

export type NotificationLedgerItem =
  | SingleNotificationLedgerItem
  | LikeNotificationGroupLedgerItem;

function truncateNotificationPost(content?: string | null, maxLength = 56) {
  const normalized = content?.trim().replace(/\s+/g, " ") || "";

  if (!normalized) {
    return "Untitled archive entry";
  }

  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, maxLength).trimEnd()}...`;
}

export function formatNotificationTime(dateString: string) {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return "Just now";
  }

  if (diffInSeconds < 3600) {
    return `${Math.floor(diffInSeconds / 60)}m ago`;
  }

  if (diffInSeconds < 86400) {
    return `${Math.floor(diffInSeconds / 3600)}h ago`;
  }

  if (diffInSeconds < 172800) {
    return "Yesterday";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(date);
}

export function getNotificationCategory(
  type: NotificationType | string,
): NotificationCategory {
  switch (type) {
    case "FOLLOW":
    case "FOLLOW_ACCEPT":
    case "UNFOLLOW":
      return "social";
    case "LIKE":
    case "COMMENT":
    case "MENTION":
      return "post";
    default:
      return "message";
  }
}

export function matchesNotificationFilters(
  notification: NotificationItem,
  filters: NotificationFilterState,
) {
  const category = getNotificationCategory(notification.type);
  return filters[category];
}

export function getNotificationHref(notification: NotificationItem) {
  const actorUsername = encodeURIComponent(notification.actor.username);
  const actorProfileHref = `/profile/${actorUsername}`;

  switch (notification.type) {
    case "LIKE":
    case "COMMENT":
      return notification.postId ? `/profile?post=${notification.postId}` : "/profile";
    case "MENTION":
      return notification.postId
        ? `${actorProfileHref}?post=${notification.postId}`
        : actorProfileHref;
    default:
      return actorProfileHref;
  }
}

export function getNotificationCopy(
  notification: NotificationItem,
): NotificationCopy {
  switch (notification.type) {
    case "FOLLOW":
      return {
        eyebrow: "Friend Request",
        body: "Sent you a friend request.",
        helper: "This notice opens their public profile record.",
        actionLabel: "Visit profile",
      };
    case "FOLLOW_ACCEPT":
      return {
        eyebrow: "Accepted request",
        body: "Accepted your friend request.",
        helper: "This notice opens the newly connected profile.",
        actionLabel: "Open profile",
      };
    case "UNFOLLOW":
      return {
        eyebrow: "Field distance",
        body: "Removed you from their friends list.",
        helper: "You can still review their profile record if needed.",
        actionLabel: "Review profile",
      };
    case "LIKE":
      return {
        eyebrow: "Like",
        body: "Liked your post:",
        helper: "This notice links directly to the referenced post dialog.",
        actionLabel: "Open entry",
        quote: truncateNotificationPost(notification.post?.content),
        inlineQuote: true,
      };
    case "COMMENT":
      return {
        eyebrow: "Comment",
        body: "Commented on your post.",
        helper: "Open the linked record to inspect the conversation.",
        actionLabel: "Open comment thread",
      };
    case "MENTION":
      return {
        eyebrow: "Ink mention",
        body: "Mentioned you in a post.",
        helper: "This notice links to the referenced post on their profile.",
        actionLabel: "Open mention",
        quote: truncateNotificationPost(notification.post?.content),
      };
    case "MESSAGE":
      return {
        eyebrow: "Message",
        body: "Sent you a message.",
        helper: "Direct messaging is not wired here yet, so this opens the sender profile.",
        actionLabel: "Open sender profile",
      };
    default:
      return {
        eyebrow: "Archive update",
        body: "triggered a notification event in your record.",
        helper: "Open the related profile to inspect the activity.",
        actionLabel: "Open record",
      };
  }
}

export function getNotificationSearchText(notification: NotificationItem) {
  const copy = getNotificationCopy(notification);
  return [
    notification.actor.displayName,
    notification.actor.username,
    notification.type,
    copy.eyebrow,
    copy.body,
    copy.helper,
  ]
    .join(" ")
    .toLowerCase();
}

function getUniqueActors(notifications: NotificationItem[]) {
  const actors = new Map<number, NotificationItem["actor"]>();

  for (const notification of notifications) {
    if (!actors.has(notification.actor.id)) {
      actors.set(notification.actor.id, notification.actor);
    }
  }

  return Array.from(actors.values());
}

export function buildNotificationLedgerItems(
  notifications: NotificationItem[],
): NotificationLedgerItem[] {
  const likeNotificationsByPostId = new Map<number, NotificationItem[]>();
  const ledgerItems: NotificationLedgerItem[] = [];

  for (const notification of notifications) {
    if (notification.type !== "LIKE" || notification.postId === null) {
      continue;
    }

    const current = likeNotificationsByPostId.get(notification.postId) ?? [];
    current.push(notification);
    likeNotificationsByPostId.set(notification.postId, current);
  }

  const emittedLikeGroups = new Set<number>();

  for (const notification of notifications) {
    if (notification.type !== "LIKE" || notification.postId === null) {
      ledgerItems.push({
        kind: "single",
        id: `notification-${notification.id}`,
        notification,
      });
      continue;
    }

    const groupedNotifications =
      likeNotificationsByPostId.get(notification.postId) ?? [];

    if (groupedNotifications.length <= 3) {
      ledgerItems.push({
        kind: "single",
        id: `notification-${notification.id}`,
        notification,
      });
      continue;
    }

    if (emittedLikeGroups.has(notification.postId)) {
      continue;
    }

    emittedLikeGroups.add(notification.postId);

    ledgerItems.push({
      kind: "like-group",
      id: `like-group-${notification.postId}`,
      notifications: groupedNotifications,
      latestNotification: groupedNotifications[0],
      actors: getUniqueActors(groupedNotifications),
      likeCount: groupedNotifications.length,
      unread: groupedNotifications.some(
        (groupedNotification) => !groupedNotification.read,
      ),
      createdAt: groupedNotifications[0].createdAt,
      postId: notification.postId,
    });
  }

  return ledgerItems;
}

export function matchesNotificationLedgerFilters(
  item: NotificationLedgerItem,
  filters: NotificationFilterState,
) {
  if (item.kind === "like-group") {
    return filters.post;
  }

  return matchesNotificationFilters(item.notification, filters);
}

export function getNotificationLedgerSearchText(item: NotificationLedgerItem) {
  if (item.kind === "single") {
    return getNotificationSearchText(item.notification);
  }

  const primaryActor =
    item.actors[0]?.displayName?.trim() || item.actors[0]?.username || "Someone";
  const otherCount = Math.max(0, item.likeCount - 1);
  const postPreview = truncateNotificationPost(item.latestNotification.post?.content);

  return [
    primaryActor,
    ...item.actors.map((actor) => actor.displayName),
    ...item.actors.map((actor) => actor.username),
    "recent activity",
    "liked your post",
    postPreview,
    otherCount > 0 ? `${otherCount} others` : null,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}
