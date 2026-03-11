"use client";

import { useEffect, useState } from "react";

type Friend = {
  name: string;
  status: string;
};

type UserProfile = {
  username: string;
  email: string;
  bio: string;
  status: string;
  avatar: string;
  location: string;
  joinedAt: string;
  website: string;
  preferences: {
    theme: string;
    language: string;
    notifications: string;
  };
  notifications: string[];
  activity: string[];
  history: string[];
  friends: Friend[];
};

const defaultUser: UserProfile = {
  username: "nabboud",
  email: "nabboud@example.com",
  bio: "Étudiant en informatique, passionné par le développement web, la cybersécurité et les interfaces modernes.",
  status: "Online",
  avatar:
    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=400&auto=format&fit=crop",
  location: "France",
  joinedAt: "March 2026",
  website: "portfolio.dev",
  preferences: {
    theme: "Dark",
    language: "Français",
    notifications: "Enabled",
  },
  notifications: [
    "Friend request accepted by Amine",
    "New message from Yassir",
    "Your profile was updated successfully",
  ],
  activity: [
    "Updated profile picture",
    "Accepted a friend request",
    "Joined a new conversation",
    "Changed account settings",
  ],
  history: [
    "Connected 2 hours ago",
    "Last message sent yesterday",
    "Profile created in March 2026",
  ],
  friends: [
    { name: "Amine", status: "Online" },
    { name: "Yassir", status: "Offline" },
    { name: "Sami", status: "Online" },
    { name: "Ikram", status: "Offline" },
  ],
};

export default function Profil() {
  const [user, setUser] = useState<UserProfile>(defaultUser);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");

    const fetchUser = async () => {
      if (!token) {
        setMessage("Aucun token trouvé. Utilisateur non connecté.");
        return;
      }

      try {
        const res = await fetch("http://localhost:3001/user", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (res.ok) {
          setUser((prevUser) => ({
            ...prevUser,
            username: data.username || prevUser.username,
            email: data.email || prevUser.email,
          }));
          setMessage("");
        } else {
          setMessage("Erreur : " + (data.message || "Impossible de récupérer l'utilisateur."));
        }
      } catch (error) {
        console.error("Erreur fetch user :", error);
        setMessage("Erreur réseau lors de la récupération du profil.");
      }
    };

    fetchUser();
  }, []);

  return (
    <section className="min-h-screen bg-neutral-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl">
        {message && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {message}
          </div>
        )}

        <div className="mb-8 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-md">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <img
                src={user.avatar}
                alt="Avatar utilisateur"
                className="h-24 w-24 rounded-full border-2 border-orange-500 object-cover"
              />

              <div>
                <div className="mb-2 flex flex-wrap items-center gap-3">
                  <h1 className="text-3xl font-bold">{user.username}</h1>
                  <span className="rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1 text-xs font-semibold text-green-400">
                    {user.status}
                  </span>
                </div>

                <p className="text-sm text-white/60">{user.email}</p>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-white/75">
                  {user.bio}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600">
                Edit profile
              </button>
              <button className="rounded-xl border border-white/15 px-4 py-2 text-sm font-semibold text-white/80 transition hover:border-orange-500/50 hover:text-white">
                Send message
              </button>
              <button className="rounded-xl border border-white/15 px-4 py-2 text-sm font-semibold text-white/80 transition hover:border-orange-500/50 hover:text-white">
                Add friend
              </button>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <h2 className="mb-4 text-lg font-semibold">Personal Info</h2>

              <div className="space-y-4">
                <div>
                  <p className="text-xs uppercase tracking-widest text-white/40">Username</p>
                  <p className="mt-1 text-sm text-white">{user.username}</p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-widest text-white/40">Email</p>
                  <p className="mt-1 text-sm text-white">{user.email}</p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-widest text-white/40">Location</p>
                  <p className="mt-1 text-sm text-white">{user.location}</p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-widest text-white/40">Joined</p>
                  <p className="mt-1 text-sm text-white">{user.joinedAt}</p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-widest text-white/40">Website</p>
                  <p className="mt-1 text-sm text-orange-400">{user.website}</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <h2 className="mb-4 text-lg font-semibold">Preferences</h2>

              <div className="space-y-4">
                <div>
                  <p className="text-xs uppercase tracking-widest text-white/40">Theme</p>
                  <p className="mt-1 text-sm text-white">{user.preferences.theme}</p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-widest text-white/40">Language</p>
                  <p className="mt-1 text-sm text-white">{user.preferences.language}</p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-widest text-white/40">Notifications</p>
                  <p className="mt-1 text-sm text-green-400">{user.preferences.notifications}</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <h2 className="mb-4 text-lg font-semibold">Notifications</h2>

              <div className="space-y-3">
                {user.notifications.map((item, index) => (
                  <div
                    key={index}
                    className="rounded-xl bg-black/20 px-4 py-3 text-sm text-white/75"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6 lg:col-span-6">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h2 className="mb-4 text-xl font-semibold">About</h2>
              <p className="leading-7 text-white/75">{user.bio}</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h2 className="mb-4 text-xl font-semibold">Recent Activity</h2>

              <div className="space-y-3">
                {user.activity.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 rounded-xl bg-black/20 p-4"
                  >
                    <div className="mt-1 h-2.5 w-2.5 rounded-full bg-orange-400" />
                    <p className="text-sm text-white/80">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h2 className="mb-4 text-xl font-semibold">History</h2>

              <div className="space-y-3">
                {user.history.map((item, index) => (
                  <div
                    key={index}
                    className="rounded-xl border border-white/5 bg-black/20 p-4 text-sm text-white/70"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6 lg:col-span-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Friends</h2>
                <button className="text-sm text-orange-400 hover:text-orange-300">
                  See all
                </button>
              </div>

              <div className="space-y-3">
                {user.friends.map((friend, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-xl bg-black/20 p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-white/10" />
                      <div>
                        <p className="text-sm font-medium text-white">{friend.name}</p>
                        <p className="text-xs text-white/40">Friend</p>
                      </div>
                    </div>

                    <span
                      className={`text-xs font-semibold ${
                        friend.status === "Online" ? "text-green-400" : "text-white/40"
                      }`}
                    >
                      {friend.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-orange-500/20 bg-orange-500/5 p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-orange-300/70">
                Profile summary
              </p>
              <h3 className="mt-2 text-xl font-bold text-white">
                Active community member
              </h3>
              <p className="mt-3 text-sm leading-6 text-white/70">
                This profile is active, connected with friends, and frequently
                interacting on the platform.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <h2 className="mb-4 text-lg font-semibold">Quick Actions</h2>

              <div className="flex flex-col gap-3">
                <button className="rounded-lg bg-white/10 px-4 py-3 text-left text-sm font-medium text-white transition hover:bg-white/15">
                  Open settings
                </button>
                <button className="rounded-lg bg-white/10 px-4 py-3 text-left text-sm font-medium text-white transition hover:bg-white/15">
                  View conversations
                </button>
                <button className="rounded-lg bg-white/10 px-4 py-3 text-left text-sm font-medium text-white transition hover:bg-white/15">
                  Manage notifications
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}