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
  Mail,
  Leaf,
} from "lucide-react";

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

type Friend = {
  name: string;
  status: string;
};

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
  preferences: {
    theme: "Soft Sage",
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
  ] as Friend[],
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
  const { user } = useAuth();

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-[#f6f1e8] text-[#2f3a32]">
        <section className="relative overflow-hidden px-4 py-6 sm:px-6 lg:px-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(125,148,112,0.16),transparent_26%),radial-gradient(circle_at_bottom_right,rgba(216,207,184,0.32),transparent_30%)]" />
          <div className="relative mx-auto max-w-7xl">
            <div className="grid gap-6 lg:grid-cols-12">
              {/* Left sidebar */}
              <div className="space-y-6 lg:col-span-3">
                <Card className="rounded-[2rem] border-[#ddd3c2] bg-[#fffaf2]/95 shadow-sm">
                  <CardContent className="p-6">
                    <div className="mb-4 flex items-center gap-2">
                      <Leaf className="h-4 w-4 text-[#6f8467]" />
                      <p className="text-sm font-semibold text-[#6f8467]">
                        Personal Info
                      </p>
                    </div>

                    <div className="space-y-4 text-sm">
                      <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-[#8f968d]">
                          Username
                        </p>
                        <p className="mt-1 text-[#2f3a32]">
                          {user?.username || "Utilisateur"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-[#8f968d]">
                          Email
                        </p>
                        <p className="mt-1 text-[#2f3a32]">
                          {user?.email || "email@example.com"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-[#8f968d]">
                          Location
                        </p>
                        <p className="mt-1 text-[#2f3a32]">{profileExtras.location}</p>
                      </div>

                      <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-[#8f968d]">
                          Joined
                        </p>
                        <p className="mt-1 text-[#2f3a32]">{profileExtras.joinedAt}</p>
                      </div>

                      <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-[#8f968d]">
                          Website
                        </p>
                        <p className="mt-1 text-[#6f8467]">{profileExtras.website}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-[2rem] border-[#ddd3c2] bg-[#fffaf2]/95 shadow-sm">
                  <CardContent className="p-6">
                    <h2 className="mb-4 text-lg font-semibold text-[#2f3a32]">
                      Preferences
                    </h2>

                    <div className="space-y-4 text-sm">
                      <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-[#8f968d]">
                          Theme
                        </p>
                        <p className="mt-1">{profileExtras.preferences.theme}</p>
                      </div>

                      <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-[#8f968d]">
                          Language
                        </p>
                        <p className="mt-1">{profileExtras.preferences.language}</p>
                      </div>

                      <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-[#8f968d]">
                          Notifications
                        </p>
                        <p className="mt-1 text-[#6f8467]">
                          {profileExtras.preferences.notifications}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-[2rem] border-[#ddd3c2] bg-[#eef3e8]/90 shadow-sm">
                  <CardContent className="p-6">
                    <p className="text-xs uppercase tracking-[0.18em] text-[#6f8467]">
                      Profile summary
                    </p>
                    <h3 className="mt-2 text-xl font-bold text-[#2f3a32]">
                      Active community member
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-[#617061]">
                      This profile is active, connected with friends, and regularly
                      interacting through posts, comments, and reactions.
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Center column */}
              <div className="space-y-6 lg:col-span-6">
                {/* Cover + profile header */}
                <Card className="overflow-hidden rounded-[2rem] border-[#ddd3c2] bg-[#fffaf2]/95 shadow-sm">
                  <div className="h-40 bg-gradient-to-r from-[#b7c7aa] via-[#d8cfb8] to-[#8ca27d]" />

                  <CardContent className="p-0">
                    <div className="px-6 pb-6">
                      <div className="-mt-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                          <Avatar className="h-24 w-24 border-4 border-[#fffaf2] shadow-md">
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
                          <Button className="rounded-full bg-[#6f8467] text-white hover:bg-[#5f7358]">
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit profile
                          </Button>
                          <Button
                            variant="outline"
                            className="rounded-full border-[#d8cfbe] bg-[#fffaf2]"
                          >
                            <Mail className="mr-2 h-4 w-4" />
                            Send message
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

                      <p className="mt-5 max-w-3xl text-sm leading-7 text-[#4e5850]">
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

                      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
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

                {/* Twitter-like feed */}
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
                <Card className="rounded-[2rem] border-[#ddd3c2] bg-[#fffaf2]/95 shadow-sm">
                  <CardContent className="p-6">
                    <div className="mb-4 flex items-center justify-between">
                      <h2 className="text-lg font-semibold text-[#2f3a32]">
                        Friends
                      </h2>
                      <Button
                        variant="ghost"
                        className="h-auto p-0 text-[#6f8467] hover:bg-transparent hover:text-[#5f7358]"
                      >
                        See all
                      </Button>
                    </div>

                    <div className="space-y-3">
                      {profileExtras.friends.map((friend, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between rounded-2xl border border-[#e3d9c8] bg-[#fcf8f1] p-3"
                        >
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 border border-[#d8cfbe]">
                              <AvatarFallback className="bg-[#eef3e8] text-[#6f8467]">
                                {friend.name.slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium text-[#2f3a32]">
                                {friend.name}
                              </p>
                              <p className="text-xs text-[#7b847b]">Friend</p>
                            </div>
                          </div>

                          <span
                            className={`text-xs font-semibold ${
                              friend.status === "Online"
                                ? "text-[#6f8467]"
                                : "text-[#9aa19a]"
                            }`}
                          >
                            {friend.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-[2rem] border-[#ddd3c2] bg-[#fffaf2]/95 shadow-sm">
                  <CardContent className="p-6">
                    <h2 className="mb-4 text-lg font-semibold text-[#2f3a32]">
                      Notifications
                    </h2>

                    <div className="space-y-3">
                      {profileExtras.notifications.map((item, index) => (
                        <div
                          key={index}
                          className="rounded-2xl border border-[#e3d9c8] bg-[#fcf8f1] px-4 py-3 text-sm text-[#576358]"
                        >
                          {item}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-[2rem] border-[#ddd3c2] bg-[#fffaf2]/95 shadow-sm">
                  <CardContent className="p-6">
                    <h2 className="mb-4 text-lg font-semibold text-[#2f3a32]">
                      Quick Actions
                    </h2>

                    <div className="space-y-3">
                      <Button
                        variant="outline"
                        className="w-full justify-start rounded-2xl border-[#d8cfbe] bg-[#faf5eb]"
                      >
                        <Settings className="mr-2 h-4 w-4" />
                        Open settings
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-start rounded-2xl border-[#d8cfbe] bg-[#faf5eb]"
                      >
                        <Mail className="mr-2 h-4 w-4" />
                        View conversations
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