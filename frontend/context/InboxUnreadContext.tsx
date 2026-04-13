"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useEffectEvent,
  useMemo,
  useState,
} from "react";
import { getConversations, getNotifications } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/context/SocketContext";
import {
  SOCKET_EVENTS,
  type InboxUnreadCountsEvent,
} from "@/lib/socket-events";

type InboxUnreadContextType = {
  unreadNotificationsCount: number;
  unreadMessagesCount: number;
  setUnreadNotificationsCount: (count: number) => void;
  setUnreadMessagesCount: (count: number) => void;
  refreshUnreadNotificationsCount: () => Promise<void>;
  refreshUnreadMessagesCount: () => Promise<void>;
  refreshUnreadCounts: () => Promise<void>;
};

const InboxUnreadContext = createContext<InboxUnreadContextType | undefined>(
  undefined,
);

export function InboxUnreadProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { token } = useAuth();
  const { socket, isConnected } = useSocket();
  const [unreadNotificationsCount, setUnreadNotificationsCountState] = useState(0);
  const [unreadMessagesCount, setUnreadMessagesCountState] = useState(0);

  const setUnreadNotificationsCount = useCallback((count: number) => {
    setUnreadNotificationsCountState(Math.max(0, count));
  }, []);

  const setUnreadMessagesCount = useCallback((count: number) => {
    setUnreadMessagesCountState(Math.max(0, count));
  }, []);

  const refreshUnreadNotificationsCount = useCallback(async () => {
    if (!token) {
      setUnreadNotificationsCountState(0);
      return;
    }

    const result = await getNotifications(token);
    if (!result.ok) {
      return;
    }

    setUnreadNotificationsCountState(
      result.data.allNotifs.filter((notification) => !notification.read).length,
    );
  }, [token]);

  const refreshUnreadMessagesCount = useCallback(async () => {
    if (!token) {
      setUnreadMessagesCountState(0);
      return;
    }

    const result = await getConversations(token);
    if (!result.ok) {
      return;
    }

    setUnreadMessagesCountState(
      result.data.conversations.reduce(
        (total, conversation) => total + Math.max(0, conversation.unreadCount),
        0,
      ),
    );
  }, [token]);

  const refreshUnreadCounts = useCallback(async () => {
    await Promise.all([
      refreshUnreadNotificationsCount(),
      refreshUnreadMessagesCount(),
    ]);
  }, [refreshUnreadMessagesCount, refreshUnreadNotificationsCount]);

  const handleUnreadCountsEvent = useEffectEvent((payload: InboxUnreadCountsEvent) => {
    setUnreadMessagesCountState(Math.max(0, payload.unreadMessagesCount));
    setUnreadNotificationsCountState(Math.max(0, payload.unreadNotificationsCount));
  });

  useEffect(() => {
    if (!token) {
      return;
    }

    queueMicrotask(() => {
      void refreshUnreadCounts();
    });
  }, [refreshUnreadCounts, token]);

  useEffect(() => {
    if (!socket) {
      return;
    }

    const handleCounts = (payload: InboxUnreadCountsEvent) => {
      handleUnreadCountsEvent(payload);
    };

    socket.on(SOCKET_EVENTS.INBOX_UNREAD_COUNTS, handleCounts);

    return () => {
      socket.off(SOCKET_EVENTS.INBOX_UNREAD_COUNTS, handleCounts);
    };
  }, [handleUnreadCountsEvent, socket]);

  useEffect(() => {
    if (!token || !isConnected) {
      return;
    }

    void refreshUnreadCounts();
  }, [isConnected, refreshUnreadCounts, token]);

  useEffect(() => {
    if (!token) {
      return;
    }

    const handleWindowFocus = () => {
      void refreshUnreadCounts();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void refreshUnreadCounts();
      }
    };

    window.addEventListener("focus", handleWindowFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("focus", handleWindowFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [refreshUnreadCounts, token]);

  const value = useMemo(
    () => ({
      unreadNotificationsCount,
      unreadMessagesCount,
      setUnreadNotificationsCount,
      setUnreadMessagesCount,
      refreshUnreadNotificationsCount,
      refreshUnreadMessagesCount,
      refreshUnreadCounts,
    }),
    [
      refreshUnreadCounts,
      refreshUnreadMessagesCount,
      refreshUnreadNotificationsCount,
      setUnreadMessagesCount,
      setUnreadNotificationsCount,
      unreadMessagesCount,
      unreadNotificationsCount,
    ],
  );

  return (
    <InboxUnreadContext.Provider value={value}>
      {children}
    </InboxUnreadContext.Provider>
  );
}

export function useInboxUnread() {
  const context = useContext(InboxUnreadContext);

  if (!context) {
    throw new Error("useInboxUnread must be used inside an InboxUnreadProvider");
  }

  return context;
}
