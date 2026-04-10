import Link from "next/link";
import { MapPin } from "lucide-react";
import ArchiveStar from "@/components/decor/ArchiveStar";
import { ProfileBanner } from "@/components/profile/ProfileBanner";
import { ProfilePicture } from "@/components/ui/ProfilePicture";
import { cn } from "@/lib/utils";
import type { PublicUser } from "@/lib/api";

export type SearchUserRecord = PublicUser & {
  friendCount: number;
  postCount: number;
  totalLikes: number;
  totalComments: number;
};

type SearchUserCardProps = {
  user: SearchUserRecord;
  index: number;
};

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

function formatCompactCount(value: number) {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

function formatJoinedDate(dateString?: string) {
  if (!dateString) {
    return "Recently";
  }

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "Recently";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
  }).format(date);
}

export function SearchUserCard({ user, index }: SearchUserCardProps) {
  const variant = CARD_VARIANTS[index % CARD_VARIANTS.length];
  const displayName = user.displayName?.trim() || user.username;
  const bio =
    user.bio?.trim() ||
    user.status?.trim() ||
    "Field observer contributing fresh records to the archive.";

  return (
    <Link
      href={`/profile/${encodeURIComponent(user.username)}`}
      className="group block"
    >
      <article
        className={cn(
          "relative border border-label/30 shadow-[6px_10px_28px_rgba(26,26,26,0.12)] transition-transform duration-200 group-hover:-translate-y-1",
          variant.surface,
        )}
      >
        <div className="relative h-24 overflow-hidden bg-paper-muted/80">
          <ProfileBanner
            name={user.username}
            src={user.banner}
            className="h-full w-full object-cover"
          />
        </div>

        <div className="relative p-5 pt-0">
          <ProfilePicture
            name={displayName}
            src={user.avatar}
            alt={displayName}
            className={cn(
              "absolute -top-8 left-5 h-16 w-16 border-none bg-white",
              variant.avatar,
            )}
            frameClassName="bg-paper p-1"
          />

          <div className="pt-10">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h3 className="truncate font-display text-2xl font-black uppercase tracking-[-0.04em] text-ink">
                  {displayName}
                </h3>
                <p className="truncate font-mono text-[11px] uppercase tracking-[0.18em] text-label">
                  @{user.username.toLowerCase()}
                </p>
              </div>

              {user.location ? (
                <span className="inline-flex max-w-[45%] shrink-0 items-center gap-1 truncate font-mono text-[10px] uppercase tracking-[0.18em] text-label">
                  <MapPin className="h-3.5 w-3.5" />
                  {user.location}
                </span>
              ) : null}
            </div>

            <p className="mt-3 min-h-[72px] text-sm leading-relaxed text-ink">
              {bio}
            </p>

            <div className="mt-4 grid grid-cols-3 gap-4 border-t border-dashed border-label/30 pt-3 text-center">
              <div>
                <div className="text-base font-bold text-ink">
                  {formatCompactCount(user.postCount)}
                </div>
                <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-label">
                  Posts
                </div>
              </div>
              <div>
                <div className="text-base font-bold text-ink">
                  {formatCompactCount(user.totalLikes)}
                </div>
                <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-label">
                  Likes
                </div>
              </div>
              <div>
                <div className="text-base font-bold text-ink">
                  {formatCompactCount(user.friendCount)}
                </div>
                <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-label">
                  Friends
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between gap-3 border-t border-dashed border-label/20 pt-3 font-mono text-[10px] uppercase tracking-[0.18em] text-label">
              <span>{formatCompactCount(user.totalComments)} notes logged</span>
              <span>Joined {formatJoinedDate(user.createdAt)}</span>
            </div>
          </div>

          {variant.star ? (
            <div className="pointer-events-none absolute bottom-[30%] -right-3 h-11 w-11 rotate-[14deg]">
              <ArchiveStar />
            </div>
          ) : null}
        </div>
      </article>
    </Link>
  );
}
