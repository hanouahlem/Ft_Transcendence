"use client";

import { MailEdit01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { ConversationItem } from "@/lib/api";
import { ProfilePicture } from "@/components/ui/ProfilePicture";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function formatRailTime(value?: string | null) {
  if (!value) {
    return "";
  }

  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

type ConversationRailProps = {
  conversations: ConversationItem[];
  selectedConversationId: number | null;
  isLoadingConversations: boolean;
  onSelectConversation: (conversationId: number) => void;
  onOpenNewConversation: () => void;
};

export function ConversationRail({
  conversations,
  selectedConversationId,
  isLoadingConversations,
  onSelectConversation,
  onOpenNewConversation,
}: ConversationRailProps) {
  return (
    <aside className="relative z-10 flex min-h-screen w-full flex-col border border-black/10 bg-paper xl:w-[360px]">
      <div className="flex-1 space-y-3 overflow-auto p-4">
        {isLoadingConversations ? (
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-label">
            Loading conversations...
          </p>
        ) : conversations.length < 1 ? (
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-label">
            No conversation yet.
          </p>
        ) : (
          conversations.map((conversation, index) => {
            const rotationClass =
              index % 3 === 0 ? "rotate-[0.5deg]" : index % 3 === 1 ? "-rotate-[0.6deg]" : "rotate-0";
            const isActive = selectedConversationId === conversation.id;

            return (
              <button
                key={conversation.id}
                type="button"
                onClick={() => onSelectConversation(conversation.id)}
                className={cn(
                  "w-full border p-4 text-left transition",
                  rotationClass,
                  isActive
                    ? "border-ink border-2 bg-paper shadow-[4px_6px_0_rgba(26,26,26,0.12)]"
                    : "border-black/10 bg-paper-muted hover:bg-paper hover:shadow-[3px_4px_0_rgba(26,26,26,0.08)]",
                )}
              >
                <div className="flex items-start gap-3">
                  <ProfilePicture
                    name={conversation.peer?.displayName || conversation.peer?.username || "User"}
                    src={conversation.peer?.avatar}
                    size="sm"
                    withShadow={false}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-bold text-ink">
                        {conversation.peer?.displayName || conversation.peer?.username || "Unknown user"}
                      </p>
                      <div className="relative shrink-0 self-start">
                        <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-label">
                          {formatRailTime(conversation.lastMessageAt)}
                        </span>
                        {conversation.unreadCount > 0 ? (
                          <div className="absolute right-4 top-[calc(100%+4px)] rounded-full bg-accent-red px-2 py-0.5 font-mono text-[10px] font-sans uppercase tracking-[0.1em] text-paper shadow-[2px_2px_0_#1a1a1a]">
                            {conversation.unreadCount}
                          </div>
                        ) : null}
                      </div>
                    </div>
                    <p className="truncate font-mono text-[10px] uppercase tracking-[0.16em] text-label">
                      @{conversation.peer?.username || "unknown"}
                    </p>
                    <p className="mt-1 truncate font-serif text-xs italic text-ink/75">
                      {conversation.lastMessage?.content || "No message yet."}
                    </p>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>

      <div className="border-t border-black/10 bg-paper p-5">
        <Button
          type="button"
          variant="black"
          className="w-full tracking-[0.18em] font-sans"
          onClick={onOpenNewConversation}
        >
          <HugeiconsIcon icon={MailEdit01Icon} size={16} strokeWidth={1.9} />
          New Message
        </Button>
      </div>
    </aside>
  );
}
