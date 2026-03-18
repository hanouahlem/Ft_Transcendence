"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  Heart,
  MessageCircle,
  Bell,
  User,
  LogOut,
  Plus,
  Users,
  Check,
  Trash
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function HomePage() {
  const username = "ybenzeggagh";
  const [openNotif, setOpenNotif] = useState(false);
  const [postLikes, setPostLikes] = useState<number[]>([]);
  const [postComments, setPostComments] = useState<number[]>([]);

  useEffect(() => {
    setPostLikes([
      Math.floor(Math.random() * 200),
      Math.floor(Math.random() * 200),
      Math.floor(Math.random() * 200)
    ]);
    setPostComments([
      Math.floor(Math.random() * 50),
      Math.floor(Math.random() * 50),
      Math.floor(Math.random() * 50)
    ]);
  }, []);

  const handleLogout = () => {
    if (confirm("Are you sure you want to logout?")) {
      console.log("logout");
    }
  };

  const commentsData = [
    [{ user: "alice", text: "Trop beau!" }, { user: "bob", text: "J'adore 😍" }],
    [{ user: "carol", text: "Super post!" }],
    [{ user: "dave", text: "Wow" }, { user: "eve", text: "Canon!" }]
  ];

  return (
    <main className="min-h-screen bg-gradient-to-tl from-pink-200 via-pink-300 to-white text-black">
      <div className="mx-auto max-w-7xl px-8 py-8 text-lg relative z-10">

        {/* Topbar */}
        <div className="mb-8 flex items-center justify-between py-4">
          <Link href="/">
            <h1 className="cursor-pointer text-4xl font-extrabold tracking-wide text-pink-600 hover:text-pink-700">
              ft_transcendence
            </h1>
          </Link>

          <div className="flex items-center gap-8">
            <span className="text-base font-medium">@{username}</span>
            <Link href="/login">
              <User className="h-7 w-7 cursor-pointer hover:scale-110 transition-transform text-pink-500" />
            </Link>

            <div className="relative">
              <Bell
                onClick={() => setOpenNotif(!openNotif)}
                className="h-7 w-7 cursor-pointer hover:scale-110 transition-transform text-pink-500"
              />
              {openNotif && (
                <div className="absolute right-0 top-10 z-50 w-80 rounded-2xl bg-white text-black p-4 shadow-2xl">
                  <p className="mb-3 text-sm font-semibold">Notifications</p>
                  {[1, 2].map((notif) => (
                    <div key={notif} className="mb-2 flex items-center justify-between gap-2 rounded-lg bg-pink-100 p-3 shadow-md">
                      <p className="text-sm">user_{notif} liked your post</p>
                      <div className="flex gap-2">
                        <Check className="h-5 w-5 cursor-pointer text-green-500 hover:scale-110 transition-transform" />
                        <Trash className="h-5 w-5 cursor-pointer text-red-500 hover:scale-110 transition-transform" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Users className="h-7 w-7 cursor-pointer hover:scale-110 transition-transform text-pink-500" />
            <LogOut
              onClick={handleLogout}
              className="h-7 w-7 cursor-pointer text-red-600 hover:text-red-700 transition-transform"
            />
          </div>
        </div>

        {/* Layout */}
        <div className="grid gap-10 lg:grid-cols-[2fr_1fr]">

          {/* Feed */}
          <div className="space-y-12">
            {[1, 2, 3].map((post, idx) => (
              <Card
                key={post}
                className="rounded-3xl bg-white text-black shadow-2xl hover:shadow-3xl transition-all duration-300 flex flex-col"
              >
                {/* User header */}
                <Link href={`/profile/user_${post}`} className="flex items-center gap-3 p-4">
                  <Avatar className="h-14 w-14 cursor-pointer">
                    <AvatarImage src={`https://i.pravatar.cc/100?img=${post+30}`} />
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                  <span className="font-semibold hover:text-pink-600 cursor-pointer text-lg">user_{post}</span>
                </Link>

                {/* Post image */}
                <div className="flex-1">
                  <img
                    src={`https://picsum.photos/500?random=${post}`}
                    alt={`Post ${post}`}
                    className="w-full h-96 object-cover rounded-t-3xl"
                  />
                </div>

                {/* Like & Comment buttons */}
                <div className="flex gap-6 p-4 border-t border-gray-200">
                  <button className="flex items-center gap-2 text-pink-500 hover:scale-110 transition-transform font-semibold">
                    <Heart className="h-6 w-6" /> {postLikes[idx]}
                  </button>
                  <button className="flex items-center gap-2 text-purple-500 hover:scale-110 transition-transform font-semibold">
                    <MessageCircle className="h-6 w-6" /> {postComments[idx]}
                  </button>
                </div>

                {/* Comments section */}
                <div className="px-4 pb-4 text-sm text-gray-700 space-y-1">
                  {commentsData[idx].map((c, i) => (
                    <p key={i}><span className="font-semibold">{c.user}:</span> {c.text}</p>
                  ))}
                </div>

              </Card>
            ))}
          </div>

          {/* Right - Suggestions / Trends */}
          <div className="space-y-10">
            <div className="sticky top-8 space-y-10">
              <Card className="rounded-2xl bg-white p-6 shadow-2xl">
                <p className="mb-5 text-base font-semibold text-pink-600">Suggestions</p>
                {[1, 2, 3].map((user) => (
                  <div key={user} className="mb-5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Link href={`/profile/user_${user}`}>
                        <Avatar className="h-12 w-12 cursor-pointer">
                          <AvatarFallback>U</AvatarFallback>
                        </Avatar>
                      </Link>
                      <Link href={`/profile/user_${user}`} className="text-base font-medium text-black hover:text-pink-600">
                        user_{user}
                      </Link>
                    </div>
                    <button className="text-sm text-pink-500 hover:scale-110 transition-transform">Follow</button>
                  </div>
                ))}
              </Card>

              <Card className="rounded-2xl bg-white p-6 shadow-2xl">
                <p className="mb-2 text-base font-semibold text-pink-600">Trends</p>
                <div className="flex flex-wrap gap-2">
                  {['#Code', '#Ecole', '#42'].map((tag) => (
                    <span key={tag} className="text-sm text-purple-500 bg-purple-100 px-2 py-1 rounded-full cursor-pointer hover:bg-purple-200">{tag}</span>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </div>

        {/* Big create post button */}
        <Link href="/create">
          <button className="fixed bottom-8 right-8 flex h-20 w-20 items-center justify-center rounded-full bg-pink-400 text-white shadow-xl hover:bg-pink-500 hover:scale-110 transition-transform">
            <Plus className="h-8 w-8" />
          </button>
        </Link>

        {/* Background gradient */}
        <div className="pointer-events-none fixed bottom-0 right-0 h-full w-full bg-gradient-to-tl from-pink-400/30 via-pink-300/20 to-transparent"></div>
      </div>
    </main>
  );
}