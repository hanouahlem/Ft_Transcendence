import {
	Bookmark02Icon,
	Comment01Icon,
	Delete02Icon,
	FavouriteIcon,
	Pdf01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { FeedPost } from "@/lib/feed-types";
import { Button } from "@/components/ui/button";
import { RelativeTime } from "@/components/ui/relative-time";
import { cn } from "@/lib/utils";
import { SocialToggle } from "@/components/posts/SocialToggle";
import { ProfilePicture } from "@/components/ui/ProfilePicture";
import { UserIdentityLink } from "@/components/users/UserIdentityLink";
import ArchiveStar from "@/components/decor/ArchiveStar";

type PostCardProps = {
	post: FeedPost;
	currentUserId: number | undefined;
	onOpenPost: (postId: number, focusCommentInput?: boolean) => void;
	onDelete: (postId: number) => Promise<void>;
	onToggleLike: (post: FeedPost) => Promise<void>;
	onToggleFavorite: (post: FeedPost) => Promise<void>;
	deletingPostId: number | null;
	likingPostId: number | null;
	favoritingPostId: number | null;
};

type PostVariant = {
	wrapper: string;
	article: string;
	tape: string;
	imageFrame: string;
	imageMaxHeight: string;
	headerBorder: string;
	contentClass: string;
	actionJustify: string;
	accentDot?: boolean;
	star?: boolean;
	starClass?: string;
};

const POST_VARIANTS: PostVariant[] = [
	{
		wrapper: "",
		article: "bg-paper border-2 border-label/30 p-6 relative",
		tape: "left-6 top-[-12px] h-5 w-20 rotate-2 bg-accent-green",
		imageFrame:
			"relative mx-auto w-[90%] -rotate-2 bg-white p-2 pb-8 shadow-lg",
		imageMaxHeight: "max-h-[360px]",
		headerBorder: "border-dashed border-label/40",
		contentClass: "text-lg leading-relaxed text-justify",
		actionJustify: "justify-between",
	},
	{
		wrapper: "-rotate-1",
		article: "relative bg-paper-muted p-6 pb-10",
		tape: "right-8 top-[-12px] h-5 w-16 -rotate-2 bg-accent-red",
		imageFrame:
			"relative mx-auto w-[90%] rotate-2 bg-white p-2 pb-8 shadow-lg",
		imageMaxHeight: "max-h-[320px]",
		headerBorder: "border-label",
		contentClass: "text-lg leading-relaxed",
		actionJustify: "justify-start gap-8",
	},
	{
		wrapper: "rotate-1 ml-4",
		article:
			"relative border-l-4 border-accent-blue bg-paper p-6",
		tape: "left-1/2 top-[-12px] h-5 w-16 -translate-x-1/2 -rotate-1 bg-accent-blue",
		imageFrame: "",
		imageMaxHeight: "max-h-[260px]",
		headerBorder: "",
		contentClass: "text-base leading-relaxed text-label",
		actionJustify: "justify-start gap-8",
		accentDot: true,
	},
	{
		wrapper: "-rotate-1",
		article: "relative border-2 border-label/40 bg-paper p-6",
		tape: "left-4 top-[-12px] h-5 w-20 rotate-3 bg-accent-red",
		imageFrame: "",
		imageMaxHeight: "max-h-[300px]",
		headerBorder: "border-dashed border-ink/20",
		contentClass:
			"text-2xl font-bold italic leading-snug text-center py-4 opacity-90",
		actionJustify: "justify-start gap-8",
		star: true,
		starClass: "right-6 top-2 h-8 w-8 rotate-90 scale-50",
	},
	{
		wrapper: "",
		article:
			"bg-paper-muted border-2 border-label/30 p-6 relative",
		tape: "right-12 top-[-12px] h-6 w-24 -rotate-2 bg-accent-green",
		imageFrame:
			"relative mx-auto w-[90%] rotate-1 bg-white p-2 pb-8 shadow-lg",
		imageMaxHeight: "max-h-[320px]",
		headerBorder: "border-dashed border-label/40",
		contentClass: "text-lg leading-relaxed",
		actionJustify: "justify-between",
		star: true,
		starClass: "bottom-[20%] -left-4 h-10 w-10 rotate-[12deg] scale-75",
	},
];

function getVariantKeyFromPostId(postId: number) {
	return postId % POST_VARIANTS.length;
}

function isPdfAttachment(url: string) {
	return /\.pdf(?:$|[?#])/i.test(url);
}

function getAttachmentFileName(url: string) {
	try {
		const pathname = new URL(url).pathname;
		return decodeURIComponent(pathname.split("/").pop() || "attachment.pdf");
	} catch {
		return "attachment.pdf";
	}
}

function renderBody(
	post: FeedPost,
	variantKey: number,
	contentClass: string,
) {
	const content = post.content.trim();

	if (!content) {
		return null;
	}

	if (variantKey === 0) {
		const firstCharacter = content[0];
		const rest = content.slice(1);

		return (
			<p className={cn(contentClass, "font-display")}>
				<span className="float-left mr-2 text-4xl leading-none font-black text-accent-red">
					{firstCharacter}
				</span>
				{rest}
			</p>
		);
	}

	if (variantKey === 3 && !post.media.length && content.length < 200) {
		return (
			<p className={cn(contentClass, "font-display")}>
				&quot;{content}&quot;
			</p>
		);
	}

	if (variantKey === 3) {
		return (
			<p className="font-display text-lg leading-relaxed text-ink">
				{content}
			</p>
		);
	}

	return <p className={cn(contentClass, "font-display")}>{content}</p>;
}

export function PostCard({
	post,
	currentUserId,
	onOpenPost,
	onDelete,
	onToggleLike,
	onToggleFavorite,
	deletingPostId,
	likingPostId,
	favoritingPostId,
}: PostCardProps) {
	const variantKey = getVariantKeyFromPostId(post.id);
	const variant = POST_VARIANTS[variantKey];
	const isOwner = post.author.id === currentUserId;
	const isDeleting = deletingPostId === post.id;
	const isLiking = likingPostId === post.id;
	const isFavoriting = favoritingPostId === post.id;
	const authorDisplayName =
		post.author.displayName?.trim() || post.author.username;
	const attachmentUrl = post.media[0];
	const attachmentFileName = attachmentUrl
		? getAttachmentFileName(attachmentUrl)
		: null;
	const authorPreview = {
		id: post.author.id,
		username: post.author.username,
		displayName: post.author.displayName,
		avatar: post.author.avatar,
	};

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
					<div className="absolute -left-5 top-8 h-2 w-2 rounded-full bg-label" />
				) : null}

				{variant.star ? (
					<div
						className={cn(
							"pointer-events-none absolute z-20",
							variant.starClass,
						)}
					>
						<ArchiveStar />
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
						<UserIdentityLink
							user={authorPreview}
							className="shrink-0"
						>
							<ProfilePicture
								name={authorDisplayName}
								src={post.author.avatar}
								alt={authorDisplayName}
								className={cn(
									variantKey === 2
										? "h-8 w-8 rotate-1"
										: "h-10 w-10 -rotate-2",
								)}
							/>
						</UserIdentityLink>

						<div className="min-w-0">
							<div className="flex flex-wrap items-center gap-3">
								<UserIdentityLink
									user={authorPreview}
									className={cn(
										"truncate font-bold tracking-wide text-ink",
										variantKey === 2
											? "text-base"
											: "text-lg",
									)}
								>
									{authorDisplayName}
								</UserIdentityLink>
								<UserIdentityLink
									user={authorPreview}
									className="font-mono text-xs text-label"
								>
									@{post.author.username.toLowerCase()}
								</UserIdentityLink>
							</div>
						</div>
					</div>

					<div className="flex items-center gap-3">
						<RelativeTime
							dateString={post.createdAt}
							className="shrink-0 font-mono text-[10px] text-label"
						/>
						{isOwner ? (
							<Button
								type="button"
								variant="delete"
								size="sm"
								onClick={() => onDelete(post.id)}
								disabled={isDeleting}
							>
								<HugeiconsIcon icon={Delete02Icon} size={14} strokeWidth={1.9} />
							</Button>
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

						{post.media.length > 0 ? (
							<div className={variant.imageFrame || ""}>
								{attachmentUrl && isPdfAttachment(attachmentUrl) ? (
									<div className="flex min-h-[180px] flex-col justify-between border border-label/20 bg-paper-muted px-5 py-5">
										<div className="flex items-start gap-4">
											<div className="flex h-12 w-12 shrink-0 items-center justify-center border border-label/25 bg-paper">
												<HugeiconsIcon icon={Pdf01Icon} size={24} strokeWidth={1.8} />
											</div>
											<div className="min-w-0">
												<p className="truncate font-display text-lg text-ink">
													{attachmentFileName}
												</p>
												<p className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-label">
													PDF Attachment
												</p>
											</div>
										</div>

										<p className="mt-5 font-mono text-[10px] uppercase tracking-[0.18em] text-label">
											Document preview not embedded
										</p>
									</div>
								) : (
									/* eslint-disable-next-line @next/next/no-img-element */
									<img
										src={attachmentUrl ?? undefined}
										alt="Post media"
										className={cn(
											"archive-photo w-full object-cover border border-label/20",
											variant.imageMaxHeight,
										)}
										style={
											variant.imageFrame
												? { mixBlendMode: "multiply" }
												: undefined
										}
									/>
								)}
								{variant.imageFrame ? (
									<div className="absolute bottom-2 right-3 font-mono text-[10px] text-label">
										{attachmentUrl && isPdfAttachment(attachmentUrl)
											? `FIELD DOSSIER - EXP ${post.id}`
											: `FILM ROLL 42 - EXP ${post.id}`}
									</div>
								) : null}
								{variantKey === 0 ? (
									<div className="pointer-events-none absolute -left-4 -top-4 h-8 w-8 rotate-12 scale-75">
										<ArchiveStar />
									</div>
								) : null}
							</div>
						) : null}
					</div>
				</button>

				<div className="mt-6 border-t border-ink/10 pt-4">
					<div
						className={cn(
							"flex items-center",
							variant.actionJustify,
						)}
					>
						<SocialToggle
							icon={Comment01Icon}
							label="Comment count"
							count={post.commentsCount}
							accent="blue"
							onClick={() => onOpenPost(post.id, true)}
						/>
						<SocialToggle
							icon={Bookmark02Icon}
							label="Favorite post"
							count={post.favoritesCount}
							accent="green"
							pressed={post.favoritedByCurrentUser}
							disabled={isFavoriting}
							onClick={() => onToggleFavorite(post)}
						/>
						<SocialToggle
							icon={FavouriteIcon}
							label="Like post"
							count={post.likesCount}
							accent="red"
							pressed={post.likedByCurrentUser}
							disabled={isLiking}
							onClick={() => onToggleLike(post)}
						/>
					</div>
				</div>
			</article>
		</div>
	);
}
