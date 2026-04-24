"use client";

import { MailEdit01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { ConversationItem } from "@/lib/api";
import { ProfilePicture } from "@/components/ui/ProfilePicture";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n/I18nProvider";

function formatRailTime(value: string | null | undefined, locale: string) {
  if (!value) {
    return "";
  }

  return new Intl.DateTimeFormat(locale, {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

type ConversationRailProps = {
  conversations: ConversationItem[];
  selectedConversationId: number | null;
  onlineUserIds: Set<number>;
  isLoadingConversations: boolean;
  onSelectConversation: (conversationId: number) => void;
  onOpenNewConversation: () => void;
  className?: string;
};

export function ConversationRail({
  conversations,
  selectedConversationId,
  onlineUserIds,
  isLoadingConversations,
  onSelectConversation,
  onOpenNewConversation,
  className,
}: ConversationRailProps) {
  const { locale, t } = useI18n();

  return (
    <aside className={cn("relative z-10 flex h-full min-h-0 w-full flex-col border border-black/10 bg-paper xl:w-[360px] xl:shrink-0", className)}>
      <div className="min-h-0 flex-1 space-y-3 overflow-auto p-3 sm:p-4">
        {isLoadingConversations ? (
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-label">
            {t("conversation.loadingConversations")}
          </p>
        ) : conversations.length < 1 ? (
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-label">
            {t("conversation.noConversation")}
          </p>
        ) : (
          conversations.map((conversation, index) => {
            const rotationClass =
              index % 3 === 0 ? "rotate-[0.5deg]" : index % 3 === 1 ? "-rotate-[0.6deg]" : "rotate-0";
            const isActive = selectedConversationId === conversation.id;
            const peerUserId = conversation.peer?.id;
            const isPeerOnline =
              typeof peerUserId === "number" && peerUserId > 0 && onlineUserIds.has(peerUserId);

            return (
              <button
                key={conversation.id}
                type="button"
                onClick={() => onSelectConversation(conversation.id)}
                className={cn(
                  "relative w-full border p-3 text-start transition sm:p-4",
                  rotationClass,
                  isActive
                    ? "border-ink border-2 bg-paper shadow-[4px_6px_0_rgba(26,26,26,0.12)]"
                    : "border-black/10 bg-paper-muted hover:bg-paper hover:shadow-[3px_4px_0_rgba(26,26,26,0.08)]",
                )}
              >
                {conversation.unreadCount > 0 ? (
                  <div className="absolute -top-2 z-10 rounded-full bg-accent-red px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em] text-paper shadow-[2px_2px_0_#1a1a1a]" style={{ insetInlineEnd: "-0.5rem" }}>
                    {conversation.unreadCount}
                  </div>
                ) : null}
                <div className="flex items-center gap-3 sm:gap-4">
                  <ProfilePicture
                    name={conversation.peer?.displayName || conversation.peer?.username || t("conversation.userFallback")}
                    src={conversation.peer?.avatar}
                    size="lg"
                    withShadow={false}
                    className="shrink-0 self-center"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-2">
                        <p className="truncate text-base font-bold text-ink sm:text-lg">
                          {conversation.peer?.displayName || conversation.peer?.username || "Unknown user"}
                        </p>
                        <span
                          aria-hidden="true"
                          title={isPeerOnline ? "Online" : "Offline"}
                          className={cn(
                            "h-2.5 w-2.5 shrink-0 rounded-full border border-black/20",
                            isPeerOnline ? "bg-emerald-500" : "bg-zinc-400",
                          )}
                        />
                      </div>
                      <div className="shrink-0 self-start">
                        <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-label">
                          {formatRailTime(conversation.lastMessageAt, locale)}
                        </span>
                      </div>
                    </div>
                    {/* Translation note: we keep a localized fallback for empty previews so list rows stay stable even without lastMessage */}
                    <p className="mt-1 truncate font-serif text-sm leading-5 text-ink/75 sm:text-md">
                      {conversation.lastMessage?.content || t("conversation.noMessageYet")}
                    </p>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>

      <div className="shrink-0 border-t border-black/10 bg-paper p-4 sm:p-5">
        <Button
          type="button"
          variant="black"
          className="w-full tracking-[0.18em] font-sans"
          onClick={onOpenNewConversation}
        >
          <HugeiconsIcon icon={MailEdit01Icon} size={16} strokeWidth={1.9} />
          {t("conversation.newMessage")}
        </Button>
      </div>
    </aside>
  );
}
