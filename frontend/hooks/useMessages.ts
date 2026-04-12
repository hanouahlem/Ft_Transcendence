"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  createDirectConversation,
  getConversationMessages,
  getConversations,
  getUsers,
  markConversationAsRead,
  sendConversationMessage,
  type ConversationItem,
  type ConversationMessage,
  type PublicUserListItem,
} from "@/lib/api";
import { archiveToaster } from "@/components/ui/toaster";

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
  const selectedConversationIdRef = useRef<number | null>(null);

  const selectedConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === selectedConversationId) ?? null,
    [conversations, selectedConversationId],
  );

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

    setIsLoadingConversations(true);
    const result = await getConversations(token);
    setIsLoadingConversations(false);

    if (!result.ok) {
      archiveToaster.error({
        title: "Messages",
        description: result.message || "Unable to load conversations.",
      });
      return;
    }

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
    setMessages((previous) => [...previous, nextMessage]);
    messagesCacheRef.current.set(selectedConversationId, [
      ...(messagesCacheRef.current.get(selectedConversationId) ?? []),
      nextMessage,
    ]);
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
  }, [draft, selectedConversationId, token]);

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
    },
    [handleOpenConversation],
  );

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
  };
}
