"use client";

import Link from "next/link";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";

type Post = {
  id: number;
  imageUrl: string;
};

const profileExtras = {
  bio: "Étudiant en informatique, passionné par le développement web, la cybersécurité et les interfaces modernes.",
  avatar:
    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=400&auto=format&fit=crop",
  friendsCount: 4,
  posts: [] as Post[], // remplace avec tes vrais posts depuis l'API
};

export default function Profil() {
  const { user } = useAuth();

  return (
    <ProtectedRoute>
      <section className="min-h-screen bg-neutral-950 px-6 py-10 text-white">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-md">

            {/* ── Ligne haut : photo + stats ─────────────────────────────── */}
            <div className="flex items-center gap-8">

              {/* Photo + bouton Edit */}
              <div className="flex flex-col items-center gap-3">
                <img
                  src={profileExtras.avatar}
                  alt="Avatar"
                  className="h-24 w-24 rounded-full border-2 border-orange-500 object-cover"
                />
                <button className="rounded-lg border border-white/15 px-4 py-1.5 text-xs font-semibold text-white/70 transition hover:border-orange-500/50 hover:text-white">
                  Edit
                </button>
              </div>

              {/* Stats */}
              <div className="flex gap-6">
                <div className="rounded-2xl border border-white/10 bg-black/20 px-6 py-4 text-center">
                  <p className="text-2xl font-bold">{profileExtras.posts.length}</p>
                  <p className="mt-1 text-xs text-white/40">Posts</p>
                </div>
                <Link
                  href="/friends"
                  className="rounded-2xl border border-white/10 bg-black/20 px-6 py-4 text-center transition hover:border-orange-500/50"
                >
                  <p className="text-2xl font-bold">{profileExtras.friendsCount}</p>
                  <p className="mt-1 text-xs text-white/40">Amis</p>
                </Link>
              </div>
            </div>

            {/* ── Username ───────────────────────────────────────────────── */}
            <div className="mt-5">
              <h1 className="text-lg font-semibold">
                {user?.username || "Utilisateur"}
              </h1>
            </div>

            {/* ── Bio ────────────────────────────────────────────────────── */}
            <div className="mt-3">
              <p className="rounded-xl border border-white/8 bg-black/20 px-4 py-3 text-sm leading-6 text-white/70">
                {profileExtras.bio || "No bio yet."}
              </p>
            </div>

            {/* ── Posts ──────────────────────────────────────────────────── */}
            <div className="mt-6">
              {profileExtras.posts.length > 0 ? (
                <div className="grid grid-cols-3 gap-2">
                  {profileExtras.posts.map((post) => (
                    <div
                      key={post.id}
                      className="aspect-square overflow-hidden rounded-xl bg-white/5"
                    >
                      <img
                        src={post.imageUrl}
                        alt="Post"
                        className="h-full w-full object-cover transition hover:brightness-75"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 py-10 text-center">
                  <p className="text-sm text-white/30">Aucun post pour l'instant.</p>
                  <p className="text-xs text-white/20">
                    Partage ton premier moment ✦
                  </p>
                </div>
              )}
            </div>

          </div>
        </div>
      </section>
    </ProtectedRoute>
  );
}