"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
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
  Activity,
  History,
} from "lucide-react";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

type FeedPost = {
  id: number;
  author: string;
  handle: string;
  time: string;
  content: string;
  likes: number;
  comments: number;
  reposts: number;
  favorites: number;
};

const profileExtras = {
  bio: "Étudiant en informatique, passionné par le développement web, la cybersécurité et les interfaces modernes.",
  status: "Online",
  avatar:
    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=400&auto=format&fit=crop",
  location: "France",
  joinedAt: "March 2026",
  website: "portfolio.dev",
  activity: [
    "Updated profile picture",
    "Accepted a friend request",
    "Changed account settings",
  ],
  history: [
    "Connected 2 hours ago",
    "Last message sent yesterday",
    "Profile created in March 2026",
  ],
  posts: [
    {
      id: 1,
      author: "Nabil",
      handle: "@nabil.dev",
      time: "2h",
      content:
        "Je travaille sur une interface plus propre et plus calme, inspirée d’un mélange entre Twitter et un blog éditorial. L’objectif : garder la lisibilité sans perdre l’aspect social.",
      likes: 28,
      comments: 6,
      reposts: 3,
      favorites: 12,
    },
    {
      id: 2,
      author: "Nabil",
      handle: "@nabil.dev",
      time: "5h",
      content:
        "J’aime les interfaces qui respirent : plus d’espace, des couleurs naturelles, et une hiérarchie visuelle simple. Ça change complètement la perception du produit.",
      likes: 41,
      comments: 9,
      reposts: 5,
      favorites: 18,
    },
    {
      id: 3,
      author: "Nabil",
      handle: "@nabil.dev",
      time: "1d",
      content:
        "Petit focus du jour : quand on garde la logique intacte et qu’on refait seulement la DA, on voit très vite si l’UX devient plus cohérente.",
      likes: 19,
      comments: 4,
      reposts: 2,
      favorites: 10,
    },
  ] as FeedPost[],
  likedPosts: [
    {
      id: 4,
      author: "Amine",
      handle: "@amine.ui",
      time: "3h",
      content:
        "Une bonne interface sociale ne doit pas seulement être belle, elle doit aussi guider naturellement le regard.",
      likes: 52,
      comments: 11,
      reposts: 7,
      favorites: 23,
    },
  ] as FeedPost[],
  favoritePosts: [
    {
      id: 5,
      author: "Sara",
      handle: "@sara.codes",
      time: "8h",
      content:
        "Les palettes vert sauge et beige donnent souvent une sensation plus premium que les contrastes trop agressifs.",
      likes: 63,
      comments: 14,
      reposts: 8,
      favorites: 31,
    },
  ] as FeedPost[],
  commentedPosts: [
    {
      id: 6,
      author: "Yassir",
      handle: "@yassir.dev",
      time: "1d",
      content:
        "Refaire une page profil en gardant la logique existante, c’est un très bon exercice pour séparer UI et métier.",
      likes: 34,
      comments: 12,
      reposts: 4,
      favorites: 15,
    },
  ] as FeedPost[],
};

