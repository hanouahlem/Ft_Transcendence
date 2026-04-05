"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { Bookmark, Heart, MessageCircle, Trash2, X } from "lucide-react";
import type { FeedComment, FeedPost } from "@/lib/feed-types";
import { getInitials } from "@/lib/user-utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RelativeTime } from "@/components/ui/relative-time";
import {
	Dialog,
	DialogClose,
	DialogContent,
} from "@/components/ui/dialog";
import { CommentCard } from "@/components/posts/CommentCard";
import { CommentComposer } from "@/components/posts/CommentComposer";
import { SocialToggle } from "@/components/posts/SocialToggle";
import { Button } from "@/components/ui/button";

type PostDialogProps = {
	open: boolean;
	post: FeedPost | null;
	focusCommentInput?: boolean;
	currentUserId: number | undefined;
	onOpenChange: (open: boolean) => void;
	onDelete: (postId: number) => Promise<void>;
	onDeleteComment: (commentId: number) => Promise<void>;
	onToggleLike: (post: FeedPost) => Promise<void>;
	onToggleFavorite: (post: FeedPost) => Promise<void>;
	onToggleCommentLike: (comment: FeedComment) => Promise<void>;
	onToggleCommentFavorite: (comment: FeedComment) => Promise<void>;
	onCommentChange: (postId: number, value: string) => void;
	onAddComment: (postId: number) => Promise<void>;
	commentValue: string;
	deletingPostId: number | null;
	deletingCommentId: number | null;
	likingPostId: number | null;
	favoritingPostId: number | null;
	likingCommentId: number | null;
	favoritingCommentId: number | null;
	commentingPostId: number | null;
};

