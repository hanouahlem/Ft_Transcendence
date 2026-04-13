"use client";

import type { KeyboardEvent, MouseEvent } from "react";
import { useRouter } from "next/navigation";
import type { NotificationItem } from "@/lib/api";
import { ProfilePicture } from "@/components/ui/ProfilePicture";
import { UserIdentityLink } from "@/components/users/UserIdentityLink";
import ArchiveTape from "@/components/decor/ArchiveTape";
import ArchiveStar from "@/components/decor/ArchiveStar";
import {
  getNotificationTone,
  NotificationGlyph,
} from "@/components/notifications/NotificationVisuals";
import {
  formatNotificationTime,
  getNotificationCopy,
  getNotificationHref,
} from "@/lib/notification-utils";
import { cn } from "@/lib/utils";

type NotificationCardProps = {
  notification: NotificationItem;
  index: number;
  onMarkAsRead: (notificationId: number) => Promise<void>;
};

const ROTATIONS = ["rotate-1", "-rotate-1", "rotate-0", "rotate-2", "-rotate-1"];

export function NotificationCard({
  notification,
  index,
  onMarkAsRead,
}: NotificationCardProps) {
  const router = useRouter();
  const copy = getNotificationCopy(notification);
  const href = getNotificationHref(notification);
  const tone = getNotificationTone(notification.type);
  const rotation = ROTATIONS[index % ROTATIONS.length];
  const actorDisplayName =
    notification.actor.displayName?.trim() || notification.actor.username;
  const actorHandle = `@${notification.actor.username.toLowerCase()}`;
  const actorPreview = {
    id: notification.actor.id,
    username: notification.actor.username,
    displayName: notification.actor.displayName,
    avatar: notification.actor.avatar,
  };

  const navigateToRecord = () => {
    if (!notification.read) {
      void onMarkAsRead(notification.id);
    }

    router.push(href);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      navigateToRecord();
    }
  };

  const handleActorLinkClick = (event: MouseEvent<HTMLElement>) => {
    event.stopPropagation();

    if (!notification.read) {
      void onMarkAsRead(notification.id);
    }
  };

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={navigateToRecord}
      onKeyDown={handleKeyDown}
      className={cn(
        "group relative cursor-pointer border-2 border-label/30 p-5 text-left shadow-[8px_12px_25px_rgba(26,26,26,0.15)] transition-transform duration-200 hover:-translate-y-1",
        notification.read ? "bg-paper-muted" : "bg-paper",
        rotation,
      )}
    >
      <ArchiveTape tone={tone.tapeTone} className={tone.tapeClass} />
      {notification.type === "MENTION" ? (
        <div className="pointer-events-none absolute -left-4 -top-4 z-20 h-8 w-8 scale-75 rotate-[12deg]">
          <ArchiveStar />
        </div>
      ) : null}

      <div className="flex items-start gap-4">
        <div
          className={cn(
            "mt-1 flex h-12 w-12 shrink-0 items-center justify-center border",
            tone.iconWrap,
          )}
        >
          <NotificationGlyph type={notification.type} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <UserIdentityLink user={actorPreview} onClick={handleActorLinkClick}>
                  <ProfilePicture
                    name={actorDisplayName}
                    src={notification.actor.avatar}
                    alt={actorDisplayName}
                    withShadow={false}
                    className="h-6 w-6 border border-label/50 bg-paper p-0"
                  />
                </UserIdentityLink>
                <UserIdentityLink
                  user={actorPreview}
                  onClick={handleActorLinkClick}
                  className="truncate text-[1.2rem] font-bold text-ink transition-colors hover:text-accent-blue"
                >
                  {actorDisplayName}
                </UserIdentityLink>
                <UserIdentityLink
                  user={actorPreview}
                  onClick={handleActorLinkClick}
                  className="truncate font-mono text-[0.8rem] text-label transition-colors hover:text-accent-blue"
                >
                  {actorHandle}
                </UserIdentityLink>
              </div>
            </div>

            <div className="shrink-0 space-y-2 text-right">
              <span className="inline-flex bg-stage px-1.5 py-0.5 font-mono text-[10px] text-label">
                {formatNotificationTime(notification.createdAt)}
              </span>
            </div>
          </div>

          <p className="text-[1.2rem] leading-relaxed text-label">
            {copy.body}
            {copy.quote && copy.inlineQuote ? (
              <>
                {" "}
                <span className="font-serif italic text-ink">
                  &quot;{copy.quote}&quot;
                </span>
              </>
            ) : null}
          </p>

          {copy.quote && !copy.inlineQuote ? (
            <div className="mt-3 border-l-2 border-accent-green bg-stage/40 px-3 py-2 font-serif text-[1.2rem] italic leading-relaxed text-ink">
              &quot;{copy.quote}&quot;
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}
