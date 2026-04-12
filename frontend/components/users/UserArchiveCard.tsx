import Link from "next/link";
import type { ReactNode } from "react";
import ArchiveStar from "@/components/decor/ArchiveStar";
import { ProfileBanner } from "@/components/profile/ProfileBanner";
import { ProfilePicture } from "@/components/ui/ProfilePicture";
import {
  formatUserPreviewCompactCount,
  formatUserPreviewJoinedDate,
  getUserPreviewBio,
  getUserPreviewDisplayName,
  type UserPreviewIdentity,
} from "@/lib/user-preview";
import { cn } from "@/lib/utils";

const CARD_VARIANTS = [
  {
    surface: "bg-paper rotate-1",
    avatar: "-rotate-2",
    star: false,
  },
  {
    surface: "bg-paper -rotate-1",
    avatar: "rotate-1",
    star: false,
  },
  {
    surface: "bg-paper rotate-[0.5deg]",
    avatar: "-rotate-1",
    star: true,
  },
  {
    surface: "bg-paper -rotate-[1.5deg]",
    avatar: "rotate-2",
    star: false,
  },
  {
    surface: "bg-paper rotate-[1.75deg]",
    avatar: "-rotate-3",
    star: true,
  },
];

type UserArchiveCardProps = {
  user: UserPreviewIdentity;
  topRightContent?: ReactNode;
  className?: string;
  renderIdentityLink?: (content: ReactNode, className?: string) => ReactNode;
  cardHref?: string;
  showBio?: boolean;
  compact?: boolean;
};

export function UserArchiveCard({
  user,
  topRightContent,
  className,
  renderIdentityLink,
  cardHref,
  showBio = true,
  compact = false,
}: UserArchiveCardProps) {
  const variant = CARD_VARIANTS[user.id % CARD_VARIANTS.length];
  const displayName = getUserPreviewDisplayName(user);
  const bio = getUserPreviewBio(user);

  const renderIdentity = (
    content: ReactNode,
    wrapperClassName?: string,
  ) => {
    if (renderIdentityLink) {
      return renderIdentityLink(content, wrapperClassName);
    }

    return <div className={wrapperClassName}>{content}</div>;
  };

  return (
    <article
      className={cn(
        "group relative border border-label/30 shadow-[6px_10px_28px_rgba(26,26,26,0.12)] transition-transform duration-200 hover:-translate-y-1",
        variant.surface,
        className,
      )}
    >
      {cardHref ? (
        <Link
          href={cardHref}
          aria-label={`Open ${displayName}'s profile`}
          className="absolute inset-0 z-10"
        />
      ) : null}

      {renderIdentity(
        <div
          className={cn(
            "relative overflow-hidden bg-paper-muted/80",
            compact ? "h-20" : "h-24",
          )}
        >
          <ProfileBanner
            name={user.username}
            src={user.banner}
            className="h-full w-full object-cover"
          />
        </div>,
        "block",
      )}

      <div className={cn("relative pt-0", compact ? "p-4" : "p-5")}>
        {renderIdentity(
          <ProfilePicture
            name={displayName}
            src={user.avatar}
            alt={displayName}
            className={cn(
              "absolute border-none bg-white",
              compact ? "-top-7 left-4 h-14 w-14" : "-top-8 left-5 h-16 w-16",
              variant.avatar,
            )}
            frameClassName="bg-paper p-1"
          />,
        )}

        <div className={cn(compact ? "pt-8" : "pt-10")}>
          <div className={cn("flex items-start justify-between", compact ? "gap-3" : "gap-4")}>
            <div className="min-w-0">
              {renderIdentity(
                <>
                  <h3
                    className={cn(
                      "truncate font-display font-black uppercase tracking-[-0.04em] text-ink",
                      compact ? "text-xl" : "text-2xl",
                    )}
                  >
                    {displayName}
                  </h3>
                  <p className="truncate font-mono text-[11px] uppercase tracking-[0.18em] text-label">
                    @{user.username.toLowerCase()}
                  </p>
                </>,
                "block",
              )}
            </div>

            {topRightContent ? (
              <div className="relative z-20 shrink-0">{topRightContent}</div>
            ) : null}
          </div>

          {showBio
            ? renderIdentity(
                <p
                  className={cn(
                    "mt-3 font-display leading-relaxed text-ink",
                    compact ? "min-h-[56px] text-[13px]" : "min-h-[72px] text-sm",
                  )}
                >
                  {bio}
                </p>,
                "block",
              )
            : null}

          {renderIdentity(
            <div className={cn("grid grid-cols-3 text-center", compact ? "gap-3" : "gap-4")}>
              <div>
                <div
                  className="font-display font-bold text-2xl text-ink"
                >
                  {formatUserPreviewCompactCount(user.postCount ?? 0)}
                </div>
                <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-label">
                  Posts
                </div>
              </div>
              <div>
                <div
                  className="font-display font-bold text-2xl text-ink"
                >
                  {formatUserPreviewCompactCount(user.totalLikes ?? 0)}
                </div>
                <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-label">
                  Likes
                </div>
              </div>
              <div>
                <div
                  className="font-display font-bold text-2xl text-ink"
                >
                  {formatUserPreviewCompactCount(user.friendCount ?? 0)}
                </div>
                <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-label">
                  Friends
                </div>
              </div>
            </div>,
            cn(
              "block border-t border-dashed border-label/30",
              compact ? "mt-3 pt-2.5" : "mt-4 pt-3",
            ),
          )}

          {renderIdentity(
            <div className="flex min-w-0 w-full items-center justify-end gap-3 text-right">
              <span>Joined {formatUserPreviewJoinedDate(user.createdAt)}</span>
            </div>,
            cn(
              "flex items-center justify-between gap-3 border-t border-dashed border-label/20 font-mono text-[10px] uppercase tracking-[0.18em] text-label",
              compact ? "mt-3 pt-2.5" : "mt-4 pt-3",
            ),
          )}
        </div>

        {variant.star ? (
          <div
            className={cn(
              "pointer-events-none absolute rotate-[14deg]",
              compact
                ? "bottom-[28%] -right-2 h-9 w-9"
                : "bottom-[30%] -right-3 h-11 w-11",
            )}
          >
            <ArchiveStar />
          </div>
        ) : null}
      </div>
    </article>
  );
}
