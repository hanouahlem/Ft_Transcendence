"use client";

import {
	Bookmark02Icon,
	Delete02Icon,
	FavouriteIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@/components/ui/button";
import { RelativeTime } from "@/components/ui/relative-time";
import type { FeedComment } from "@/lib/feed-types";
import { SocialToggle } from "@/components/posts/SocialToggle";
import { ProfilePicture } from "@/components/ui/ProfilePicture";
import { UserIdentityLink } from "@/components/users/UserIdentityLink";

type CommentCardProps = {
	comment: FeedComment;
	currentUserId: number | undefined;
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
	const authorDisplayName =
		comment.author.displayName?.trim() || comment.author.username;
	const authorPreview = {
		id: comment.author.id,
		username: comment.author.username,
		displayName: comment.author.displayName,
		avatar: comment.author.avatar,
	};

	return (
		<div className="relative w-full min-w-0 max-w-full overflow-hidden border border-black/10 bg-paper-muted px-4 py-4 shadow-[4px_6px_18px_rgba(26,26,26,0.08)]">
			<div className="flex items-start justify-between gap-3">
				<div className="flex min-w-0 flex-1 items-center gap-3">
					<UserIdentityLink
						user={authorPreview}
						className="shrink-0"
					>
						<ProfilePicture
							name={authorDisplayName}
							src={comment.author.avatar}
							alt={authorDisplayName}
							className="h-8 w-8 -rotate-2"
						/>
					</UserIdentityLink>

					<div className="min-w-0 flex-1">
						<div className="flex flex-wrap items-center gap-3">
							<UserIdentityLink
								user={authorPreview}
								className="max-w-full truncate font-display text-ink transition hover:text-accent-blue"
							>
								{authorDisplayName}
							</UserIdentityLink>
							<UserIdentityLink
								user={authorPreview}
								className="max-w-full truncate font-mono text-xs text-label"
							>
								@{comment.author.username.toLowerCase()}
							</UserIdentityLink>
						</div>
					</div>
				</div>

				<div className="flex shrink-0 items-center gap-3">
					<RelativeTime
						dateString={comment.createdAt}
						className="font-mono text-[10px] uppercase tracking-[0.16em] text-label"
					/>

					{isOwner ? (
						<Button
							type="button"
							variant="delete"
							size="sm"
							onClick={() => onDeleteComment(comment.id)}
							disabled={isDeleting}
						>
							<HugeiconsIcon icon={Delete02Icon} size={14} strokeWidth={1.9} />
						</Button>
					) : null}
				</div>
			</div>

			<p className="mt-3 w-full min-w-0 max-w-full whitespace-pre-wrap break-all font-display text-m leading-7 text-ink/85">
				{comment.content}
			</p>

			<div className="mt-2 flex flex-wrap items-center gap-2">
				<SocialToggle
					icon={FavouriteIcon}
					label="Like comment"
					count={comment.likesCount}
					accent="red"
					pressed={comment.likedByCurrentUser}
					disabled={isLiking}
					onClick={() => onToggleCommentLike(comment)}
				/>
				<SocialToggle
					icon={Bookmark02Icon}
					label="Favorite comment"
					count={comment.favoritesCount}
					accent="green"
					pressed={comment.favoritedByCurrentUser}
					disabled={isFavoriting}
					onClick={() => onToggleCommentFavorite(comment)}
				/>
			</div>
		</div>
	);
}
