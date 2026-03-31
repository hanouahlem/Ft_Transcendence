import Link from "next/link";
import {
  Heart,
  MessageCircle,
  Bookmark,
  Leaf,
  ArrowRight,
  Users,
  Bell,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#EAF1E6] via-[#dbe7d2] to-[#9CAF88] text-[#33412c]">
      <section className="relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(74,100,64,0.20),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(156,175,136,0.28),transparent_30%)]" />
        <div className="absolute left-[-80px] top-24 h-72 w-72 rounded-full bg-[#EAF1E6]/40 blur-3xl" />
        <div className="absolute bottom-0 right-[-60px] h-80 w-80 rounded-full bg-[#c8dbbf]/50 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-6 pb-14 pt-28 lg:px-8 lg:pt-32">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            {/* Left side */}
            <div className="max-w-2xl">


              <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                A softer way to{" "}
                <span className="text-[#4A6440]">share stories</span>, connect
                with people, and grow a meaningful blog community
              </h1>

              <p className="mt-6 max-w-xl text-base leading-8 text-[#4f5d49] sm:text-lg">
                Publish your thoughts, capture moments, and explore a curated
                social feed in a warm, elegant interface inspired by modern
                editorial platforms and lifestyle communities.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button
                  asChild
                  size="lg"
                  className="rounded-full bg-[#4A6440] px-7 text-white hover:bg-[#3a5230]"
                >
                  <Link href="/register">
                    Start your journey
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>

                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="rounded-full border-0 bg-white/80 px-7 text-[#33412c] shadow-md backdrop-blur hover:bg-white/95"
                >
                  <Link href="/login">Login</Link>
                </Button>
              </div>

              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                <Card className="border-0 bg-white/90 shadow-md backdrop-blur">
                  <CardContent className="flex items-start gap-3 p-4">
                    <div className="rounded-xl bg-[#EAF1E6] p-2 text-[#4A6440]">
                      <Users className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#33412c]">
                        Community
                      </p>
                      <p className="text-xs leading-5 text-[#4f5d49]">
                        Follow creators and build genuine connections
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 bg-white/90 shadow-md backdrop-blur">
                  <CardContent className="flex items-start gap-3 p-4">
                    <div className="rounded-xl bg-[#EAF1E6] p-2 text-[#4A6440]">
                      <Heart className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#33412c]">
                        Reactions
                      </p>
                      <p className="text-xs leading-5 text-[#4f5d49]">
                        Engage through likes, comments and saved posts
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 bg-white/90 shadow-md backdrop-blur">
                  <CardContent className="flex items-start gap-3 p-4">
                    <div className="rounded-xl bg-[#EAF1E6] p-2 text-[#4A6440]">
                      <Bell className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#33412c]">
                        Updates
                      </p>
                      <p className="text-xs leading-5 text-[#4f5d49]">
                        Stay in touch with activity and new stories
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Right side visual */}
            <div className="relative mx-auto w-full max-w-2xl">
              <div className="grid gap-4 md:grid-cols-[1.15fr_0.85fr]">
                {/* Main featured post */}
                <Card className="overflow-hidden border-0 bg-white/95 shadow-[0_20px_60px_rgba(74,100,64,0.14)] backdrop-blur">
                  <div className="h-56 bg-gradient-to-br from-[#a8c49a] via-[#c4d9b8] to-[#7B9270]" />
                  <CardContent className="space-y-5 p-5">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border-2 border-[#d8e3d1]">
                        <AvatarImage src="https://i.pravatar.cc/100?img=32" />
                        <AvatarFallback className="bg-[#EAF1E6] text-[#4A6440]">EM</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-semibold text-[#33412c]">
                          @emma.journal
                        </p>
                        <p className="text-xs text-[#7a8874]">3 min ago</p>
                      </div>
                    </div>

                    <div>
                      <h2 className="text-lg font-semibold leading-snug text-[#33412c]">
                        Creating a slower, warmer social experience for modern
                        storytelling
                      </h2>
                      <p className="mt-2 text-sm leading-6 text-[#4f5d49]">
                        Thoughtful design, quiet tones, and elegant content
                        cards help users focus on stories, people, and everyday
                        inspiration.
                      </p>
                    </div>

                    <div className="flex items-center gap-5 text-sm text-[#6B7C5D]">
                      <div className="flex items-center gap-2">
                        <Heart className="h-4 w-4" />
                        <span>864</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MessageCircle className="h-4 w-4" />
                        <span>92</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Bookmark className="h-4 w-4" />
                        <span>Saved</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Side blocks */}
                <div className="space-y-4">
                  <Card className="border-0 bg-white/90 shadow-md backdrop-blur">
                    <CardContent className="p-5">
                      <p className="mb-4 text-sm font-semibold text-[#33412c]">
                        Featured creators
                      </p>

                      <div className="space-y-4">
                        {[
                          {
                            name: "lina.home",
                            role: "Interior moments",
                            fallback: "LH",
                          },
                          {
                            name: "youssef.notes",
                            role: "Daily reflections",
                            fallback: "YN",
                          },
                          {
                            name: "sara.studio",
                            role: "Creative lifestyle",
                            fallback: "SS",
                          },
                        ].map((user) => (
                          <div
                            key={user.name}
                            className="flex items-center justify-between"
                          >
                            <div className="flex items-center gap-3">
                              <Avatar className="h-9 w-9">
                                <AvatarFallback className="bg-[#EAF1E6] text-[#4A6440]">
                                  {user.fallback}
                                </AvatarFallback>
                              </Avatar>

                              <div>
                                <p className="text-sm font-medium text-[#33412c]">
                                  @{user.name}
                                </p>
                                <p className="text-xs text-[#7a8874]">
                                  {user.role}
                                </p>
                              </div>
                            </div>

                            <Button
                              variant="secondary"
                              size="sm"
                              className="rounded-full bg-[#EAF1E6] text-[#4A6440] hover:bg-[#d9e6d0]"
                            >
                              Follow
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-0 bg-white/90 shadow-md backdrop-blur">
                    <CardContent className="p-5">
                      <p className="mb-4 text-sm font-semibold text-[#33412c]">
                        This week’s mood
                      </p>

                      <div className="space-y-3">
                        <div className="rounded-2xl border border-[#cfe0c4] bg-[#F4F8F1] p-3">
                          <div className="mb-2 flex items-center gap-2 text-[#4A6440]">
                            <Leaf className="h-4 w-4" />
                            <p className="text-sm font-medium">#SlowLiving</p>
                          </div>
                          <p className="text-xs text-[#5a6b54]">
                            Gentle routines, mindful sharing, and calm visual
                            storytelling
                          </p>
                        </div>

                        <div className="rounded-2xl border border-[#cfe0c4] bg-[#F4F8F1] p-3">
                          <p className="text-sm font-medium text-[#33412c]">
                            #NaturePalette
                          </p>
                          <p className="text-xs text-[#5a6b54]">
                            Sage, sand, olive and warm neutral tones
                          </p>
                        </div>

                        <div className="rounded-2xl border border-[#cfe0c4] bg-[#F4F8F1] p-3">
                          <p className="text-sm font-medium text-[#33412c]">
                            #PersonalStories
                          </p>
                          <p className="text-xs text-[#5a6b54]">
                            Everyday moments shaped into beautiful narratives
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom section */}
          <div className="mt-16 grid gap-6 md:grid-cols-3">
            <Card className="border-0 bg-white/90 shadow-md backdrop-blur">
              <CardContent className="p-6">
                <p className="text-sm font-semibold text-[#4A6440]">
                  Elegant content
                </p>
                <h3 className="mt-2 text-xl font-semibold text-[#33412c]">
                  Share visual posts and thoughtful writing
                </h3>
                <p className="mt-3 text-sm leading-6 text-[#4f5d49]">
                  A homepage designed to feel clean, breathable, and editorial,
                  while still keeping the social energy of a modern platform.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 bg-white/90 shadow-md backdrop-blur">
              <CardContent className="p-6">
                <p className="text-sm font-semibold text-[#4A6440]">
                  Soft interactions
                </p>
                <h3 className="mt-2 text-xl font-semibold text-[#33412c]">
                  Designed for calm engagement
                </h3>
                <p className="mt-3 text-sm leading-6 text-[#4f5d49]">
                  Likes, comments, saves, and notifications are still present,
                  but wrapped in a quieter and more refined interface.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 bg-white/90 shadow-md backdrop-blur">
              <CardContent className="p-6">
                <p className="text-sm font-semibold text-[#4A6440]">
                  Lifestyle aesthetic
                </p>
                <h3 className="mt-2 text-xl font-semibold text-[#33412c]">
                  A blog universe with a warmer identity
                </h3>
                <p className="mt-3 text-sm leading-6 text-[#4f5d49]">
                  This direction works well if you want something between a
                  social app, a journal platform, and an aesthetic content hub.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </main>
  );
}