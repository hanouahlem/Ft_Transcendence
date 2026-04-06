"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ExternalLink, MapPin, MessageCircle } from "lucide-react";
import type { CurrentUser } from "@/lib/api";
import { RightRail } from "@/components/layout/RightRail";
import { PostCard } from "@/components/posts/PostCard";
import { PostDialog } from "@/components/posts/PostDialog";
import { Button } from "@/components/ui/button";
import { ProfilePicture } from "@/components/ui/ProfilePicture";
import { ProfileBanner } from "@/components/profile/ProfileBanner";
import {
	buildProfileSuggestions,
	getRightRailTitle,
	type RightRailSuggestion,
} from "@/lib/right-rail";
import { useAuth } from "@/context/AuthContext";
import { useFriendRequests } from "@/hooks/useFriendRequests";
import { usePostInteractions } from "@/hooks/usePostInteractions";
import { cn } from "@/lib/utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

type ProfileUser = CurrentUser & {
	bio?: string | null;
	status?: string | null;
	location?: string | null;
	website?: string | null;
	createdAt: string;
};

type ProfileFriend = RightRailSuggestion;

type ProfileViewProps = {
	profileId?: number | null;
};

function ArchiveStar() {
	return (
		<svg
			viewBox="0 0 50 50"
			className="h-full w-full fill-none stroke-accent-red"
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

function formatJoinedDate(dateString: string) {
	const date = new Date(dateString);

	if (Number.isNaN(date.getTime())) {
		return "Unknown";
	}

	return new Intl.DateTimeFormat("en-US", {
		month: "short",
		year: "numeric",
	}).format(date);
}

function formatCompactCount(value: number) {
	return new Intl.NumberFormat("en-US", {
		notation: "compact",
		maximumFractionDigits: 1,
	}).format(value);
}

export function ProfileView({ profileId = null }: ProfileViewProps) {
	const { user, token, isAuthLoading } = useAuth();

	const resolvedProfileId = profileId ?? user?.id ?? null;
	const isOwnProfile =
		resolvedProfileId !== null && resolvedProfileId === user?.id;

	const [profile, setProfile] = useState<ProfileUser | null>(null);
	const [friends, setFriends] = useState<ProfileFriend[]>([]);
	const [loading, setLoading] = useState(true);
	const [pageError, setPageError] = useState<string | null>(null);

	const [connectedUserIds, setConnectedUserIds] = useState<number[]>([]);
	const {
		sentRequests,
		incomingRequestIdsBySender,
		sendingFriendId,
		handleAddFriend,
		handleAcceptFriend,
	} = useFriendRequests({
		token,
		onFriendAccepted: (userId) => {
			setConnectedUserIds((prev) =>
				prev.includes(userId) ? prev : [...prev, userId],
			);
		},
	});

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
		resetInteractionState,
	} = usePostInteractions({ token });

	const totalLikes = useMemo(
		() => posts.reduce((sum, post) => sum + post.likesCount, 0),
		[posts],
	);

	const totalComments = useMemo(
		() => posts.reduce((sum, post) => sum + post.commentsCount, 0),
		[posts],
	);

	const rightRailTitle = useMemo(
		() =>
			getRightRailTitle({
				isOwnProfile,
				profileUsername: isOwnProfile
					? null
					: (profile?.username ?? null),
			}),
		[isOwnProfile, profile?.username],
	);

	const rightRailSuggestions = useMemo(
		() =>
			buildProfileSuggestions({
				friends,
				currentUserId: user?.id,
				connectedUserIds,
				includeConnected: isOwnProfile,
			}),
		[friends, user?.id, connectedUserIds, isOwnProfile],
	);

	useEffect(() => {
		if (!token || !user?.id) {
			return;
		}

		const fetchConnections = async () => {
			try {
				const res = await fetch(`${API_URL}/friends`, {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				});

				const data = await res.json();

				if (!res.ok || !Array.isArray(data)) {
					return;
				}

				setConnectedUserIds(
					data
						.map((friend) => friend.id)
						.filter((id): id is number => typeof id === "number"),
				);
			} catch (error) {
				console.error("fetchConnections error:", error);
			}
		};

		fetchConnections();
	}, [token, user?.id]);

	useEffect(() => {
		if (!token) {
			return;
		}

		if (resolvedProfileId === null) {
			if (isAuthLoading) {
				return;
			}

			setLoading(false);
			setPageError("Unable to resolve the observer record.");
			return;
		}

		const fetchProfile = async () => {
			try {
				setLoading(true);
				setPageError(null);
				setProfile(null);
				setPosts([]);
				setFriends([]);
				resetInteractionState();

				const [userRes, postsRes, friendsRes] = await Promise.all([
					fetch(`${API_URL}/users/${resolvedProfileId}`, {
						headers: { Authorization: `Bearer ${token}` },
					}),
					fetch(`${API_URL}/users/${resolvedProfileId}/posts`, {
						headers: { Authorization: `Bearer ${token}` },
					}),
					fetch(`${API_URL}/users/${resolvedProfileId}/friends`, {
						headers: { Authorization: `Bearer ${token}` },
					}),
				]);

				const [userData, postsData, friendsData] = await Promise.all([
					userRes.json(),
					postsRes.json(),
					friendsRes.json(),
				]);

				if (!userRes.ok) {
					throw new Error(
						userData.message || "Unable to fetch user.",
					);
				}

				if (!postsRes.ok) {
					throw new Error(
						postsData.message || "Unable to fetch posts.",
					);
				}

				if (!friendsRes.ok) {
					throw new Error(
						friendsData.message ||
							"Unable to fetch observer fellows.",
					);
				}

				setProfile(userData);
				setPosts(Array.isArray(postsData) ? postsData : []);
				setFriends(Array.isArray(friendsData) ? friendsData : []);
			} catch (error) {
				console.error("fetchProfile error:", error);
				setPageError(
					error instanceof Error
						? error.message
						: "Failed to load the observer record.",
				);
			} finally {
				setLoading(false);
			}
		};

		fetchProfile();
	}, [
		token,
		resolvedProfileId,
		isAuthLoading,
		resetInteractionState,
		setPosts,
	]);

	const profileSent = resolvedProfileId
		? sentRequests.includes(resolvedProfileId)
		: false;
	const profileConnected = resolvedProfileId
		? connectedUserIds.includes(resolvedProfileId)
		: false;

	return (
		<>
			<div className="flex items-start justify-start gap-8 xl:gap-10">
				<section className="min-w-0 w-full max-w-[800px]">
					{loading ? (
						<section className="border border-black/10 bg-paper px-5 py-6 shadow-[6px_8px_25px_rgba(26,26,26,0.12)]">
							<p className="font-mono text-[11px] uppercase tracking-[0.18em] text-label">
								Loading observer record...
							</p>
						</section>
					) : pageError || !profile ? (
						<section className="border border-black/10 bg-paper px-5 py-6 shadow-[6px_8px_25px_rgba(26,26,26,0.12)]">
							<p className="font-mono text-[11px] uppercase tracking-[0.18em] text-label">
								{pageError || "Observer record not found."}
							</p>
						</section>
					) : (
						<div className="flex flex-col gap-10 lg:gap-12">
							<section className="relative mt-3">
								<div className="relative h-[260px] overflow-hidden border border-black/10 bg-paper-muted shadow-[8px_12px_30px_rgba(26,26,26,0.12)] sm:h-[300px]">
									<ProfileBanner
										name={profile.username}
										className="h-full w-full"
									/>

									<div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/6 to-black/45" />

									<div className="absolute right-4 top-4 rotate-2 border border-black/15 bg-paper/90 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-ink shadow-sm">
										{profile.location
											? `Loc: ${profile.location}`
											: "Loc: Archive Record"}
									</div>
								</div>

								<div className="archive-tape absolute -top-2 left-[14%] h-5 w-28 -rotate-2 bg-accent-green" />
								<div className="archive-tape absolute -top-2 right-[10%] h-5 w-36 rotate-3 bg-accent-blue" />
							</section>

							<section className="relative -mt-33 px-4 sm:px-8">
								<div className="flex flex-col items-start gap-6 md:flex-row md:items-end">
									<div className="relative shrink-0 shadow-xl -rotate-3">
										<ProfilePicture
											name={profile.username}
											src={profile.avatar}
											alt={profile.username}
											withShadow={false}
											frameClassName="p-2.5"
											className="h-32 w-32 md:h-44 md:w-44"
										/>

										<div className="absolute -bottom-3 -right-3 h-8 w-8 rotate-12 md:h-10 md:w-10">
											<ArchiveStar />
										</div>
									</div>

									<div className="w-full flex-1 pb-1">
										<div className="space-y-4">
											<div>
												<h1 className="font-display text-4xl font-black uppercase leading-none tracking-[-0.05em] text-paper md:text-5xl">
													{profile.username}
												</h1>
												<div className="flex flex-wrap items-center gap-3 font-mono text-s uppercase tracking-[0.18em] text-paper/80">
													<span>
														@
														{profile.username.toLowerCase()}
													</span>
													{profile.status ? (
														<span>
															State:{" "}
															{profile.status}
														</span>
													) : null}
												</div>
											</div>

											<p
												className="max-w-2xl text-xl italic leading-relaxed text-accent-blue"
												style={{
													fontFamily:
														"var(--font-display)",
												}}
											>
												{profile.bio ||
													"Field observer cataloguing fragments, patterns, and quiet evidence from the archive."}
											</p>

											<div className="flex flex-wrap items-center gap-3 text-sm text-paper/90">
												{profile.location ? (
													<span className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em]">
														<MapPin className="h-3.5 w-3.5" />
														{profile.location}
													</span>
												) : null}
												{profile.website ? (
													<a
														href={profile.website}
														target="_blank"
														rel="noreferrer"
														className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] underline underline-offset-4"
													>
														<ExternalLink className="h-3.5 w-3.5" />
														Website
													</a>
												) : null}
											</div>

											<div className="flex flex-wrap gap-3 md:justify-end">
												{isOwnProfile ? (
													<>
														<Button
															asChild
															variant="bluesh"
															size="lg"
														>
															<Link href="/settings/profile">
																Edit Record
															</Link>
														</Button>
														<Button
															asChild
															variant="paper"
															size="lg"
														>
															<Link href="/friends">
																Fellow Observers
															</Link>
														</Button>
													</>
												) : (
													<>
														<Button
															type="button"
															variant={
																profileConnected
																	? "paper"
																	: "bluesh"
															}
															size="lg"
															disabled={
																profileConnected ||
																profileSent ||
																sendingFriendId ===
																	resolvedProfileId
															}
															onClick={() =>
																resolvedProfileId &&
																handleAddFriend(
																	resolvedProfileId,
																)
															}
														>
															{sendingFriendId ===
															resolvedProfileId
																? "Sending"
																: profileConnected
																	? "Following"
																	: profileSent
																		? "Requested"
																		: "Follow"}
														</Button>
														<Button
															asChild
															variant="paper"
															size="lg"
														>
															<Link href="/friends">
																<MessageCircle className="h-4 w-4" />
																Network
															</Link>
														</Button>
													</>
												)}
											</div>
										</div>
									</div>
								</div>
							</section>

							<section className="px-2">
								<div className="mb-6 flex items-center gap-4">
									<h2 className="shrink-0 font-display text-[1.65rem] font-black uppercase tracking-[0.04em] text-ink">
										Observer Profile
									</h2>
									<div className="flex-grow border-t-2 border-ink/20" />
								</div>

								<div className="grid grid-cols-2 gap-4 md:grid-cols-5">
									{[
										{
											label: "Observations",
											value: formatCompactCount(
												posts.length,
											),
											tone: "text-ink",
											tape: "bg-accent-green",
											rotate: "rotate-1",
										},
										{
											label: "Received Likes",
											value: formatCompactCount(
												totalLikes,
											),
											tone: "text-accent-red",
											rotate: "-rotate-1",
										},
										{
											label: "Notes",
											value: formatCompactCount(
												totalComments,
											),
											tone: "text-accent-blue",
											rotate: "rotate-2",
											star: true,
										},
										{
											label: "Fellows",
											value: formatCompactCount(
												friends.length,
											),
											tone: "text-ink",
											rotate: "-rotate-2",
											tape: "bg-accent-red",
										},
										{
											label: "Joined",
											value: formatJoinedDate(
												profile.createdAt,
											),
											tone: "text-ink",
											rotate: "rotate-1",
										},
									].map((item, index) => (
										<article
											key={item.label}
											className={cn(
												"relative border border-label/10 bg-paper p-4 text-center shadow-sm",
												item.rotate,
												index === 4
													? "col-span-2 md:col-span-1"
													: "",
											)}
										>
											{item.tape ? (
												<div
													className={cn(
														"archive-tape absolute -top-2 left-4 h-4 w-8 rotate-[-4deg]",
														item.tape,
													)}
												/>
											) : null}
											{item.star ? (
												<div className="absolute right-2 top-1 h-6 w-6 scale-75">
													<ArchiveStar />
												</div>
											) : null}
											<span
												className={cn(
													"block text-2xl font-black uppercase tracking-wide",
													item.tone,
												)}
											>
												{item.value}
											</span>
											<span className="mt-1 block font-mono text-[9px] uppercase tracking-[0.22em] text-label">
												{item.label}
											</span>
										</article>
									))}
								</div>
							</section>

							<section className="px-2">
								<div className="mb-6 flex items-center gap-4">
									<h2 className="shrink-0 font-display text-[1.65rem] font-black uppercase tracking-[0.04em] text-ink">
										Recent Entries
									</h2>
									<div className="flex-grow border-t-2 border-ink/20" />
								</div>

								{posts.length === 0 ? (
									<section className="border border-black/10 bg-paper px-5 py-6 shadow-[6px_8px_25px_rgba(26,26,26,0.12)]">
										<p className="font-mono text-[11px] uppercase tracking-[0.18em] text-label">
											No posts have been recorded for this
											observer yet.
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
												onToggleFavorite={
													handleToggleFavorite
												}
												deletingPostId={deletingPostId}
												likingPostId={likingPostId}
												favoritingPostId={
													favoritingPostId
												}
											/>
										))}
									</div>
								)}

								<div className="border-t border-dashed border-label py-8 text-center font-mono text-sm text-label mt-10">
									--- END OF PROFILE RECORD ---
								</div>
							</section>
						</div>
					)}
				</section>

				<RightRail
					totalPosts={posts.length}
					totalLikes={totalLikes}
					totalComments={totalComments}
					sectionTitle={rightRailTitle}
					suggestions={rightRailSuggestions}
					sentRequests={sentRequests}
					incomingRequestIdsBySender={incomingRequestIdsBySender}
					sendingFriendId={sendingFriendId}
					onAddFriend={handleAddFriend}
					onAcceptFriend={handleAcceptFriend}
					allowFollow={!isOwnProfile}
				/>
			</div>

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
