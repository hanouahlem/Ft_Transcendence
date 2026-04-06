"use client";

import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import { Plus } from "lucide-react";
import type { FeedPost } from "@/lib/feed-types";
import { RightRail } from "@/components/layout/RightRail";
import { NewPostCard } from "@/components/posts/NewPostCard";
import { PostCard } from "@/components/posts/PostCard";
import { PostDialog } from "@/components/posts/PostDialog";
import {
	buildFeedSuggestions,
	getRightRailTitle,
	type RightRailSuggestion,
} from "@/lib/right-rail";
import { useAuth } from "@/context/AuthContext";
import { useArchiveToasts } from "@/hooks/useArchiveToasts";
import { useFriendRequests } from "@/hooks/useFriendRequests";
import { usePostInteractions } from "@/hooks/usePostInteractions";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function FeedPage() {
	const { user, token } = useAuth();
	const { notifyError, notifySuccess } = useArchiveToasts();

	const [postContent, setPostContent] = useState("");
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [previewUrl, setPreviewUrl] = useState("");
	const [loading, setLoading] = useState(true);
	const [publishing, setPublishing] = useState(false);
	const [allUsers, setAllUsers] = useState<RightRailSuggestion[]>([]);
	const [connectedUsers, setConnectedUsers] = useState<RightRailSuggestion[]>(
		[],
	);
	const [friendNetworks, setFriendNetworks] = useState<
		RightRailSuggestion[][]
	>([]);

	const { sentRequests, sendingFriendId, handleAddFriend } = useFriendRequests({
		token,
	});

	const fileInputRef = useRef<HTMLInputElement | null>(null);

	const {
		posts,
		setPosts,
		activePost,
		postDialogOpen,
		focusCommentInput,
		commentValue,
		deletingPostId,
		deletingCommentId,
		likingPostId,
		favoritingPostId,
		likingCommentId,
		favoritingCommentId,
		commentingPostId,
		handleCommentChange,
		handleOpenPost,
		handlePostDialogChange,
		handleDeleteComment,
		handleAddComment,
		handleDelete,
		handleToggleLike,
		handleToggleFavorite,
		handleToggleCommentLike,
		handleToggleCommentFavorite,
	} = usePostInteractions({ token });

	const connectedUserIds = useMemo(
		() => connectedUsers.map((observer) => observer.id),
		[connectedUsers],
	);

	const suggestions = useMemo(() => {
		if (!user?.id) {
			return [];
		}

		return buildFeedSuggestions({
			allUsers,
			currentUserId: user.id,
			connectedUserIds,
			friendNetworks,
		});
	}, [allUsers, connectedUserIds, friendNetworks, user?.id]);

	const rightRailSentRequests = useMemo(
		() => Array.from(new Set([...sentRequests, ...connectedUserIds])),
		[sentRequests, connectedUserIds],
	);

	const totalLikes = useMemo(
		() => posts.reduce((sum, post) => sum + post.likesCount, 0),
		[posts],
	);

	const totalComments = useMemo(
		() => posts.reduce((sum, post) => sum + post.commentsCount, 0),
		[posts],
	);

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
		fetchRightRailSuggestions();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [token, user?.id]);

	useEffect(() => {
		const handlePostCreated = (event: Event) => {
			const customEvent = event as CustomEvent<FeedPost | undefined>;
			const createdPost = customEvent.detail;

			if (!createdPost) {
				return;
			}

			setPosts((prevPosts) => [
				createdPost,
				...prevPosts.filter((post) => post.id !== createdPost.id),
			]);
		};

		window.addEventListener("archive:post-created", handlePostCreated);
		return () => {
			window.removeEventListener("archive:post-created", handlePostCreated);
		};
	}, [setPosts]);

	const resetComposer = () => {
		setPostContent("");
		handleRemoveFile();
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

	const fetchRightRailSuggestions = async () => {
		if (!token || !user?.id) return;

		try {
			const [friendsRes, usersRes] = await Promise.all([
				fetch(`${API_URL}/friends`, {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}),
				fetch(`${API_URL}/users`),
			]);

			const [friendsData, usersData] = await Promise.all([
				friendsRes.json(),
				usersRes.json(),
			]);

			if (!friendsRes.ok) {
				throw new Error(
					friendsData.message ||
						"Unable to fetch friend relations.",
				);
			}

			if (!usersRes.ok) {
				throw new Error(
					usersData.message ||
						"Unable to fetch users for suggestions.",
				);
			}

			const normalizedFriends = Array.isArray(friendsData)
				? friendsData
						.filter(
							(item): item is RightRailSuggestion =>
								typeof item?.id === "number" &&
								typeof item?.username === "string",
						)
						.map((item) => ({
							id: item.id,
							username: item.username,
							avatar: item.avatar || null,
						}))
				: [];

			const normalizedUsers = Array.isArray(usersData)
				? usersData
						.filter(
							(item): item is RightRailSuggestion =>
								typeof item?.id === "number" &&
								typeof item?.username === "string",
						)
						.map((item) => ({
							id: item.id,
							username: item.username,
							avatar: item.avatar || null,
						}))
				: [];

			setConnectedUsers(normalizedFriends);
			setAllUsers(normalizedUsers);

			if (normalizedFriends.length === 0) {
				setFriendNetworks([]);
				return;
			}

			const networkResponses = await Promise.all(
				normalizedFriends.map(async (friend) => {
					try {
						const res = await fetch(
							`${API_URL}/users/${friend.id}/friends`,
							{
								headers: {
									Authorization: `Bearer ${token}`,
								},
							},
						);
						const data = await res.json();

						if (!res.ok || !Array.isArray(data)) {
							return [];
						}

						return data
							.filter(
								(item): item is RightRailSuggestion =>
									typeof item?.id === "number" &&
									typeof item?.username === "string",
							)
							.map((item) => ({
								id: item.id,
								username: item.username,
								avatar: item.avatar || null,
							}));
					} catch (error) {
						console.error(
							`Failed to fetch network for user ${friend.id}:`,
							error,
						);
						return [];
					}
				}),
			);

			setFriendNetworks(networkResponses);
		} catch (err) {
			console.error("Erreur suggestions right rail :", err);
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
							<section className="border border-black/10 bg-paper px-5 py-6 shadow-[6px_8px_25px_rgba(26,26,26,0.12)]">
								<p className="font-mono text-[11px] uppercase tracking-[0.18em] text-label">
									Loading feed archive...
								</p>
							</section>
						) : posts.length === 0 ? (
							<section className="border border-black/10 bg-paper px-5 py-6 shadow-[6px_8px_25px_rgba(26,26,26,0.12)]">
								<p className="font-mono text-[11px] uppercase tracking-[0.18em] text-label">
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

						<div className="border-t border-dashed border-label py-8 text-center font-mono text-sm text-label">
							--- END OF RECENT LOGS ---
						</div>
					</div>
				</section>

				<RightRail
					totalPosts={posts.length}
					totalLikes={totalLikes}
					totalComments={totalComments}
					sectionTitle={getRightRailTitle({})}
					suggestions={suggestions}
					sentRequests={rightRailSentRequests}
					sendingFriendId={sendingFriendId}
					onAddFriend={handleAddFriend}
				/>
			</div>

			<button
				type="button"
				onClick={() => window.dispatchEvent(new Event("archive:create-post"))}
				className="fixed bottom-6 right-6 z-40 flex h-16 w-16 items-center justify-center rounded-full border border-ink bg-ink text-paper shadow-[3px_6px_0_#d32f2f] transition hover:scale-105 lg:hidden"
				aria-label="Create a new post"
			>
				<Plus className="h-6 w-6" />
			</button>

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
				commentValue={commentValue}
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
