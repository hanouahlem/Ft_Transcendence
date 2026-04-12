import { Location01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { UserArchiveCard } from "@/components/users/UserArchiveCard";
import type { UserPreviewIdentity } from "@/lib/user-preview";
import { cn } from "@/lib/utils";

type UserPreviewCardProps = {
  user: UserPreviewIdentity;
  className?: string;
};

export function UserPreviewCard({ user, className }: UserPreviewCardProps) {
  return (
    <UserArchiveCard
      user={user}
      className={cn("w-[320px]", className)}
      showBio={false}
      compact
      topRightContent={
        user.location?.trim() ? (
          <span className="inline-flex max-w-[132px] items-center gap-2 bg-ink p-1 px-2 font-mono text-[10px] uppercase tracking-[0.16em] text-paper">
            <HugeiconsIcon icon={Location01Icon} size={14} strokeWidth={1.9} />
            <span className="truncate">{user.location.trim()}</span>
          </span>
        ) : null
      }
    />
  );
}
