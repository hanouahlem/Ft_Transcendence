"use client";

import Link from "next/link";
import { useState } from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Navbar from "@/components/layout/Navbar";
import {
  ArrowLeft,
  Bell,
  User,
  Shield,
  Mail,
  Users,
  Heart,
  Settings,
  Leaf,
  Save,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

export default function SettingsNotificationsPage() {
  const [friendRequests, setFriendRequests] = useState(true);
  const [newFollowers, setNewFollowers] = useState(true);
  const [postLikes, setPostLikes] = useState(true);
  const [comments, setComments] = useState(true);
  const [systemUpdates, setSystemUpdates] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(false);

  const [message, setMessage] = useState("");

  const handleSave = async () => {
    try {
      setMessage("");

      // TODO: brancher ton API ici
      // await updateNotificationSettings({ ... })

      await new Promise((resolve) => setTimeout(resolve, 700));
      setMessage("Notification settings updated successfully.");
    } catch (error) {
      console.error(error);
      setMessage("Unable to save notification settings.");
    }
  };

  const NotificationRow = ({
    icon,
    title,
    description,
    checked,
    onCheckedChange,
  }: {
    icon: React.ReactNode;
    title: string;
    description: string;
    checked: boolean;
    onCheckedChange: (value: boolean) => void;
  }) => (
    <div className="flex items-start justify-between gap-4 rounded-[1.5rem] border border-[#e3d9c8] bg-[#fcf8f1] p-4">
      <div className="flex items-start gap-3">
        <div className="rounded-2xl bg-[#eef3e8] p-2 text-[#6f8467]">
          {icon}
        </div>
        <div>
          <p className="font-semibold text-[#2f3a32]">{title}</p>
          <p className="mt-1 text-sm leading-6 text-[#667066]">
            {description}
          </p>
        </div>
      </div>

      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );

  return (
    <ProtectedRoute>
      <Navbar />
      <main className="min-h-screen bg-[#f6f1e8] text-[#2f3a32]">
        <section className="relative overflow-hidden px-4 py-6 sm:px-6 lg:px-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(125,148,112,0.16),transparent_26%),radial-gradient(circle_at_bottom_right,rgba(216,207,184,0.32),transparent_30%)]" />

          <div className="relative mx-auto max-w-6xl space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Button
                asChild
                variant="outline"
                className="rounded-full border-[#d8cfbe] bg-[#fffaf2]"
              >
                <Link href="/profile">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to profile
                </Link>
              </Button>
            </div>

            <Card className="rounded-[2rem] border-[#ddd3c2] bg-[#fffaf2]/95 shadow-sm">
              <CardContent className="p-6">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  <div className="max-w-2xl">
                    <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#d8cfbe] bg-[#eef3e8] px-4 py-2 text-sm font-medium text-[#64785f]">
                      <Leaf className="h-4 w-4" />
                      Account settings
                    </div>

                    <h1 className="text-3xl font-bold tracking-tight text-[#2f3a32] md:text-4xl">
                      Notification settings
                    </h1>

                    <p className="mt-3 text-sm leading-7 text-[#667066] md:text-base">
                      Choose the alerts you want to receive inside the app and by
                      email.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Button
                      asChild
                      variant="outline"
                      className="rounded-full border-[#d8cfbe] bg-[#fffaf2]"
                    >
                      <Link href="/settings/profile">
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </Link>
                    </Button>

                    <Button
                      asChild
                      variant="outline"
                      className="rounded-full border-[#d8cfbe] bg-[#fffaf2]"
                    >
                      <Link href="/settings/security">
                        <Shield className="mr-2 h-4 w-4" />
                        Security
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {message && (
              <div className="rounded-2xl border border-[#c7d7bd] bg-[#edf4e8] px-4 py-3 text-sm text-[#5f7358]">
                {message}
              </div>
            )}

            <div className="grid gap-6">
              <Card className="rounded-[2rem] border-[#ddd3c2] bg-[#fffaf2]/95 shadow-sm">
                <CardContent className="p-6">
                  <div className="mb-6 flex items-start gap-3">
                    <div className="rounded-2xl bg-[#eef3e8] p-3 text-[#6f8467]">
                      <Bell className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-semibold text-[#2f3a32]">
                        In-app notifications
                      </h2>
                      <p className="mt-2 text-sm text-[#667066]">
                        Control what appears inside your platform.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <NotificationRow
                      icon={<Users className="h-4 w-4" />}
                      title="Friend requests"
                      description="Receive alerts when someone sends you a friend request."
                      checked={friendRequests}
                      onCheckedChange={setFriendRequests}
                    />

                    <NotificationRow
                      icon={<Users className="h-4 w-4" />}
                      title="New followers"
                      description="Get notified when new people follow your profile."
                      checked={newFollowers}
                      onCheckedChange={setNewFollowers}
                    />

                    <NotificationRow
                      icon={<Heart className="h-4 w-4" />}
                      title="Likes and reactions"
                      description="See when people react to your posts and favorites."
                      checked={postLikes}
                      onCheckedChange={setPostLikes}
                    />

                    <NotificationRow
                      icon={<Mail className="h-4 w-4" />}
                      title="Comments and replies"
                      description="Receive alerts when someone comments on your content."
                      checked={comments}
                      onCheckedChange={setComments}
                    />

                    <NotificationRow
                      icon={<Settings className="h-4 w-4" />}
                      title="System updates"
                      description="Important account, maintenance, and platform updates."
                      checked={systemUpdates}
                      onCheckedChange={setSystemUpdates}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-[2rem] border-[#ddd3c2] bg-[#fffaf2]/95 shadow-sm">
                <CardContent className="p-6">
                  <div className="mb-6 flex items-start gap-3">
                    <div className="rounded-2xl bg-[#eef3e8] p-3 text-[#6f8467]">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-semibold text-[#2f3a32]">
                        Email notifications
                      </h2>
                      <p className="mt-2 text-sm text-[#667066]">
                        Choose whether important alerts can also be sent by email.
                      </p>
                    </div>
                  </div>

                  <div className="rounded-[1.5rem] border border-[#e3d9c8] bg-[#fcf8f1] p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold text-[#2f3a32]">
                          Email alerts
                        </p>
                        <p className="mt-1 text-sm leading-6 text-[#667066]">
                          Receive important notification summaries and account
                          activity by email.
                        </p>
                      </div>

                      <Switch checked={emailAlerts} onCheckedChange={setEmailAlerts} />
                    </div>
                  </div>

                  <div className="mt-6">
                    <Button
                      onClick={handleSave}
                      className="rounded-full bg-[#6f8467] text-white hover:bg-[#5f7358]"
                    >
                      <Save className="mr-2 h-4 w-4" />
                      Save preferences
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
    </ProtectedRoute>
  );
}