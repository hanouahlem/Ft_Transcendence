"use client";

import { Search } from "lucide-react";
import type { PublicUserListItem } from "@/lib/api";
import { ProfilePicture } from "@/components/ui/ProfilePicture";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

type NewConversationDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userSearch: string;
  onUserSearchChange: (value: string) => void;
  filteredUsers: PublicUserListItem[];
  isCreatingConversation: number | null;
  onStartConversation: (targetUserId: number) => void | Promise<void>;
};

export function NewConversationDialog({
  open,
  onOpenChange,
  userSearch,
  onUserSearchChange,
  filteredUsers,
  isCreatingConversation,
  onStartConversation,
}: NewConversationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="archive-paper border border-black/10 p-0">
        <DialogTitle className="sr-only">Start a new conversation</DialogTitle>
        <DialogDescription className="sr-only">
          Search users and create a direct conversation.
        </DialogDescription>
        <div className="p-5 sm:p-6">
          <header className="mb-4 border-b border-black/10 pb-3">
            <h2 className="font-display text-2xl font-black text-ink">New Conversation</h2>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-label">
              Search a user to start messaging
            </p>
          </header>

          <div className="mb-4 flex items-center gap-2 border border-black/10 bg-black/5 px-3">
            <Search className="h-4 w-4 text-label" />
            <input
              type="text"
              value={userSearch}
              onChange={(event) => onUserSearchChange(event.target.value)}
              placeholder="Find a user..."
              className="h-10 w-full bg-transparent font-mono text-xs uppercase tracking-[0.14em] text-ink outline-none"
            />
          </div>

          <div className="max-h-[360px] space-y-2 overflow-auto border border-black/10 bg-paper-muted p-2">
            {filteredUsers.length < 1 ? (
              <p className="p-3 font-mono text-xs uppercase tracking-[0.14em] text-label">
                No users found.
              </p>
            ) : (
              filteredUsers.map((entry) => (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => onStartConversation(entry.id)}
                  disabled={isCreatingConversation === entry.id}
                  className="flex w-full items-center gap-3 border border-transparent bg-paper px-3 py-2 text-left transition hover:border-black/10 disabled:opacity-60"
                >
                  <ProfilePicture
                    name={entry.displayName || entry.username}
                    src={entry.avatar}
                    size="sm"
                    withShadow={false}
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-ink">
                      {entry.displayName || entry.username}
                    </p>
                    <p className="truncate font-mono text-[10px] uppercase tracking-[0.16em] text-label">
                      @{entry.username}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
