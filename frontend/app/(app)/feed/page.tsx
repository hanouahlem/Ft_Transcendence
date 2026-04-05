"use client";

import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import { Plus } from "lucide-react";
import { ArchiveRightRail } from "@/components/archive/ArchiveRightRail";
import type { FeedComment, FeedPost } from "@/components/feed/types";
import { NewPostCard } from "@/components/posts/NewPostCard";
import { NewPostDialog } from "@/components/posts/NewPostDialog";
import { PostCard } from "@/components/posts/PostCard";
import { PostDialog } from "@/components/posts/PostDialog";
import { archiveToaster } from "@/components/ui/toaster";
import { useAuth } from "@/context/AuthContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function FeedPage() {
	const { user, token } = useAuth();

	const [posts, setPosts] = useState<FeedPost[]>([]);
	const [postContent, setPostContent] = useState("");
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [previewUrl, setPreviewUrl] = useState("");
	const [loading, setLoading] = useState(true);
	const [publishing, setPublishing] = useState(false);
	const [createOpen, setCreateOpen] = useState(false);
	const [sentRequests, setSentRequests] = useState<number[]>([]);
	const [sendingFriendId, setSendingFriendId] = useState<number | null>(null);

	const [deletingPostId, setDeletingPostId] = useState<number | null>(null);
	const [deletingCommentId, setDeletingCommentId] = useState<number | null>(
		null,
	);
	const [likingPostId, setLikingPostId] = useState<number | null>(null);
	const [favoritingPostId, setFavoritingPostId] = useState<number | null>(
		null,
	);
	const [likingCommentId, setLikingCommentId] = useState<number | null>(null);
	const [favoritingCommentId, setFavoritingCommentId] = useState<
		number | null
	>(null);

	const [commentInputs, setCommentInputs] = useState<Record<number, string>>(
		{},
	);
	const [commentingPostId, setCommentingPostId] = useState<number | null>(
		null,
	);
	const [dialogPostId, setDialogPostId] = useState<number | null>(null);
	const [dialogPostSnapshot, setDialogPostSnapshot] =
		useState<FeedPost | null>(null);
	const [postDialogOpen, setPostDialogOpen] = useState(false);
	const [focusCommentInput, setFocusCommentInput] = useState(false);

	const fileInputRef = useRef<HTMLInputElement | null>(null);

	const suggestions = useMemo(() => {
		const unique = posts.filter(
			(post, index, array) =>
				array.findIndex((item) => item.author.id === post.author.id) ===
				index,
		);

		return unique
			.filter((post) => post.author.id !== user?.id)
			.slice(0, 5)
			.map((post) => post.author);
	}, [posts, user?.id]);

	const totalLikes = useMemo(
		() => posts.reduce((sum, post) => sum + post.likesCount, 0),
		[posts],
	);

	const totalComments = useMemo(
		() => posts.reduce((sum, post) => sum + post.commentsCount, 0),
		[posts],
	);

	const activePost = useMemo(
		() =>
			posts.find((post) => post.id === dialogPostId) ??
			dialogPostSnapshot ??
			null,
		[posts, dialogPostId, dialogPostSnapshot],
	);

	const notifyError = (description: string) => {
		archiveToaster.error({
			title: "Error",
			description,
			duration: 6000,
		});
	};

	const notifySuccess = (description: string) => {
		archiveToaster.success({
			title: "Field Notice",
			description,
		});
	};

	useEffect(() => {
		return () => {
			if (previewUrl) {
				URL.revokeObjectURL(previewUrl);
			}
		};
	}, [previewUrl]);

	useEffect(() => {
		if (!token) {
			return;
		}

		fetchPosts();
		fetchExistingFriendRelations();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [token, user?.id]);

	useEffect(() => {
		if (dialogPostId === null) {
			return;
		}

		const nextPost =
			posts.find((post) => post.id === dialogPostId) ??
			dialogPostSnapshot;

		if (nextPost) {
			setDialogPostSnapshot(nextPost);
		}
	}, [posts, dialogPostId, dialogPostSnapshot]);

	const resetComposer = () => {
		setPostContent("");
		handleRemoveFile();
		setCreateOpen(false);
	};

	const fetchPosts = async () => {
		if (!token) return;

		try {
			setLoading(true);

			const res = await fetch(`${API_URL}/posts`, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			const data = await res.json();

			if (!res.ok) {
				throw new Error(
					data.message || "Unable to fetch posts.",
				);
			}

			setPosts(Array.isArray(data) ? data : []);
		} catch (err) {
			console.error("Erreur fetchPosts :", err);
			notifyError(
				err instanceof Error
					? err.message
					: "Failed to load the feed.",
			);
		} finally {
			setLoading(false);
		}
	};

	const fetchExistingFriendRelations = async () => {
		if (!token || !user?.id) return;

		try {
			const res = await fetch(`${API_URL}/friends`, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			const data = await res.json();

			if (!res.ok) {
				throw new Error(
					data.message || "Unable to fetch friend relations.",
				);
			}

			if (!Array.isArray(data)) {
				return;
			}

			const sentIds = data
				.map((item) => {
					const senderId =
						item.senderId ??
						item.sender?.id ??
						item.sender?.userId ??
						item.userId;

					const receiverId =
						item.receiverId ??
						item.receiver?.id ??
						item.receiver?.userId ??
						item.friend?.id;

					const status = item.status;

					return { senderId, receiverId, status };
				})
				.filter(
					(item) =>
						item.senderId === user.id &&
						(item.status === "pending" ||
							item.status === "accepted"),
				)
				.map((item) => item.receiverId)
				.filter((id): id is number => typeof id === "number");

			setSentRequests(sentIds);
		} catch (err) {
			console.error("Erreur fetch relations amis :", err);
		}
	};

	const handleCommentChange = (postId: number, value: string) => {
		setCommentInputs((prev) => ({
			...prev,
			[postId]: value,
		}));
	};

	const updatePostInState = (
		postId: number,
		updater: (post: FeedPost) => FeedPost,
	) => {
		setPosts((prevPosts) =>
			prevPosts.map((post) =>
				post.id === postId ? updater(post) : post,
			),
		);
	};

	const updateCommentInState = (
		commentId: number,
		updater: (comment: FeedComment) => FeedComment,
	) => {
		setPosts((prevPosts) =>
			prevPosts.map((post) => {
				const hasComment = post.comments.some(
					(comment) => comment.id === commentId,
				);

				if (!hasComment) {
					return post;
				}

				return {
					...post,
					comments: post.comments.map((comment) =>
						comment.id === commentId ? updater(comment) : comment,
					),
				};
			}),
		);
	};

	const handleOpenPost = (
		postId: number,
		shouldFocusCommentInput = false,
	) => {
		const post = posts.find((item) => item.id === postId) ?? null;

		setDialogPostId(postId);
		setDialogPostSnapshot(post);
		setPostDialogOpen(true);
		setFocusCommentInput(shouldFocusCommentInput);
	};

	const handlePostDialogChange = (open: boolean) => {
		setPostDialogOpen(open);

		if (!open) {
			setFocusCommentInput(false);
		}
	};

	const handleDeleteComment = async (commentId: number) => {
		if (!token) {
			notifyError("You must be logged in to delete a comment.");
			return;
		}

		try {
			setDeletingCommentId(commentId);

			const response = await fetch(`${API_URL}/comments/${commentId}`, {
				method: "DELETE",
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(
					data.message ||
						"Failed to delete the comment.",
				);
			}

			setPosts((prevPosts) =>
				prevPosts.map((post) => {
					const hasComment = post.comments.some(
						(comment) => comment.id === commentId,
					);

					if (!hasComment) {
						return post;
					}

					return {
						...post,
						comments: post.comments.filter(
							(comment) => comment.id !== commentId,
						),
						commentsCount: Math.max(0, post.commentsCount - 1),
					};
				}),
			);

			notifySuccess("Comment deleted successfully.");
		} catch (error) {
			console.error(error);
			notifyError(
				error instanceof Error ? error.message : "Unknown error.",
			);
		} finally {
			setDeletingCommentId(null);
		}
	};

	const handleAddComment = async (postId: number) => {
		if (!token) {
			notifyError("You must be logged in to comment.");
			return;
		}

		const content = commentInputs[postId]?.trim() || "";

		if (!content) {
			notifyError("You need to write a comment.");
			return;
		}

		try {
			setCommentingPostId(postId);

			const formData = new FormData();
			formData.append("content", content);

			const res = await fetch(`${API_URL}/posts/${postId}/comments`, {
				method: "POST",
				headers: {
					Authorization: `Bearer ${token}`,
				},
				body: formData,
			});

			const data = await res.json();

			if (!res.ok) {
				throw new Error(
					data.message || "Unable to add the comment.",
				);
			}

			setCommentInputs((prev) => ({ ...prev, [postId]: "" }));
			if (data.comment) {
				updatePostInState(postId, (post) => ({
					...post,
					comments: [...post.comments, data.comment],
					commentsCount: post.commentsCount + 1,
				}));
			}
		} catch (err) {
			notifyError(
				err instanceof Error
					? err.message
					: "Failed to add the comment.",
			);
		} finally {
			setCommentingPostId(null);
		}
	};

	const handleOpenFilePicker = () => {
		fileInputRef.current?.click();
	};

	const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];

		if (!file) return;

		if (previewUrl) {
			URL.revokeObjectURL(previewUrl);
		}

		setSelectedFile(file);
		setPreviewUrl(URL.createObjectURL(file));
	};

	const handleRemoveFile = () => {
		if (previewUrl) {
			URL.revokeObjectURL(previewUrl);
		}

		setSelectedFile(null);
		setPreviewUrl("");

		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	const handlePublish = async () => {
		if (!postContent.trim()) {
			notifyError("You need to write something before publishing.");
			return;
		}

		if (!token) {
			notifyError("You must be logged in to publish.");
			return;
		}

		try {
			setPublishing(true);

			const formData = new FormData();
			formData.append("content", postContent);

			if (selectedFile) {
				formData.append("media", selectedFile);
			}

			const res = await fetch(`${API_URL}/posts`, {
				method: "POST",
				headers: {
					Authorization: `Bearer ${token}`,
				},
				body: formData,
			});

			const data = await res.json();

			if (!res.ok) {
				throw new Error(
					data.message || "Unable to publish the post.",
				);
			}

			notifySuccess("Post published successfully.");
			if (data.post) {
				setPosts((prevPosts) => [data.post, ...prevPosts]);
			}
			resetComposer();
		} catch (err) {
			console.error("Erreur publish post :", err);
			notifyError(
				err instanceof Error
					? err.message
					: "Failed to publish the post.",
			);
		} finally {
			setPublishing(false);
		}
	};

	const handleDelete = async (postId: number) => {
		if (!token) {
			notifyError("You must be logged in to delete a post.");
			return;
		}

		try {
			setDeletingPostId(postId);

			const res = await fetch(`${API_URL}/posts/${postId}`, {
				method: "DELETE",
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			const data = await res.json();

			if (!res.ok) {
				throw new Error(
					data.message || "Unable to delete the post.",
				);
			}

			notifySuccess("Post deleted successfully.");
			setPosts((prevPosts) =>
				prevPosts.filter((post) => post.id !== postId),
			);
			setPostDialogOpen((prevOpen) =>
				prevOpen && dialogPostId === postId ? false : prevOpen,
			);
		} catch (err) {
			console.error("Erreur suppression post :", err);
			notifyError(
				err instanceof Error
					? err.message
					: "Failed to delete the post.",
			);
		} finally {
			setDeletingPostId(null);
		}
	};

	const handleToggleLike = async (post: FeedPost) => {
		if (!token) {
			notifyError("You must be logged in to like a post.");
			return;
		}

		try {
			setLikingPostId(post.id);

			const method = post.likedByCurrentUser ? "DELETE" : "POST";

			const res = await fetch(`${API_URL}/posts/${post.id}/like`, {
				method,
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			const data = await res.json();

			if (!res.ok) {
				throw new Error(
					data.message || "Unable to update the like.",
				);
			}

			updatePostInState(post.id, (currentPost) => ({
				...currentPost,
				likedByCurrentUser: !currentPost.likedByCurrentUser,
				likesCount: Math.max(
					0,
					currentPost.likesCount +
						(currentPost.likedByCurrentUser ? -1 : 1),
				),
			}));
		} catch (err) {
			console.error("Erreur like post :", err);
			notifyError(
				err instanceof Error ? err.message : "Failed to update the like.",
			);
		} finally {
			setLikingPostId(null);
		}
	};

	const handleToggleFavorite = async (post: FeedPost) => {
		if (!token) {
			notifyError("You must be logged in to manage favorites.");
			return;
		}

		try {
			setFavoritingPostId(post.id);

			const method = post.favoritedByCurrentUser ? "DELETE" : "POST";

			const res = await fetch(`${API_URL}/posts/${post.id}/favorite`, {
				method,
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			const data = await res.json();

			if (!res.ok) {
				throw new Error(
					data.message || "Unable to update the favorite.",
				);
			}

			updatePostInState(post.id, (currentPost) => ({
				...currentPost,
				favoritedByCurrentUser: !currentPost.favoritedByCurrentUser,
				favoritesCount: Math.max(
					0,
					currentPost.favoritesCount +
						(currentPost.favoritedByCurrentUser ? -1 : 1),
				),
			}));
		} catch (err) {
			console.error("Erreur favorite post :", err);
			notifyError(
				err instanceof Error ? err.message : "Failed to update the favorite.",
			);
		} finally {
			setFavoritingPostId(null);
		}
	};

	const handleAddFriend = async (receiverId: number) => {
		if (!token) {
			notifyError(
				"You must be logged in to send a friend request.",
			);
			return;
		}

		try {
			setSendingFriendId(receiverId);

			const res = await fetch(`${API_URL}/friends`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({ receiverId }),
			});

			const data = await res.json();

			if (!res.ok) {
				if (data.message === "Friend request already exists") {
					setSentRequests((prev) =>
						prev.includes(receiverId)
							? prev
							: [...prev, receiverId],
					);
					notifySuccess("Friend request already sent.");
					return;
				}

				throw new Error(
					data.message || "Unable to send the friend request.",
				);
			}

			setSentRequests((prev) =>
				prev.includes(receiverId) ? prev : [...prev, receiverId],
			);
			notifySuccess(data.message || "Friend request sent.");
		} catch (err) {
			console.error("Erreur demande d'ami :", err);
			notifyError(
				err instanceof Error
					? err.message
					: "Failed to send the friend request.",
			);
		} finally {
			setSendingFriendId(null);
		}
	};

	const handleToggleCommentLike = async (comment: FeedComment) => {
		if (!token) {
			notifyError("You must be logged in to like a comment.");
			return;
		}

		try {
			setLikingCommentId(comment.id);

			const method = comment.likedByCurrentUser ? "DELETE" : "POST";

			const res = await fetch(`${API_URL}/comments/${comment.id}/like`, {
				method,
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			const data = await res.json();

			if (!res.ok) {
				throw new Error(
					data.message ||
						"Unable to update the comment like.",
				);
			}

			updateCommentInState(comment.id, (currentComment) => ({
				...currentComment,
				likedByCurrentUser: !currentComment.likedByCurrentUser,
				likesCount: Math.max(
					0,
					currentComment.likesCount +
						(currentComment.likedByCurrentUser ? -1 : 1),
				),
			}));
		} catch (err) {
			console.error("Erreur like commentaire :", err);
			notifyError(
				err instanceof Error
					? err.message
					: "Failed to update the comment like.",
			);
		} finally {
			setLikingCommentId(null);
		}
	};

	const handleToggleCommentFavorite = async (comment: FeedComment) => {
		if (!token) {
			notifyError(
				"You must be logged in to manage comment favorites.",
			);
			return;
		}

		try {
			setFavoritingCommentId(comment.id);

			const method = comment.favoritedByCurrentUser ? "DELETE" : "POST";

			const res = await fetch(
				`${API_URL}/comments/${comment.id}/favorite`,
				{
					method,
					headers: {
						Authorization: `Bearer ${token}`,
					},
				},
			);

			const data = await res.json();

			if (!res.ok) {
				throw new Error(
					data.message ||
						"Unable to update the comment favorite.",
				);
			}

			updateCommentInState(comment.id, (currentComment) => ({
				...currentComment,
				favoritedByCurrentUser: !currentComment.favoritedByCurrentUser,
				favoritesCount: Math.max(
					0,
					currentComment.favoritesCount +
						(currentComment.favoritedByCurrentUser ? -1 : 1),
				),
			}));
		} catch (err) {
			console.error("Erreur favori commentaire :", err);
			notifyError(
				err instanceof Error
					? err.message
					: "Failed to update the comment favorite.",
			);
		} finally {
			setFavoritingCommentId(null);
		}
	};

	return (
		<>
			<div className="flex items-start justify-start gap-8 xl:gap-10">
				<section className="min-w-0 w-full max-w-[800px]">
					<div className="flex flex-col gap-8 lg:gap-12">
						<NewPostCard
							content={postContent}
							previewUrl={previewUrl}
							selectedFileName={selectedFile?.name || ""}
							publishing={publishing}
							onPublish={handlePublish}
							onContentChange={setPostContent}
							onOpenFilePicker={handleOpenFilePicker}
							onRemoveFile={handleRemoveFile}
						/>

						{loading ? (
							<section className="border border-black/10 bg-field-paper px-5 py-6 shadow-[6px_8px_25px_rgba(26,26,26,0.12)]">
								<p className="font-mono text-[11px] uppercase tracking-[0.18em] text-field-label">
									Loading feed archive...
								</p>
							</section>
						) : posts.length === 0 ? (
							<section className="border border-black/10 bg-field-paper px-5 py-6 shadow-[6px_8px_25px_rgba(26,26,26,0.12)]">
								<p className="font-mono text-[11px] uppercase tracking-[0.18em] text-field-label">
									No posts have been recorded yet.
								</p>
							</section>
						) : (
							<div className="flex flex-col gap-10">
								{posts.map((post, index) => (
									<PostCard
										key={post.id}
										post={post}
										currentUserId={user?.id}
										variantIndex={index}
										onOpenPost={handleOpenPost}
										onDelete={handleDelete}
										onToggleLike={handleToggleLike}
										onToggleFavorite={handleToggleFavorite}
										deletingPostId={deletingPostId}
										likingPostId={likingPostId}
										favoritingPostId={favoritingPostId}
									/>
								))}
							</div>
						)}

						<div className="border-t border-dashed border-field-label py-8 text-center font-mono text-sm text-field-label">
							--- END OF RECENT LOGS ---
						</div>
					</div>
				</section>

				<ArchiveRightRail
					totalPosts={posts.length}
					totalLikes={totalLikes}
					totalComments={totalComments}
					suggestions={suggestions}
					sentRequests={sentRequests}
					sendingFriendId={sendingFriendId}
					onAddFriend={handleAddFriend}
				/>
			</div>

			<button
				type="button"
				onClick={() => setCreateOpen(true)}
				className="fixed bottom-6 right-6 z-40 flex h-16 w-16 items-center justify-center rounded-full border border-field-ink bg-field-ink text-field-paper shadow-[3px_6px_0_#ff4a1c] transition hover:scale-105 lg:hidden"
				aria-label="Create a new post"
			>
				<Plus className="h-6 w-6" />
			</button>

			<NewPostDialog
				open={createOpen}
				content={postContent}
				previewUrl={previewUrl}
				selectedFileName={selectedFile?.name || ""}
				publishing={publishing}
				onClose={resetComposer}
				onPublish={handlePublish}
				onContentChange={setPostContent}
				onOpenFilePicker={handleOpenFilePicker}
				onRemoveFile={handleRemoveFile}
			/>

			<input
				ref={fileInputRef}
				type="file"
				accept="image/*"
				onChange={handleFileChange}
				className="hidden"
			/>

			<PostDialog
				open={postDialogOpen}
				post={activePost}
				focusCommentInput={focusCommentInput}
				currentUserId={user?.id}
				onOpenChange={handlePostDialogChange}
				onDelete={handleDelete}
				onDeleteComment={handleDeleteComment}
				onToggleLike={handleToggleLike}
				onToggleFavorite={handleToggleFavorite}
				onToggleCommentLike={handleToggleCommentLike}
				onToggleCommentFavorite={handleToggleCommentFavorite}
				onCommentChange={handleCommentChange}
				onAddComment={handleAddComment}
				commentValue={
					dialogPostId ? commentInputs[dialogPostId] || "" : ""
				}
				deletingPostId={deletingPostId}
				deletingCommentId={deletingCommentId}
				likingPostId={likingPostId}
				favoritingPostId={favoritingPostId}
				likingCommentId={likingCommentId}
				favoritingCommentId={favoritingCommentId}
				commentingPostId={commentingPostId}
			/>
		</>
	);
}
