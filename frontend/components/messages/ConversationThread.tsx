"use client";

import { useEffect, useRef } from "react";
import { MessageCircle } from "lucide-react";
import { ProfilePicture } from "@/components/ui/ProfilePicture";
import { NatureCanvas } from "@/components/layout/NatureCanvas";
import { SocialComposer } from "@/components/ui/SocialComposer";
import { UserIdentityLink } from "@/components/users/UserIdentityLink";
import { cn } from "@/lib/utils";
import type { ConversationItem, ConversationMessage } from "@/lib/api";

function formatMessageDate(value: string) {
  const date = new Date(value);
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

type ConversationThreadProps = {
  selectedConversation: ConversationItem | null;
  messages: ConversationMessage[];
  currentUserId?: number;
  isLoadingMessages: boolean;
  draft: string;
  onDraftChange: (value: string) => void;
  onSend: () => void | Promise<void>;
  isSending: boolean;
};

export function ConversationThread({
  selectedConversation,
  messages,
  currentUserId,
  isLoadingMessages,
  draft,
  onDraftChange,
  onSend,
  isSending,
}: ConversationThreadProps) {
  const composerRef = useRef<HTMLTextAreaElement | null>(null);
  const selectedConversationId = selectedConversation?.id ?? null;
  const selectedPeer = selectedConversation?.peer ?? null;

  useEffect(() => {
    if (!selectedConversationId) {
      return;
    }

    requestAnimationFrame(() => {
      composerRef.current?.focus();
      const valueLength = composerRef.current?.value.length ?? 0;
      composerRef.current?.setSelectionRange(valueLength, valueLength);
    });
  }, [selectedConversationId]);

  return (
    <section className="archive-paper shadow-none flex min-h-screen w-full flex-1 flex-col p-4 sm:p-6">
      <header className="mb-5 flex items-center justify-center gap-3">
        {selectedConversation ? (
          <>
            {selectedPeer ? (
              <UserIdentityLink user={selectedPeer} className="shrink-0">
                <ProfilePicture
                  name={
                    selectedPeer.displayName ||
                    selectedPeer.username ||
                    "User"
                  }
                  src={selectedPeer.avatar}
                  withShadow={true}
                  size="lg"
                  className="-rotate-3 min-h-12 min-w-12"
                />
              </UserIdentityLink>
            ) : null}
            <div className="min-w-0">
              {selectedPeer ? (
                <>
                  <UserIdentityLink
                    user={selectedPeer}
                    className="block truncate text-3xl font-semibold text-ink"
                  >
                    {selectedPeer.displayName ||
                      selectedPeer.username ||
                      "Unknown user"}
                  </UserIdentityLink>
                  <UserIdentityLink
                    user={selectedPeer}
                    className="block truncate font-mono text-[10px] uppercase tracking-[0.18em] text-label"
                  >
                    @{selectedPeer.username || "unknown"}
                  </UserIdentityLink>
                </>
              ) : null}
            </div>
          </>
        ) : (
          <>
            <div className="flex h-11 w-11 items-center justify-center border border-black/10 bg-paper-muted">
              <MessageCircle className="h-5 w-5 text-label" />
            </div>
            <p className="font-serif text-sm text-label">
              Select a conversation or start one from the user list.
            </p>
          </>
        )}
      </header>

      <div className="archive-page relative flex-1 overflow-hidden border border-black/10">
        <NatureCanvas embedded className="opacity-35" />
        <div className="relative z-10 h-full space-y-3 overflow-auto p-4">
          {!selectedConversation ? (
            <p className="font-mono text-xs uppercase tracking-[0.14em] text-label">
              No conversation selected.
            </p>
          ) : isLoadingMessages ? (
            <p className="font-mono text-xs uppercase tracking-[0.14em] text-label">
              Loading messages...
            </p>
          ) : messages.length < 1 ? (
            <p className="font-mono text-xs uppercase tracking-[0.14em] text-label">
              No messages yet. Send the first one.
            </p>
          ) : (
            messages.map((message) => {
              const isMine = message.senderId === currentUserId;

              return (
                <div
                  key={message.id}
                  className={cn("flex", isMine ? "justify-end" : "justify-start")}
                >
                  <div
                    className={cn(
                      "max-w-[78%] border px-3 py-2",
                      isMine
                        ? "border-ink bg-ink text-paper"
                        : "border-black/10 bg-paper text-ink",
                    )}
                  >
                    <p className="whitespace-pre-wrap font-serif text-md">{message.content}</p>
                    <p
                      className={cn(
                        "mt-1 text-right font-mono text-[10px] uppercase tracking-[0.16em]",
                        isMine ? "text-paper/70" : "text-label",
                      )}
                    >
                      {formatMessageDate(message.createdAt)}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="mt-4">
        <SocialComposer
          ref={composerRef}
          value={draft}
          submitting={isSending}
          onChange={onDraftChange}
          onSubmit={onSend}
          placeholder={
            selectedConversation ? "Write your correspondence..." : "Select a conversation first..."
          }
          label="Write a direct message"
          submitLabel={isSending ? "Sending message" : "Send message"}
          rows={1}
          maxLength={1000}
          keepFocusOnSubmit
          disabled={!selectedConversation}
          containerClassName="border-black/10 bg-paper-muted"
          textareaClassName="min-h-0 font-serif text-md leading-6"
        />
      </div>
    </section>
  );
}
