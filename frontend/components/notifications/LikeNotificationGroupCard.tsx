"use client";

import type { KeyboardEvent } from "react";
import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { ProfilePicture } from "@/components/ui/ProfilePicture";
import { useI18n } from "@/i18n/I18nProvider";
import type { LikeNotificationGroupLedgerItem } from "@/lib/notification-utils";
import { cn } from "@/lib/utils";
import { formatNotificationTime } from "@/lib/notification-utils";

type LikeNotificationGroupCardProps = {
  group: LikeNotificationGroupLedgerItem;
  index: number;
  onMarkAsRead: (notificationIds: number[]) => Promise<void>;
};

const ROTATIONS = ["rotate-1", "-rotate-1", "rotate-0", "rotate-2", "-rotate-2"];

function truncateLikePreview(content?: string | null, maxLength = 60) {
  const normalized = content?.trim().replace(/\s+/g, " ") || "";

  if (!normalized) {
    return "";
  }

  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, maxLength).trimEnd()}...`;
}

export function LikeNotificationGroupCard({
  group,
  index,
  onMarkAsRead,
}: LikeNotificationGroupCardProps) {
  const router = useRouter();
  const { locale, t } = useI18n();
  const rotation = ROTATIONS[index % ROTATIONS.length];
  const primaryActor = group.actors[0];
  const primaryName =
    primaryActor?.displayName?.trim() || primaryActor?.username || t("notifications.someone");
  const otherCount = Math.max(0, group.likeCount - 1);
  const unreadIds = group.notifications
    .filter((notification) => !notification.read)
    .map((notification) => notification.id);
  const postPreview =
    truncateLikePreview(group.latestNotification.post?.content) ||
    t("notifications.likeGroup.fallbackPost");

  const handleOpenGroup = () => {
    if (unreadIds.length > 0) {
      void onMarkAsRead(unreadIds);
    }

    router.push(`/profile?post=${group.postId}`);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleOpenGroup();
    }
  };

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={handleOpenGroup}
      onKeyDown={handleKeyDown}
      className={cn(
        "group relative cursor-pointer border-2 border-label/30 px-6 py-7 text-start shadow-[8px_12px_25px_rgba(26,26,26,0.15)] transition-transform duration-200 hover:-translate-y-1",
        group.unread ? "bg-paper" : "bg-paper-muted",
        rotation,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex shrink-0 flex-col items-start gap-3">
              <div className="-mb-6 flex h-12 w-12 items-center justify-center border border-accent-red/20 bg-accent-red/100 text-paper shadow-[3px_4px_0_rgba(211,47,47,0.18)] -rotate-3">
                <Heart className="h-5 w-5 fill-current" />
              </div>

              <div className="flex items-center">
                {group.actors.slice(0, 3).map((actor, avatarIndex) => {
                  const actorName = actor.displayName?.trim() || actor.username;

                  return (
                    <div
                      key={actor.id}
                      className={cn(
                        "overflow-hidden rounded-full border-2 border-paper shadow-[2px_3px_8px_rgba(26,26,26,0.12)]",
                        avatarIndex === 0 ? "z-30" : avatarIndex === 1 ? "z-30 -ml-4 mt-3 " : "z-10 -ml-4",
                      )}
                    >
                      <ProfilePicture
                        name={actorName}
                        src={actor.avatar}
                        alt={actorName}
                        withShadow={false}
                        className="h-6 w-6 border-0 bg-paper p-0"
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-4">
                <p className="font-display text-[1.2rem] leading-relaxed text-label">
                  <span className="font-black text-ink">{primaryName}</span>
                  {otherCount > 0 ? (
                    <>
                      {" "}
                      {t("notifications.likeGroup.andOthers", { count: otherCount })}
                    </>
                  ) : null}{" "}
                  {t("notifications.likeGroup.likedYourPost")}
                </p>
                <span className="shrink-0 bg-stage px-2.5 py-1 font-mono text-[10px] text-label">
                  {formatNotificationTime(group.createdAt, locale)}
                </span>
              </div>

              <div className="mt-4 border-l-2 border-accent-red bg-stage/40 px-3 py-2 font-serif text-[1.2rem] italic leading-relaxed text-ink">
                "{postPreview}"
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
