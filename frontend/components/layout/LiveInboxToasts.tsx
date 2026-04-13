"use client";

import { useEffect, useEffectEvent } from "react";
import { usePathname } from "next/navigation";
import { archiveToaster } from "@/components/ui/toaster";
import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/context/SocketContext";
import {
  SOCKET_EVENTS,
  type MessageCreatedEvent,
  type NotificationCreatedEvent,
} from "@/lib/socket-events";

function getDisplayName(value?: string | null, fallback?: string | null) {
  const normalizedValue = value?.trim();

  if (normalizedValue) {
    return normalizedValue;
  }

  return fallback?.trim() || "Someone";
}

export function LiveInboxToasts() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { socket } = useSocket();
  const isMessagePage = pathname === "/message";
  const isNotificationsPage = pathname === "/notifications";

  const handleMessageCreatedEvent = useEffectEvent(
    ({ conversation, message }: MessageCreatedEvent) => {
      if (isMessagePage) {
        return;
      }

      if (message.senderId === user?.id) {
        return;
      }

      const peerName = getDisplayName(
        conversation.peer?.displayName,
        conversation.peer?.username,
      );

      archiveToaster.info({
        title: peerName,
        description: message.content,
        duration: Infinity,
        meta: {
          kind: "message",
          conversation,
          message,
        },
      });
    },
  );

  const handleNotificationCreatedEvent = useEffectEvent(
    ({ notification }: NotificationCreatedEvent) => {
      if (isNotificationsPage) {
        return;
      }

      if (notification.type === "MESSAGE") {
        return;
      }

      archiveToaster.info({
        title: "Notification",
        duration: 5000,
        closable: false,
        meta: {
          kind: "notification",
          notification,
        },
      });
    },
  );

  useEffect(() => {
    if (!socket) {
      return;
    }

    const handleMessageCreated = (payload: MessageCreatedEvent) => {
      handleMessageCreatedEvent(payload);
    };

    const handleNotificationCreated = (payload: NotificationCreatedEvent) => {
      handleNotificationCreatedEvent(payload);
    };

    socket.on(SOCKET_EVENTS.MESSAGE_CREATED, handleMessageCreated);
    socket.on(SOCKET_EVENTS.NOTIFICATION_CREATED, handleNotificationCreated);

    return () => {
      socket.off(SOCKET_EVENTS.MESSAGE_CREATED, handleMessageCreated);
      socket.off(SOCKET_EVENTS.NOTIFICATION_CREATED, handleNotificationCreated);
    };
  }, [handleMessageCreatedEvent, handleNotificationCreatedEvent, socket]);

  return null;
}
