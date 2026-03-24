"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import {
  Leaf,
  MessageCircle,
  FileText,
  Mail,
  MapPin,
  Info,
  CalendarDays,
} from "lucide-react";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Card, CardContent } from "@/components/ui/card";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";

type ProfileUser = {
  id: number;
  username: string;
  email: string;
  avatar?: string | null;
  bio?: string | null;
  status?: string | null;
  location?: string | null;
  createdAt?: string;
};

type FeedComment = {
  id: number;
  content: string;
  createdAt: string;
  author: {
    id: number;
    username: string;
    email: string;
    avatar?: string | null;
  };
};

type FeedPost = {
  id: number;
  content: string;
  createdAt: string;
  author: {
    id: number;
    username: string;
    email: string;
    avatar?: string | null;
  };
  likesCount: number;
  commentsCount: number;
  favoritesCount: number;
  repostsCount?: number;
  likedByCurrentUser: boolean;
  favoritedByCurrentUser: boolean;
  repostedByCurrentUser?: boolean;
  comments: FeedComment[];
  media: string[];
};

type UserCommentItem = {
  id: number;
  content: string;
  createdAt: string;
  postId: number;
  postContent: string;
  postAuthor: {
    id: number;
    username: string;
  };
};

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleString("fr-FR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

export default function PublicProfilePage() {
  const params = useParams();
  const id = params?.id;

  const [profile, setProfile] = useState<ProfileUser | null>(null);
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"posts" | "comments">("posts");

  const userId = useMemo(() => {
    if (!id || Array.isArray(id)) return null;
    const parsed = Number(id);
    return Number.isNaN(parsed) ? null : parsed;
  }, [id]);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Tu dois être connecté.");
        setLoading(false);
        return;
      }

      if (!userId || userId < 1) {
        setError("Identifiant utilisateur invalide.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const [profileRes, postsRes] = await Promise.all([
          fetch(`http://localhost:3001/users/${userId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch("http://localhost:3001/posts", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

        const profileData = await profileRes.json();
        const postsData = await postsRes.json();

        if (!profileRes.ok) {
          throw new Error(
            profileData.message || "Impossible de récupérer le profil."
          );
        }

        if (!postsRes.ok) {
          throw new Error(
            postsData.message || "Impossible de récupérer les posts."
          );
        }

        setProfile(profileData);
        setPosts(Array.isArray(postsData) ? postsData : []);
      } catch (err) {
        console.error("Erreur chargement profil public :", err);
        setError(
          err instanceof Error
            ? err.message
            : "Erreur lors du chargement du profil."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  const userPosts = useMemo(() => {
    if (!userId) return [];
    return posts.filter((post) => post.author.id === userId);
  }, [posts, userId]);

  const userComments = useMemo<UserCommentItem[]>(() => {
    if (!userId) return [];

    return posts.flatMap((post) =>
      post.comments
        .filter((comment) => comment.author.id === userId)
        .map((comment) => ({
          id: comment.id,
          content: comment.content,
          createdAt: comment.createdAt,
          postId: post.id,
          postContent: post.content,
          postAuthor: {
            id: post.author.id,
            username: post.author.username,
          },
        }))
    );
  }, [posts, userId]);

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-[#f6f1e8] text-[#2f3a32]">
        <section className="relative overflow-hidden px-4 py-6 sm:px-6 lg:px-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(125,148,112,0.16),transparent_26%),radial-gradient(circle_at_bottom_right,rgba(216,207,184,0.32),transparent_30%)]" />

          <div className="relative mx-auto max-w-[1100px] space-y-6">
            <Card className="rounded-[2rem] border-[#ddd3c2] bg-[#fffaf2]/95 shadow-sm">
              <CardContent className="p-6">
                {loading ? (
                  <div className="rounded-2xl border border-[#e4dacb] bg-[#faf5eb] p-6 text-sm text-[#6b746c]">
                    Chargement du profil...
                  </div>
                ) : error ? (
                  <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                ) : !profile ? (
                  <div className="rounded-2xl border border-[#e4dacb] bg-[#faf5eb] p-6 text-sm text-[#6b746c]">
                    Profil introuvable.
                  </div>
                ) : (
                  <>
                    <div className="mb-5">
                      <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#d8cfbe] bg-[#eef3e8] px-4 py-2 text-sm font-medium text-[#64785f]">
                        <Leaf className="h-4 w-4" />
                        Public profile
                      </div>

                      <h1 className="text-3xl font-bold tracking-tight text-[#2f3a32] md:text-4xl">
                        Profil de {profile.username}
                      </h1>

                      <p className="mt-3 max-w-2xl text-sm leading-7 text-[#667066] md:text-base">
                        Consulte le profil public, les posts et les commentaires
                        de ce membre.
                      </p>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
                      <div className="rounded-[1.75rem] border border-[#e3d9c8] bg-[#fcf8f1] p-5">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-20 w-20 border border-[#d8cfbe]">
                            <AvatarImage
                              src={profile.avatar || ""}
                              alt={profile.username}
                            />
                            <AvatarFallback className="bg-[#eef3e8] text-[#6f8467] text-lg">
                              {profile.username.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>

                          <div>
                            <h2 className="text-2xl font-bold text-[#2f3a32]">
                              {profile.username}
                            </h2>
                            <p className="text-sm text-[#7b847b]">
                              @{profile.username.toLowerCase()}
                            </p>
                          </div>
                        </div>

                        <div className="mt-6 grid gap-4">
                          <div className="rounded-2xl border border-[#e3d9c8] bg-[#fffaf2] p-4">
                            <div className="mb-2 flex items-center gap-2 text-[#6f8467]">
                              <Mail className="h-4 w-4" />
                              <p className="text-sm font-medium">Email</p>
                            </div>
                            <p className="text-sm text-[#2f3a32]">
                              {profile.email || "Non renseigné"}
                            </p>
                          </div>

                          <div className="rounded-2xl border border-[#e3d9c8] bg-[#fffaf2] p-4">
                            <div className="mb-2 flex items-center gap-2 text-[#6f8467]">
                              <MapPin className="h-4 w-4" />
                              <p className="text-sm font-medium">Localisation</p>
                            </div>
                            <p className="text-sm text-[#2f3a32]">
                              {profile.location || "Non renseignée"}
                            </p>
                          </div>

                          <div className="rounded-2xl border border-[#e3d9c8] bg-[#fffaf2] p-4">
                            <div className="mb-2 flex items-center gap-2 text-[#6f8467]">
                              <Info className="h-4 w-4" />
                              <p className="text-sm font-medium">Statut</p>
                            </div>
                            <p className="text-sm text-[#2f3a32]">
                              {profile.status || "Non renseigné"}
                            </p>
                          </div>

                          <div className="rounded-2xl border border-[#e3d9c8] bg-[#fffaf2] p-4">
                            <div className="mb-2 flex items-center gap-2 text-[#6f8467]">
                              <CalendarDays className="h-4 w-4" />
                              <p className="text-sm font-medium">Membre depuis</p>
                            </div>
                            <p className="text-sm text-[#2f3a32]">
                              {profile.createdAt
                                ? new Date(profile.createdAt).toLocaleDateString("fr-FR")
                                : "Non disponible"}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-[1.75rem] border border-[#e3d9c8] bg-[#fcf8f1] p-5">
                        <h3 className="text-lg font-semibold text-[#2f3a32]">
                          Bio
                        </h3>

                        <div className="mt-4 rounded-2xl border border-[#e3d9c8] bg-[#fffaf2] p-4">
                          <p className="text-sm leading-7 text-[#4e5850]">
                            {profile.bio || "Aucune bio pour le moment."}
                          </p>
                        </div>

                        <div className="mt-5 grid grid-cols-2 gap-3">
                          <div className="rounded-2xl border border-[#e3d9c8] bg-[#fffaf2] p-4 text-center">
                            <p className="text-2xl font-bold text-[#2f3a32]">
                              {userPosts.length}
                            </p>
                            <p className="text-sm text-[#7b847b]">Posts</p>
                          </div>

                          <div className="rounded-2xl border border-[#e3d9c8] bg-[#fffaf2] p-4 text-center">
                            <p className="text-2xl font-bold text-[#2f3a32]">
                              {userComments.length}
                            </p>
                            <p className="text-sm text-[#7b847b]">Commentaires</p>
                          </div>
                        </div>

                        <div className="mt-5 rounded-2xl border border-[#d8cfbe] bg-[#eef3e8]/80 p-4">
                          <p className="text-xs uppercase tracking-[0.18em] text-[#6f8467]">
                            Lecture seule
                          </p>
                          <p className="mt-2 text-sm leading-6 text-[#667066]">
                            Cette page affiche le profil public, les posts et les
                            commentaires visibles dans le feed.
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {!loading && !error && profile && (
              <Card className="rounded-[2rem] border-[#ddd3c2] bg-[#fffaf2]/95 shadow-sm">
                <CardContent className="p-5 sm:p-6">
                  <div className="mb-5 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setActiveTab("posts")}
                      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
                        activeTab === "posts"
                          ? "bg-[#6f8467] text-white"
                          : "border border-[#d8cfbe] bg-[#fffaf2] text-[#4e5a50] hover:bg-[#f3ecdf]"
                      }`}
                    >
                      <FileText className="h-4 w-4" />
                      Posts
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab("comments")}
                      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
                        activeTab === "comments"
                          ? "bg-[#6f8467] text-white"
                          : "border border-[#d8cfbe] bg-[#fffaf2] text-[#4e5a50] hover:bg-[#f3ecdf]"
                      }`}
                    >
                      <MessageCircle className="h-4 w-4" />
                      Commentaires
                    </button>
                  </div>

                  {activeTab === "posts" ? (
                    userPosts.length === 0 ? (
                      <div className="rounded-3xl border border-[#e4dacb] bg-[#faf5eb] p-6 text-sm text-[#6b746c]">
                        Aucun post pour le moment.
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {userPosts.map((post) => (
                          <div
                            key={post.id}
                            className="rounded-[1.5rem] border border-[#e4dacb] bg-[#fcf8f1] p-5"
                          >
                            <div className="mb-3 flex items-center gap-3">
                              <Avatar className="h-11 w-11 border border-[#d8cfbe]">
                                <AvatarImage
                                  src={post.author.avatar || ""}
                                  alt={post.author.username}
                                />
                                <AvatarFallback className="bg-[#eef3e8] text-[#6f8467]">
                                  {post.author.username.slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>

                              <div>
                                <p className="font-semibold text-[#2f3a32]">
                                  {post.author.username}
                                </p>
                                <p className="text-sm text-[#7b847b]">
                                  {formatDate(post.createdAt)}
                                </p>
                              </div>
                            </div>

                            <p className="text-sm leading-7 text-[#4e5850]">
                              {post.content}
                            </p>

                            {post.media.length > 0 && (
                              <div className="mt-4 overflow-hidden rounded-2xl border border-[#d8cfbe] bg-[#fffaf2]">
                                <img
                                  src={post.media[0]}
                                  alt="Post media"
                                  className="max-h-[420px] w-full object-cover"
                                />
                              </div>
                            )}

                            <div className="mt-4 flex flex-wrap items-center gap-5 text-sm text-[#6f786f]">
                              <div className="inline-flex items-center gap-2">
                                <MessageCircle className="h-4 w-4" />
                                <span>{post.commentsCount}</span>
                              </div>

                              <div className="inline-flex items-center gap-2">
                                <span>❤️</span>
                                <span>{post.likesCount}</span>
                              </div>

                              <div className="inline-flex items-center gap-2">
                                <span>🔖</span>
                                <span>{post.favoritesCount}</span>
                              </div>

                              <div className="inline-flex items-center gap-2">
                                <span>🔁</span>
                                <span>{post.repostsCount ?? 0}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )
                  ) : userComments.length === 0 ? (
                    <div className="rounded-3xl border border-[#e4dacb] bg-[#faf5eb] p-6 text-sm text-[#6b746c]">
                      Aucun commentaire pour le moment.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {userComments.map((comment) => (
                        <div
                          key={comment.id}
                          className="rounded-[1.5rem] border border-[#e4dacb] bg-[#fcf8f1] p-5"
                        >
                          <div className="mb-3 flex items-center justify-between gap-3">
                            <div>
                              <p className="font-semibold text-[#2f3a32]">
                                {profile.username}
                              </p>
                              <p className="text-sm text-[#7b847b]">
                                {formatDate(comment.createdAt)}
                              </p>
                            </div>

                            <Link
                              href={`/feed`}
                              className="text-sm text-[#6f8467] hover:underline"
                            >
                              Voir le feed
                            </Link>
                          </div>

                          <p className="text-sm leading-7 text-[#4e5850]">
                            {comment.content}
                          </p>

                          <div className="mt-4 rounded-2xl border border-[#e3d9c8] bg-[#fffaf2] p-4">
                            <p className="text-xs uppercase tracking-wide text-[#8a9288]">
                              Posté sous le post de @{comment.postAuthor.username}
                            </p>
                            <p className="mt-2 text-sm leading-6 text-[#667066]">
                              {comment.postContent || "Post sans contenu texte."}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </section>
      </main>
    </ProtectedRoute>
  );
}