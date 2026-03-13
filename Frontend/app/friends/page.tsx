"use client";

import { useState } from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { addFriend } from "@/lib/api";
// ─── Mock data (remplace avec tes vrais appels API) ───────────────────────────

type User = {
  id: number;
  username: string;
  avatar?: string;
  mutualFriends?: number;
};

const mockFriends: User[] = [
  { id: 1, username: "Amine" },
  { id: 2, username: "Yassir" },
  { id: 3, username: "Sami" },
  { id: 4, username: "Ikram" },
];

const mockRequests: User[] = [
  { id: 5, username: "Karim", mutualFriends: 2 },
  { id: 6, username: "Lina", mutualFriends: 1 },
];

const mockSuggestions: User[] = [
  { id: 1, username: "ahlem", mutualFriends: 0 },
  { id: 2, username: "ines", mutualFriends: 0 },
];

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
  const [friends, setFriends] = useState<User[]>(mockFriends);
  const [requests, setRequests] = useState<User[]>(mockRequests);
  const [suggestions, setSuggestions] = useState<User[]>(mockSuggestions);

  const filteredFriends = friends.filter((f) =>
    f.username.toLowerCase().includes(search.toLowerCase())
  );

  const acceptRequest = (id: number) => {
    const user = requests.find((r) => r.id === id);
    if (user) {
      setFriends((prev) => [...prev, user]);
      setRequests((prev) => prev.filter((r) => r.id !== id));
    }
  };

  const declineRequest = (id: number) => {
    setRequests((prev) => prev.filter((r) => r.id !== id));
  };
  
const addSuggestion = async (id: number) => {
  try {
    await addFriend(id);
    setSuggestions((prev) => prev.filter((s) => s.id !== id));
  } catch (error: any) {
    console.error(error.message);
  }
};

  const removeFriend = (id: number) => {
    setFriends((prev) => prev.filter((f) => f.id !== id));
  };

  return (
    <ProtectedRoute>
      <section className="min-h-screen bg-neutral-950 px-6 py-10 text-white">
        <div className="mx-auto max-w-2xl space-y-6">

          {/* ── Titre ────────────────────────────────────────────────────── */}
          <h1 className="text-2xl font-bold">Friends</h1>

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
                      <Avatar username={req.username} />
                      <div>
                        <p className="text-sm font-medium">{req.username}</p>
                        {req.mutualFriends && (
                          <p className="text-xs text-white/40">{req.mutualFriends} mutual friends</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => acceptRequest(req.id)}
                        className="rounded-lg bg-orange-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-orange-600"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => declineRequest(req.id)}
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
              My friends · {filteredFriends.length}
            </h2>

            {filteredFriends.length > 0 ? (
              <div className="space-y-3">
                {filteredFriends.map((friend) => (
                  <div key={friend.id} className="flex items-center justify-between rounded-xl bg-black/20 p-3">
                    <div className="flex items-center gap-3">
                      <Avatar username={friend.username} />
                      <p className="text-sm font-medium">{friend.username}</p>
                    </div>
                    <button
                      onClick={() => removeFriend(friend.id)}
                      className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-semibold text-white/40 transition hover:border-red-500/40 hover:text-red-400"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-4 text-center text-sm text-white/30">
                {search ? "No results for this search." : "No friends yet."}
              </p>
            )}
          </div>

          {/* ── Suggestions ──────────────────────────────────────────────── */}
          {suggestions.length > 0 && (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-white/40">
                Suggestions
              </h2>
              <div className="space-y-3">
                {suggestions.map((s) => (
                  <div key={s.id} className="flex items-center justify-between rounded-xl bg-black/20 p-3">
                    <div className="flex items-center gap-3">
                      <Avatar username={s.username} />
                      <div>
                        <p className="text-sm font-medium">{s.username}</p>
                        {s.mutualFriends && (
                          <p className="text-xs text-white/40">{s.mutualFriends} mutual friends</p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => addSuggestion(s.id)}
                      className="rounded-lg border border-orange-500/40 px-3 py-1.5 text-xs font-semibold text-orange-400 transition hover:bg-orange-500/10"
                    >
                      Add
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </section>
    </ProtectedRoute>
  );
}