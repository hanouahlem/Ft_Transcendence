import prisma from "../prisma.js";
import { getSocketServer, getUserRoomName } from "../socket.js";
import { SOCKET_EVENTS } from "../socketEvents.js";
import { emitInboxUnreadCounts } from "./inboxService.js";

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
      displayName: true,
      avatar: true,
    },
  },
  post: {
    select: {
      id: true,
      content: true,
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
  const notification = await prisma.notification.create({
    data: {
      userId,
      actorId,
      type,
      postId,
    },
    include: notificationInclude,
  });

  try {
    getSocketServer()
      .to(getUserRoomName(userId))
      .emit(SOCKET_EVENTS.NOTIFICATION_CREATED, {
        notification: serializeNotification(notification),
      });

    await emitInboxUnreadCounts(userId);
  } catch (error) {
    console.error("createNotification socket emit error:", error);
  }

  return notification;
}

export function emitNotificationRead({ userId, notificationId }) {
  const resolvedUserId = Number(userId);
  const resolvedNotificationId = Number(notificationId);

  if (
    !Number.isInteger(resolvedUserId) ||
    resolvedUserId < 1 ||
    !Number.isInteger(resolvedNotificationId) ||
    resolvedNotificationId < 1
  ) {
    return;
  }

  try {
    getSocketServer()
      .to(getUserRoomName(resolvedUserId))
      .emit(SOCKET_EVENTS.NOTIFICATION_READ, {
        notificationId: resolvedNotificationId,
      });
  } catch (error) {
    console.error("emitNotificationRead error:", error);
  }
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
