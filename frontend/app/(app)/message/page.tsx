"use client";

import { useAuth } from "@/context/AuthContext";
import { useMessages } from "@/hooks/useMessages";
import { NewConversationDialog } from "@/components/messages/NewConversationDialog";
import { ConversationThread } from "@/components/messages/ConversationThread";
import { ConversationRail } from "@/components/messages/ConversationRail";

export default function MessagePage() {
  const { token, user } = useAuth();
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
  } = useMessages({
    token,
    currentUserId: user?.id,
  });

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
          isLoadingConversations={isLoadingConversations}
          onSelectConversation={setSelectedConversationId}
          onOpenNewConversation={() => setIsNewConversationOpen(true)}
        />

        <ConversationThread
          selectedConversation={selectedConversation}
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