function PostCard({ post }: { post: FeedPost }) {
  return (
    <Card className="rounded-3xl border-0 bg-white shadow-[0_16px_40px_rgba(74,100,64,0.12)] transition-all hover:shadow-[0_20px_50px_rgba(74,100,64,0.18)]">
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <Avatar className="h-14 w-14 border border-[#d8e3d1]">
            <AvatarImage src="" alt={post.author} />
            <AvatarFallback className="bg-[#EAF1E6] font-semibold text-[#4A6440]">
              {post.author.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 text-sm text-[#73816b]">
              <p className="font-semibold text-[#33412c]">{post.author}</p>
              <p>{post.handle}</p>
              <span>•</span>
              <p>{post.time}</p>
            </div>

            <p className="mt-3 text-sm leading-7 text-[#4d5847]">
              {post.content}
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-6 text-sm">
              <div className="inline-flex items-center gap-2 font-medium text-[#8AA678]">
                <Heart className="h-4 w-4" />
                <span>{post.likes}</span>
              </div>

              <div className="inline-flex items-center gap-2 font-medium text-[#7B9270]">
                <MessageCircle className="h-4 w-4" />
                <span>{post.comments}</span>
              </div>

              <div className="inline-flex items-center gap-2 font-medium text-[#6B7C5D]">
                <Bookmark className="h-4 w-4" />
                <span>{post.favorites}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Profil() {
  const { user } = useAuth();

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-gradient-to-br from-[#EAF1E6] via-[#dbe7d2] to-[#9CAF88] text-gray-800">
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

            <div className="grid gap-6 lg:grid-cols-12">
              <div className="space-y-6 lg:col-span-9">
                <Card className="overflow-hidden rounded-[2rem] border-0 bg-white/92 shadow-[0_18px_50px_rgba(74,100,64,0.15)] backdrop-blur">
                  <div className="h-44 bg-gradient-to-r from-[#b7c7aa] via-[#d8cfb8] to-[#8ca27d]" />

                  <CardContent className="p-0">
                    <div className="px-8 pb-8">
                      <div className="-mt-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                          <Avatar className="h-28 w-28 border-4 border-white shadow-lg">
                            <AvatarImage
                              src={profileExtras.avatar}
                              alt="Avatar utilisateur"
                            />
                            <AvatarFallback className="bg-[#EAF1E6] text-[#4A6440]">
                              {(user?.username || "U").slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>

                          <div className="sm:pb-1">
                            <div className="flex flex-wrap items-center gap-3">
                              <h2 className="text-3xl font-bold text-[#33412c]">
                                {user?.username || "Utilisateur"}
                              </h2>

                              <Badge className="rounded-full border-0 bg-[#C3D1B2] text-[#4A6440] hover:bg-[#C3D1B2]">
                                {profileExtras.status}
                              </Badge>
                            </div>

                            <p className="mt-1 text-sm text-[#70806a]">
                              @{(user?.username || "utilisateur").toLowerCase()}
                            </p>

                            <p className="mt-2 text-sm text-[#5e6c58]">
                              {user?.email || "email@example.com"}
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
                              Add friend
                            </Link>
                          </Button>
                        </div>
                      </div>

                      <p className="mt-5 max-w-4xl text-sm leading-7 text-[#4d5847]">
                        {profileExtras.bio}
                      </p>

                      <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-[#65745f]">
                        <div className="inline-flex items-center gap-2 rounded-full bg-[#F4F8F1] px-3 py-2">
                          <MapPin className="h-4 w-4" />
                          <span>{profileExtras.location}</span>
                        </div>

                        <div className="inline-flex items-center gap-2 rounded-full bg-[#F4F8F1] px-3 py-2">
                          <CalendarDays className="h-4 w-4" />
                          <span>Joined {profileExtras.joinedAt}</span>
                        </div>

                        <div className="inline-flex items-center gap-2 rounded-full bg-[#F4F8F1] px-3 py-2">
                          <Globe className="h-4 w-4" />
                          <span>{profileExtras.website}</span>
                        </div>
                      </div>

                      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
                        <div className="rounded-2xl bg-[#F4F8F1] p-4">
                          <p className="text-2xl font-bold text-[#33412c]">34</p>
                          <p className="mt-1 text-sm text-[#7b847b]">Posts</p>
                        </div>

                        <div className="rounded-2xl bg-[#F4F8F1] p-4">
                          <p className="text-2xl font-bold text-[#33412c]">128</p>
                          <p className="mt-1 text-sm text-[#7b847b]">Following</p>
                        </div>

                        <div className="rounded-2xl bg-[#F4F8F1] p-4">
                          <p className="text-2xl font-bold text-[#33412c]">86</p>
                          <p className="mt-1 text-sm text-[#7b847b]">Followers</p>
                        </div>

                        <div className="rounded-2xl bg-[#F4F8F1] p-4">
                          <p className="text-2xl font-bold text-[#33412c]">47</p>
                          <p className="mt-1 text-sm text-[#7b847b]">Favorites</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-[2rem] border-0 bg-white/92 shadow-[0_18px_50px_rgba(74,100,64,0.15)] backdrop-blur">
                  <CardContent className="p-5 sm:p-6">
                    <Tabs defaultValue="posts" className="w-full">
                      <TabsList className="grid w-full grid-cols-4 rounded-2xl bg-[#F4F3E8] p-1">
                        <TabsTrigger
                          value="posts"
                          className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-[#33412c]"
                        >
                          Posts
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

                      <TabsContent value="posts" className="mt-6 space-y-4">
                        {profileExtras.posts.map((post) => (
                          <PostCard key={post.id} post={post} />
                        ))}
                      </TabsContent>

                      <TabsContent value="likes" className="mt-6 space-y-4">
                        {profileExtras.likedPosts.map((post) => (
                          <PostCard key={post.id} post={post} />
                        ))}
                      </TabsContent>

                      <TabsContent value="favorites" className="mt-6 space-y-4">
                        {profileExtras.favoritePosts.map((post) => (
                          <PostCard key={post.id} post={post} />
                        ))}
                      </TabsContent>

                      <TabsContent value="comments" className="mt-6 space-y-4">
                        {profileExtras.commentedPosts.map((post) => (
                          <PostCard key={post.id} post={post} />
                        ))}
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </div>

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
                          Manage notifications
                        </Button>
                      </div>
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