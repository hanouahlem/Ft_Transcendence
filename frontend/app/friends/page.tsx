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

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { getFriendRequests } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";

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
          throw new Error(
            data.message || "Impossible de récupérer les utilisateurs."
          );
        }

        if (Array.isArray(data)) {
          setUsers(data);
        } else {
          setUsers([]);
        }
      } catch (err) {
        console.error("Erreur fetch users :", err);
        setError(
          err instanceof Error
            ? err.message
            : "Erreur lors du chargement des utilisateurs."
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

      setSentRequests((prev) =>
        prev.includes(receiverId) ? prev : [...prev, receiverId]
      );
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
      <main className="min-h-screen bg-gradient-to-br from-[#EAF1E6] via-[#dbe7d2] to-[#9CAF88] text-[#33412c]">
        <section className="relative overflow-hidden px-4 py-6 sm:px-6 lg:px-8">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.25),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.18),transparent_28%)]" />

          <div className="relative mx-auto max-w-7xl">
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm font-medium text-[#4A6440] shadow-md backdrop-blur">
                <Sparkles className="h-4 w-4" />
                Build your circle
              </div>

              <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-[#33412c]">
                Friends & community
              </h1>

              <p className="mt-3 max-w-2xl text-base leading-7 text-[#51604b]">
                Découvre des profils, envoie des demandes d’amis et développe
                ton réseau dans une interface plus douce et plus lisible.
              </p>
            </div>

            <div className="mb-8 grid gap-6 lg:grid-cols-[1.6fr_0.9fr]">
              <Card className="rounded-[2rem] border-0 bg-white/92 shadow-[0_18px_50px_rgba(74,100,64,0.15)] backdrop-blur">
                <CardContent className="p-6">
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    <div className="max-w-2xl">
                      <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#EAF1E6] px-4 py-2 text-sm font-medium text-[#4A6440]">
                        <Leaf className="h-4 w-4" />
                        Community space
                      </div>

                      <h2 className="text-2xl font-bold text-[#33412c]">
                        Connect with people
                      </h2>

                      <p className="mt-3 text-sm leading-7 text-[#60705a]">
                        Explore user profiles, send requests, and organise your
                        future social interactions with a cleaner visual rhythm.
                      </p>
                    </div>

                  </div>
                </CardContent>
              </Card>

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
              <Card className="rounded-[2rem] border-0 bg-white/92 shadow-[0_18px_50px_rgba(74,100,64,0.15)] backdrop-blur">
                <CardContent className="p-6">
                  <div className="mb-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-2xl bg-[#EAF1E6] p-2 text-[#4A6440]">
                        <Users className="h-5 w-5" />
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold text-[#33412c]">
                          Users
                        </h2>
                        <p className="text-sm text-[#71806c]">
                          Browse and connect
                        </p>
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
                      {filteredUsers.map((user) => {
                        const alreadySent = sentRequests.includes(user.id);
                        const isSending = sendingId === user.id;

                        return (
                          <div
                            key={user.id}
                            className="flex flex-col gap-4 rounded-[1.5rem] bg-[#fbfdf9] p-4 shadow-sm transition hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
                          >
                            <div className="flex items-center gap-4">
                              <Avatar className="h-14 w-14 border border-[#d8e3d1]">
                                <AvatarImage src="" alt={user.username} />
                                <AvatarFallback className="bg-[#EAF1E6] font-bold text-[#4A6440]">
                                  {user.username.slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>

                              <div>
                                <p className="text-base font-semibold text-[#33412c]">
                                  {user.username}
                                </p>
                                <p className="text-sm text-[#71806c]">
                                  {user.email}
                                </p>
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-3">
                              <Link
                                href={`/profil/${user.id}`}
                                className="inline-flex items-center gap-2 rounded-full bg-[#F4F8F1] px-4 py-2 text-sm font-medium text-[#4e5a50] transition hover:bg-[#e7f0e1]"
                              >
                                <UserRound className="h-4 w-4" />
                                Profile
                              </Link>

                              <button
                                onClick={() => handleAddFriend(user.id)}
                                disabled={alreadySent || isSending}
                                className="inline-flex items-center gap-2 rounded-full bg-[#8AA678] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#79956a] disabled:cursor-not-allowed disabled:opacity-60"
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
                </CardContent>
              </Card>

              <div className="space-y-6">
                <div className="lg:sticky lg:top-24 space-y-6">
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
                          <p className="text-sm text-[#71806c]">
                            Pending connections
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {requests.map((request, index) => (
                          <div
                            key={index}
                            className="rounded-[1.5rem] bg-[#fbfdf9] p-4 shadow-sm"
                          >
                            <div className="mb-4 flex items-center gap-3">
                              <Avatar className="h-12 w-12 border border-[#d8e3d1]">
                                <AvatarImage src="" alt={request.name} />
                                <AvatarFallback className="bg-[#EAF1E6] font-semibold text-[#4A6440]">
                                  {request.name.slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>

                              <div>
                                <p className="font-medium text-[#33412c]">
                                  {request.name}
                                </p>
                                <p className="text-sm text-[#71806c]">
                                  Wants to connect
                                </p>
                              </div>
                            </div>

                            <div className="flex gap-3">
                              <button className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#8AA678] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#79956a]">
                                <Check className="h-4 w-4" />
                                Accept
                              </button>

                              <button className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#F4F8F1] px-4 py-2 text-sm font-semibold text-[#5a665c] transition hover:bg-[#e7f0e1]">
                                <X className="h-4 w-4" />
                                Decline
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="rounded-[2rem] border-0 bg-white/92 shadow-[0_18px_50px_rgba(74,100,64,0.15)] backdrop-blur">
                    <CardContent className="p-6">
                      <p className="text-xs uppercase tracking-[0.18em] text-[#6f8467]">
                        Community
                      </p>
                      <h3 className="mt-2 text-lg font-bold text-[#33412c]">
                        Stay connected
                      </h3>
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
    </ProtectedRoute>
  );
}