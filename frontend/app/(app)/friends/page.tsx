"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { Search } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useI18n } from "@/i18n/I18nProvider";
import { ProfilePicture } from "@/components/ui/ProfilePicture";
import { Button } from "@/components/ui/button";
import { UserIdentityLink } from "@/components/users/UserIdentityLink";
import { RightRail } from "@/components/layout/RightRail";
import { archiveToaster } from "@/components/ui/toaster";
import type { RightRailSuggestion } from "@/lib/right-rail";

type FriendRequest = {
	id: number;
	senderId: number;
	receiverId: number;
	status: string;
	sender: {
		id: number;
		username: string;
		avatar?: string | null;
	};
};

type FriendListItem = RightRailSuggestion & {
	friendshipId: number;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function FriendsPage() {
	const { user, token } = useAuth();
	const { t } = useI18n();

	const [friends, setFriends] = useState<FriendListItem[]>([]);
	const [requests, setRequests] = useState<FriendRequest[]>([]);
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const [searchedUsers, setSearchedUsers] = useState<any[]>([]);
	const [searchQuery, setSearchQuery] = useState("");
	const [loading, setLoading] = useState(false);
	const [sendingId, setSendingId] = useState<number | null>(null);
	const [processingId, setProcessingId] = useState<number | null>(null);
	const [sentRequests, setSentRequests] = useState<number[]>([]);

	const incomingRequestIdsBySender = useMemo(() => {
		const map: Record<number, number> = {};
		requests.forEach((r) => {
			if (r.senderId) map[r.senderId] = r.id;
		});
		return map;
	}, [requests]);

	const friendIds = useMemo(() => new Set(friends.map((f) => f.id)), [friends]);

	const searcheduser = useCallback(
		async (query: string) => {
			if (!token) return;
			try {
				setLoading(true);
				const res = await fetch(`${API_URL}/users`, {
					headers: { Authorization: `Bearer ${token}` },
				});
				const data = await res.json();
				if (res.ok) {
					const term = query.toLowerCase().trim();
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					const others = data.filter((u: any) => u.id !== user?.id);
					if (term) {
						setSearchedUsers(
							// eslint-disable-next-line @typescript-eslint/no-explicit-any
							others.filter((u: any) =>
								u.username.toLowerCase().includes(term) ||
								(u.displayName && u.displayName.toLowerCase().includes(term))
							)
						);
					} else {
						setSearchedUsers(others);
					}
				}
			} catch (err) {
				console.error("Failed to search users", err);
			} finally {
				setLoading(false);
			}
		},
		[token, user?.id]
	);

	const fetchFriends = useCallback(async () => {
		if (!token) return;
		try {
			const res = await fetch(`${API_URL}/friends`, {
				headers: { Authorization: `Bearer ${token}` },
			});
			const data = await res.json();
			if (res.ok && Array.isArray(data)) {
				setFriends(
					data.filter(
						(friend): friend is FriendListItem =>
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
			const res = await fetch(`${API_URL}/friends/requests`, {
				headers: { Authorization: `Bearer ${token}` },
			});
			const data = await res.json();
			if (res.ok) setRequests(Array.isArray(data) ? data : []);
		} catch (err) {
			console.error("Erreur fetch requests:", err);
		}
	}, [token]);

	const fetchSentRequests = useCallback(async () => {
		if (!token) return;
		try {
			const res = await fetch(`${API_URL}/friends/requests/sent`, {
				headers: { Authorization: `Bearer ${token}` },
			});
			const data = await res.json();
			if (res.ok && Array.isArray(data)) {
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				setSentRequests(data.map((r: any) => r.receiverId));
			}
		} catch (err) {
			console.error("Erreur fetch sent requests:", err);
		}
	}, [token]);

	useEffect(() => {
		if (token) {
			fetchFriends();
			fetchRequests();
			fetchSentRequests();
			searcheduser("");
		}
	}, [token, fetchFriends, fetchRequests, fetchSentRequests, searcheduser]);

	const handleAddFriend = async (receiverId: number) => {
		if (!token) {
			archiveToaster.error({ title: t("friends.toasts.titles.error"), description: t("friends.toasts.loginRequired") });
			return;
		}

		try {
			setSendingId(receiverId);
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
				throw new Error(data.message || t("friends.toasts.sendError"));
			}

			setSentRequests((prev) => [...prev, receiverId]);
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
			setProcessingId(requestId);
			const res = await fetch(`${API_URL}/friends/${requestId}/accept`, {
				method: "PATCH",
				headers: { Authorization: `Bearer ${token}` },
			});
			if (res.ok) {
				setRequests((prev) => prev.filter((r) => r.id !== requestId));
				archiveToaster.success({ title: t("friends.toasts.titles.accepted"), description: t("friends.toasts.accepted") });
				fetchFriends();
			}
		} catch (err) {
			console.error("Accept error:", err);
		} finally {
			setProcessingId(null);
		}
	};

	const handleDeclineRequest = async (requestId: number) => {
		if (!token) return;
		try {
			setProcessingId(requestId);
			const res = await fetch(`${API_URL}/friends/${requestId}`, {
				method: "DELETE",
				headers: { Authorization: `Bearer ${token}` },
			});
			if (res.ok) {
				setRequests((prev) => prev.filter((r) => r.id !== requestId));
				archiveToaster.success({ title: t("friends.toasts.titles.declined"), description: t("friends.toasts.declined") });
			}
		} catch (err) {
			console.error("Decline error:", err);
		} finally {
			setProcessingId(null);
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
			setProcessingId(userId);
			const res = await fetch(`${API_URL}/friends/${friend.friendshipId}`, {
				method: "DELETE",
				headers: { Authorization: `Bearer ${token}` },
			});
			if (res.ok) {
				setFriends((prev) => prev.filter((entry) => entry.id !== userId));
				archiveToaster.success({ title: t("friends.toasts.titles.removed"), description: t("friends.toasts.removed") });
			} else {
				const data = await res.json();
				throw new Error(data.message || t("friends.toasts.removeError"));
			}
		} catch (err) {
			console.error("Remove friend error:", err);
			archiveToaster.error({ title: t("friends.toasts.titles.error"), description: t("friends.toasts.removeUnable") });
		} finally {
			setProcessingId(null);
		}
	};

	return (
		<div className="flex w-full items-start gap-10 lg:gap-14">
			<div className="flex-1 w-full max-w-[640px] pt-4">
				<div className="archive-paper relative p-6 sm:p-10 mb-10">
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
								setSearchQuery(e.target.value);
								searcheduser(e.target.value);
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
									<div key={req.id} className="flex items-center justify-between border border-black/15 bg-white/40 p-4">
										<div className="flex items-center gap-4">
											<UserIdentityLink user={req.sender} className="shrink-0">
												<ProfilePicture name={req.sender.username} src={req.sender.avatar} />
											</UserIdentityLink>
											<div>
												<UserIdentityLink
													user={req.sender}
													className="block font-bold text-ink"
												>
													{req.sender.username}
												</UserIdentityLink>
												<p className="font-mono text-[10px] uppercase text-label">{t("friends.wantsToConnect")}</p>
											</div>
										</div>
										<div className="flex gap-2">
											<Button variant="stamp" size="sm" onClick={() => handleAcceptFriend(req.senderId)} disabled={processingId === req.id}>
												{t("friends.accept")}
											</Button>
											<Button variant="subtle" size="sm" onClick={() => handleDeclineRequest(req.id)} disabled={processingId === req.id}>
												{t("friends.decline")}
											</Button>
										</div>
									</div>
								))}
							</div>
						</div>
					)}

					{/* Search Results */}
					<div>
						<h2 className="mb-4 font-mono text-xs uppercase tracking-[0.28em] text-label">
							{searchQuery ? t("friends.searchResults") : t("friends.allObservers")}
						</h2>
						<div className="flex flex-col gap-0 border border-black/10 bg-paper-muted">
							{loading ? (
								<div className="p-8 text-center font-mono text-sm text-label">{t("friends.loading")}</div>
							) : searchedUsers.length === 0 ? (
								<div className="p-8 text-center font-mono text-sm text-label">{t("friends.noObservers")}</div>
							) : (
								searchedUsers.map((u, i) => {
									const isFriend = friendIds.has(u.id);
									const hasSent = sentRequests.includes(u.id);
									const incomingReqId = incomingRequestIdsBySender[u.id];

									return (
										<div key={u.id} className="flex items-center justify-between border-b border-black/10 p-4 last:border-b-0 hover:bg-black/5 transition-colors">
											<div className="flex items-center gap-4">
												<UserIdentityLink user={u} className="shrink-0">
													<ProfilePicture name={u.username} src={u.avatar} size="default" className={i % 2 === 0 ? "rotate-2" : "-rotate-2"} />
												</UserIdentityLink>
												<div>
													<UserIdentityLink
														user={u}
														className="block font-bold text-ink"
													>
														{u.username}
													</UserIdentityLink>
													<UserIdentityLink
														user={u}
														className="block font-mono text-[10px] uppercase text-label"
													>
														{u.displayName || t("friends.observerProfile")}
													</UserIdentityLink>
												</div>
											</div>
											<div>
												{isFriend ? (
													<div className="flex items-center gap-3">
														<span className="font-mono text-xs font-bold uppercase tracking-widest text-label">{t("friends.friend")}</span>
														<Button variant="delete" size="sm" onClick={() => handleRemoveFriend(u.id)} disabled={processingId === u.id}>
															{t("friends.delete")}
														</Button>
													</div>
												) : incomingReqId ? (
													<Button variant="bluesh" size="sm" onClick={() => handleAcceptFriend(u.id)} disabled={processingId === incomingReqId}>
														{t("friends.accept")}
													</Button>
												) : (
													<Button
														variant={hasSent ? "subtle" : "paper"}
														size="sm"
														disabled={hasSent || sendingId === u.id}
														onClick={() => handleAddFriend(u.id)}
													>
														{hasSent ? t("friends.pending") : sendingId === u.id ? t("friends.adding") : t("friends.add")}
													</Button>
												)}
											</div>
										</div>
									);
								})
							)}
						</div>
					</div>
				</div>
			</div>

			<RightRail
				totalPosts={0}
				totalLikes={0}
				totalComments={0}
				sectionTitle={t("profile.myFriends")}
				suggestions={friends}
				sentRequests={sentRequests}
				incomingRequestIdsBySender={incomingRequestIdsBySender}
				sendingFriendId={sendingId}
				onAddFriend={handleAddFriend}
				onAcceptFriend={handleAcceptFriend}
				allowFollow={false}
			/>
		</div>
	);
}
