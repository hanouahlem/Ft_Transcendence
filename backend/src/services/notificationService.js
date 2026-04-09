import prisma from "../prisma.js";

export const NOTIFICATION_TYPES = Object.freeze({
  FOLLOW: "FOLLOW",
  UNFOLLOW: "UNFOLLOW",
  FOLLOW_ACCEPT: "FOLLOW_ACCEPT",
  LIKE: "LIKE",
  COMMENT: "COMMENT",
  MENTION: "MENTION",
  MESSAGE: "MESSAGE",
});

const VALID_NOTIFICATION_TYPES = new Set(Object.values(NOTIFICATION_TYPES));

export const notificationInclude = {
  actor: {
    select: {
      id: true,
      username: true,
      avatar: true,
    },
  },
  post: {
    select: {
      id: true,
    },
  },
};

export function isValidNotificationType(type) {
  return VALID_NOTIFICATION_TYPES.has(type);
}

function buildNotificationContent(notification) {
  const actorName = notification.actor?.username ?? "Someone";

  switch (notification.type) {
    case NOTIFICATION_TYPES.FOLLOW:
      return `${actorName} sent you a friend request.`;
    case NOTIFICATION_TYPES.UNFOLLOW:
      return `${actorName} removed you from friends.`;
    case NOTIFICATION_TYPES.FOLLOW_ACCEPT:
      return `${actorName} accepted your friend request.`;
    case NOTIFICATION_TYPES.LIKE:
      return `${actorName} liked your post.`;
    case NOTIFICATION_TYPES.COMMENT:
      return `${actorName} commented on your post.`;
    case NOTIFICATION_TYPES.MENTION:
      return `${actorName} mentioned you in a post.`;
    case NOTIFICATION_TYPES.MESSAGE:
      if (notification.actorId === notification.userId) {
        return "You have a new message.";
      }

      return `${actorName} sent you a message.`;
    default:
      return "You have a new notification.";
  }
}

export function serializeNotification(notification) {
  return {
    ...notification,
    content: buildNotificationContent(notification),
    postId: notification.postId ?? notification.post?.id ?? null,
  };
}

export async function createNotification({ userId, actorId, type, postId = null }) {
  return prisma.notification.create({
    data: {
      userId,
      actorId,
      type,
      postId,
    },
    include: notificationInclude,
  });
}
