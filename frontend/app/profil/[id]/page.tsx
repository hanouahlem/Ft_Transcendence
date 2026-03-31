"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Leaf, MessageCircle, Heart, Bookmark } from "lucide-react";

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

type FriendItem = {
  id: number;
  username: string;
  avatar?: string | null;
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
  likesCount: number;
  favoritesCount: number;
  likedByCurrentUser: boolean;
  favoritedByCurrentUser: boolean;
  media: string[];
  post?: {
    id: number;
    content: string;
    author: {
      id: number;
      username: string;
    };
  } | null;
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
  likedByCurrentUser: boolean;
  favoritedByCurrentUser: boolean;
  comments: FeedComment[];
  media: string[];
};

type ReactionResponse = {
  posts: FeedPost[];
  comments: FeedComment[];
};

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleString("fr-FR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

export default function PublicProfilePage() {
  const { token } = useAuth();
  const params = useParams();
  const userId = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const [profile, setProfile] = useState<ProfileUser | null>(null);
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [comments, setComments] = useState<FeedComment[]>([]);
  const [likedPosts, setLikedPosts] = useState<FeedPost[]>([]);
  const [likedComments, setLikedComments] = useState<FeedComment[]>([]);
  const [favoritePosts, setFavoritePosts] = useState<FeedPost[]>([]);
  const [favoriteComments, setFavoriteComments] = useState<FeedComment[]>([]);
  const [friends, setFriends] = useState<FriendItem[]>([]);
  const [activeTab, setActiveTab] = useState<"posts" | "friends" | "comments" | "likes" | "favorites">("posts");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token || !userId) return;

    const fetchAll = async () => {
      try {
        setLoading(true);
        setError("");

        const headers = {
          Authorization: `Bearer ${token}`,
        };

        const [profileRes, postsRes, commentsRes, likesRes, favoritesRes, friendsRes] =
          await Promise.all([
            fetch(`http://localhost:3001/users/${userId}`, { headers }),
            fetch(`http://localhost:3001/users/${userId}/posts`, { headers }),
            fetch(`http://localhost:3001/users/${userId}/comments`, { headers }),
            fetch(`http://localhost:3001/users/${userId}/likes`, { headers }),
            fetch(`http://localhost:3001/users/${userId}/favorites`, { headers }),
            fetch(`http://localhost:3001/users/${userId}/friends`, { headers }),
          ]);

        const profileData = await profileRes.json();
        const postsData = await postsRes.json();
        const commentsData = await commentsRes.json();
        const likesData: ReactionResponse = await likesRes.json();
        const favoritesData: ReactionResponse = await favoritesRes.json();
        const friendsData = await friendsRes.json();

        if (!profileRes.ok) {
          throw new Error(profileData.message || "Impossible de charger le profil.");
        }
        if (!postsRes.ok) {
          throw new Error(postsData.message || "Impossible de charger les posts.");
        }
        if (!commentsRes.ok) {
          throw new Error(commentsData.message || "Impossible de charger les commentaires.");
        }
        if (!likesRes.ok) {
          throw new Error("Impossible de charger les likes.");
        }
        if (!favoritesRes.ok) {
          throw new Error("Impossible de charger les favoris.");
        }

        setProfile(profileData);
        setPosts(Array.isArray(postsData) ? postsData : []);
        setComments(Array.isArray(commentsData) ? commentsData : []);
        setLikedPosts(Array.isArray(likesData.posts) ? likesData.posts : []);
        setLikedComments(Array.isArray(likesData.comments) ? likesData.comments : []);
        setFavoritePosts(Array.isArray(favoritesData.posts) ? favoritesData.posts : []);
        setFavoriteComments(Array.isArray(favoritesData.comments) ? favoritesData.comments : []);
        setFriends(Array.isArray(friendsData) ? friendsData : []);
      } catch (err) {
        console.error("Erreur chargement profil :", err);
        setError(err instanceof Error ? err.message : "Erreur inconnue");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [token, userId]);

  const renderPostCard = (post: FeedPost) => (
    <div
      key={post.id}
      className="rounded-[1.5rem] border border-[#e4dacb] bg-[#fcf8f1] p-5"
    >
      <div className="mb-3 flex items-center gap-3">
        <Avatar className="h-11 w-11 border border-[#d8cfbe]">
          <AvatarImage src={post.author.avatar || ""} alt={post.author.username} />
          <AvatarFallback className="bg-[#eef3e8] text-[#6f8467]">
            {post.author.username.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div>
          <Link
            href={`/profil/${post.author.id}`}
            className="font-semibold text-[#2f3a32] hover:underline"
          >
            {post.author.username}
          </Link>
          <p className="text-sm text-[#7b847b]">{formatDate(post.createdAt)}</p>
        </div>
      </div>

      <p className="text-sm leading-7 text-[#4e5850]">{post.content}</p>

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
          <Heart className="h-4 w-4" />
          <span>{post.likesCount}</span>
        </div>

        <div className="inline-flex items-center gap-2">
          <Bookmark className="h-4 w-4" />
          <span>{post.favoritesCount}</span>
        </div>
      </div>
    </div>
  );

  const renderCommentCard = (comment: FeedComment) => (
    <div
      key={comment.id}
      className="rounded-[1.5rem] border border-[#e4dacb] bg-[#fcf8f1] p-5"
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <Link
            href={`/profil/${comment.author.id}`}
            className="font-semibold text-[#2f3a32] hover:underline"
          >
            {comment.author.username}
          </Link>
          <p className="text-sm text-[#7b847b]">{formatDate(comment.createdAt)}</p>
        </div>
      </div>

      <p className="text-sm leading-7 text-[#4e5850]">{comment.content}</p>

      {comment.media.length > 0 && (
        <div className="mt-4 overflow-hidden rounded-2xl border border-[#d8cfbe] bg-[#fffaf2]">
          <img
            src={comment.media[0]}
            alt="Comment media"
            className="max-h-[320px] w-full object-cover"
          />
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-5 text-sm text-[#6f786f]">
        <div className="inline-flex items-center gap-2">
          <Heart className="h-4 w-4" />
          <span>{comment.likesCount}</span>
        </div>

        <div className="inline-flex items-center gap-2">
          <Bookmark className="h-4 w-4" />
          <span>{comment.favoritesCount}</span>
        </div>
      </div>

      {comment.post && (
        <div className="mt-4 rounded-2xl border border-[#e3d9c8] bg-[#fffaf2] p-4">
          <p className="text-xs uppercase tracking-wide text-[#8a9288]">
            Sous le post de @{comment.post.author.username}
          </p>
          <p className="mt-2 text-sm leading-6 text-[#667066]">
            {comment.post.content || "Post sans contenu texte."}
          </p>
        </div>
      )}
    </div>
  );

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
                        Consulte l’activité publique de ce membre.
                      </p>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
                      <div className="rounded-[1.75rem] border border-[#e3d9c8] bg-[#fcf8f1] p-5">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-20 w-20 border border-[#d8cfbe]">
                            <AvatarImage src={profile.avatar || ""} alt={profile.username} />
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
                            <p className="text-sm font-medium text-[#6f8467]">Email</p>
                            <p className="mt-2 text-sm text-[#2f3a32]">
                              {profile.email || "Non renseigné"}
                            </p>
                          </div>

                          <div className="rounded-2xl border border-[#e3d9c8] bg-[#fffaf2] p-4">
                            <p className="text-sm font-medium text-[#6f8467]">Bio</p>
                            <p className="mt-2 text-sm text-[#2f3a32]">
                              {profile.bio || "Aucune bio pour le moment."}
                            </p>
                          </div>

                          <div className="grid grid-cols-3 gap-3">
                            <div className="rounded-2xl border border-[#e3d9c8] bg-[#fffaf2] p-4 text-center">
                              <p className="text-2xl font-bold text-[#2f3a32]">{posts.length}</p>
                              <p className="text-sm text-[#7b847b]">Posts</p>
                            </div>
                            <div className="rounded-2xl border border-[#e3d9c8] bg-[#fffaf2] p-4 text-center">
                              <p className="text-2xl font-bold text-[#2f3a32]">{friends.length}</p>
                              <p className="text-sm text-[#7b847b]">Amis</p>
                            </div>
                            <div className="rounded-2xl border border-[#e3d9c8] bg-[#fffaf2] p-4 text-center">
                              <p className="text-2xl font-bold text-[#2f3a32]">{comments.length}</p>
                              <p className="text-sm text-[#7b847b]">Comments</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-[1.75rem] border border-[#e3d9c8] bg-[#fcf8f1] p-5">
                        <div className="flex flex-wrap gap-3">
                          {(["posts", "friends", "comments", "likes", "favorites"] as const).map((tab) => (
                            <button
                              key={tab}
                              type="button"
                              onClick={() => setActiveTab(tab)}
                              className={`rounded-full px-4 py-2 text-sm font-medium capitalize ${
                                activeTab === tab
                                  ? "bg-[#4A6440] text-white"
                                  : "border border-[#d8e3d1] bg-[#F4F8F1] text-[#4e5a50]"
                              }`}
                            >
                              {tab === "comments" ? "Commentaires" : tab === "favorites" ? "Favoris" : tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </button>
                          ))}
                        </div>

                        <div className="mt-6 space-y-4">
                          {activeTab === "friends" && (
                            friends.length === 0 ? (
                              <div className="rounded-3xl border border-[#e4dacb] bg-[#faf5eb] p-6 text-sm text-[#6b746c]">
                                Aucun ami.
                              </div>
                            ) : (
                              <div className="grid gap-3 sm:grid-cols-2">
                                {friends.map((friend) => (
                                  <Link
                                    key={friend.id}
                                    href={`/profil/${friend.id}`}
                                    className="flex items-center gap-3 rounded-2xl border border-[#e3d9c8] bg-[#fcf8f1] p-4 transition hover:bg-[#eef3e8]"
                                  >
                                    <Avatar className="h-11 w-11 border border-[#d8cfbe]">
                                      <AvatarImage src={friend.avatar || ""} alt={friend.username} />
                                      <AvatarFallback className="bg-[#EAF1E6] text-[#4A6440]">
                                        {friend.username.slice(0, 2).toUpperCase()}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <p className="font-semibold text-[#2f3a32]">{friend.username}</p>
                                      <p className="text-sm text-[#7b847b]">@{friend.username.toLowerCase()}</p>
                                    </div>
                                  </Link>
                                ))}
                              </div>
                            )
                          )}

                          {activeTab === "posts" &&
                            (posts.length === 0 ? (
                              <div className="rounded-3xl border border-[#e4dacb] bg-[#faf5eb] p-6 text-sm text-[#6b746c]">
                                Aucun post.
                              </div>
                            ) : (
                              posts.map(renderPostCard)
                            ))}

                          {activeTab === "comments" &&
                            (comments.length === 0 ? (
                              <div className="rounded-3xl border border-[#e4dacb] bg-[#faf5eb] p-6 text-sm text-[#6b746c]">
                                Aucun commentaire.
                              </div>
                            ) : (
                              comments.map(renderCommentCard)
                            ))}

                          {activeTab === "likes" && (
                            <>
                              <h3 className="text-lg font-semibold text-[#2f3a32]">
                                Posts likés
                              </h3>
                              {likedPosts.length === 0 ? (
                                <div className="rounded-3xl border border-[#e4dacb] bg-[#faf5eb] p-6 text-sm text-[#6b746c]">
                                  Aucun post liké.
                                </div>
                              ) : (
                                likedPosts.map(renderPostCard)
                              )}

                              <h3 className="pt-4 text-lg font-semibold text-[#2f3a32]">
                                Commentaires likés
                              </h3>
                              {likedComments.length === 0 ? (
                                <div className="rounded-3xl border border-[#e4dacb] bg-[#faf5eb] p-6 text-sm text-[#6b746c]">
                                  Aucun commentaire liké.
                                </div>
                              ) : (
                                likedComments.map(renderCommentCard)
                              )}
                            </>
                          )}

                          {activeTab === "favorites" && (
                            <>
                              <h3 className="text-lg font-semibold text-[#2f3a32]">
                                Posts favoris
                              </h3>
                              {favoritePosts.length === 0 ? (
                                <div className="rounded-3xl border border-[#e4dacb] bg-[#faf5eb] p-6 text-sm text-[#6b746c]">
                                  Aucun post favori.
                                </div>
                              ) : (
                                favoritePosts.map(renderPostCard)
                              )}

                              <h3 className="pt-4 text-lg font-semibold text-[#2f3a32]">
                                Commentaires favoris
                              </h3>
                              {favoriteComments.length === 0 ? (
                                <div className="rounded-3xl border border-[#e4dacb] bg-[#faf5eb] p-6 text-sm text-[#6b746c]">
                                  Aucun commentaire favori.
                                </div>
                              ) : (
                                favoriteComments.map(renderCommentCard)
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </ProtectedRoute>
  );
}