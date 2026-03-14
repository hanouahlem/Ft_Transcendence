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
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

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
      <main className="min-h-screen bg-[#f6f1e8] text-[#2f3a32]">
        <section className="relative overflow-hidden px-4 py-6 sm:px-6 lg:px-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(125,148,112,0.16),transparent_26%),radial-gradient(circle_at_bottom_right,rgba(216,207,184,0.32),transparent_30%)]" />

          <div className="relative mx-auto max-w-6xl space-y-6">
            {/* Header */}
            <Card className="rounded-[2rem] border-[#ddd3c2] bg-[#fffaf2]/95 shadow-sm">
              <CardContent className="p-6">
                <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                  <div className="max-w-2xl">
                    <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#d8cfbe] bg-[#eef3e8] px-4 py-2 text-sm font-medium text-[#64785f]">
                      <Leaf className="h-4 w-4" />
                      Activity center
                    </div>

                    <h1 className="text-3xl font-bold tracking-tight text-[#2f3a32] md:text-4xl">
                      Notifications
                    </h1>

                    <p className="mt-3 text-sm leading-7 text-[#667066] md:text-base">
                      Stay updated with friend requests, messages, and account
                      activity in a cleaner, calmer interface.
                    </p>
                  </div>

                  <Button className="rounded-full bg-[#6f8467] text-white hover:bg-[#5f7358]">
                    <CheckCheck className="mr-2 h-4 w-4" />
                    Mark all as read
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Summary */}
            <div className="grid gap-4 sm:grid-cols-3">
              <Card className="rounded-[1.75rem] border-[#ddd3c2] bg-[#fffaf2]/95 shadow-sm">
                <CardContent className="p-5">
                  <p className="text-sm text-[#7b847b]">Total</p>
                  <p className="mt-2 text-3xl font-bold text-[#2f3a32]">
                    {notifications.length}
                  </p>
                </CardContent>
              </Card>

              <Card className="rounded-[1.75rem] border-[#ddd3c2] bg-[#eef3e8]/95 shadow-sm">
                <CardContent className="p-5">
                  <p className="text-sm text-[#6f786f]">Unread</p>
                  <p className="mt-2 text-3xl font-bold text-[#6f8467]">
                    {unreadCount}
                  </p>
                </CardContent>
              </Card>

              <Card className="rounded-[1.75rem] border-[#ddd3c2] bg-[#faf5eb]/95 shadow-sm">
                <CardContent className="p-5">
                  <p className="text-sm text-[#7b847b]">Read</p>
                  <p className="mt-2 text-3xl font-bold text-[#8a7a5d]">
                    {readCount}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Notification feed */}
            <Card className="rounded-[2rem] border-[#ddd3c2] bg-[#fffaf2]/95 shadow-sm">
              <CardContent className="p-4 sm:p-6">
                <div className="mb-4 flex items-center gap-3">
                  <div className="rounded-2xl bg-[#eef3e8] p-2 text-[#6f8467]">
                    <Bell className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-[#2f3a32]">
                      Recent updates
                    </h2>
                    <p className="text-sm text-[#7b847b]">
                      Your latest platform activity
                    </p>
                  </div>
                </div>

                <Separator className="mb-6 bg-[#e5dccd]" />

                <div className="space-y-4">
                  {notifications.map((notification, index) => (
                    <Card
                      key={index}
                      className={`rounded-[1.5rem] border shadow-none transition ${
                        notification.unread
                          ? "border-[#c7d7bd] bg-[#edf4e8]"
                          : "border-[#e3d9c8] bg-[#fcf8f1]"
                      }`}
                    >
                      <CardContent className="p-5">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div className="flex items-start gap-4">
                            <div
                              className={`mt-1 flex h-11 w-11 items-center justify-center rounded-2xl ${
                                notification.unread
                                  ? "bg-[#dfe8d7] text-[#6f8467]"
                                  : "bg-[#f3ecdf] text-[#8a7a5d]"
                              }`}
                            >
                              {getIcon(notification.type)}
                            </div>

                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-3">
                                <h3 className="text-base font-semibold text-[#2f3a32] sm:text-lg">
                                  {notification.title}
                                </h3>

                                {notification.unread && (
                                  <Badge className="rounded-full border-[#b7c9ae] bg-[#edf4e8] text-[#5f7358] hover:bg-[#edf4e8]">
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
                            <span className="text-xs text-[#8b928a]">
                              {notification.time}
                            </span>

                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                className="rounded-full border-[#d8cfbe] bg-[#fffaf2] text-[#4e5a50] hover:bg-[#f3ecdf]"
                              >
                                <ExternalLink className="mr-2 h-4 w-4" />
                                Open
                              </Button>

                              <Button
                                variant="outline"
                                className="rounded-full border-[#d8cfbe] bg-[#fffaf2] text-[#4e5a50] hover:bg-[#f3ecdf]"
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