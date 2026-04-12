import prisma from "../prisma.js";
import { getSocketServer, getUserRoomName } from "../socket.js";
import { SOCKET_EVENTS } from "../socketEvents.js";
import {
  createNotificationIfRelevant,
  NOTIFICATION_TYPES,
} from "../services/notificationService.js";
import { emitInboxUnreadCounts } from "../services/inboxService.js";

const messageSenderSelect = {
  id: true,
  username: true,
  displayName: true,
  avatar: true,
};

function toInt(value) {
  const parsedValue = Number.parseInt(String(value), 10);
  return Number.isNaN(parsedValue) ? null : parsedValue;
}

function buildDirectKey(firstUserId, secondUserId) {
  const sortedIds = [firstUserId, secondUserId].sort((left, right) => left - right);
  return `${sortedIds[0]}:${sortedIds[1]}`;
}

function serializeMessage(message) {
  return {
    id: message.id,
    conversationId: message.conversationId,
    senderId: message.senderId,
    content: message.content,
    createdAt: message.createdAt,
    sender: message.sender,
  };
}

function serializeConversation({ conversation, currentUserId, unreadCount }) {
  const peerMember = conversation.members.find((member) => member.userId !== currentUserId);
  const lastMessage = conversation.messages[0] ?? null;

  return {
    id: conversation.id,
    createdAt: conversation.createdAt,
    updatedAt: conversation.updatedAt,
    lastMessageAt: conversation.lastMessageAt,
    unreadCount,
    peer: peerMember ? peerMember.user : null,
    lastMessage: lastMessage ? serializeMessage(lastMessage) : null,
  };
}

async function getUnreadCount({ conversationId, currentUserId, lastReadMessageId }) {
  const where = {
    conversationId,
    senderId: { not: currentUserId },
  };

  if (typeof lastReadMessageId === "number") {
    where.id = { gt: lastReadMessageId };
  }

  return prisma.message.count({ where });
}

async function getConversationOrNull(conversationId, currentUserId) {
  const conversation = await prisma.conversation.findFirst({
    where: {
      id: conversationId,
      members: {
        some: {
          userId: currentUserId,
        },
      },
    },
    include: {
      members: {
        select: {
          userId: true,
          lastReadMessageId: true,
          user: {
            select: messageSenderSelect,
          },
        },
      },
      messages: {
        take: 1,
        orderBy: { id: "desc" },
        include: {
          sender: {
            select: messageSenderSelect,
          },
        },
      },
    },
  });

  return conversation;
}

async function getSerializedConversationForUser(conversationId, currentUserId) {
  const conversation = await getConversationOrNull(conversationId, currentUserId);

  if (!conversation) {
    return null;
  }

  const currentMember = conversation.members.find((member) => member.userId === currentUserId);
  const unreadCount = await getUnreadCount({
    conversationId,
    currentUserId,
    lastReadMessageId: currentMember?.lastReadMessageId ?? null,
  });

  return serializeConversation({
    conversation,
    currentUserId,
    unreadCount,
  });
}

async function emitMessageCreated({ conversationId, message, participantUserIds }) {
  try {
    const serializedMessage = serializeMessage(message);
    const socketServer = getSocketServer();

    await Promise.all(
      participantUserIds.map(async (userId) => {
        const conversation = await getSerializedConversationForUser(conversationId, userId);

        if (!conversation) {
          return;
        }

        socketServer.to(getUserRoomName(userId)).emit(SOCKET_EVENTS.MESSAGE_CREATED, {
          conversation,
          message: serializedMessage,
        });
      }),
    );
  } catch (error) {
    console.error("emitMessageCreated error:", error);
  }
}

function emitConversationRead({ conversationId, userId, unreadCount }) {
  try {
    getSocketServer()
      .to(getUserRoomName(userId))
      .emit(SOCKET_EVENTS.CONVERSATION_READ, {
        conversationId,
        unreadCount,
      });
  } catch (error) {
    console.error("emitConversationRead error:", error);
  }
}

