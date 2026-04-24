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

type NotificationTranslate = (
  key: string,
  params?: Record<string, string | number>,
) => string;

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

export function formatNotificationTime(dateString: string, locale = "en") {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const diffInSeconds = Math.floor((date.getTime() - Date.now()) / 1000);
  const absDiff = Math.abs(diffInSeconds);
  const relativeFormatter = new Intl.RelativeTimeFormat(locale, {
    numeric: "auto",
    style: "short",
  });

  if (absDiff < 60) {
    return relativeFormatter.format(Math.round(diffInSeconds), "second");
  }

  if (absDiff < 3600) {
    return relativeFormatter.format(Math.round(diffInSeconds / 60), "minute");
  }

  if (absDiff < 86400) {
    return relativeFormatter.format(Math.round(diffInSeconds / 3600), "hour");
  }

  if (absDiff < 172800) {
    return relativeFormatter.format(Math.round(diffInSeconds / 86400), "day");
  }

  return new Intl.DateTimeFormat(locale, {
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
    case "FAVORITE":
    case "COMMENT":
    case "COMMENT_LIKE":
    case "COMMENT_FAVORITE":
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
    case "FAVORITE":
    case "COMMENT":
    case "COMMENT_LIKE":
    case "COMMENT_FAVORITE":
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
  t?: NotificationTranslate,
): NotificationCopy {
  switch (notification.type) {
    case "FOLLOW":
      return {
        eyebrow: t ? t("notifications.copy.follow.eyebrow") : "Friend Request",
        body: t ? t("notifications.copy.follow.body") : "Sent you a friend request.",
        helper: t
          ? t("notifications.copy.follow.helper")
          : "This notice opens their public profile record.",
        actionLabel: t ? t("notifications.copy.follow.actionLabel") : "Visit profile",
      };
    case "FOLLOW_ACCEPT":
      return {
        eyebrow: t ? t("notifications.copy.followAccept.eyebrow") : "Accepted request",
        body: t ? t("notifications.copy.followAccept.body") : "Accepted your friend request.",
        helper: t
          ? t("notifications.copy.followAccept.helper")
          : "This notice opens the newly connected profile.",
        actionLabel: t ? t("notifications.copy.followAccept.actionLabel") : "Open profile",
      };
    case "UNFOLLOW":
      return {
        eyebrow: t ? t("notifications.copy.unfollow.eyebrow") : "Field distance",
        body: t ? t("notifications.copy.unfollow.body") : "Removed you from their friends list.",
        helper: t
          ? t("notifications.copy.unfollow.helper")
          : "You can still review their profile record if needed.",
        actionLabel: t ? t("notifications.copy.unfollow.actionLabel") : "Review profile",
      };
    case "LIKE":
      return {
        eyebrow: t ? t("notifications.copy.like.eyebrow") : "Like",
        body: t ? t("notifications.copy.like.body") : "Liked your post:",
        helper: t
          ? t("notifications.copy.like.helper")
          : "This notice links directly to the referenced post dialog.",
        actionLabel: t ? t("notifications.copy.like.actionLabel") : "Open entry",
        quote: truncateNotificationPost(notification.post?.content),
        inlineQuote: true,
      };
    case "FAVORITE":
      return {
        eyebrow: "Favorite",
        body: "Favorited your post:",
        helper: "This notice links directly to the referenced post dialog.",
        actionLabel: "Open entry",
        quote: truncateNotificationPost(notification.post?.content),
        inlineQuote: true,
      };
    case "COMMENT_LIKE":
      return {
        eyebrow: "Comment like",
        body: "Liked your comment.",
        helper: "Open the post to inspect the conversation.",
        actionLabel: "Open comment thread",
      };
    case "COMMENT_FAVORITE":
      return {
        eyebrow: "Comment favorite",
        body: "Favorited your comment.",
        helper: "Open the post to inspect the conversation.",
        actionLabel: "Open comment thread",
      };
    case "COMMENT":
      return {
        eyebrow: t ? t("notifications.copy.comment.eyebrow") : "Comment",
        body: t ? t("notifications.copy.comment.body") : "Commented on your post.",
        helper: t
          ? t("notifications.copy.comment.helper")
          : "Open the linked record to inspect the conversation.",
        actionLabel: t ? t("notifications.copy.comment.actionLabel") : "Open comment thread",
      };
    case "MENTION":
      return {
        eyebrow: t ? t("notifications.copy.mention.eyebrow") : "Ink mention",
        body: t ? t("notifications.copy.mention.body") : "Mentioned you in a post.",
        helper: t
          ? t("notifications.copy.mention.helper")
          : "This notice links to the referenced post on their profile.",
        actionLabel: t ? t("notifications.copy.mention.actionLabel") : "Open mention",
        quote: truncateNotificationPost(notification.post?.content),
      };
    case "MESSAGE":
      return {
        eyebrow: t ? t("notifications.copy.message.eyebrow") : "Message",
        body: t ? t("notifications.copy.message.body") : "Sent you a message.",
        helper: t
          ? t("notifications.copy.message.helper")
          : "Direct messaging is not wired here yet, so this opens the sender profile.",
        actionLabel: t ? t("notifications.copy.message.actionLabel") : "Open sender profile",
      };
    default:
      return {
        eyebrow: t ? t("notifications.copy.default.eyebrow") : "Archive update",
        body: t
          ? t("notifications.copy.default.body")
          : "triggered a notification event in your record.",
        helper: t
          ? t("notifications.copy.default.helper")
          : "Open the related profile to inspect the activity.",
        actionLabel: t ? t("notifications.copy.default.actionLabel") : "Open record",
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

  return notifications.flatMap<NotificationLedgerItem>(
    (notification): NotificationLedgerItem[] => {
      if (notification.type !== "LIKE" || notification.postId === null) {
        return [
          {
            kind: "single" as const,
            id: `notification-${notification.id}`,
            notification,
          },
        ];
      }

      const groupedNotifications =
        likeNotificationsByPostId.get(notification.postId) ?? [];

      if (groupedNotifications.length <= 3) {
        return [
          {
            kind: "single" as const,
            id: `notification-${notification.id}`,
            notification,
          },
        ];
      }

      if (emittedLikeGroups.has(notification.postId)) {
        return [];
      }

      emittedLikeGroups.add(notification.postId);

      return [
        {
          kind: "like-group" as const,
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
        },
      ];
    },
  );
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
