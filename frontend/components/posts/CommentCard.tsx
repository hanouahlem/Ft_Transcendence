"use client";

import Link from "next/link";
import { Bookmark, Heart, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RelativeTime } from "@/components/ui/relative-time";
import { getInitials } from "@/lib/user-utils";
import type { FeedComment } from "@/lib/feed-types";
import { SocialToggle } from "@/components/posts/SocialToggle";

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

	return (
		<div className="relative overflow-hidden border border-black/10 bg-field-paper-muted px-4 py-4 shadow-[4px_6px_18px_rgba(26,26,26,0.08)]">
			<div className="flex items-start justify-between gap-3">
				<div className="flex min-w-0 items-center gap-3">
					<Link
						href={`/profil/${comment.author.id}`}
						className="shrink-0"
					>
						<Avatar className="h-8 w-8 overflow-hidden rounded-none border border-field-label bg-field-stage p-0.5 -rotate-2">
							<AvatarImage
								src={comment.author.avatar || ""}
								alt={comment.author.username}
								className="archive-photo object-cover"
							/>
							<AvatarFallback className="rounded-none bg-field-stage font-display text-[10px] font-black text-field-ink">
								{getInitials(comment.author.username)}
							</AvatarFallback>
						</Avatar>
					</Link>

					<div className="min-w-0">
						<div className="flex flex-wrap items-center gap-3">
							<Link
								href={`/profil/${comment.author.id}`}
								className="font-mono text-field-ink transition hover:text-field-accent-blue"
							>
								@{comment.author.username}
							</Link>
							<span className="font-mono text-[15px] text-field-label">
								@{comment.author.username.toLowerCase()}
							</span>
						</div>
					</div>
				</div>

				<div className="flex shrink-0 items-center gap-3">
					<RelativeTime
						dateString={comment.createdAt}
						className="font-mono text-[10px] uppercase tracking-[0.16em] text-field-label"
					/>

					{isOwner ? (
						<Button
							type="button"
							variant="delete"
							size="sm"
							onClick={() => onDeleteComment(comment.id)}
							disabled={isDeleting}
						>
							<Trash2 className="h-3.5 w-3.5" />
						</Button>
					) : null}
				</div>
			</div>

			<p className="font-display text-m leading-7 text-field-ink/85">
				{comment.content}
			</p>

			<div className="mt-2 flex flex-wrap items-center gap-2">
				<SocialToggle
					icon={Heart}
					label="Like comment"
					count={comment.likesCount}
					accent="orange"
					pressed={comment.likedByCurrentUser}
					disabled={isLiking}
					onClick={() => onToggleCommentLike(comment)}
				/>
				<SocialToggle
					icon={Bookmark}
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
