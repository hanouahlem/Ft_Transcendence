"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { Heart, MessageCircle, Repeat2, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Friend = { name: string; status: string };
type FeedPost = { id: number; author: string; handle: string; time: string; content: string; likes: number; comments: number; reposts: number };

const profileExtras = {
  bio: "Étudiant en informatique, passionné par le développement web, la cybersécurité et les interfaces modernes.",
  status: "Online",
  avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=400&auto=format&fit=crop",
  preferences: {
    theme: "Sage Green",
    language: "Français",
    notifications: "Enabled",
  },
  friends: [
    { name: "Amine", status: "Online" },
    { name: "Yassir", status: "Offline" },
    { name: "Sami", status: "Online" },
    { name: "Ikram", status: "Offline" },
  ] as Friend[],
  notifications: [
    "Friend request accepted by Amine",
    "New message from Yassir",
    "Your profile was updated successfully",
  ],
  posts: [
    { id: 1, author: "Nabil", handle: "@nabil.dev", time: "2h", content: "Je travaille sur une interface plus propre et plus calme...", likes: 28, comments: 6, reposts: 3 },
    { id: 2, author: "Nabil", handle: "@nabil.dev", time: "5h", content: "J’aime les interfaces qui respirent : plus d’espace...", likes: 41, comments: 9, reposts: 5 },
    { id: 3, author: "Nabil", handle: "@nabil.dev", time: "1d", content: "Petit focus du jour : quand on garde la logique intacte...", likes: 19, comments: 4, reposts: 2 },
  ] as FeedPost[],
  likedPosts: [
    { id: 4, author: "Amine", handle: "@amine.ui", time: "3h", content: "Une bonne interface sociale ne doit pas seulement être belle...", likes: 52, comments: 11, reposts: 7 },
  ] as FeedPost[],
  commentedPosts: [
    { id: 6, author: "Yassir", handle: "@yassir.dev", time: "1d", content: "Refaire une page profil en gardant la logique existante...", likes: 34, comments: 12, reposts: 4 },
  ] as FeedPost[],
};

