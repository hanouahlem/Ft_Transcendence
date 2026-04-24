"use client";

import { useCallback, useEffect, useEffectEvent, useMemo, useRef, useState } from "react";
import {
  createDirectConversation,
  getConversationMessages,
  getConversations,
  getUsers,
  markConversationAsRead,
  normalizeUploadedMediaPayload,
  sendConversationMessage,
  type ConversationItem,
  type ConversationMessage,
  type PublicUserListItem,
} from "@/lib/api";
import { archiveToaster } from "@/components/ui/toaster";
import { useInboxUnread } from "@/context/InboxUnreadContext";
import { useSocket } from "@/context/SocketContext";
import {
  SOCKET_EVENTS,
  type ConversationReadEvent,
  type MessageCreatedEvent,
} from "@/lib/socket-events";

function sortConversations(left: ConversationItem, right: ConversationItem) {
  const leftTimestamp = left.lastMessageAt ?? left.createdAt;
  const rightTimestamp = right.lastMessageAt ?? right.createdAt;
  return new Date(rightTimestamp).getTime() - new Date(leftTimestamp).getTime();
}

type UseMessagesOptions = {
  token: string | null;
  currentUserId?: number;
};

export function useMessages({ token, currentUserId }: UseMessagesOptions) {
  const { setUnreadMessagesCount } = useInboxUnread();
  const { socket, isConnected } = useSocket();
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [users, setUsers] = useState<PublicUserListItem[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null);
  const [draft, setDraft] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isNewConversationOpen, setIsNewConversationOpen] = useState(false);
  const [isCreatingConversation, setIsCreatingConversation] = useState<number | null>(null);
  const messagesCacheRef = useRef<Map<number, ConversationMessage[]>>(new Map());
  const hasLoadedConversationsRef = useRef(false);
  const conversationsRequestIdRef = useRef(0);
  const selectedConversationIdRef = useRef<number | null>(null);

  const selectedConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === selectedConversationId) ?? null,
    [conversations, selectedConversationId],
  );

  const upsertConversation = useCallback((conversation: ConversationItem) => {
    setConversations((previous) => {
      const withoutCurrent = previous.filter((entry) => entry.id !== conversation.id);
      return [conversation, ...withoutCurrent].sort(sortConversations);
    });
  }, []);

  const appendMessageToCache = useCallback((conversationId: number, message: ConversationMessage) => {
    const previousMessages = messagesCacheRef.current.get(conversationId) ?? [];

    if (previousMessages.some((entry) => entry.id === message.id)) {
      return previousMessages;
    }

    const nextMessages = [...previousMessages, message].sort(
      (left, right) => new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime(),
    );

    messagesCacheRef.current.set(conversationId, nextMessages);
    return nextMessages;
  }, []);

  const filteredUsers = useMemo(() => {
    const query = userSearch.trim().toLowerCase();
    if (!query) {
      return users;
    }

    return users.filter((entry) => {
      const username = entry.username.toLowerCase();
      const displayName = entry.displayName?.toLowerCase() ?? "";
      return username.includes(query) || displayName.includes(query);
    });
  }, [userSearch, users]);

  const loadConversations = useCallback(async () => {
    if (!token) {
      return;
    }

    const requestId = conversationsRequestIdRef.current + 1;
    conversationsRequestIdRef.current = requestId;
    setIsLoadingConversations(true);
    const result = await getConversations(token);

    if (requestId !== conversationsRequestIdRef.current) {
      return;
    }

    setIsLoadingConversations(false);

    if (!result.ok) {
      archiveToaster.error({
        title: "Messages",
        description: result.message || "Unable to load conversations.",
      });
      return;
    }

    hasLoadedConversationsRef.current = true;
    const nextConversations = [...result.data.conversations].sort(sortConversations);
    setConversations(nextConversations);

    setSelectedConversationId((currentId) => {
      if (currentId && nextConversations.some((conversation) => conversation.id === currentId)) {
        return currentId;
      }
      return nextConversations[0]?.id ?? null;
    });
  }, [token]);

  const loadUsers = useCallback(async () => {
    if (!token) {
      return;
    }

    const result = await getUsers(token);
    if (!result.ok) {
      return;
    }

    const nextUsers = result.data.filter((entry) => entry.id !== currentUserId);
    setUsers(nextUsers);
  }, [currentUserId, token]);

  const loadMessages = useCallback(
    async (
      conversationId: number,
      options: {
        showLoading?: boolean;
      } = {},
    ) => {
      if (!token) {
        return;
      }

      const { showLoading = true } = options;

      if (showLoading) {
        setIsLoadingMessages(true);
      }
      const result = await getConversationMessages(conversationId, token);
      if (showLoading) {
        setIsLoadingMessages(false);
      }

      if (!result.ok) {
        archiveToaster.error({
          title: "Messages",
          description: result.message || "Unable to load messages.",
        });
        return;
      }

      messagesCacheRef.current.set(conversationId, result.data.messages);

      if (selectedConversationIdRef.current === conversationId) {
        setMessages(result.data.messages);
        setIsLoadingMessages(false);
      }
    },
    [token],
  );

  useEffect(() => {
    selectedConversationIdRef.current = selectedConversationId;
  }, [selectedConversationId]);

  useEffect(() => {
    messagesCacheRef.current.clear();
    hasLoadedConversationsRef.current = false;
    queueMicrotask(() => {
      setMessages([]);
    });
  }, [token, currentUserId]);

  useEffect(() => {
    if (!token) {
      return;
    }

    queueMicrotask(() => {
      void loadConversations();
      void loadUsers();
    });
  }, [loadConversations, loadUsers, token]);

  useEffect(() => {
    if (!token || !selectedConversationId) {
      return;
    }

    const cachedMessages = messagesCacheRef.current.get(selectedConversationId);

    queueMicrotask(() => {
      if (cachedMessages) {
        setMessages(cachedMessages);
        setIsLoadingMessages(false);
        void loadMessages(selectedConversationId, { showLoading: false });
        return;
      }

      setMessages([]);
      void loadMessages(selectedConversationId, { showLoading: true });
    });
  }, [loadMessages, selectedConversationId, token]);

  useEffect(() => {
    if (!token || !selectedConversation || selectedConversation.unreadCount < 1) {
      return;
    }

    markConversationAsRead(selectedConversation.id, token).then((result) => {
      if (!result.ok) {
        return;
      }

      setConversations((previous) =>
        previous.map((conversation) =>
          conversation.id === selectedConversation.id
            ? { ...conversation, unreadCount: 0 }
            : conversation,
        ),
      );
    });
  }, [selectedConversation, token]);

  useEffect(() => {
    if (!hasLoadedConversationsRef.current) {
      return;
    }

    setUnreadMessagesCount(
      conversations.reduce(
        (total, conversation) => total + Math.max(0, conversation.unreadCount),
        0,
      ),
    );
  }, [conversations, setUnreadMessagesCount]);

  const handleMessageCreatedEvent = useEffectEvent((payload: MessageCreatedEvent) => {
    const conversation = normalizeUploadedMediaPayload(payload.conversation);
    const message = normalizeUploadedMediaPayload(payload.message);

    upsertConversation(conversation);
    const nextMessages = appendMessageToCache(conversation.id, message);

    if (selectedConversationIdRef.current === conversation.id) {
      setMessages(nextMessages);
      setIsLoadingMessages(false);
    }
  });

  const handleConversationReadEvent = useEffectEvent((payload: ConversationReadEvent) => {
    setConversations((previous) =>
      previous.map((conversation) =>
        conversation.id === payload.conversationId
          ? { ...conversation, unreadCount: payload.unreadCount }
          : conversation,
      ),
    );
  });

  const handleOpenConversation = useCallback(
    async (targetUserId: number) => {
      if (!token) {
        return false;
      }

      const result = await createDirectConversation(targetUserId, token);
      if (!result.ok) {
        archiveToaster.error({
          title: "Messages",
          description: result.message || "Unable to start conversation.",
        });
        return false;
      }

      const createdConversation = result.data.conversation;
      setConversations((previous) => {
        const withoutCurrent = previous.filter((entry) => entry.id !== createdConversation.id);
        return [createdConversation, ...withoutCurrent].sort(sortConversations);
      });
      setSelectedConversationId(createdConversation.id);
      return true;
    },
    [token],
  );

  const handleSendMessage = useCallback(async () => {
    if (!token || !selectedConversationId) {
      return;
    }

    const content = draft.trim();
    if (!content) {
      return;
    }

    setIsSending(true);
    const result = await sendConversationMessage(selectedConversationId, content, token);
    setIsSending(false);

    if (!result.ok) {
      archiveToaster.error({
        title: "Messages",
        description: result.message || "Unable to send message.",
      });
      return;
    }

    const nextMessage = result.data.message;
    setDraft("");
    const nextMessages = appendMessageToCache(selectedConversationId, nextMessage);

    if (selectedConversationIdRef.current === selectedConversationId) {
      setMessages(nextMessages);
    }

    setConversations((previous) =>
      previous
        .map((conversation) =>
          conversation.id === selectedConversationId
            ? {
                ...conversation,
                lastMessage: nextMessage,
                lastMessageAt: nextMessage.createdAt,
              }
            : conversation,
        )
        .sort(sortConversations),
    );
  }, [appendMessageToCache, draft, selectedConversationId, token]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadConversations();
    if (selectedConversationId) {
      await loadMessages(selectedConversationId, { showLoading: true });
    }
    setIsRefreshing(false);
  }, [loadConversations, loadMessages, selectedConversationId]);

  const handleStartConversationFromDialog = useCallback(
    async (targetUserId: number) => {
      setIsCreatingConversation(targetUserId);
      const opened = await handleOpenConversation(targetUserId);
      setIsCreatingConversation(null);

      if (opened) {
        setIsNewConversationOpen(false);
        setUserSearch("");
      }

      return opened;
    },
    [handleOpenConversation],
  );

  const handleStartConversationFromRoute = useCallback(
    async (targetUserId: number) => {
      const opened = await handleOpenConversation(targetUserId);

      if (!opened) {
        return false;
      }

      await loadConversations();
      return true;
    },
    [handleOpenConversation, loadConversations],
  );

  useEffect(() => {
    if (!socket) {
      return;
    }

    const handleMessageCreated = (payload: MessageCreatedEvent) => {
      handleMessageCreatedEvent(payload);
    };

    const handleConversationRead = (payload: ConversationReadEvent) => {
      handleConversationReadEvent(payload);
    };

    socket.on(SOCKET_EVENTS.MESSAGE_CREATED, handleMessageCreated);
    socket.on(SOCKET_EVENTS.CONVERSATION_READ, handleConversationRead);

    return () => {
      socket.off(SOCKET_EVENTS.MESSAGE_CREATED, handleMessageCreated);
      socket.off(SOCKET_EVENTS.CONVERSATION_READ, handleConversationRead);
    };
  }, [socket]);

  useEffect(() => {
    if (!token || !isConnected) {
      return;
    }

    queueMicrotask(() => {
      void loadConversations().then(() => {
        const activeConversationId = selectedConversationIdRef.current;

        if (activeConversationId) {
          void loadMessages(activeConversationId, { showLoading: false });
        }
      });
    });
  }, [isConnected, loadConversations, loadMessages, token]);

  return {
    conversations,
    messages,
    selectedConversation,
    selectedConversationId,
    setSelectedConversationId,
    draft,
    setDraft,
    userSearch,
    setUserSearch,
    filteredUsers,
    isLoadingConversations,
    isLoadingMessages,
    isSending,
    isRefreshing,
    isNewConversationOpen,
    setIsNewConversationOpen,
    isCreatingConversation,
    handleSendMessage,
    handleRefresh,
    handleStartConversationFromDialog,
    handleStartConversationFromRoute,
  };
}
