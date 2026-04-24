"use client";

import { useEffect, useRef } from "react";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { ProfilePicture } from "@/components/ui/ProfilePicture";
import { NatureCanvas } from "@/components/layout/NatureCanvas";
import { SocialComposer } from "@/components/ui/SocialComposer";
import { UserIdentityLink } from "@/components/users/UserIdentityLink";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ConversationItem, ConversationMessage } from "@/lib/api";
import { useI18n } from "@/i18n/I18nProvider";

type ConversationThreadProps = {
  selectedConversation: ConversationItem | null;
  onlineUserIds: Set<number>;
  messages: ConversationMessage[];
  currentUserId?: number;
  isLoadingMessages: boolean;
  draft: string;
  onDraftChange: (value: string) => void;
  onSend: () => void | Promise<void>;
  isSending: boolean;
  onBackToConversations?: () => void;
  showBackButton?: boolean;
  className?: string;
};

export function ConversationThread({
  selectedConversation,
  onlineUserIds,
  messages,
  currentUserId,
  isLoadingMessages,
  draft,
  onDraftChange,
  onSend,
  isSending,
  onBackToConversations,
  showBackButton = false,
  className,
}: ConversationThreadProps) {
  const { isRtl, locale, t } = useI18n();
  const composerRef = useRef<HTMLTextAreaElement | null>(null);
  const selectedConversationId = selectedConversation?.id ?? null;
  const selectedPeer = selectedConversation?.peer ?? null;
  const selectedPeerIsOnline =
    typeof selectedPeer?.id === "number" && selectedPeer.id > 0 && onlineUserIds.has(selectedPeer.id);

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
    <section className={cn("archive-paper flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden p-3 shadow-none sm:p-5 xl:p-6", className)}>
      <header className="mb-4 flex shrink-0 items-center gap-3 sm:mb-5 xl:justify-center">
        {showBackButton ? (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="shrink-0 border-black/10 bg-paper-muted text-ink xl:hidden"
            aria-label={t("conversation.backToConversations")}
            onClick={onBackToConversations}
          >
            <ArrowLeft className={cn("h-4 w-4", isRtl && "rotate-180")} />
          </Button>
        ) : null}

        <div className="flex min-w-0 flex-1 items-center justify-center gap-3 xl:flex-none">
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
                  <div className="flex max-w-full items-center gap-2 sm:gap-3">
                    <div className="min-w-0">
                      <UserIdentityLink
                        user={selectedPeer}
                        className="block truncate text-xl font-semibold text-ink sm:text-3xl"
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
                    </div>
                    <div
                      className={cn(
                        "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em]",
                        selectedPeerIsOnline
                          ? "border-emerald-600/45 bg-emerald-500/10 text-emerald-700"
                          : "border-zinc-600/35 bg-zinc-500/10 text-zinc-700",
                      )}
                    >
                      <span
                        aria-hidden="true"
                        className={cn(
                          "h-1.5 w-1.5 rounded-full",
                          selectedPeerIsOnline ? "bg-emerald-500" : "bg-zinc-500",
                        )}
                      />
                      {selectedPeerIsOnline ? "Online" : "Offline"}
                    </div>
                  </div>
                ) : null}
              </div>
            </>
          ) : (
            <>
              <div className="flex h-11 w-11 items-center justify-center border border-black/10 bg-paper-muted">
                <MessageCircle className="h-5 w-5 text-label" />
              </div>
              <p className="font-serif text-sm text-label">
                {t("conversation.selectPrompt")}
              </p>
            </>
          )}
        </div>
      </header>

      <div className="archive-page relative min-h-0 flex-1 overflow-hidden border border-black/10">
        <NatureCanvas embedded className="opacity-35" />
        <div className="relative z-10 h-full space-y-3 overflow-auto p-4">
          {!selectedConversation ? (
            <p className="font-mono text-xs uppercase tracking-[0.14em] text-label">
              {t("conversation.noSelected")}
            </p>
          ) : isLoadingMessages ? (
            <p className="font-mono text-xs uppercase tracking-[0.14em] text-label">
              {t("conversation.loadingMessages")}
            </p>
          ) : messages.length < 1 ? (
            <p className="font-mono text-xs uppercase tracking-[0.14em] text-label">
              {t("conversation.noMessages")}
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
                      "max-w-[86%] border px-3 py-2 sm:max-w-[78%]",
                      isMine
                        ? "border-ink bg-ink text-paper"
                        : "border-black/10 bg-paper text-ink",
                    )}
                  >
                    <p className="whitespace-pre-wrap font-serif text-md">{message.content}</p>
                    <p
                      className={cn(
                        "mt-1 text-end font-mono text-[10px] uppercase tracking-[0.16em]",
                        isMine ? "text-paper/70" : "text-label",
                      )}
                    >
                      {new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit" }).format(new Date(message.createdAt))}
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
            selectedConversation ? t("conversation.writePrompt") : t("conversation.selectFirst")
          }
          label={t("conversation.composeLabel")}
          submitLabel={isSending ? t("conversation.sending") : t("conversation.send")}
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
