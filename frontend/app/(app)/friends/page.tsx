"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { Search } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useI18n } from "@/i18n/I18nProvider";
import { FriendActionButton } from "@/components/profile/FriendActionButton";
import { ProfilePicture } from "@/components/ui/ProfilePicture";
import { Button } from "@/components/ui/button";
import { UserIdentityLink } from "@/components/users/UserIdentityLink";
import { RightRail } from "@/components/layout/RightRail";
import { archiveToaster } from "@/components/ui/toaster";
import type { RightRailSuggestion } from "@/lib/right-rail";
import {
	addFriend,
	acceptFriend,
	deleteFriend,
	getFriendSuggestions,
	getFriendRequests,
	getFriends,
	getSentFriendRequests,
	searchUser,
	type FriendRequest,
	type PublicUserListItem,
} from "@/lib/api";

type AcceptedFriendListItem = RightRailSuggestion & {
	friendshipId: number;
};

type IncomingFriendRequest = FriendRequest & {
	sender: PublicUserListItem;
};

type OutgoingFriendRequest = FriendRequest & {
	receiverId: number;
	receiver: PublicUserListItem;
};

export default function FriendsPage() {
	const { user, token } = useAuth();
	const { t } = useI18n();

	const [friends, setFriends] = useState<AcceptedFriendListItem[]>([]);
	const [requests, setRequests] = useState<IncomingFriendRequest[]>([]);
	const [pendingRequests, setPendingRequests] = useState<OutgoingFriendRequest[]>([]);
	const [searchedUsers, setSearchedUsers] = useState<PublicUserListItem[]>([]);
	const [suggestions, setSuggestions] = useState<RightRailSuggestion[]>([]);
	const [searchQuery, setSearchQuery] = useState("");
	const [loading, setLoading] = useState(false);
	const [sendingId, setSendingId] = useState<number | null>(null);
	const [processingRequestId, setProcessingRequestId] = useState<number | null>(null);
	const [processingUserId, setProcessingUserId] = useState<number | null>(null);
	const [sentRequests, setSentRequests] = useState<number[]>([]);
	const searchRequestIdRef = useRef(0);

	const incomingRequestIdsBySender = useMemo(() => {
		const map: Record<number, number> = {};
		requests.forEach((r) => {
			if (r.senderId) map[r.senderId] = r.id;
		});
		return map;
	}, [requests]);

	const friendIds = useMemo(() => new Set(friends.map((f) => f.id)), [friends]);
	const trimmedSearchQuery = searchQuery.trim();
	const showingSearchResults = trimmedSearchQuery.length > 0;
	const visibleUsers = showingSearchResults ? searchedUsers : friends;
	const activeFriendActionUserId = sendingId ?? processingUserId;

	const searchObservers = useCallback(
		async (query: string) => {
			if (!token) return;

			const trimmedQuery = query.trim();
			const requestId = searchRequestIdRef.current + 1;
			searchRequestIdRef.current = requestId;

			if (!trimmedQuery) {
				setSearchedUsers([]);
				setLoading(false);
				return;
			}

			try {
				setLoading(true);
				const result = await searchUser(trimmedQuery, token);
				if (searchRequestIdRef.current !== requestId) {
					return;
				}

				if (!result.ok) {
					throw new Error(result.message || "Failed to search observers.");
				}

				const results = Array.isArray(result.data) ? result.data : [];
				setSearchedUsers(results.filter((entry) => entry.id !== user?.id));
			} catch (err) {
				console.error("Failed to search users", err);
				if (searchRequestIdRef.current === requestId) {
					setSearchedUsers([]);
				}
			} finally {
				if (searchRequestIdRef.current === requestId) {
					setLoading(false);
				}
			}
		},
		[token, user?.id]
	);

	const fetchFriends = useCallback(async () => {
		if (!token) return;
		try {
			const result = await getFriends(token);
			if (result.ok && Array.isArray(result.data)) {
				setFriends(
					result.data.filter(
						(friend): friend is AcceptedFriendListItem =>
							typeof friend?.id === "number" &&
							typeof friend?.username === "string" &&
							typeof friend?.friendshipId === "number"
					)
				);
			}
		} catch (err) {
			console.error("Erreur fetch friends:", err);
		}
	}, [token]);

	const fetchRequests = useCallback(async () => {
		if (!token) return;
		try {
			const result = await getFriendRequests(token);
			if (result.ok) {
				setRequests(
					(Array.isArray(result.data) ? result.data : []).filter(
						(request): request is IncomingFriendRequest =>
							typeof request?.id === "number" &&
							typeof request?.senderId === "number" &&
							typeof request?.sender?.id === "number" &&
							typeof request.sender.username === "string"
					)
				);
			}
		} catch (err) {
			console.error("Erreur fetch requests:", err);
		}
	}, [token]);

	const fetchSentRequests = useCallback(async () => {
		if (!token) return;
		try {
			const result = await getSentFriendRequests(token);
			if (result.ok && Array.isArray(result.data)) {
				const nextPendingRequests = result.data.filter(
					(request): request is OutgoingFriendRequest =>
						typeof request?.id === "number" &&
						typeof request?.receiverId === "number" &&
						typeof request?.receiver?.id === "number" &&
						typeof request.receiver.username === "string"
				);
				setPendingRequests(nextPendingRequests);
				setSentRequests(nextPendingRequests.map((request) => request.receiverId));
			}
		} catch (err) {
			console.error("Erreur fetch sent requests:", err);
		}
	}, [token]);

	const fetchSuggestions = useCallback(async () => {
		if (!token) return;
		try {
			const result = await getFriendSuggestions(token);
			if (result.ok) {
				setSuggestions(
					Array.isArray(result.data?.suggestions)
						? result.data.suggestions
						: []
				);
			}
		} catch (err) {
			console.error("Erreur fetch suggestions:", err);
		}
	}, [token]);

	useEffect(() => {
		if (token) {
			fetchFriends();
			fetchRequests();
			fetchSentRequests();
			fetchSuggestions();
		}
	}, [token, fetchFriends, fetchRequests, fetchSentRequests, fetchSuggestions]);

	const handleAddFriend = async (receiverId: number) => {
		if (!token) {
			archiveToaster.error({ title: t("friends.toasts.titles.error"), description: t("friends.toasts.loginRequired") });
			return;
		}

			try {
				setSendingId(receiverId);
				const pendingUser =
					searchedUsers.find((entry) => entry.id === receiverId) ??
					suggestions.find((entry) => entry.id === receiverId) ??
					null;
			const result = await addFriend(receiverId, token);

			if (!result.ok) {
				throw new Error(result.message || t("friends.toasts.sendError"));
			}

			setSentRequests((prev) =>
				prev.includes(receiverId) ? prev : [...prev, receiverId]
			);
			if (pendingUser) {
				setPendingRequests((prev) =>
					prev.some((request) => request.receiverId === receiverId)
						? prev
						: [
								...prev,
								{
									id: result.data.request.id,
									senderId: result.data.request.senderId,
									receiverId,
									status: result.data.request.status,
									receiver: pendingUser,
								},
						  ]
				);
			}
			archiveToaster.success({ title: t("friends.toasts.titles.sent"), description: t("friends.toasts.sent") });
		} catch (err) {
			archiveToaster.error({
				title: t("friends.toasts.titles.error"),
				description: err instanceof Error ? err.message : t("friends.toasts.sendError"),
			});
		} finally {
			setSendingId(null);
		}
	};

	const handleAcceptFriend = async (senderId: number) => {
		if (!token) return;
		const requestId = incomingRequestIdsBySender[senderId];
		if (!requestId) return;

		try {
			setProcessingUserId(senderId);
			const result = await acceptFriend(requestId, token);
			if (result.ok) {
				setRequests((prev) => prev.filter((r) => r.id !== requestId));
				setSuggestions((prev) => prev.filter((entry) => entry.id !== senderId));
				archiveToaster.success({ title: t("friends.toasts.titles.accepted"), description: t("friends.toasts.accepted") });
				fetchFriends();
			}
		} catch (err) {
			console.error("Accept error:", err);
		} finally {
			setProcessingUserId(null);
		}
	};

	const handleDeclineRequest = async (requestId: number) => {
		if (!token) return;
		try {
			setProcessingRequestId(requestId);
			const result = await deleteFriend(requestId, token);
			if (result.ok) {
				setRequests((prev) => prev.filter((r) => r.id !== requestId));
				archiveToaster.success({ title: t("friends.toasts.titles.declined"), description: t("friends.toasts.declined") });
			}
		} catch (err) {
			console.error("Decline error:", err);
		} finally {
			setProcessingRequestId(null);
		}
	};

	const handleRemoveFriend = async (userId: number) => {
		if (!token) return;

		const friend = friends.find((entry) => entry.id === userId);
		if (!friend) {
			archiveToaster.error({ title: t("friends.toasts.titles.error"), description: t("friends.toasts.notFound") });
			return;
		}

		try {
			setProcessingUserId(userId);
			const result = await deleteFriend(friend.friendshipId, token);
			if (result.ok) {
				setFriends((prev) => prev.filter((entry) => entry.id !== userId));
				archiveToaster.success({ title: t("friends.toasts.titles.removed"), description: t("friends.toasts.removed") });
				fetchSuggestions();
			} else {
				throw new Error(result.message || t("friends.toasts.removeError"));
			}
		} catch (err) {
			console.error("Remove friend error:", err);
			archiveToaster.error({ title: t("friends.toasts.titles.error"), description: t("friends.toasts.removeUnable") });
		} finally {
			setProcessingUserId(null);
		}
	};

	const renderObserverRow = (
		observer: PublicUserListItem,
		index: number,
		options?: {
			isPending?: boolean;
		}
	) => {
		const displayName = observer.displayName?.trim() || observer.username;
		const isFriend = friendIds.has(observer.id);
		const incomingReqId = incomingRequestIdsBySender[observer.id];
		const isPending = options?.isPending ?? sentRequests.includes(observer.id);

		return (
			<div
				key={observer.id}
				className="flex items-center justify-between gap-3 border-b border-black/10 px-4 py-4 transition-colors hover:bg-black/5 last:border-b-0"
			>
				<div className="flex min-w-0 items-center gap-4">
					<UserIdentityLink user={observer} className="shrink-0">
						<ProfilePicture
							name={displayName}
							src={observer.avatar}
							size="default"
							className={index % 2 === 0 ? "rotate-2" : "-rotate-2"}
						/>
					</UserIdentityLink>
					<div className="min-w-0">
						<UserIdentityLink
							user={observer}
							className="block truncate font-bold text-ink"
						>
							{displayName}
						</UserIdentityLink>
						<UserIdentityLink
							user={observer}
							className="block truncate font-mono text-[10px] uppercase text-label"
						>
							@{observer.username.toLowerCase()}
						</UserIdentityLink>
					</div>
				</div>

				<div className="shrink-0">
					<FriendActionButton
						profileUserId={observer.id}
						isConnected={isFriend}
						incomingRequestId={incomingReqId}
						isPending={isPending}
						sendingFriendId={activeFriendActionUserId}
						size="sm"
						onAddFriend={handleAddFriend}
						onAcceptFriend={handleAcceptFriend}
						onRemoveFriend={handleRemoveFriend}
					/>
				</div>
			</div>
		);
	};

	return (
		<div className="flex items-start justify-center gap-8 xl:gap-10">
			<section className="min-w-0 w-full max-w-[800px]">
				<div className="archive-paper relative px-6 py-6 sm:px-8 sm:py-8">
					<div className="archive-tape absolute -top-3 left-8 h-8 w-24 -rotate-2 bg-accent-red mix-blend-multiply opacity-70" />

					<header className="mb-8 border-b-2 border-ink pb-4">
						<h1 className="font-display text-4xl font-black tracking-tight text-ink">
							{t("friends.title")}
						</h1>
						<p className="mt-2 font-mono text-xs uppercase tracking-[0.2em] text-label">
							{t("friends.subtitle")}
						</p>
					</header>

					{/* Search Input */}
					<div className="relative mb-8">
						<Search className="absolute left-3 top-3.5 h-5 w-5 text-label" />
						<input
							type="text"
							placeholder={t("friends.searchPlaceholder")}
							value={searchQuery}
							onChange={(e) => {
								const nextQuery = e.target.value;
								setSearchQuery(nextQuery);
								searchObservers(nextQuery);
							}}
							className="archive-input w-full border-0 border-b-2 border-dotted border-label bg-black/5 py-3 pl-11 pr-4 font-mono text-base text-ink transition-colors focus:border-accent-red focus:bg-accent-red/5 outline-none"
						/>
					</div>

					{/* Incoming Requests */}
					{requests.length > 0 && (
						<div className="mb-10">
							<h2 className="mb-4 inline-block -rotate-1 bg-ink px-3 py-1 font-display text-lg font-bold text-paper">
								{t("friends.incomingRequests")}
							</h2>
								<div className="flex flex-col gap-4">
									{requests.map((req) => (
										<div key={req.id} className="flex items-center justify-between gap-3 border border-black/15 bg-white/40 p-4">
											<div className="flex min-w-0 items-center gap-4">
												<UserIdentityLink user={req.sender} className="shrink-0">
													<ProfilePicture name={req.sender.username} src={req.sender.avatar} />
												</UserIdentityLink>
												<div className="min-w-0">
													<UserIdentityLink
														user={req.sender}
														className="block truncate font-bold text-ink"
													>
														{req.sender.username}
													</UserIdentityLink>
													<p className="font-mono text-[10px] uppercase text-label">{t("friends.wantsToConnect")}</p>
												</div>
											</div>
											<div className="flex shrink-0 gap-2">
												<Button variant="bluesh" size="sm" onClick={() => handleAcceptFriend(req.senderId)} disabled={processingUserId === req.senderId}>
													{t("friends.accept")}
												</Button>
												<Button variant="destructive" size="sm" onClick={() => handleDeclineRequest(req.id)} disabled={processingRequestId === req.id}>
													{t("friends.decline")}
												</Button>
											</div>
									</div>
								))}
							</div>
						</div>
					)}

					{!showingSearchResults && pendingRequests.length > 0 && (
						<div className="mb-10">
							<h2 className="mb-4 font-mono text-xs uppercase tracking-[0.28em] text-label">
								{t("friends.pending")}
							</h2>
							<div className="flex flex-col gap-0 border border-black/10 bg-paper">
								{pendingRequests.map((request, index) =>
									renderObserverRow(request.receiver, index, { isPending: true })
								)}
							</div>
						</div>
					)}

					{/* Search Results */}
					<div>
						<h2 className="mb-4 font-mono text-xs uppercase tracking-[0.28em] text-label">
							{showingSearchResults ? t("friends.searchResults") : t("profile.myFriends")}
						</h2>
						<div className="flex flex-col gap-0 border border-black/10 bg-paper">
							{loading ? (
								<div className="p-8 text-center font-mono text-sm text-label">{t("friends.loading")}</div>
							) : visibleUsers.length === 0 ? (
								<div className="p-8 text-center font-mono text-sm text-label">
									{showingSearchResults ? t("friends.noObservers") : t("rightRail.emptyFriends")}
								</div>
							) : (
								visibleUsers.map((u, i) => renderObserverRow(u, i))
							)}
						</div>
					</div>
				</div>
			</section>

			<RightRail
				totalPosts={0}
				totalLikes={0}
				totalComments={0}
				sectionTitle={t("rightRail.youMightKnow")}
				suggestions={suggestions}
				sentRequests={sentRequests}
				incomingRequestIdsBySender={incomingRequestIdsBySender}
				sendingFriendId={activeFriendActionUserId}
				onAddFriend={handleAddFriend}
				onAcceptFriend={handleAcceptFriend}
			/>
		</div>
	);
}
