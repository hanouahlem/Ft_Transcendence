"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/context/SocketContext";
import { useMessages } from "@/hooks/useMessages";
import { NewConversationDialog } from "@/components/messages/NewConversationDialog";
import { ConversationThread } from "@/components/messages/ConversationThread";
import { ConversationRail } from "@/components/messages/ConversationRail";

function MessagePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { token, user } = useAuth();
  const { onlineUserIds } = useSocket();
  const [compactPane, setCompactPane] = useState<"rail" | "thread">("thread");
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

      setCompactPane("thread");
      router.replace("/message", { scroll: false });
    });
  }, [handleStartConversationFromRoute, routeTargetUserId, router, token]);

  const isCompactThreadVisible = compactPane === "thread" && Boolean(selectedConversation);

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
          void handleStartConversationFromDialog(targetUserId).then((opened) => {
            if (opened) {
              setCompactPane("thread");
            }
          });
        }}
      />

      <div className="flex h-[calc(100dvh_-_var(--mobile-bottom-nav-height))] min-h-0 w-full overflow-hidden lg:h-screen lg:min-h-screen xl:flex-row">
        <ConversationRail
          conversations={conversations}
          selectedConversationId={selectedConversationId}
          onlineUserIds={onlineUserIds}
          isLoadingConversations={isLoadingConversations}
          onSelectConversation={(conversationId) => {
            setSelectedConversationId(conversationId);
            setCompactPane("thread");
          }}
          onOpenNewConversation={() => setIsNewConversationOpen(true)}
          className={isCompactThreadVisible ? "hidden xl:flex" : "flex xl:flex"}
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
          onBackToConversations={() => setCompactPane("rail")}
          showBackButton={Boolean(selectedConversation)}
          className={isCompactThreadVisible ? "flex xl:flex" : "hidden xl:flex"}
        />
      </div>
    </>
  );
}

export default function MessagePage() {
  return (
    <Suspense fallback={null}>
      <MessagePageContent />
    </Suspense>
  );
}
