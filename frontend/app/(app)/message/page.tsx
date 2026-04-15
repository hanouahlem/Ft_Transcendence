"use client";

import { useEffect, useMemo, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/context/SocketContext";
import { useMessages } from "@/hooks/useMessages";
import { NewConversationDialog } from "@/components/messages/NewConversationDialog";
import { ConversationThread } from "@/components/messages/ConversationThread";
import { ConversationRail } from "@/components/messages/ConversationRail";

export default function MessagePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { token, user } = useAuth();
  const { onlineUserIds } = useSocket();
  const {
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
    isNewConversationOpen,
    setIsNewConversationOpen,
    isCreatingConversation,
    handleSendMessage,
    handleStartConversationFromDialog,
    handleStartConversationFromRoute,
  } = useMessages({
    token,
    currentUserId: user?.id,
  });
  const handledTargetUserIdRef = useRef<number | null>(null);
  const routeTargetUserId = useMemo(() => {
    const value = searchParams.get("userId");

    if (!value) {
      return null;
    }

    const parsedValue = Number.parseInt(value, 10);
    return Number.isNaN(parsedValue) ? null : parsedValue;
  }, [searchParams]);

  useEffect(() => {
    if (!token || !routeTargetUserId) {
      return;
    }

    if (handledTargetUserIdRef.current === routeTargetUserId) {
      return;
    }

    handledTargetUserIdRef.current = routeTargetUserId;

    void handleStartConversationFromRoute(routeTargetUserId).then((opened) => {
      if (!opened) {
        handledTargetUserIdRef.current = null;
        return;
      }

      router.replace("/message", { scroll: false });
    });
  }, [handleStartConversationFromRoute, routeTargetUserId, router, token]);

  return (
    <>
      <NewConversationDialog
        open={isNewConversationOpen}
        onOpenChange={setIsNewConversationOpen}
        userSearch={userSearch}
        onUserSearchChange={setUserSearch}
        filteredUsers={filteredUsers}
        isCreatingConversation={isCreatingConversation}
        onStartConversation={(targetUserId) => {
          void handleStartConversationFromDialog(targetUserId);
        }}
      />

      <div className="flex w-full min-h-screen flex-col gap-0 xl:flex-row">
        <ConversationRail
          conversations={conversations}
          selectedConversationId={selectedConversationId}
          onlineUserIds={onlineUserIds}
          isLoadingConversations={isLoadingConversations}
          onSelectConversation={setSelectedConversationId}
          onOpenNewConversation={() => setIsNewConversationOpen(true)}
        />

        <ConversationThread
          selectedConversation={selectedConversation}
          onlineUserIds={onlineUserIds}
          messages={messages}
          currentUserId={user?.id}
          isLoadingMessages={isLoadingMessages}
          draft={draft}
          onDraftChange={setDraft}
          onSend={() => {
            void handleSendMessage();
          }}
          isSending={isSending}
        />
      </div>
    </>
  );
}
