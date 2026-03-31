"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Navbar from "@/components/layout/Navbar";
import { useAuth } from "@/context/AuthContext";
import {
  Heart,
  MessageCircle,
  Bookmark,
  MapPin,
  CalendarDays,
  Globe,
  Settings,
  Bell,
  Users,
  Pencil,
  Sparkles,
} from "lucide-react";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  media: string[];
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
  post: { id: number; content: string; author: { id: number; username: string } } | null;
};

type ProfileData = {
  id: number;
  username: string;
  email: string;
  avatar?: string | null;
  bio?: string | null;
  status?: string | null;
  location?: string | null;
  website?: string | null;
  createdAt: string;
};

type FriendItem = {
  id: number;
  username: string;
  avatar?: string | null;
};

function formatPostTime(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" });
}

function PostCard({ post }: { post: FeedPost }) {
  return (
    <Card className="rounded-3xl border-0 bg-white shadow-[0_16px_40px_rgba(74,100,64,0.12)] transition-all hover:shadow-[0_20px_50px_rgba(74,100,64,0.18)]">
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <Avatar className="h-12 w-12 border-2 border-[#d8e3d1]">
            <AvatarImage src={post.author.avatar || ""} alt={post.author.username} />
            <AvatarFallback className="bg-[#EAF1E6] font-semibold text-[#4A6440]">
              {post.author.username.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 text-sm text-[#73816b]">
              <p className="font-semibold text-[#33412c]">{post.author.username}</p>
              <span>•</span>
              <p>{formatPostTime(post.createdAt)}</p>
            </div>

            <p className="mt-3 text-sm leading-7 text-[#4d5847]">{post.content}</p>

            {post.media.length > 0 && (
              <img
                src={post.media[0]}
                alt="Post media"
                className="mt-3 max-h-64 w-full rounded-2xl object-cover"
              />
            )}

            <div className="mt-4 flex flex-wrap items-center gap-6 text-sm">
              <div className="inline-flex items-center gap-2 font-medium text-[#8AA678]">
                <Heart className="h-4 w-4" />
                <span>{post.likesCount}</span>
              </div>
              <div className="inline-flex items-center gap-2 font-medium text-[#7B9270]">
                <MessageCircle className="h-4 w-4" />
                <span>{post.commentsCount}</span>
              </div>
              <div className="inline-flex items-center gap-2 font-medium text-[#6B7C5D]">
                <Bookmark className="h-4 w-4" />
                <span>{post.favoritesCount}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function CommentCard({ comment }: { comment: FeedComment }) {
  return (
    <Card className="rounded-3xl border-0 bg-white shadow-[0_16px_40px_rgba(74,100,64,0.12)]">
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <Avatar className="h-10 w-10 border-2 border-[#d8e3d1]">
            <AvatarImage src={comment.author.avatar || ""} alt={comment.author.username} />
            <AvatarFallback className="bg-[#EAF1E6] font-semibold text-[#4A6440]">
              {comment.author.username.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 text-sm text-[#73816b]">
              <p className="font-semibold text-[#33412c]">{comment.author.username}</p>
              <span>•</span>
              <p>{formatPostTime(comment.createdAt)}</p>
            </div>

            {comment.post && (
              <p className="mt-2 truncate text-xs text-[#7B9270]">
                En réponse à : {comment.post.author.username} — "{comment.post.content.slice(0, 60)}..."
              </p>
            )}

            <p className="mt-2 text-sm leading-7 text-[#4d5847]">{comment.content}</p>

            <div className="mt-3 flex items-center gap-4 text-sm">
              <div className="inline-flex items-center gap-2 font-medium text-[#8AA678]">
                <Heart className="h-4 w-4" />
                <span>{comment.likesCount}</span>
              </div>
              <div className="inline-flex items-center gap-2 font-medium text-[#6B7C5D]">
                <Bookmark className="h-4 w-4" />
                <span>{comment.favoritesCount}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Profil() {
  const { user, token } = useAuth();

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [likedPosts, setLikedPosts] = useState<FeedPost[]>([]);
  const [favoritePosts, setFavoritePosts] = useState<FeedPost[]>([]);
  const [comments, setComments] = useState<FeedComment[]>([]);
  const [friends, setFriends] = useState<FriendItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token || !user?.id) return;

    const fetchAll = async () => {
      try {
        setLoading(true);
        setError("");

        const [profileRes, postsRes, likesRes, favoritesRes, commentsRes, friendsRes] =
          await Promise.all([
            fetch("http://localhost:3001/user", {
              headers: { Authorization: `Bearer ${token}` },
            }),
            fetch(`http://localhost:3001/users/${user.id}/posts`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
            fetch(`http://localhost:3001/users/${user.id}/likes`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
            fetch(`http://localhost:3001/users/${user.id}/favorites`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
            fetch(`http://localhost:3001/users/${user.id}/comments`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
            fetch("http://localhost:3001/friends", {
              headers: { Authorization: `Bearer ${token}` },
            }),
          ]);

        if (profileRes.ok) setProfile(await profileRes.json());
        if (postsRes.ok) setPosts(await postsRes.json());
        if (likesRes.ok) {
          const data = await likesRes.json();
          setLikedPosts(data.posts ?? []);
        }
        if (favoritesRes.ok) {
          const data = await favoritesRes.json();
          setFavoritePosts(data.posts ?? []);
        }
        if (commentsRes.ok) setComments(await commentsRes.json());
        if (friendsRes.ok) setFriends(await friendsRes.json());
      } catch (err) {
        console.error("Erreur chargement profil :", err);
        setError("Erreur lors du chargement du profil.");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [token, user?.id]);

  const joinedAt = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : null;

  return (
    <ProtectedRoute>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-br from-[#EAF1E6] via-[#dbe7d2] to-[#9CAF88] text-[#33412c]">
        <section className="relative px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm font-medium text-[#4A6440] shadow-md backdrop-blur">
                <Sparkles className="h-4 w-4" />
                Profile overview
              </div>

              <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-[#33412c]">
                Mon profil
              </h1>

              <p className="mt-3 max-w-2xl text-base leading-7 text-[#4f5d49]">
                Une vue plus douce, plus moderne et plus cohérente de ton espace personnel.
              </p>
            </div>

            {error && (
              <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {loading ? (
              <Card className="rounded-3xl border-0 bg-white/90 shadow-2xl">
                <CardContent className="p-6 text-sm text-[#5f6c59]">
                  Chargement du profil...
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 lg:grid-cols-12">
                <div className="space-y-6 lg:col-span-9">
                  {/* Profile header card */}
                  <Card className="overflow-hidden rounded-[2rem] border-0 bg-white/92 shadow-[0_18px_50px_rgba(74,100,64,0.15)] backdrop-blur">
                    <div className="h-44 bg-gradient-to-r from-[#a8c49a] via-[#c4d9b8] to-[#7B9270]" />

                    <CardContent className="p-0">
                      <div className="px-8 pb-8">
                        <div className="-mt-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                            <Avatar className="h-28 w-28 border-4 border-white shadow-lg">
                              <AvatarImage
                                src={profile?.avatar || ""}
                                alt="Avatar utilisateur"
                              />
                              <AvatarFallback className="bg-[#EAF1E6] text-[#4A6440]">
                                {(profile?.username || user?.username || "U").slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>

                            <div className="sm:pb-1">
                              <div className="flex flex-wrap items-center gap-3">
                                <h2 className="text-3xl font-bold text-[#33412c]">
                                  {profile?.username || user?.username || "Utilisateur"}
                                </h2>

                                {profile?.status && (
                                  <Badge className="rounded-full border-0 bg-[#C3D1B2] text-[#4A6440] hover:bg-[#C3D1B2]">
                                    {profile.status}
                                  </Badge>
                                )}
                              </div>

                              <p className="mt-1 text-sm text-[#70806a]">
                                @{(profile?.username || user?.username || "utilisateur").toLowerCase()}
                              </p>

                              <p className="mt-2 text-sm text-[#5e6c58]">
                                {profile?.email || user?.email || ""}
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-3">
                            <Button
                              asChild
                              className="rounded-2xl bg-[#8AA678] text-white hover:bg-[#79956a]"
                            >
                              <Link href="/settings/profile">
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit profile
                              </Link>
                            </Button>

                            <Button
                              asChild
                              variant="outline"
                              className="rounded-2xl border-[#d8e3d1] bg-[#F4F8F1] text-[#4A6440] hover:bg-[#e7f0e1]"
                            >
                              <Link href="/friends">
                                <Users className="mr-2 h-4 w-4" />
                                Friends
                              </Link>
                            </Button>
                          </div>
                        </div>

                        {profile?.bio && (
                          <p className="mt-5 max-w-4xl text-sm leading-7 text-[#4d5847]">
                            {profile.bio}
                          </p>
                        )}

                        <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-[#65745f]">
                          {profile?.location && (
                            <div className="inline-flex items-center gap-2 rounded-full bg-[#F4F8F1] px-3 py-2">
                              <MapPin className="h-4 w-4" />
                              <span>{profile.location}</span>
                            </div>
                          )}

                          {joinedAt && (
                            <div className="inline-flex items-center gap-2 rounded-full bg-[#F4F8F1] px-3 py-2">
                              <CalendarDays className="h-4 w-4" />
                              <span>Joined {joinedAt}</span>
                            </div>
                          )}

                          {profile?.website && (
                            <div className="inline-flex items-center gap-2 rounded-full bg-[#F4F8F1] px-3 py-2">
                              <Globe className="h-4 w-4" />
                              <span>{profile.website}</span>
                            </div>
                          )}
                        </div>

                        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
                          <div className="rounded-2xl bg-[#F4F8F1] p-4">
                            <p className="text-2xl font-bold text-[#33412c]">{posts.length}</p>
                            <p className="mt-1 text-sm text-[#7b847b]">Posts</p>
                          </div>

                          <div className="rounded-2xl bg-[#F4F8F1] p-4">
                            <p className="text-2xl font-bold text-[#33412c]">{friends.length}</p>
                            <p className="mt-1 text-sm text-[#7b847b]">Friends</p>
                          </div>

                          <div className="rounded-2xl bg-[#F4F8F1] p-4">
                            <p className="text-2xl font-bold text-[#33412c]">{likedPosts.length}</p>
                            <p className="mt-1 text-sm text-[#7b847b]">Likes</p>
                          </div>

                          <div className="rounded-2xl bg-[#F4F8F1] p-4">
                            <p className="text-2xl font-bold text-[#33412c]">{favoritePosts.length}</p>
                            <p className="mt-1 text-sm text-[#7b847b]">Favorites</p>
                          </div>

                          <div className="rounded-2xl bg-[#F4F8F1] p-4">
                            <p className="text-2xl font-bold text-[#33412c]">{comments.length}</p>
                            <p className="mt-1 text-sm text-[#7b847b]">Comments</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Tabs */}
                  <Card className="rounded-[2rem] border-0 bg-white/92 shadow-[0_18px_50px_rgba(74,100,64,0.15)] backdrop-blur">
                    <CardContent className="p-5 sm:p-6">
                      <Tabs defaultValue="posts" className="w-full">
                        <TabsList className="grid w-full grid-cols-5 rounded-2xl bg-[#F4F3E8] p-1">
                          <TabsTrigger
                            value="posts"
                            className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-[#33412c]"
                          >
                            Posts
                          </TabsTrigger>
                          <TabsTrigger
                            value="friends"
                            className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-[#33412c]"
                          >
                            Friends
                          </TabsTrigger>
                          <TabsTrigger
                            value="likes"
                            className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-[#33412c]"
                          >
                            Likes
                          </TabsTrigger>
                          <TabsTrigger
                            value="favorites"
                            className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-[#33412c]"
                          >
                            Favorites
                          </TabsTrigger>
                          <TabsTrigger
                            value="comments"
                            className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-[#33412c]"
                          >
                            Comments
                          </TabsTrigger>
                        </TabsList>

                        <TabsContent value="friends" className="mt-6">
                          {friends.length === 0 ? (
                            <p className="text-sm text-[#7d8b76]">Aucun ami pour le moment.</p>
                          ) : (
                            <div className="grid gap-4 sm:grid-cols-2">
                              {friends.map((friend) => (
                                <Link
                                  key={friend.id}
                                  href={`/profil/${friend.id}`}
                                  className="flex items-center gap-4 rounded-2xl bg-[#F4F8F1] p-4 transition hover:bg-[#e7f0e1]"
                                >
                                  <Avatar className="h-12 w-12 border-2 border-[#d8e3d1]">
                                    <AvatarImage src={friend.avatar || ""} alt={friend.username} />
                                    <AvatarFallback className="bg-[#EAF1E6] font-semibold text-[#4A6440]">
                                      {friend.username.slice(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="font-semibold text-[#33412c]">{friend.username}</p>
                                    <p className="text-sm text-[#7a8874]">@{friend.username.toLowerCase()}</p>
                                  </div>
                                </Link>
                              ))}
                            </div>
                          )}
                        </TabsContent>

                        <TabsContent value="posts" className="mt-6 space-y-4">
                          {posts.length === 0 ? (
                            <p className="text-sm text-[#7d8b76]">Aucun post pour le moment.</p>
                          ) : (
                            posts.map((post) => <PostCard key={post.id} post={post} />)
                          )}
                        </TabsContent>

                        <TabsContent value="likes" className="mt-6 space-y-4">
                          {likedPosts.length === 0 ? (
                            <p className="text-sm text-[#7d8b76]">Aucun like pour le moment.</p>
                          ) : (
                            likedPosts.map((post) => <PostCard key={post.id} post={post} />)
                          )}
                        </TabsContent>

                        <TabsContent value="favorites" className="mt-6 space-y-4">
                          {favoritePosts.length === 0 ? (
                            <p className="text-sm text-[#7d8b76]">Aucun favori pour le moment.</p>
                          ) : (
                            favoritePosts.map((post) => <PostCard key={post.id} post={post} />)
                          )}
                        </TabsContent>

                        <TabsContent value="comments" className="mt-6 space-y-4">
                          {comments.length === 0 ? (
                            <p className="text-sm text-[#7d8b76]">Aucun commentaire pour le moment.</p>
                          ) : (
                            comments.map((comment) => <CommentCard key={comment.id} comment={comment} />)
                          )}
                        </TabsContent>
                      </Tabs>
                    </CardContent>
                  </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6 lg:col-span-3">
                  <div className="lg:sticky lg:top-24">
                    <Card className="rounded-[2rem] border-0 bg-white/92 shadow-[0_18px_50px_rgba(74,100,64,0.15)] backdrop-blur">
                      <CardContent className="p-6">
                        <div className="mb-5 flex items-center gap-2 text-[#4A6440]">
                          <Settings className="h-5 w-5" />
                          <h2 className="text-lg font-semibold">Quick Actions</h2>
                        </div>

                        <div className="space-y-3">
                          <Button
                            asChild
                            variant="outline"
                            className="w-full justify-start rounded-2xl border-[#d8e3d1] bg-[#F4F8F1] text-[#4A6440] hover:bg-[#e7f0e1]"
                          >
                            <Link href="/settings/profile">
                              <Settings className="mr-2 h-4 w-4" />
                              Open settings
                            </Link>
                          </Button>

                          <Button
                            variant="outline"
                            className="w-full justify-start rounded-2xl border-[#d8e3d1] bg-[#F4F8F1] text-[#4A6440] hover:bg-[#e7f0e1]"
                          >
                            <Bell className="mr-2 h-4 w-4" />
                            Notifications
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
    </ProtectedRoute>
  );
}
