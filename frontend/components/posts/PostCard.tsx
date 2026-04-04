import Link from "next/link";
import { Bookmark, Heart, MessageCircle, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/components/archive/archiveUtils";
import { ArchiveButton } from "@/components/archive/ArchiveButton";
import { FeedActionButton } from "@/components/feed/FeedActionButton";
import { formatFeedTime } from "@/components/feed/feedUtils";
import type { FeedPost } from "@/components/feed/types";
import { cn } from "@/lib/utils";

type PostCardProps = {
	post: FeedPost;
	currentUserId: number | undefined;
	variantIndex: number;
	onOpenPost: (postId: number, focusCommentInput?: boolean) => void;
	onDelete: (postId: number) => Promise<void>;
	onToggleLike: (post: FeedPost) => Promise<void>;
	onToggleFavorite: (post: FeedPost) => Promise<void>;
	deletingPostId: number | null;
	likingPostId: number | null;
	favoritingPostId: number | null;
};

const POST_VARIANTS = [
	{
		wrapper: "",
		article: "bg-field-paper border-2 border-field-label/30 p-6 relative",
		tape: "left-6 top-[-12px] h-5 w-20 rotate-2 bg-field-accent-green",
		imageFrame:
			"relative mx-auto w-[90%] -rotate-2 bg-white p-2 pb-8 shadow-lg",
		imageMaxHeight: "max-h-[360px]",
		headerBorder: "border-dashed border-field-label/40",
		contentClass: "text-lg leading-relaxed text-justify",
		actionJustify: "justify-between",
	},
	{
		wrapper: "-rotate-1",
		article: "relative bg-field-paper-muted p-6 pb-10",
		tape: "right-8 top-[-12px] h-5 w-16 -rotate-2 bg-field-accent",
		imageFrame: "",
		imageMaxHeight: "max-h-[320px]",
		headerBorder: "border-field-label",
		contentClass: "text-lg leading-relaxed",
		actionJustify: "justify-between",
	},
	{
		wrapper: "rotate-1 ml-4",
		article:
			"relative border-l-4 border-field-accent-blue bg-field-paper p-6",
		tape: "left-1/2 top-[-12px] h-5 w-16 -translate-x-1/2 -rotate-1 bg-field-accent-blue",
		imageFrame: "",
		imageMaxHeight: "max-h-[260px]",
		headerBorder: "",
		contentClass: "text-base leading-relaxed text-field-label",
		actionJustify: "justify-start gap-8",
		accentDot: true,
	},
	{
		wrapper: "-rotate-1",
		article: "relative border-2 border-field-label/40 bg-field-stage p-6",
		tape: "left-4 top-[-12px] h-5 w-20 rotate-3 bg-field-accent",
		imageFrame: "",
		imageMaxHeight: "max-h-[300px]",
		headerBorder: "border-dashed border-field-ink/20",
		contentClass:
			"text-2xl font-bold italic leading-snug text-center py-4 opacity-90",
		actionJustify: "justify-between",
		star: true,
	},
	{
		wrapper: "",
		article:
			"bg-field-paper-muted border-2 border-field-label/30 p-6 relative",
		tape: "right-12 top-[-12px] h-6 w-24 -rotate-2 bg-field-accent-green",
		imageFrame:
			"relative rotate-1 border border-field-ink bg-field-paper-muted p-4",
		imageMaxHeight: "max-h-[320px]",
		headerBorder: "border-dashed border-field-label/40",
		contentClass: "text-lg leading-relaxed",
		actionJustify: "justify-between",
	},
] as const;

function OrangeStar() {
	return (
		<svg
			viewBox="0 0 50 50"
			className="h-full w-full fill-none stroke-field-accent"
			strokeWidth="1.5"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<polygon points="25,5 30,20 45,25 30,30 25,45 20,30 5,25 20,20" />
			<line x1="15" y1="15" x2="35" y2="35" />
			<line x1="15" y1="35" x2="35" y2="15" />
		</svg>
	);
}

function renderBody(
	post: FeedPost,
	variantIndex: number,
	contentClass: string,
) {
	const content = post.content.trim();

	if (!content) {
		return null;
	}

	if (variantIndex === 0) {
		const firstCharacter = content[0];
		const rest = content.slice(1);

		return (
			<p className={cn(contentClass, "font-field-display")}>
				<span className="float-left mr-2 text-4xl leading-none font-black text-field-accent">
					{firstCharacter}
				</span>
				{rest}
			</p>
		);
	}

	if (variantIndex === 3 && !post.media.length && content.length < 200) {
		return (
			<p className={cn(contentClass, "font-field-display")}>
				&quot;{content}&quot;
			</p>
		);
	}

	if (variantIndex === 3) {
		return (
			<p className="font-field-display text-lg leading-relaxed text-field-ink">
				{content}
			</p>
		);
	}

	return <p className={cn(contentClass, "font-field-display")}>{content}</p>;
}

export function PostCard({
	post,
	currentUserId,
	variantIndex,
	onOpenPost,
	onDelete,
	onToggleLike,
	onToggleFavorite,
	deletingPostId,
	likingPostId,
	favoritingPostId,
}: PostCardProps) {
	const variantKey = variantIndex % POST_VARIANTS.length;
	const variant = POST_VARIANTS[variantKey];
	const isOwner = post.author.id === currentUserId;
	const isDeleting = deletingPostId === post.id;
	const isLiking = likingPostId === post.id;
	const isFavoriting = favoritingPostId === post.id;

	return (
		<div className={variant.wrapper}>
			<article
				className={cn(variant.article)}
				style={{ boxShadow: "6px 10px 28px rgba(26,26,26,0.12)" }}
			>
				<div
					className={cn("archive-tape absolute z-30", variant.tape)}
				/>

				{variant.accentDot ? (
					<div className="absolute -left-5 top-8 h-2 w-2 rounded-full bg-field-label" />
				) : null}

				{variant.star ? (
					<div className="absolute right-6 top-2 h-8 w-8 rotate-90 scale-50 pointer-events-none">
						<OrangeStar />
					</div>
				) : null}

				<div
					className={cn(
						"mb-4 flex justify-between items-baseline gap-3",
						variant.headerBorder
							? `border-b pb-2 ${variant.headerBorder}`
							: "",
					)}
				>
					<div className="flex min-w-0 items-center gap-3">
						<Link
							href={`/profil/${post.author.id}`}
							className="shrink-0"
						>
							<Avatar
								className={cn(
									"overflow-hidden rounded-none border border-field-label bg-field-stage p-0.5",
									variantKey === 2
										? "h-8 w-8 rotate-1"
										: "h-10 w-10 -rotate-2",
								)}
							>
								<AvatarImage
									src={post.author.avatar || ""}
									alt={post.author.username}
									className="archive-photo object-cover"
								/>
								<AvatarFallback className="rounded-none bg-field-stage font-field-display text-xs font-black text-field-ink">
									{getInitials(post.author.username)}
								</AvatarFallback>
							</Avatar>
						</Link>

						<div className="min-w-0">
							<div className="flex flex-wrap items-center gap-3">
								<Link
									href={`/profil/${post.author.id}`}
									className={cn(
										"truncate font-bold uppercase tracking-wide text-field-ink",
										variantKey === 2
											? "text-base"
											: "text-lg",
									)}
								>
									{post.author.username}
								</Link>
								<span className="font-field-mono text-xs text-field-label">
									@{post.author.username.toLowerCase()}
								</span>
							</div>
						</div>
					</div>

					<div className="flex items-center gap-3">
						<span className="shrink-0 font-field-mono text-[10px] text-field-label">
							{formatFeedTime(post.createdAt)}
						</span>
						{isOwner ? (
							<ArchiveButton
								type="button"
								variant="stamp"
								size="sm"
								onClick={() => onDelete(post.id)}
								disabled={isDeleting}
							>
								<Trash2 className="h-3.5 w-3.5" />
							</ArchiveButton>
						) : null}
					</div>
				</div>

				<button
					type="button"
					onClick={() => onOpenPost(post.id)}
					className="block w-full text-left"
				>
					<div className="space-y-5">
						<div>
							{renderBody(post, variantKey, variant.contentClass)}
						</div>

						{variantKey === 2 ? (
							<div className="my-4 rotate-[-1deg] border border-field-ink/20 bg-field-stage p-3 font-field-mono text-xs">
								<div className="mb-1 border-b border-dashed border-field-label pb-1 text-field-accent">
									DATA EXCERPT_
								</div>
								<div>COMMENTS: {post.commentsCount}</div>
								<div>LIKES: {post.likesCount}</div>
								<div>FAVORITES: {post.favoritesCount}</div>
							</div>
						) : null}

						{post.media.length > 0 ? (
							<div className={variant.imageFrame || ""}>
								<img
									src={post.media[0]}
									alt="Post media"
									className={cn(
										"archive-photo w-full object-cover border border-field-label/20",
										variant.imageMaxHeight,
									)}
									style={
										variant.imageFrame
											? { mixBlendMode: "multiply" }
											: undefined
									}
								/>
								{variant.imageFrame ? (
									<div className="absolute bottom-2 right-3 font-field-mono text-[10px] text-field-label">
										FILM ROLL 42 - EXP {post.id}
									</div>
								) : null}
								{variantKey === 0 ? (
									<div className="pointer-events-none absolute -left-4 -top-4 h-8 w-8 rotate-12 scale-75">
										<OrangeStar />
									</div>
								) : null}
							</div>
						) : null}
					</div>
				</button>

				<div className="mt-6 border-t border-field-ink/10 pt-4">
					<div
						className={cn(
							"flex items-center",
							variant.actionJustify,
						)}
					>
						<FeedActionButton
							icon={MessageCircle}
							label="Comment count"
							count={post.commentsCount}
							accent="blue"
							onClick={() => onOpenPost(post.id, true)}
						/>
						<FeedActionButton
							icon={Bookmark}
							label="Favorite post"
							count={post.favoritesCount}
							accent="green"
							active={post.favoritedByCurrentUser}
							disabled={isFavoriting}
							onClick={() => onToggleFavorite(post)}
						/>
						<FeedActionButton
							icon={Heart}
							label="Like post"
							count={post.likesCount}
							accent="orange"
							active={post.likedByCurrentUser}
							disabled={isLiking}
							onClick={() => onToggleLike(post)}
						/>
					</div>
				</div>
			</article>

		</div>
	);
}
