import prisma from "../prisma.js";
import { getSocketServer, getUserRoomName } from "../socket.js";
import { SOCKET_EVENTS } from "../socketEvents.js";

function buildUnreadMessagesWhere({ conversationId, userId, lastReadMessageId }) {
  const where = {
    conversationId,
    senderId: {
      not: userId,
    },
  };

  if (typeof lastReadMessageId === "number") {
    where.id = { gt: lastReadMessageId };
  }

  return where;
}

export async function getUnreadMessagesCount(userId) {
  const resolvedUserId = Number(userId);

  if (!Number.isInteger(resolvedUserId) || resolvedUserId < 1) {
    return 0;
  }

  const memberships = await prisma.conversationMember.findMany({
    where: {
      userId: resolvedUserId,
    },
    select: {
      conversationId: true,
      lastReadMessageId: true,
    },
  });

  const unreadCounts = await Promise.all(
    memberships.map((membership) =>
      prisma.message.count({
        where: buildUnreadMessagesWhere({
          conversationId: membership.conversationId,
          userId: resolvedUserId,
          lastReadMessageId: membership.lastReadMessageId,
        }),
      }),
    ),
  );

  return unreadCounts.reduce((total, count) => total + count, 0);
}

export async function getUnreadNotificationsCount(userId) {
  const resolvedUserId = Number(userId);

  if (!Number.isInteger(resolvedUserId) || resolvedUserId < 1) {
    return 0;
  }

  return prisma.notification.count({
    where: {
      userId: resolvedUserId,
      read: false,
    },
  });
}

export async function getInboxUnreadCounts(userId) {
  const resolvedUserId = Number(userId);

  if (!Number.isInteger(resolvedUserId) || resolvedUserId < 1) {
    return {
      unreadMessagesCount: 0,
      unreadNotificationsCount: 0,
    };
  }

  const [unreadMessagesCount, unreadNotificationsCount] = await Promise.all([
    getUnreadMessagesCount(resolvedUserId),
    getUnreadNotificationsCount(resolvedUserId),
  ]);

  return {
    unreadMessagesCount,
    unreadNotificationsCount,
  };
}

export async function emitInboxUnreadCounts(userId) {
  const resolvedUserId = Number(userId);

  if (!Number.isInteger(resolvedUserId) || resolvedUserId < 1) {
    return;
  }

  try {
    const counts = await getInboxUnreadCounts(resolvedUserId);

    getSocketServer()
      .to(getUserRoomName(resolvedUserId))
      .emit(SOCKET_EVENTS.INBOX_UNREAD_COUNTS, counts);
  } catch (error) {
    console.error("emitInboxUnreadCounts error:", error);
  }
}
