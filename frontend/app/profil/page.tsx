"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import {
  Heart,
  MessageCircle,
  Bookmark,
  Repeat2,
  MapPin,
  CalendarDays,
  Globe,
  Settings,
  Bell,
  Users,
  Pencil,
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
import { Separator } from "@/components/ui/separator";

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
    <Card className="overflow-hidden rounded-[1.75rem] border-[#ddd3c2] bg-[#fffaf2]/95 shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <Avatar className="h-11 w-11 border border-[#d8cfbe]">
            <AvatarFallback className="bg-[#eef3e8] text-[#6f8467]">
              {post.author.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <p className="font-semibold text-[#2f3a32]">{post.author}</p>
              <p className="text-sm text-[#7b847b]">{post.handle}</p>
              <span className="text-sm text-[#a0a79f]">·</span>
              <p className="text-sm text-[#7b847b]">{post.time}</p>
            </div>

            <p className="mt-3 text-sm leading-7 text-[#4e5850]">
              {post.content}
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-5 text-sm text-[#6f786f]">
              <div className="inline-flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                <span>{post.comments}</span>
              </div>

              <div className="inline-flex items-center gap-2">
                <Repeat2 className="h-4 w-4" />
                <span>{post.reposts}</span>
              </div>

              <div className="inline-flex items-center gap-2">
                <Heart className="h-4 w-4" />
                <span>{post.likes}</span>
              </div>

              <div className="inline-flex items-center gap-2">
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
  const { user, token } = useAuth();

  return (
    <ProtectedRoute>``  ` `
      <main className="min-h-screen bg-[#f6f1e8] text-[#2f3a32]">
        <section className="relative overflow-hidden px-4 py-6 sm:px-6 lg:px-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(125,148,112,0.16),transparent_26%),radial-gradient(circle_at_bottom_right,rgba(216,207,184,0.32),transparent_30%)]" />

          <div className="relative mx-auto max-w-[1500px]">
            <div className="grid gap-6 lg:grid-cols-12">
              {/* Center column */}
              <div className="space-y-6 lg:col-span-9">
                {/* Cover + profile header */}
                <Card className="overflow-hidden rounded-[2rem] border-[#ddd3c2] bg-[#fffaf2]/95 shadow-sm">
                  <div className="h-44 bg-gradient-to-r from-[#b7c7aa] via-[#d8cfb8] to-[#8ca27d]" />

                  <CardContent className="p-0">
                    <div className="px-8 pb-8">
                      <div className="-mt-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                          <Avatar className="h-28 w-28 border-4 border-[#fffaf2] shadow-md">
                            <AvatarImage
                              src={profileExtras.avatar}
                              alt="Avatar utilisateur"
                            />
                            <AvatarFallback>
                              {(user?.username || "U").slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>

                          <div className="sm:pb-1">
                            <div className="flex flex-wrap items-center gap-3">
                              <h1 className="text-2xl font-bold text-[#2f3a32] sm:text-3xl">
                                {user?.username || "Utilisateur"}
                              </h1>

                              <Badge className="rounded-full border-[#b7c9ae] bg-[#edf4e8] text-[#5f7358] hover:bg-[#edf4e8]">
                                {profileExtras.status}
                              </Badge>
                            </div>

                            <p className="mt-1 text-sm text-[#7b847b]">
                              @{(user?.username || "utilisateur").toLowerCase()}
                            </p>
                            <p className="mt-2 text-sm text-[#6b746c]">
                              {user?.email || "email@example.com"}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-3">
                          <Button asChild className="rounded-full bg-[#6f8467] text-white hover:bg-[#5f7358]">
                            <Link href="/settings/profile">
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit profile
                            </Link>
                        </Button>

                          <Button
                            variant="outline"
                            className="rounded-full border-[#d8cfbe] bg-[#fffaf2]"
                          >
                            <Users className="mr-2 h-4 w-4" />
                            Add friend
                          </Button>
                        </div>
                      </div>

                      <p className="mt-5 max-w-4xl text-sm leading-7 text-[#4e5850]">
                        {profileExtras.bio}
                      </p>

                      <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-[#6f786f]">
                        <div className="inline-flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <span>{profileExtras.location}</span>
                        </div>

                        <div className="inline-flex items-center gap-2">
                          <CalendarDays className="h-4 w-4" />
                          <span>Joined {profileExtras.joinedAt}</span>
                        </div>

                        <div className="inline-flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          <span>{profileExtras.website}</span>
                        </div>
                      </div>

                      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
                        <div className="rounded-2xl border border-[#e3d9c8] bg-[#fcf8f1] p-4">
                          <p className="text-2xl font-bold text-[#2f3a32]">34</p>
                          <p className="text-sm text-[#7b847b]">Posts</p>
                        </div>
                        <div className="rounded-2xl border border-[#e3d9c8] bg-[#fcf8f1] p-4">
                          <p className="text-2xl font-bold text-[#2f3a32]">128</p>
                          <p className="text-sm text-[#7b847b]">Following</p>
                        </div>
                        <div className="rounded-2xl border border-[#e3d9c8] bg-[#fcf8f1] p-4">
                          <p className="text-2xl font-bold text-[#2f3a32]">86</p>
                          <p className="text-sm text-[#7b847b]">Followers</p>
                        </div>
                        <div className="rounded-2xl border border-[#e3d9c8] bg-[#fcf8f1] p-4">
                          <p className="text-2xl font-bold text-[#2f3a32]">47</p>
                          <p className="text-sm text-[#7b847b]">Favorites</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Feed */}
                <Card className="rounded-[2rem] border-[#ddd3c2] bg-[#fffaf2]/95 shadow-sm">
                  <CardContent className="p-5 sm:p-6">
                    <Tabs defaultValue="posts" className="w-full">
                      <TabsList className="grid w-full grid-cols-4 rounded-2xl bg-[#f3ecdf] p-1">
                        <TabsTrigger
                          value="posts"
                          className="rounded-xl data-[state=active]:bg-[#fffaf2] data-[state=active]:text-[#2f3a32]"
                        >
                          Posts
                        </TabsTrigger>
                        <TabsTrigger
                          value="likes"
                          className="rounded-xl data-[state=active]:bg-[#fffaf2] data-[state=active]:text-[#2f3a32]"
                        >
                          Likes
                        </TabsTrigger>
                        <TabsTrigger
                          value="favorites"
                          className="rounded-xl data-[state=active]:bg-[#fffaf2] data-[state=active]:text-[#2f3a32]"
                        >
                          Favorites
                        </TabsTrigger>
                        <TabsTrigger
                          value="comments"
                          className="rounded-xl data-[state=active]:bg-[#fffaf2] data-[state=active]:text-[#2f3a32]"
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

              {/* Right sidebar */}
              <div className="space-y-6 lg:col-span-3">
                <Card className="rounded-[2rem] border-[#ddd3c2] bg-[#fffaf2]/95 shadow-sm lg:sticky lg:top-6">
                  <CardContent className="p-6">
                    <h2 className="mb-4 text-lg font-semibold text-[#2f3a32]">
                      Quick Actions
                    </h2>

                    <div className="space-y-3">
                      <Button
                        asChild
                        variant="outline"
                        className="w-full justify-start rounded-2xl border-[#d8cfbe] bg-[#faf5eb]"
                      >
                        <Link href="/settings/profile">
                          <Settings className="mr-2 h-4 w-4" />
                          Open settings
                        </Link>
                      </Button>

                      <Button
                        variant="outline"
                        className="w-full justify-start rounded-2xl border-[#d8cfbe] bg-[#faf5eb]"
                      >
                        <Bell className="mr-2 h-4 w-4" />
                        Manage notifications
                      </Button>
                    </div>

                    <Separator className="my-5 bg-[#e5dccd]" />

                    <div className="space-y-3">
                      {profileExtras.activity.map((item, index) => (
                        <div key={index} className="text-sm text-[#667066]">
                          • {item}
                        </div>
                      ))}
                    </div>

                    <Separator className="my-5 bg-[#e5dccd]" />

                    <div className="space-y-3">
                      {profileExtras.history.map((item, index) => (
                        <div key={index} className="text-sm text-[#7b847b]">
                          {item}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>
    </ProtectedRoute>
  );
}