// --- Post Card ---
function PostCard({ post }: { post: FeedPost }) {
  return (
    <Card className="rounded-3xl bg-white shadow-md hover:shadow-xl transition-all overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <Avatar className="h-14 w-14 border border-gray-200">
            <AvatarFallback>{post.author.slice(0,2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
              <p className="font-semibold text-gray-800">{post.author}</p>
              <p>{post.handle}</p>
              <span>· {post.time}</span>
            </div>
            <p className="mt-2 text-sm text-gray-700">{post.content}</p>
            <div className="mt-3 flex gap-6">
              <button className="flex items-center gap-2 text-[#9CAF88] hover:scale-105 transition-transform">
                <Heart className="h-5 w-5" /> {post.likes}
              </button>
              <button className="flex items-center gap-2 text-[#8AA678] hover:scale-105 transition-transform">
                <MessageCircle className="h-5 w-5" /> {post.comments}
              </button>
              <button className="flex items-center gap-2 text-gray-500 hover:scale-105 transition-transform">
                <Repeat2 className="h-5 w-5" /> {post.reposts}
              </button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// --- Profile Page ---
export default function Profil() {
  const { user } = useAuth();

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-gradient-to-br from-[#EAF1E6] to-[#9CAF88] text-gray-800">
        <section className="px-4 py-6 sm:px-6 lg:px-8 relative">
          <div className="mx-auto max-w-7xl grid gap-6 lg:grid-cols-12">

            {/* Center Block: Profile Info + Posts */}
            <div className="space-y-6 lg:col-span-9">
              <Card className="rounded-3xl bg-white shadow-lg overflow-hidden">
                <CardContent className="p-6">

                  {/* Quick Actions Top Right */}
                  <div className="flex justify-end mb-4">
                    <Button className="rounded-2xl bg-[#C3D1B2] text-[#4A6440] hover:bg-[#D0E0C2] transition">
                      <Settings className="mr-2 h-4 w-4"/>Settings
                    </Button>
                  </div>

                  {/* Profile Header */}
                  <div className="flex items-end gap-6 mb-4">
                    <Avatar className="h-28 w-28 border-4 border-white shadow-lg">
                      <AvatarImage src={profileExtras.avatar} />
                      <AvatarFallback>{(user?.username || "U").slice(0,2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h1 className="text-3xl font-bold">{user?.username || "Utilisateur"}</h1>
                      <Badge className="rounded-full bg-[#C3D1B2] text-[#4A6440]">{profileExtras.status}</Badge>
                      <p className="text-sm text-gray-500 mt-1">@{(user?.username||"utilisateur").toLowerCase()}</p>
                      <p className="text-sm text-gray-600 mt-2">{profileExtras.bio}</p>
                    </div>
                  </div>

                  {/* Preferences */}
                  <Card className="rounded-2xl bg-[#F4F3E8] p-4 mb-6">
                    <h2 className="font-semibold text-gray-800 mb-2">Preferences</h2>
                    <div className="grid grid-cols-3 gap-4 text-sm text-gray-700">
                      <div>
                        <p className="text-xs uppercase text-gray-400">Theme</p>
                        <p>{profileExtras.preferences.theme}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase text-gray-400">Language</p>
                        <p>{profileExtras.preferences.language}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase text-gray-400">Notifications</p>
                        <p>{profileExtras.preferences.notifications}</p>
                      </div>
                    </div>
                  </Card>

                  {/* Tabs for posts */}
                  <Card className="rounded-3xl bg-white shadow-lg">
                    <CardContent className="p-5">
                      <Tabs defaultValue="posts">
                        <TabsList className="grid grid-cols-3 bg-[#F4F3E8] rounded-xl p-1">
                          <TabsTrigger value="posts" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-gray-800">Posts</TabsTrigger>
                          <TabsTrigger value="likes" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-gray-800">Likes</TabsTrigger>
                          <TabsTrigger value="comments" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-gray-800">Comments</TabsTrigger>
                        </TabsList>

                        <TabsContent value="posts" className="mt-4 space-y-4">{profileExtras.posts.map(post=><PostCard key={post.id} post={post}/>)}</TabsContent>
                        <TabsContent value="likes" className="mt-4 space-y-4">{profileExtras.likedPosts.map(post=><PostCard key={post.id} post={post}/>)}</TabsContent>
                        <TabsContent value="comments" className="mt-4 space-y-4">{profileExtras.commentedPosts.map(post=><PostCard key={post.id} post={post}/>)}</TabsContent>
                      </Tabs>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            </div>

            {/* Right Sidebar: Friends + Notifications */}
            <div className="space-y-6 lg:col-span-3 sticky top-6">
              {/* Friends */}
              <Card className="rounded-3xl bg-white shadow-lg">
                <CardContent className="p-6 space-y-4">
                  <h2 className="font-semibold text-gray-800 text-lg">Friends</h2>
                  {profileExtras.friends.map((friend,i)=>(
                    <Button key={i} className="w-full justify-between bg-[#F4F3E8] p-4 rounded-2xl hover:bg-[#E0E3D5] transition text-gray-800">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12 border border-gray-200">
                          <AvatarFallback>{friend.name.slice(0,2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <p className="text-base font-medium">{friend.name}</p>
                      </div>
                      <span className={`text-sm font-semibold ${friend.status==="Online"?"text-[#4A6440]":"text-gray-400"}`}>{friend.status}</span>
                    </Button>
                  ))}
                </CardContent>
              </Card>

              {/* Notifications */}
              <Card className="rounded-3xl bg-white shadow-lg">
                <CardContent className="p-6 space-y-3">
                  <h2 className="font-semibold text-gray-800 text-lg">Notifications</h2>
                  {profileExtras.notifications.map((notif,i)=>
                    <div key={i} className="bg-[#F4F3E8] rounded-2xl p-3 text-sm text-gray-800">{notif}</div>
                  )}
                </CardContent>
              </Card>
            </div>

          </div>
        </section>
      </main>
    </ProtectedRoute>
  );
}