"use client";

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
} from "lucide-react";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { getFriendRequests } from "@/lib/api";

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

      const data = await getFriendRequests(receiverId, token);

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
      <main className="min-h-screen bg-[#f6f1e8] text-[#2f3a32]">
        <section className="relative overflow-hidden px-6 py-10 lg:px-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(125,148,112,0.18),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(216,207,184,0.35),transparent_30%)]" />
          <div className="absolute left-[-80px] top-20 h-72 w-72 rounded-full bg-[#dbe4d3]/40 blur-3xl" />
          <div className="absolute bottom-0 right-[-60px] h-80 w-80 rounded-full bg-[#ddd1bb]/50 blur-3xl" />

          <div className="relative mx-auto max-w-7xl">
            <div className="mb-8 rounded-[2rem] border border-[#ddd3c2] bg-[#fffaf2]/90 p-6 shadow-[0_20px_60px_rgba(92,108,91,0.10)] backdrop-blur-xl">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="max-w-2xl">
                  <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#d8cfbe] bg-[#eef3e8] px-4 py-2 text-sm font-medium text-[#64785f]">
                    <Leaf className="h-4 w-4" />
                    Build your circle
                  </div>

                  <h1 className="text-3xl font-bold tracking-tight text-[#2f3a32] md:text-4xl">
                    Friends & community
                  </h1>

                  <p className="mt-3 max-w-xl text-sm leading-7 text-[#667066] md:text-base">
                    Discover people, send friend requests, and grow a calmer,
                    more meaningful network inside your platform.
                  </p>
                </div>

                <button className="inline-flex items-center justify-center gap-2 rounded-full bg-[#6f8467] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#5f7358]">
                  <UserPlus className="h-4 w-4" />
                  Add friend
                </button>
              </div>
            </div>

            <div className="mb-8 rounded-[1.75rem] border border-[#ddd3c2] bg-[#fffaf2]/90 p-5 shadow-sm">
              <label className="mb-3 block text-sm font-medium text-[#6c756d]">
                Search users
              </label>

              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#93a08f]" />
                <input
                  type="text"
                  placeholder="Search by username or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-2xl border border-[#d8cfbe] bg-[#fcf8f1] py-3 pl-11 pr-4 text-sm text-[#2f3a32] outline-none transition placeholder:text-[#98a091] focus:border-[#91a387] focus:ring-4 focus:ring-[#dfe8d7]"
                />
              </div>
            </div>

            {error && (
              <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {actionMessage && (
              <div className="mb-6 rounded-2xl border border-[#c7d7bd] bg-[#edf4e8] px-4 py-3 text-sm text-[#5f7358]">
                {actionMessage}
              </div>
            )}

            <div className="grid gap-6 lg:grid-cols-[1.6fr_0.9fr]">
              <div className="rounded-[2rem] border border-[#ddd3c2] bg-[#fffaf2]/90 p-6 shadow-sm">
                <div className="mb-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-[#eef3e8] p-2 text-[#6f8467]">
                      <Users className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-[#2f3a32]">
                        Users
                      </h2>
                      <p className="text-sm text-[#7b847b]">
                        Browse and connect
                      </p>
                    </div>
                  </div>

                  <span className="rounded-full border border-[#ddd3c2] bg-[#faf5eb] px-3 py-1 text-sm text-[#6b746c]">
                    {filteredUsers.length} total
                  </span>
                </div>

                {loading ? (
                  <div className="rounded-3xl border border-[#e4dacb] bg-[#faf5eb] p-6 text-sm text-[#6b746c]">
                    Loading users...
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="rounded-3xl border border-[#e4dacb] bg-[#faf5eb] p-6 text-sm text-[#6b746c]">
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
                          className="flex flex-col gap-4 rounded-[1.5rem] border border-[#e4dacb] bg-[#fcf8f1] p-4 transition hover:shadow-sm sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div className="flex items-center gap-4">
                            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[#d8cfbe] bg-[#eef3e8] text-sm font-bold text-[#6f8467]">
                              {user.username.slice(0, 2).toUpperCase()}
                            </div>

                            <div>
                              <p className="text-base font-semibold text-[#2f3a32]">
                                {user.username}
                              </p>
                              <p className="text-sm text-[#7b847b]">
                                {user.email}
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-3">
                            <button className="inline-flex items-center gap-2 rounded-full border border-[#ddd3c2] bg-[#fffaf2] px-4 py-2 text-sm font-medium text-[#4e5a50] transition hover:bg-[#f3ecdf]">
                              <UserRound className="h-4 w-4" />
                              Profile
                            </button>

                            <button
                              onClick={() => handleAddFriend(user.id)}
                              disabled={alreadySent || isSending}
                              className="inline-flex items-center gap-2 rounded-full bg-[#6f8467] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#5f7358] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              <UserPlus className="h-4 w-4" />
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

              <div className="space-y-6">
                <div className="rounded-[2rem] border border-[#ddd3c2] bg-[#fffaf2]/90 p-6 shadow-sm">
                  <div className="mb-5 flex items-center gap-3">
                    <div className="rounded-2xl bg-[#eef3e8] p-2 text-[#6f8467]">
                      <Bell className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-[#2f3a32]">
                        Friend Requests
                      </h2>
                      <p className="text-sm text-[#7b847b]">
                        Pending connections
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {requests.map((request, index) => (
                      <div
                        key={index}
                        className="rounded-[1.5rem] border border-[#e4dacb] bg-[#fcf8f1] p-4"
                      >
                        <div className="mb-4 flex items-center gap-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#d8cfbe] bg-[#eef3e8] text-sm font-semibold text-[#6f8467]">
                            {request.name.slice(0, 2).toUpperCase()}
                          </div>

                          <div>
                            <p className="font-medium text-[#2f3a32]">
                              {request.name}
                            </p>
                            <p className="text-sm text-[#7b847b]">
                              Wants to connect
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <button className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#6f8467] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#5f7358]">
                            <Check className="h-4 w-4" />
                            Accept
                          </button>

                          <button className="flex flex-1 items-center justify-center gap-2 rounded-full border border-[#ddd3c2] bg-[#fffaf2] px-4 py-2 text-sm font-semibold text-[#5a665c] transition hover:bg-[#f3ecdf]">
                            <X className="h-4 w-4" />
                            Decline
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[2rem] border border-[#d8cfbe] bg-[#eef3e8]/80 p-5 shadow-sm">
                  <p className="text-xs uppercase tracking-[0.18em] text-[#6f8467]">
                    Community
                  </p>
                  <h3 className="mt-2 text-lg font-bold text-[#2f3a32]">
                    Stay connected
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-[#667066]">
                    Build your network, discover people, and prepare the future
                    friend system in a softer and more elegant interface.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </ProtectedRoute>
  );
}