export function PostDialog({
	open,
	post,
	focusCommentInput = false,
	currentUserId,
	onOpenChange,
	onDelete,
	onDeleteComment,
	onToggleLike,
	onToggleFavorite,
	onToggleCommentLike,
	onToggleCommentFavorite,
	onCommentChange,
	onAddComment,
	commentValue,
	deletingPostId,
	deletingCommentId,
	likingPostId,
	favoritingPostId,
	likingCommentId,
	favoritingCommentId,
	commentingPostId,
}: PostDialogProps) {
	const commentInputRef = useRef<HTMLTextAreaElement | null>(null);

	const focusReplyInput = () => {
		commentInputRef.current?.scrollIntoView({
			behavior: "smooth",
			block: "center",
		});
		commentInputRef.current?.focus();
		const valueLength = commentInputRef.current?.value.length ?? 0;
		commentInputRef.current?.setSelectionRange(valueLength, valueLength);
	};

	const queueReplyFocus = () => {
		requestAnimationFrame(() => {
			focusReplyInput();
		});
	};

	useEffect(() => {
		if (!open || !post || !focusCommentInput) {
			return;
		}

		const frame = requestAnimationFrame(() => {
			focusReplyInput();
		});

		return () => cancelAnimationFrame(frame);
	}, [open, post, focusCommentInput]);

	const isOwner = post ? post.author.id === currentUserId : false;
	const isDeleting = post ? deletingPostId === post.id : false;
	const isLiking = post ? likingPostId === post.id : false;
	const isFavoriting = post ? favoritingPostId === post.id : false;
	const isCommenting = post ? commentingPostId === post.id : false;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			{post ? (
				<DialogContent className="max-h-[90vh] overflow-hidden p-0">
					<DialogClose asChild>
						<button
							type="button"
							className="rounded-full border border-black/10 bg-paper p-2 text-label transition hover:bg-paper-muted"
							aria-label="Close post dialog"
						>
							<X className="h-5 w-5" />
						</button>
					</DialogClose>
					<article className="relative max-h-[90vh] overflow-auto border border-black/10 bg-stage rounded-none p-0">
						<div className="px-5 py-6 sm:px-8 sm:py-8">
							<div className="space-y-6">
								<section className="archive-paper relative overflow-hidden border border-black/10 bg-paper px-5 py-5">
									<div className="mb-5 flex items-start justify-between gap-4 border-b border-dashed border-black/20 pb-4">
										<div className="flex min-w-0 items-center gap-3">
											<Link
												href={`/profil/${post.author.id}`}
												className="shrink-0"
											>
												<Avatar className="h-11 w-11 overflow-hidden rounded-none border border-label bg-stage p-0.5 -rotate-2">
													<AvatarImage
														src={
															post.author
																.avatar || ""
														}
														alt={
															post.author.username
														}
														className="archive-photo object-cover"
													/>
													<AvatarFallback className="rounded-none bg-stage font-display text-xs font-black text-ink">
														{getInitials(
															post.author
																.username,
														)}
													</AvatarFallback>
												</Avatar>
											</Link>

											<div className="min-w-0">
												<div className="flex flex-wrap items-center gap-3">
													<Link
														href={`/profil/${post.author.id}`}
														className="truncate text-lg font-bold uppercase tracking-wide text-ink"
													>
														{post.author.username}
													</Link>
													<span className="font-mono text-xs text-label">
														@
														{post.author.username.toLowerCase()}
													</span>
												</div>
											</div>
										</div>

										<div className="flex shrink-0 items-center gap-3">
											<RelativeTime
												dateString={post.createdAt}
												className="font-mono text-[10px] text-label"
											/>
											{isOwner ? (
												<Button
													type="button"
													variant="stamp"
													size="sm"
													onClick={() =>
														onDelete(post.id)
													}
													disabled={isDeleting}
												>
													<Trash2 className="h-3.5 w-3.5" />
													{isDeleting
														? "Deleting"
														: "Delete"}
												</Button>
											) : null}
										</div>
									</div>

									{post.content ? (
										<p className="font-display text-lg leading-8 text-ink">
											{post.content}
										</p>
									) : null}

									{post.media.length > 0 ? (
										<div className="relative mt-6 w-full rotate-[-1deg] bg-white p-2 pb-8 shadow-lg">
											<img
												src={post.media[0]}
												alt="Post media"
												className="archive-photo max-h-[420px] w-full border border-label/20 object-cover"
											/>
											<div className="absolute bottom-2 right-3 font-mono text-[10px] text-label">
												FILM ROLL 42 - EXP {post.id}
											</div>
										</div>
									) : null}

									<div className="mt-6 border-t border-ink/10 pt-4">
										<div className="flex flex-wrap items-center gap-2 sm:gap-4">
											<SocialToggle
												icon={MessageCircle}
												label="Comment count"
												count={post.commentsCount}
												accent="blue"
												onMouseDown={(event) =>
													event.preventDefault()
												}
												onClick={queueReplyFocus}
											/>
											<SocialToggle
												icon={Bookmark}
												label="Favorite post"
												count={post.favoritesCount}
												accent="green"
												pressed={
													post.favoritedByCurrentUser
												}
												disabled={isFavoriting}
												onClick={() =>
													onToggleFavorite(post)
												}
											/>
											<SocialToggle
												icon={Heart}
												label="Like post"
												count={post.likesCount}
												accent="orange"
												pressed={post.likedByCurrentUser}
												disabled={isLiking}
												onClick={() =>
													onToggleLike(post)
												}
											/>
										</div>
									</div>
								</section>

								<section className="space-y-4 rounded-sm bg-stage/45 px-0 py-0">
									{post.comments.map((comment) => (
										<CommentCard
											key={comment.id}
											comment={comment}
											currentUserId={currentUserId}
											onDeleteComment={onDeleteComment}
											onToggleCommentLike={
												onToggleCommentLike
											}
											onToggleCommentFavorite={
												onToggleCommentFavorite
											}
											deletingCommentId={
												deletingCommentId
											}
											likingCommentId={likingCommentId}
											favoritingCommentId={
												favoritingCommentId
											}
										/>
									))}
								</section>

								<CommentComposer
									ref={commentInputRef}
									postId={post.id}
									value={commentValue}
									submitting={isCommenting}
									onChange={onCommentChange}
									onSubmit={onAddComment}
								/>
							</div>
						</div>
					</article>
				</DialogContent>
			) : null}
		</Dialog>
	);
}