export async function createDirectConversation(req, res) {
  try {
    const currentUserId = req.user.id;
    const targetUserId = toInt(req.body?.targetUserId);

    if (!targetUserId || targetUserId < 1) {
      return res.status(400).json({ message: "targetUserId must be a positive number." });
    }

    if (targetUserId === currentUserId) {
      return res.status(400).json({ message: "You cannot create a conversation with yourself." });
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { id: true },
    });

    if (!targetUser) {
      return res.status(404).json({ message: "Target user not found." });
    }

    const directKey = buildDirectKey(currentUserId, targetUserId);

    const conversation = await prisma.conversation.upsert({
      where: { directKey },
      update: {},
      create: {
        directKey,
        members: {
          create: [{ userId: currentUserId }, { userId: targetUserId }],
        },
      },
      include: {
        members: {
          select: {
            userId: true,
            lastReadMessageId: true,
            user: {
              select: messageSenderSelect,
            },
          },
        },
        messages: {
          take: 1,
          orderBy: { id: "desc" },
          include: {
            sender: {
              select: messageSenderSelect,
            },
          },
        },
      },
    });

    const currentMember = conversation.members.find((member) => member.userId === currentUserId);
    const unreadCount = await getUnreadCount({
      conversationId: conversation.id,
      currentUserId,
      lastReadMessageId: currentMember?.lastReadMessageId ?? null,
    });

    return res.status(200).json({
      conversation: serializeConversation({
        conversation,
        currentUserId,
        unreadCount,
      }),
    });
  } catch (error) {
    console.error("createDirectConversation error:", error);
    return res.status(500).json({ message: "Failed to create conversation." });
  }
}

export async function getConversations(req, res) {
  try {
    const currentUserId = req.user.id;

    const conversations = await prisma.conversation.findMany({
      where: {
        members: {
          some: { userId: currentUserId },
        },
      },
      include: {
        members: {
          select: {
            userId: true,
            lastReadMessageId: true,
            user: {
              select: messageSenderSelect,
            },
          },
        },
        messages: {
          take: 1,
          orderBy: { id: "desc" },
          include: {
            sender: {
              select: messageSenderSelect,
            },
          },
        },
      },
      orderBy: [{ lastMessageAt: "desc" }, { id: "desc" }],
    });

    const serializedConversations = await Promise.all(
      conversations.map(async (conversation) => {
        const currentMember = conversation.members.find(
          (member) => member.userId === currentUserId,
        );

        const unreadCount = await getUnreadCount({
          conversationId: conversation.id,
          currentUserId,
          lastReadMessageId: currentMember?.lastReadMessageId ?? null,
        });

        return serializeConversation({
          conversation,
          currentUserId,
          unreadCount,
        });
      }),
    );

    return res.status(200).json({ conversations: serializedConversations });
  } catch (error) {
    console.error("getConversations error:", error);
    return res.status(500).json({ message: "Failed to fetch conversations." });
  }
}

