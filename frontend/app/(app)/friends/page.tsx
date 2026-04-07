"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Search,
  UserPlus,
  UserRound,
  Users,
  Bell,
  Check,
  X,
  Leaf,
  Sparkles,
} from "lucide-react";

import { useEffect, useMemo, useState, useCallback } from "react";
import { Search } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { ProfilePicture } from "@/components/ui/ProfilePicture";
import { Button } from "@/components/ui/button";
import { RightRail } from "@/components/layout/RightRail";
import { archiveToaster } from "@/components/ui/toaster";
import type { RightRailSuggestion } from "@/lib/right-rail";

type UserItem = {
  id: number;
  username: string;
  email: string;
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

type FriendItem = {
  id: number;
  username: string;
  avatar?: string | null;
};
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

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

export default function FriendsPage() {
  const { user, token } = useAuth();
	const { user, token } = useAuth();

  const [users, setUsers] = useState<UserItem[]>([]);
  const [friends, setFriends] = useState<FriendItem[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [sentRequests, setSentRequests] = useState<number[]>([]);
  const [sendingId, setSendingId] = useState<number | null>(null);
  const [processingRequestId, setProcessingRequestId] = useState<number | null>(null);
	const [friends, setFriends] = useState<RightRailSuggestion[]>([]);
	const [requests, setRequests] = useState<FriendRequest[]>([]);
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const [searchedUsers, setSearchedUsers] = useState<any[]>([]);
	const [searchQuery, setSearchQuery] = useState("");
	const [loading, setLoading] = useState(false);
	const [sendingId, setSendingId] = useState<number | null>(null);
	const [processingId, setProcessingId] = useState<number | null>(null);
	const [sentRequests, setSentRequests] = useState<number[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await fetch("http://localhost:3001/users");
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Impossible de récupérer les utilisateurs.");
        setUsers(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur lors du chargement des utilisateurs.");
      } finally {
        setLoading(false);
      }
    };
	const incomingRequestIdsBySender = useMemo(() => {
		const map: Record<number, number> = {};
		requests.forEach((r) => {
			if (r.senderId) map[r.senderId] = r.id;
		});
		return map;
	}, [requests]);

    const fetchFriends = async () => {
      if (!token) return;
      try {
        const res = await fetch("http://localhost:3001/friends", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) setFriends(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Erreur fetch friends:", err);
      }
    };
	const friendIds = useMemo(() => new Set(friends.map((f) => f.id)), [friends]);

    fetchUsers();
    fetchFriends();
  }, [token]);
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
								(u.email && u.email.toLowerCase().includes(term))
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

  const fetchRequests = async () => {
    if (!token) return;
    try {
      setLoadingRequests(true);
      const res = await fetch("http://localhost:3001/friends/requests", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Erreur fetch requests:", err);
    } finally {
      setLoadingRequests(false);
    }
  };
	const fetchFriends = useCallback(async () => {
		if (!token) return;
		try {
			const res = await fetch(`${API_URL}/friends`, {
				headers: { Authorization: `Bearer ${token}` },
			});
			const data = await res.json();
			if (res.ok) setFriends(Array.isArray(data) ? data : []);
		} catch (err) {
			console.error("Erreur fetch friends:", err);
		}
	}, [token]);

  useEffect(() => {
    fetchRequests();
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

  const friendIds = useMemo(() => new Set(friends.map((f) => f.id)), [friends]);
	useEffect(() => {
		if (token) {
			fetchFriends();
			fetchRequests();
			searcheduser("");
		}
	}, [token, fetchFriends, fetchRequests, searcheduser]);

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase();
    // exclure l'user courant et les amis déjà acceptés
    const list = users.filter((u) => u.id !== user?.id && !friendIds.has(u.id));
    if (!term) return list;
    return list.filter(
      (u) =>
        u.username.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term)
    );
  }, [users, search, user?.id, friendIds]);
	const handleAddFriend = async (receiverId: number) => {
		if (!token) {
			archiveToaster.error({ title: "Error", description: "You must be logged in to send a request." });
			return;
		}

  const handleAddFriend = async (receiverId: number) => {
    if (!token) {
      setActionMessage("You must be logged in to send a friend request.");
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

    try {
      setSendingId(receiverId);
      setActionMessage("");
			const data = await res.json();

      const res = await fetch("http://localhost:3001/friends", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ receiverId }),
      });
			if (!res.ok) {
				throw new Error(data.message || "Unable to send friend request.");
			}

      const data = await res.json();
			setSentRequests((prev) => [...prev, receiverId]);
			archiveToaster.success({ title: "Sent", description: "Friend request sent." });
		} catch (err) {
			archiveToaster.error({
				title: "Error",
				description: err instanceof Error ? err.message : "Unable to send friend request.",
			});
		} finally {
			setSendingId(null);
		}
	};

      if (!res.ok) {
        setActionMessage(data.message || "Unable to send friend request.");
        return;
      }
	const handleAcceptFriend = async (senderId: number) => {
		if (!token) return;
		const requestId = incomingRequestIdsBySender[senderId];
		if (!requestId) return;

      setSentRequests((prev) => [...prev, receiverId]);
      setActionMessage(data.message || "Friend request sent.");
    } catch (err) {
      setActionMessage(err instanceof Error ? err.message : "Unable to send friend request.");
    } finally {
      setSendingId(null);
    }
  };
		try {
			setProcessingId(requestId);
			const res = await fetch(`${API_URL}/friends/${requestId}`, {
				method: "PUT",
				headers: { Authorization: `Bearer ${token}` },
			});
			if (res.ok) {
				setRequests((prev) => prev.filter((r) => r.id !== requestId));
				archiveToaster.success({ title: "Accepted", description: "Friend request accepted." });
				fetchFriends();
			}
		} catch (err) {
			console.error("Accept error:", err);
		} finally {
			setProcessingId(null);
		}
	};

  const handleAccept = async (requestId: number) => {
    if (!token) return;
    try {
      setProcessingRequestId(requestId);
      const res = await fetch(`http://localhost:3001/friends/${requestId}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setRequests((prev) => prev.filter((r) => r.id !== requestId));
        setActionMessage("Friend request accepted.");
      }
    } catch (err) {
      console.error("Accept error:", err);
    } finally {
      setProcessingRequestId(null);
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
				archiveToaster.success({ title: "Declined", description: "Friend request declined." });
			}
		} catch (err) {
			console.error("Decline error:", err);
		} finally {
			setProcessingId(null);
		}
	};

  const handleDecline = async (requestId: number) => {
    if (!token) return;
    try {
      setProcessingRequestId(requestId);
      const res = await fetch(`http://localhost:3001/friends/${requestId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setRequests((prev) => prev.filter((r) => r.id !== requestId));
        setActionMessage("Friend request declined.");
      }
    } catch (err) {
      console.error("Decline error:", err);
    } finally {
      setProcessingRequestId(null);
    }
  };
	return (
		<div className="flex w-full items-start gap-10 lg:gap-14">
			<div className="flex-1 w-full max-w-[640px] pt-4">
				<div className="archive-paper relative p-6 sm:p-10 mb-10">
					<div className="archive-tape absolute -top-3 left-8 h-8 w-24 -rotate-2 bg-accent-red mix-blend-multiply opacity-70" />

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#EAF1E6] via-[#dbe7d2] to-[#9CAF88] text-[#33412c]">
        <section className="relative overflow-hidden px-4 py-6 sm:px-6 lg:px-8">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.25),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.18),transparent_28%)]" />
					<header className="mb-8 border-b-2 border-ink pb-4">
						<h1 className="font-display text-4xl font-black tracking-tight text-ink">
							Directory
						</h1>
						<p className="mt-2 font-mono text-xs uppercase tracking-[0.2em] text-label">
							Search for observers & manage connections
						</p>
					</header>

          <div className="relative mx-auto max-w-7xl">
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm font-medium text-[#4A6440] shadow-md backdrop-blur">
                <Sparkles className="h-4 w-4" />
                Build your circle
              </div>
					{/* Search Input */}
					<div className="relative mb-8">
						<Search className="absolute left-3 top-3.5 h-5 w-5 text-label" />
						<input
							type="text"
							placeholder="Search observers..."
							value={searchQuery}
							onChange={(e) => {
								setSearchQuery(e.target.value);
								searcheduser(e.target.value);
							}}
							className="archive-input w-full border-0 border-b-2 border-dotted border-label bg-black/5 py-3 pl-11 pr-4 font-mono text-base text-ink transition-colors focus:border-accent-red focus:bg-accent-red/5 outline-none"
						/>
					</div>

              <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-[#33412c]">
                Friends & community
              </h1>
					{/* Incoming Requests */}
					{requests.length > 0 && (
						<div className="mb-10">
							<h2 className="mb-4 inline-block -rotate-1 bg-ink px-3 py-1 font-display text-lg font-bold text-paper">
								Incoming Requests
							</h2>
							<div className="flex flex-col gap-4">
								{requests.map((req) => (
									<div key={req.id} className="flex items-center justify-between border border-black/15 bg-white/40 p-4">
										<div className="flex items-center gap-4">
											<ProfilePicture name={req.sender.username} src={req.sender.avatar} />
											<div>
												<p className="font-bold text-ink">{req.sender.username}</p>
												<p className="font-mono text-[10px] uppercase text-label">Wants to connect</p>
											</div>
										</div>
										<div className="flex gap-2">
											<Button variant="stamp" size="sm" onClick={() => handleAcceptFriend(req.senderId)} disabled={processingId === req.id}>
												Accept
											</Button>
											<Button variant="subtle" size="sm" onClick={() => handleDeclineRequest(req.id)} disabled={processingId === req.id}>
												Decline
											</Button>
										</div>
									</div>
								))}
							</div>
						</div>
					)}

              <p className="mt-3 max-w-2xl text-base leading-7 text-[#51604b]">
                Découvre des profils, envoie des demandes d&apos;amis et développe
                ton réseau dans une interface plus douce et plus lisible.
              </p>
            </div>
					{/* Search Results */}
					<div>
						<h2 className="mb-4 font-mono text-xs uppercase tracking-[0.28em] text-label">
							{searchQuery ? "Search Results" : "All Observers"}
						</h2>
						<div className="flex flex-col gap-0 border border-black/10 bg-paper-muted">
							{loading ? (
								<div className="p-8 text-center font-mono text-sm text-label">Loading...</div>
							) : searchedUsers.length === 0 ? (
								<div className="p-8 text-center font-mono text-sm text-label">No observers found.</div>
							) : (
								searchedUsers.map((u, i) => {
									const isFriend = friendIds.has(u.id);
									const hasSent = sentRequests.includes(u.id);
									const incomingReqId = incomingRequestIdsBySender[u.id];

            <div className="mb-8 grid gap-6 lg:grid-cols-[1.6fr_0.9fr]">
              <Card className="rounded-[2rem] border-0 bg-white/92 shadow-[0_18px_50px_rgba(74,100,64,0.15)] backdrop-blur">
                <CardContent className="p-6">
                  <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#EAF1E6] px-4 py-2 text-sm font-medium text-[#4A6440]">
                    <Leaf className="h-4 w-4" />
                    Community space
                  </div>
                  <h2 className="text-2xl font-bold text-[#33412c]">Connect with people</h2>
                  <p className="mt-3 text-sm leading-7 text-[#60705a]">
                    Explore user profiles, send requests, and organise your
                    future social interactions with a cleaner visual rhythm.
                  </p>
                </CardContent>
              </Card>
									return (
										<div key={u.id} className="flex items-center justify-between border-b border-black/10 p-4 last:border-b-0 hover:bg-black/5 transition-colors">
											<div className="flex items-center gap-4">
												<ProfilePicture name={u.username} src={u.avatar} size="default" className={i % 2 === 0 ? "rotate-2" : "-rotate-2"} />
												<div>
													<p className="font-bold text-ink">{u.username}</p>
													<p className="font-mono text-[10px] uppercase text-label">{u.email}</p>
												</div>
											</div>
											<div>
												{isFriend ? (
													<span className="font-mono text-xs font-bold uppercase tracking-widest text-label">Friend</span>
												) : incomingReqId ? (
													<Button variant="bluesh" size="sm" onClick={() => handleAcceptFriend(u.id)} disabled={processingId === incomingReqId}>
														Accept
													</Button>
												) : (
													<Button
														variant={hasSent ? "subtle" : "paper"}
														size="sm"
														disabled={hasSent || sendingId === u.id}
														onClick={() => handleAddFriend(u.id)}
													>
														{hasSent ? "Sent" : sendingId === u.id ? "Adding" : "Add"}
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

              <Card className="rounded-[2rem] border-0 bg-white/92 shadow-[0_18px_50px_rgba(74,100,64,0.15)] backdrop-blur">
                <CardContent className="p-6">
                  <label className="mb-3 block text-sm font-medium text-[#5f6f58]">
                    Search users
                  </label>
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8a9983]" />
                    <input
                      type="text"
                      placeholder="Search by username or email..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full rounded-2xl border border-[#d8e3d1] bg-[#fbfdf9] py-3 pl-11 pr-4 text-sm text-[#2f3a32] outline-none transition placeholder:text-[#98a091] focus:border-[#8AA678] focus:ring-4 focus:ring-[#dce9d1]"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {error && (
              <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-md">
                {error}
              </div>
            )}

            {actionMessage && (
              <div className="mb-6 rounded-2xl border border-[#c7d7bd] bg-white/85 px-4 py-3 text-sm text-[#5f7358] shadow-md">
                {actionMessage}
              </div>
            )}

            <div className="grid gap-6 lg:grid-cols-[1.6fr_0.9fr]">
              {/* Users list */}
              <Card className="rounded-[2rem] border-0 bg-white/92 shadow-[0_18px_50px_rgba(74,100,64,0.15)] backdrop-blur">
                <CardContent className="p-6">
                  <div className="mb-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-2xl bg-[#EAF1E6] p-2 text-[#4A6440]">
                        <Users className="h-5 w-5" />
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold text-[#33412c]">Users</h2>
                        <p className="text-sm text-[#71806c]">Browse and connect</p>
                      </div>
                    </div>
                    <span className="rounded-full bg-[#F4F8F1] px-3 py-1 text-sm text-[#5d6c56]">
                      {filteredUsers.length} total
                    </span>
                  </div>

                  {loading ? (
                    <div className="rounded-3xl bg-[#F4F8F1] p-6 text-sm text-[#6b746c]">
                      Loading users...
                    </div>
                  ) : filteredUsers.length === 0 ? (
                    <div className="rounded-3xl bg-[#F4F8F1] p-6 text-sm text-[#6b746c]">
                      No users found.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredUsers.map((u) => {
                        const alreadySent = sentRequests.includes(u.id);
                        const isSending = sendingId === u.id;

                        return (
                          <div
                            key={u.id}
                            className="flex flex-col gap-4 rounded-[1.5rem] bg-[#fbfdf9] p-4 shadow-sm transition hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
                          >
                            <div className="flex items-center gap-4">
                              <ProfilePicture
                                name={u.username}
                                className="h-14 w-14"
                              />
                              <div>
                                <p className="text-base font-semibold text-[#33412c]">{u.username}</p>
                                <p className="text-sm text-[#71806c]">{u.email}</p>
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-3">
                              <Link
                                href={`/profil/${u.id}`}
                                className="inline-flex items-center gap-2 rounded-full bg-[#F4F8F1] px-4 py-2 text-sm font-medium text-[#4e5a50] transition hover:bg-[#e7f0e1]"
                              >
                                <UserRound className="h-4 w-4" />
                                Profile
                              </Link>

                              <button
                                onClick={() => handleAddFriend(u.id)}
                                disabled={alreadySent || isSending}
                                className="inline-flex items-center gap-2 rounded-full bg-[#8AA678] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#79956a] disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                <UserPlus className="h-4 w-4" />
                                {isSending ? "Sending..." : alreadySent ? "Sent" : "Add"}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Sidebar */}
              <div className="space-y-6">
                <div className="lg:sticky lg:top-24 space-y-6">
                  {/* Friend requests */}
                  <Card className="rounded-[2rem] border-0 bg-white/92 shadow-[0_18px_50px_rgba(74,100,64,0.15)] backdrop-blur">
                    <CardContent className="p-6">
                      <div className="mb-5 flex items-center gap-3">
                        <div className="rounded-2xl bg-[#EAF1E6] p-2 text-[#4A6440]">
                          <Bell className="h-5 w-5" />
                        </div>
                        <div>
                          <h2 className="text-xl font-semibold text-[#33412c]">
                            Friend Requests
                          </h2>
                          <p className="text-sm text-[#71806c]">Pending connections</p>
                        </div>
                      </div>

                      {loadingRequests ? (
                        <p className="text-sm text-[#7d8b76]">Loading...</p>
                      ) : requests.length === 0 ? (
                        <p className="text-sm text-[#7d8b76]">No pending requests.</p>
                      ) : (
                        <div className="space-y-4">
                          {requests.map((request) => {
                            const isProcessing = processingRequestId === request.id;
                            return (
                              <div
                                key={request.id}
                                className="rounded-[1.5rem] bg-[#fbfdf9] p-4 shadow-sm"
                              >
                                <div className="mb-4 flex items-center gap-3">
                                  <ProfilePicture
                                    name={request.sender.username}
                                    src={request.sender.avatar}
                                    className="h-12 w-12"
                                  />
                                  <div>
                                    <p className="font-medium text-[#33412c]">{request.sender.username}</p>
                                    <p className="text-sm text-[#71806c]">Wants to connect</p>
                                  </div>
                                </div>

                                <div className="flex gap-3">
                                  <button
                                    onClick={() => handleAccept(request.id)}
                                    disabled={isProcessing}
                                    className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#8AA678] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#79956a] disabled:opacity-60"
                                  >
                                    <Check className="h-4 w-4" />
                                    Accept
                                  </button>

                                  <button
                                    onClick={() => handleDecline(request.id)}
                                    disabled={isProcessing}
                                    className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#F4F8F1] px-4 py-2 text-sm font-semibold text-[#5a665c] transition hover:bg-[#e7f0e1] disabled:opacity-60"
                                  >
                                    <X className="h-4 w-4" />
                                    Decline
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="rounded-[2rem] border-0 bg-white/92 shadow-[0_18px_50px_rgba(74,100,64,0.15)] backdrop-blur">
                    <CardContent className="p-6">
                      <p className="text-xs uppercase tracking-[0.18em] text-[#4A6440]">
                        Community
                      </p>
                      <h3 className="mt-2 text-lg font-bold text-[#33412c]">Stay connected</h3>
                      <p className="mt-2 text-sm leading-6 text-[#60705a]">
                        Build your network, discover people, and organise your
                        future social interactions in a calmer interface.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
  );
			<RightRail
				totalPosts={0}
				totalLikes={0}
				totalComments={0}
				sectionTitle="My Friends"
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
