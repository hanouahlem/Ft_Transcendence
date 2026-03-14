"use client";

import { useState, useEffect, useRef } from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { addFriend, getFriends, getFriendRequests, acceptFriend, deleteFriend, searchUser} from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────

type User = {
  id: number;
  username: string;
  avatar?: string;
};

type FriendRequest = {
  id: number;
  sender: User;
};

// ─── Avatar ───────────────────────────────────────────────────────────────────

function Avatar({ username, size = 40 }: { username: string; size?: number }) {
  return (
    <div
      style={{ width: size, height: size, fontSize: size * 0.38 }}
      className="flex items-center justify-center rounded-full border border-white/10 bg-orange-500/10 font-semibold text-orange-400"
    >
      {username[0].toUpperCase()}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function FriendsPage() {
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [sentRequests, setSentRequests] = useState<number[]>([]); // ids déjà envoyés

  const [friends, setFriends] = useState<User[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Chargement initial ──────────────────────────────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [friendsData, requestsData] = await Promise.all([
          getFriends(),
          getFriendRequests(),
        ]);
        setFriends(friendsData);
        setRequests(requestsData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // ── Recherche avec debounce ─────────────────────────────────────────────────
  // debounce = attend 400ms après la dernière frappe avant d'appeler l'API
  // évite d'envoyer une requête à chaque lettre tapée
  useEffect(() => {
    if (!search.trim()) {
      setSearchResults([]);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const results = await searchUser(search);
        // exclure les utilisateurs déjà amis
        const friendIds = friends.map((f) => f.id);
        setSearchResults(results.filter((u: User) => !friendIds.includes(u.id)));
      } catch (err: any) {
        console.error(err.message);
      } finally {
        setSearchLoading(false);
      }
    }, 400);
  }, [search, friends]);

  // ── Accept ──────────────────────────────────────────────────────────────────
  const handleAccept = async (requestId: number, sender: User) => {
    try {
      await acceptFriend(requestId);
      setFriends((prev) => [...prev, sender]);
      setRequests((prev) => prev.filter((r) => r.id !== requestId));
    } catch (err: any) {
      console.error(err.message);
    }
  };

  // ── Decline ─────────────────────────────────────────────────────────────────
  const handleDecline = async (requestId: number) => {
    try {
      await deleteFriend(requestId);
      setRequests((prev) => prev.filter((r) => r.id !== requestId));
    } catch (err: any) {
      console.error(err.message);
    }
  };

  // ── Add depuis recherche ─────────────────────────────────────────────────────
  const handleAdd = async (receiverId: number) => {
    try {
      await addFriend(receiverId);
      setSentRequests((prev) => [...prev, receiverId]); // marque comme envoyé
    } catch (err: any) {
      console.error(err.message);
    }
  };

  // ── Remove ──────────────────────────────────────────────────────────────────
  const handleRemove = async (friendId: number) => {
    try {
      await deleteFriend(friendId);
      setFriends((prev) => prev.filter((f) => f.id !== friendId));
    } catch (err: any) {
      console.error(err.message);
    }
  };

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex min-h-screen items-center justify-center bg-neutral-950">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-orange-500" />
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <section className="min-h-screen bg-neutral-950 px-6 py-10 text-white">
        <div className="mx-auto max-w-2xl space-y-6">

          {/* ── Titre ────────────────────────────────────────────────────── */}
          <h1 className="text-2xl font-bold">Friends</h1>

          {error && (
            <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </p>
          )}

          {/* ── Recherche ────────────────────────────────────────────────── */}
          <div className="relative">
            <svg
              className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30"
              fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search a user..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-orange-500/60"
            />
          </div>

          {/* ── Résultats de recherche ────────────────────────────────────── */}
          {search.trim() && (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-white/40">
                Results
              </h2>

              {searchLoading ? (
                <div className="flex justify-center py-4">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-orange-500" />
                </div>
              ) : searchResults.length > 0 ? (
                <div className="space-y-3">
                  {searchResults.map((user) => (
                    <div key={user.id} className="flex items-center justify-between rounded-xl bg-black/20 p-3">
                      <div className="flex items-center gap-3">
                        <Avatar username={user.username} />
                        <p className="text-sm font-medium">{user.username}</p>
                      </div>
                      <button
                        onClick={() => handleAdd(user.id)}
                        disabled={sentRequests.includes(user.id)}
                        className="rounded-lg border border-orange-500/40 px-3 py-1.5 text-xs font-semibold text-orange-400 transition hover:bg-orange-500/10 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {sentRequests.includes(user.id) ? "Sent" : "Add"}
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="py-4 text-center text-sm text-white/30">No user found.</p>
              )}
            </div>
          )}

          {/* ── Demandes reçues ───────────────────────────────────────────── */}
          {requests.length > 0 && (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-white/40">
                Friend requests · {requests.length}
              </h2>
              <div className="space-y-3">
                {requests.map((req) => (
                  <div key={req.id} className="flex items-center justify-between rounded-xl bg-black/20 p-3">
                    <div className="flex items-center gap-3">
                      <Avatar username={req.sender.username} />
                      <p className="text-sm font-medium">{req.sender.username}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAccept(req.id, req.sender)}
                        className="rounded-lg bg-orange-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-orange-600"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleDecline(req.id)}
                        className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-semibold text-white/50 transition hover:text-white"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Liste des amis ────────────────────────────────────────────── */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-white/40">
              My friends · {friends.length}
            </h2>
            {friends.length > 0 ? (
              <div className="space-y-3">
                {friends.map((friend) => (
                  <div key={friend.id} className="flex items-center justify-between rounded-xl bg-black/20 p-3">
                    <div className="flex items-center gap-3">
                      <Avatar username={friend.username} />
                      <p className="text-sm font-medium">{friend.username}</p>
                    </div>
                    <button
                      onClick={() => handleRemove(friend.id)}
                      className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-semibold text-white/40 transition hover:border-red-500/40 hover:text-red-400"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-4 text-center text-sm text-white/30">No friends yet.</p>
            )}
          </div>

        </div>
      </section>
    </ProtectedRoute>
  );
}