export async function getConversationMessages(req, res) {
  try {
    const currentUserId = req.user.id;
    const conversationId = toInt(req.params.id);

    if (!conversationId || conversationId < 1) {
      return res.status(400).json({ message: "Invalid conversation id." });
    }

    const membership = await prisma.conversationMember.findUnique({
      where: {
        conversationId_userId: {
          conversationId,
          userId: currentUserId,
        },
      },
      select: { id: true },
    });

    if (!membership) {
      return res.status(404).json({ message: "Conversation not found." });
    }

    const messages = await prisma.message.findMany({
      where: { conversationId },
      include: {
        sender: {
          select: messageSenderSelect,
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return res.status(200).json({
      messages: messages.map((message) => serializeMessage(message)),
    });
  } catch (error) {
    console.error("getConversationMessages error:", error);
    return res.status(500).json({ message: "Failed to fetch messages." });
  }
}

export async function sendMessage(req, res) {
  try {
    const currentUserId = req.user.id;
    const conversationId = toInt(req.params.id);
    const content =
      typeof req.body?.content === "string" ? req.body.content.trim() : "";

    if (!conversationId || conversationId < 1) {
      return res.status(400).json({ message: "Invalid conversation id." });
    }

    if (!content) {
      return res.status(400).json({ message: "Message content is required." });
    }

    if (content.length > 1000) {
      return res.status(400).json({ message: "Message content is too long (max 1000 characters)." });
    }

    const membership = await prisma.conversationMember.findUnique({
      where: {
        conversationId_userId: {
          conversationId,
          userId: currentUserId,
        },
      },
      select: { id: true },
    });

    if (!membership) {
      return res.status(404).json({ message: "Conversation not found." });
    }

    const message = await prisma.$transaction(async (transaction) => {
      const createdMessage = await transaction.message.create({
        data: {
          conversationId,
          senderId: currentUserId,
          content,
        },
        include: {
          sender: {
            select: messageSenderSelect,
          },
        },
      });

      await transaction.conversation.update({
        where: { id: conversationId },
        data: {
          lastMessageAt: createdMessage.createdAt,
        },
      });

      await transaction.conversationMember.update({
        where: {
          conversationId_userId: {
            conversationId,
            userId: currentUserId,
          },
        },
        data: {
          lastReadMessageId: createdMessage.id,
        },
      });

      return createdMessage;
    });

    const recipients = await prisma.conversationMember.findMany({
      where: {
        conversationId,
        userId: {
          not: currentUserId,
        },
      },
      select: {
        userId: true,
      },
    });

    const participantUserIds = [currentUserId, ...recipients.map((recipient) => recipient.userId)];

    await Promise.all(
      recipients.map((recipient) =>
        createNotificationIfRelevant({
          userId: recipient.userId,
          actorId: currentUserId,
          type: NOTIFICATION_TYPES.MESSAGE,
        }),
      ),
    );

    await emitMessageCreated({
      conversationId,
      message,
      participantUserIds,
    });

    return res.status(201).json({
      message: serializeMessage(message),
    });
  } catch (error) {
    console.error("sendMessage error:", error);
    return res.status(500).json({ message: "Failed to send message." });
  }
}

export async function markConversationAsRead(req, res) {
  try {
    const currentUserId = req.user.id;
    const conversationId = toInt(req.params.id);

    if (!conversationId || conversationId < 1) {
      return res.status(400).json({ message: "Invalid conversation id." });
    }

    const membership = await prisma.conversationMember.findUnique({
      where: {
        conversationId_userId: {
          conversationId,
          userId: currentUserId,
        },
      },
      select: {
        id: true,
      },
    });

    if (!membership) {
      return res.status(404).json({ message: "Conversation not found." });
    }

    const latestMessage = await prisma.message.findFirst({
      where: { conversationId },
      orderBy: { id: "desc" },
      select: { id: true },
    });

    const updatedMembership = await prisma.conversationMember.update({
      where: {
        conversationId_userId: {
          conversationId,
          userId: currentUserId,
        },
      },
      data: {
        lastReadMessageId: latestMessage?.id ?? null,
      },
      select: {
        conversationId: true,
        lastReadMessageId: true,
      },
    });

    emitConversationRead({
      conversationId: updatedMembership.conversationId,
      userId: currentUserId,
      unreadCount: 0,
    });
    await emitInboxUnreadCounts(currentUserId);

    return res.status(200).json({
      read: {
        conversationId: updatedMembership.conversationId,
        lastReadMessageId: updatedMembership.lastReadMessageId,
        unreadCount: 0,
      },
    });
  } catch (error) {
    console.error("markConversationAsRead error:", error);
    return res.status(500).json({ message: "Failed to update read status." });
  }
}

export default {
  createDirectConversation,
  getConversations,
  getConversationMessages,
  sendMessage,
  markConversationAsRead,
};
