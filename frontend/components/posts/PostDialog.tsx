"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { Bookmark, Heart, MessageCircle, Trash2 } from "lucide-react";
import type { FeedComment, FeedPost } from "@/lib/feed-types";
import { RelativeTime } from "@/components/ui/relative-time";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { CommentCard } from "@/components/posts/CommentCard";
import { CommentComposer } from "@/components/posts/CommentComposer";
import { SocialToggle } from "@/components/posts/SocialToggle";
import { Button } from "@/components/ui/button";
import { ProfilePicture } from "@/components/ui/ProfilePicture";
import {
	ScrollArea,
	ScrollAreaContent,
	ScrollAreaCorner,
	ScrollAreaScrollbar,
	ScrollAreaThumb,
	ScrollAreaViewport,
} from "@/components/ui/scroll-area";

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
	const authorDisplayName =
		post?.author.displayName?.trim() || post?.author.username || "Observer";

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			{post ? (
				<DialogContent className="max-h-[90vh] max-w-[1120px] overflow-hidden p-0">
					<article className="relative max-h-[90vh] overflow-auto border border-black/0 bg-stage/0 rounded-none p-0">
						<div className="grid gap-6 px-5 py-6 sm:px-8 sm:py-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)] lg:gap-8">
							<section className="-rotate-1 archive-paper relative overflow-hidden border border-black/10 bg-paper px-5 py-5 lg:self-center">
								<div className="mb-5 flex items-start justify-between gap-4 border-b border-dashed border-black/20 pb-4">
									<div className="flex min-w-0 items-center gap-3">
										<Link
											href={`/profile/${encodeURIComponent(post.author.username)}`}
											className="shrink-0"
										>
											<ProfilePicture
												name={authorDisplayName}
												src={post.author.avatar}
												alt={authorDisplayName}
												className="h-11 w-11 -rotate-2"
											/>
										</Link>

										<div className="min-w-0">
											<div className="flex flex-wrap items-center gap-3">
												<Link
													href={`/profile/${encodeURIComponent(post.author.username)}`}
													className="truncate text-lg font-display uppercase tracking-wide text-ink"
												>
													{authorDisplayName}
												</Link>
												<span className="font-mono text-xs text-label">
													@{post.author.username.toLowerCase()}
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
												onClick={() => onDelete(post.id)}
												disabled={isDeleting}
											>
												<Trash2 className="h-3.5 w-3.5" />
												{isDeleting ? "Deleting" : "Delete"}
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
											pressed={post.favoritedByCurrentUser}
											disabled={isFavoriting}
											onClick={() => onToggleFavorite(post)}
										/>
										<SocialToggle
											icon={Heart}
											label="Like post"
											count={post.likesCount}
											accent="red"
											pressed={post.likedByCurrentUser}
											disabled={isLiking}
											onClick={() => onToggleLike(post)}
										/>
									</div>
								</div>
							</section>

							<section className="rotate-1 max-h-[80vh] border border-black/10 bg-stage lg:flex lg:self-stretch lg:flex-col">
								<div className="border-b border-dashed border-black/10 px-5 py-4 sm:px-6">
									<p className="font-mono text-[11px] uppercase tracking-[0.18em] text-label">
										Discussion
									</p>
								</div>

								<div className="px-2 py-2 lg:flex lg:min-h-0 lg:flex-1 lg:flex-col">
									<ScrollArea className="max-h-[38vh] lg:min-h-0 lg:max-h-none lg:flex-1">
										<ScrollAreaViewport className="max-h-[38vh] lg:h-full lg:max-h-none">
											<ScrollAreaContent className="pb-1">
											<section className="space-y-4">
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
										</ScrollAreaContent>
									</ScrollAreaViewport>
									<ScrollAreaScrollbar orientation="vertical">
										<ScrollAreaThumb />
									</ScrollAreaScrollbar>
									<ScrollAreaCorner />
									</ScrollArea>

									<div className="mt-4 shrink-0 border-t border-dashed border-black/10 pt-4">
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
							</section>
						</div>
					</article>
				</DialogContent>
			) : null}
		</Dialog>
	);
}
