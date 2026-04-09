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

export function serializeNotification(notification) {
  return {
    ...notification,
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

export async function createNotificationIfRelevant({
  userId,
  actorId,
  type,
  postId = null,
}) {
  const recipientId = Number(userId);
  const resolvedActorId = Number(actorId);

  if (
    Number.isNaN(recipientId) ||
    Number.isNaN(resolvedActorId) ||
    recipientId < 1 ||
    resolvedActorId < 1 ||
    recipientId === resolvedActorId
  ) {
    return null;
  }

  return createNotification({
    userId: recipientId,
    actorId: resolvedActorId,
    type,
    postId,
  });
}
