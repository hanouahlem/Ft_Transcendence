import type {
  ConversationItem,
  ConversationMessage,
  NotificationItem,
} from "@/lib/api";

export const SOCKET_EVENTS = {
  INBOX_UNREAD_COUNTS: "inbox:unread-counts",
  MESSAGE_CREATED: "message:created",
  CONVERSATION_READ: "conversation:read",
  NOTIFICATION_CREATED: "notification:created",
  NOTIFICATION_READ: "notification:read",
} as const;

export type InboxUnreadCountsEvent = {
  unreadMessagesCount: number;
  unreadNotificationsCount: number;
};

export type MessageCreatedEvent = {
  conversation: ConversationItem;
  message: ConversationMessage;
};

export type ConversationReadEvent = {
  conversationId: number;
  unreadCount: number;
};

export type NotificationCreatedEvent = {
  notification: NotificationItem;
};

export type NotificationReadEvent = {
  notificationId: number;
};
