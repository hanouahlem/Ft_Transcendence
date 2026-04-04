"use client";

import Link from "next/link";
import { Bookmark, Heart, Trash2 } from "lucide-react";
import { ArchiveButton } from "@/components/archive/ArchiveButton";
import { FeedActionButton } from "@/components/feed/FeedActionButton";
import { formatFeedTime } from "@/components/feed/feedUtils";
import type { FeedComment } from "@/components/feed/types";
import { cn } from "@/lib/utils";

type CommentCardProps = {
  comment: FeedComment;
  currentUserId: number | undefined;
  index: number;
  onDeleteComment: (commentId: number) => Promise<void>;
  onToggleCommentLike: (comment: FeedComment) => Promise<void>;
  onToggleCommentFavorite: (comment: FeedComment) => Promise<void>;
  deletingCommentId: number | null;
  likingCommentId: number | null;
  favoritingCommentId: number | null;
};

export function CommentCard({
  comment,
  currentUserId,
  index,
  onDeleteComment,
  onToggleCommentLike,
  onToggleCommentFavorite,
  deletingCommentId,
  likingCommentId,
  favoritingCommentId,
}: CommentCardProps) {
  const isOwner = comment.author.id === currentUserId;
  const isDeleting = deletingCommentId === comment.id;
  const isLiking = likingCommentId === comment.id;
  const isFavoriting = favoritingCommentId === comment.id;
  const tapeColors = [
    "bg-field-accent-blue",
    "bg-field-accent-green",
    "bg-field-accent",
  ];

  return (
    <div className="relative overflow-hidden border border-black/10 bg-field-paper-muted px-4 py-4 shadow-[4px_6px_18px_rgba(26,26,26,0.08)]">
      <div
        className={cn(
          "archive-tape absolute -top-2 left-5 h-4 w-16 -rotate-2",
          tapeColors[index % tapeColors.length]
        )}
      />

      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/profil/${comment.author.id}`}
              className="font-semibold text-field-ink transition hover:text-field-accent-blue"
            >
              {comment.author.username}
            </Link>
            <span className="font-field-mono text-[11px] text-field-label">
              @{comment.author.username.toLowerCase()}
            </span>
          </div>
          <p className="mt-1 font-field-mono text-[10px] uppercase tracking-[0.16em] text-field-label">
            {formatFeedTime(comment.createdAt)}
          </p>
        </div>

        {isOwner ? (
          <ArchiveButton
            type="button"
            variant="stamp"
            size="sm"
            onClick={() => onDeleteComment(comment.id)}
            disabled={isDeleting}
          >
            <Trash2 className="h-3.5 w-3.5" />
            {isDeleting ? "Deleting" : "Delete"}
          </ArchiveButton>
        ) : null}
      </div>

      <p className="font-field-display text-sm leading-7 text-field-ink/85">
        {comment.content}
      </p>

      {comment.media.length > 0 ? (
        <div className="mt-4 overflow-hidden border border-black/10 bg-field-stage/70">
          <img
            src={comment.media[0]}
            alt="Comment media"
            className="archive-photo max-h-[280px] w-full object-cover"
          />
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <FeedActionButton
          icon={Heart}
          label="Like comment"
          count={comment.likesCount}
          accent="orange"
          active={comment.likedByCurrentUser}
          disabled={isLiking}
          onClick={() => onToggleCommentLike(comment)}
        />
        <FeedActionButton
          icon={Bookmark}
          label="Favorite comment"
          count={comment.favoritesCount}
          accent="green"
          active={comment.favoritedByCurrentUser}
          disabled={isFavoriting}
          onClick={() => onToggleCommentFavorite(comment)}
        />
      </div>
    </div>
  );
}
