"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import {
  Bell,
  UserPlus,
  MessageCircle,
  Settings,
  Activity,
  CheckCheck,
  ExternalLink,
  X,
  Leaf,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export default function NotificationsPage() {
  const notifications = [
    {
      type: "friend",
      title: "New friend request",
      message: "Sarah sent you a friend request.",
      time: "2 min ago",
      unread: true,
    },
    {
      type: "message",
      title: "New message",
      message: "Yassir sent you a new message.",
      time: "10 min ago",
      unread: true,
    },
    {
      type: "system",
      title: "Profile updated",
      message: "Your profile information has been updated successfully.",
      time: "1 hour ago",
      unread: false,
    },
    {
      type: "community",
      title: "New activity",
      message: "Amine accepted your friend request.",
      time: "Yesterday",
      unread: false,
    },
  ];

  const unreadCount = notifications.filter((n) => n.unread).length;
  const readCount = notifications.filter((n) => !n.unread).length;

  const getIcon = (type: string) => {
    switch (type) {
      case "friend":
        return <UserPlus className="h-5 w-5" />;
      case "message":
        return <MessageCircle className="h-5 w-5" />;
      case "system":
        return <Settings className="h-5 w-5" />;
      case "community":
        return <Activity className="h-5 w-5" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-gradient-to-br from-[#EAF1E6] via-[#dbe7d2] to-[#9CAF88] text-[#33412c]">
        <section className="relative overflow-hidden px-4 py-6 sm:px-6 lg:px-8">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.25),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.18),transparent_28%)]" />

          <div className="relative mx-auto max-w-6xl space-y-6">
            <div className="mb-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm font-medium text-[#4A6440] shadow-md backdrop-blur">
                <Sparkles className="h-4 w-4" />
                Activity center
              </div>

              <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-[#33412c]">
                Notifications
              </h1>

              <p className="mt-3 max-w-2xl text-base leading-7 text-[#51604b]">
                Stay updated with friend requests, messages and account activity
                in a softer, cleaner interface.
              </p>
            </div>

            <Card className="rounded-[2rem] border-0 bg-white/92 shadow-[0_18px_50px_rgba(74,100,64,0.15)] backdrop-blur">
              <CardContent className="p-6">
                <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                  <div className="max-w-2xl">
                    <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#EAF1E6] px-4 py-2 text-sm font-medium text-[#4A6440]">
                      <Leaf className="h-4 w-4" />
                      Notification hub
                    </div>

                    <h2 className="text-2xl font-bold text-[#33412c]">
                      Your recent activity
                    </h2>

                    <p className="mt-3 text-sm leading-7 text-[#60705a]">
                      Track social activity, messages and important account
                      updates in one place.
                    </p>
                  </div>

                  <Button className="rounded-full bg-[#8AA678] text-white hover:bg-[#79956a]">
                    <CheckCheck className="mr-2 h-4 w-4" />
                    Mark all as read
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4 sm:grid-cols-3">
              <Card className="rounded-[1.75rem] border-0 bg-white/92 shadow-[0_14px_35px_rgba(74,100,64,0.12)] backdrop-blur">
                <CardContent className="p-5">
                  <p className="text-sm text-[#72826c]">Total</p>
                  <p className="mt-2 text-3xl font-bold text-[#33412c]">
                    {notifications.length}
                  </p>
                </CardContent>
              </Card>

              <Card className="rounded-[1.75rem] border-0 bg-[#EAF1E6]/95 shadow-[0_14px_35px_rgba(74,100,64,0.12)] backdrop-blur">
                <CardContent className="p-5">
                  <p className="text-sm text-[#5f7358]">Unread</p>
                  <p className="mt-2 text-3xl font-bold text-[#4A6440]">
                    {unreadCount}
                  </p>
                </CardContent>
              </Card>

              <Card className="rounded-[1.75rem] border-0 bg-[#F4F8F1]/95 shadow-[0_14px_35px_rgba(74,100,64,0.12)] backdrop-blur">
                <CardContent className="p-5">
                  <p className="text-sm text-[#72826c]">Read</p>
                  <p className="mt-2 text-3xl font-bold text-[#66745f]">
                    {readCount}
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card className="rounded-[2rem] border-0 bg-white/92 shadow-[0_18px_50px_rgba(74,100,64,0.15)] backdrop-blur">
              <CardContent className="p-4 sm:p-6">
                <div className="mb-5 flex items-center gap-3">
                  <div className="rounded-2xl bg-[#EAF1E6] p-2 text-[#4A6440]">
                    <Bell className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-[#33412c]">
                      Recent updates
                    </h2>
                    <p className="text-sm text-[#71806c]">
                      Your latest platform activity
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {notifications.map((notification, index) => (
                    <Card
                      key={index}
                      className={`rounded-[1.5rem] border-0 shadow-sm transition ${
                        notification.unread
                          ? "bg-[#edf6e8]"
                          : "bg-[#fbfdf9]"
                      }`}
                    >
                      <CardContent className="p-5">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div className="flex items-start gap-4">
                            <div
                              className={`mt-1 flex h-11 w-11 items-center justify-center rounded-2xl ${
                                notification.unread
                                  ? "bg-[#dce9d1] text-[#4A6440]"
                                  : "bg-[#F4F8F1] text-[#6f7d68]"
                              }`}
                            >
                              {getIcon(notification.type)}
                            </div>

                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-3">
                                <h3 className="text-base font-semibold text-[#33412c] sm:text-lg">
                                  {notification.title}
                                </h3>

                                {notification.unread && (
                                  <Badge className="rounded-full border-0 bg-[#C3D1B2] text-[#4A6440] hover:bg-[#C3D1B2]">
                                    New
                                  </Badge>
                                )}
                              </div>

                              <p className="mt-2 text-sm leading-6 text-[#59655a]">
                                {notification.message}
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-col items-start gap-3 sm:items-end">
                            <span className="text-xs text-[#85927f]">
                              {notification.time}
                            </span>

                            <div className="flex flex-wrap gap-2">
                              <Button
                                variant="outline"
                                className="rounded-full border-[#d8e3d1] bg-white text-[#4e5a50] hover:bg-[#eef4e8]"
                              >
                                <ExternalLink className="mr-2 h-4 w-4" />
                                Open
                              </Button>

                              <Button
                                variant="outline"
                                className="rounded-full border-[#d8e3d1] bg-white text-[#4e5a50] hover:bg-[#eef4e8]"
                              >
                                <X className="mr-2 h-4 w-4" />
                                Dismiss
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </ProtectedRoute>
  );
}