"use client";

import { useEffect, useMemo, useState } from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { sendFriendRequest } from "@/lib/api";

type UserItem = {
  id: number;
  username: string;
  email: string;
};

export default function FriendsPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [requests] = useState([{ name: "Sarah" }, { name: "Mehdi" }]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [sentRequests, setSentRequests] = useState<number[]>([]);
  const [sendingId, setSendingId] = useState<number | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await fetch("http://localhost:3001/users");
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Impossible de récupérer les utilisateurs.");
        }

        if (Array.isArray(data)) {
          setUsers(data);
        } else {
          setUsers([]);
        }
      } catch (err) {
        console.error("Erreur fetch users :", err);
        setError(
          err instanceof Error ? err.message : "Erreur lors du chargement des utilisateurs."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return users;

    return users.filter(
      (user) =>
        user.username.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term)
    );
  }, [users, search]);

  const handleAddFriend = async (receiverId: number) => {
    const token = localStorage.getItem("token");

    if (!token) {
      setActionMessage("You must be logged in to send a friend request.");
      return;
    }

    try {
      setSendingId(receiverId);
      setActionMessage("");

      const data = await sendFriendRequest(receiverId, token);

      setSentRequests((prev) => [...prev, receiverId]);
      setActionMessage(data.message || "Friend request sent.");
    } catch (err) {
      console.error("Erreur add friend :", err);
      setActionMessage(
        err instanceof Error ? err.message : "Unable to send friend request."
      );
    } finally {
      setSendingId(null);
    }
  };

  return (
    <ProtectedRoute>
      <section className="min-h-screen bg-neutral-950 px-6 py-10 text-white">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-md md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold">Friends</h1>
              <p className="mt-2 text-sm text-white/60">
                Browse users, manage requests, and build your community.
              </p>
            </div>

            <button className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600">
              Add friend
            </button>
          </div>

          <div className="mb-8 rounded-2xl border border-white/10 bg-white/5 p-5">
            <label className="mb-2 block text-sm font-medium text-white/70">
              Search users
            </label>
            <input
              type="text"
              placeholder="Search by username or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-orange-500/50"
            />
          </div>

          {error && (
            <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {actionMessage && (
            <div className="mb-6 rounded-xl border border-orange-500/30 bg-orange-500/10 px-4 py-3 text-sm text-orange-300">
              {actionMessage}
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-white/5 p-6">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-xl font-semibold">Users</h2>
                <span className="text-sm text-white/50">
                  {filteredUsers.length} total
                </span>
              </div>

              {loading ? (
                <div className="rounded-2xl bg-black/20 p-6 text-sm text-white/60">
                  Loading users...
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="rounded-2xl bg-black/20 p-6 text-sm text-white/60">
                  No users found.
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredUsers.map((user) => {
                    const alreadySent = sentRequests.includes(user.id);
                    const isSending = sendingId === user.id;

                    return (
                      <div
                        key={user.id}
                        className="flex flex-col gap-4 rounded-2xl bg-black/20 p-4 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/10 text-sm font-bold text-orange-300">
                            {user.username.slice(0, 2).toUpperCase()}
                          </div>

                          <div>
                            <p className="text-base font-semibold text-white">
                              {user.username}
                            </p>
                            <p className="text-sm text-white/40">{user.email}</p>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <button className="rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/15">
                            Message
                          </button>
                          <button className="rounded-lg border border-white/15 px-4 py-2 text-sm font-medium text-white/80 transition hover:border-orange-500/50 hover:text-white">
                            Profile
                          </button>
                          <button
                            onClick={() => handleAddFriend(user.id)}
                            disabled={alreadySent || isSending}
                            className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {isSending
                              ? "Sending..."
                              : alreadySent
                              ? "Sent"
                              : "Add"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h2 className="mb-5 text-xl font-semibold">Friend Requests</h2>

              <div className="space-y-4">
                {requests.map((request, index) => (
                  <div key={index} className="rounded-2xl bg-black/20 p-4">
                    <div className="mb-4 flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-white/10" />
                      <div>
                        <p className="font-medium text-white">{request.name}</p>
                        <p className="text-sm text-white/40">Wants to connect</p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button className="flex-1 rounded-lg bg-green-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-600">
                        Accept
                      </button>
                      <button className="flex-1 rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600">
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-2xl border border-orange-500/20 bg-orange-500/5 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-orange-300/70">
                  Community
                </p>
                <h3 className="mt-2 text-lg font-bold text-white">
                  Stay connected
                </h3>
                <p className="mt-2 text-sm leading-6 text-white/70">
                  Build your network, chat with people, and prepare the future friend system.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </ProtectedRoute>
  );
}