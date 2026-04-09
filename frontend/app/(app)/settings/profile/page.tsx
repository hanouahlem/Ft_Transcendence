"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  ArrowLeft,
  User,
  MapPin,
  Globe,
  Mail,
  Pencil,
  Save,
  Shield,
  Bell,
  Leaf,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ProfilePicture } from "@/components/ui/ProfilePicture";
import { ProfileBanner } from "@/components/profile/ProfileBanner";
import { Separator } from "@/components/ui/separator";

export default function SettingsProfilePage() {
  const { user, token } = useAuth();

  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [website, setWebsite] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

useEffect(() => {
  const fetchCurrentUser = async () => {
    if (!token) return;

    try {
      setLoadingProfile(true);
      setError("");
      setMessage("");

      const res = await fetch("http://localhost:3001/user", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Impossible de charger le profil.");
      }

      setUsername(data.username || "");
      setDisplayName(data.displayName || "");
      setBio(data.bio || "");
      setLocation(data.location || "");
      setWebsite(data.website || "");
      setBannerUrl(data.banner || "");
      setAvatarUrl(data.avatar || "");
      setStatus(data.status || "");
    } catch (err) {
      console.error("Erreur fetch current user :", err);
      setError(
        err instanceof Error
          ? err.message
          : "Erreur lors du chargement du profil."
      );
    } finally {
      setLoadingProfile(false);
    }
  };

  fetchCurrentUser();
}, [token]);

const handleSave = async () => {
  if (!token || !user?.id) {
    setError("Tu dois être connecté.");
    return;
  }

  try {
    setSaving(true);
    setMessage("");
    setError("");

    const res = await fetch(`http://localhost:3001/users/${user.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        username,
        displayName,
        banner: bannerUrl,
        avatar: avatarUrl,
        bio,
        status,
        location,
        website,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Impossible de mettre à jour le profil.");
    }

    setMessage("Profile updated successfully.");
  } catch (error) {
    console.error(error);
    setError(
      error instanceof Error
        ? error.message
        : "Unable to save profile changes."
    );
  } finally {
    setSaving(false);
  }
};

  return (
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
                  {error && (
                    <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                      {error}
                    </div>
                  )}
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
                      Profile settings
                    </h1>

                    <p className="mt-3 text-sm leading-7 text-[#667066] md:text-base">
                      Update your public profile information, avatar, and basic
                      account details.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3">
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

                    <Button
                      asChild
                      variant="outline"
                      className="rounded-full border-[#d8cfbe] bg-[#fffaf2]"
                    >
                      <Link href="/settings/notifications">
                        <Bell className="mr-2 h-4 w-4" />
                        Notifications
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-6 lg:grid-cols-[1.1fr_1.9fr]">
              <Card className="rounded-[2rem] border-[#ddd3c2] bg-[#fffaf2]/95 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="relative w-full overflow-hidden rounded-[1.5rem] border border-[#d8cfbe] bg-[#eef3e8]">
                      <ProfileBanner
                        name={username || "User"}
                        src={bannerUrl}
                        className="h-32 w-full object-cover"
                      />
                    </div>

                    <ProfilePicture
                      name={displayName || username || user?.username || "User"}
                      src={avatarUrl}
                      className="-mt-12 h-28 w-28 shadow-md"
                    />

                    <h2 className="mt-4 text-xl font-bold text-[#2f3a32]">
                      {displayName || username || "Utilisateur"}
                    </h2>

                    <p className="mt-1 text-sm text-[#7b847b]">
                      @{(username || "utilisateur").toLowerCase()}
                    </p>

                    <p className="mt-3 text-sm text-[#667066]">
                      Public preview of your profile
                    </p>
                  </div>

                  <Separator className="my-6 bg-[#e5dccd]" />

                  <div className="space-y-4">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-[#5d675e]">
                        Banner URL
                      </label>
                      <Input
                        value={bannerUrl}
                        onChange={(e) => setBannerUrl(e.target.value)}
                        placeholder="https://..."
                        className="rounded-2xl border-[#d8cfbe] bg-[#fcf8f1]"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-[#5d675e]">
                        Avatar URL
                      </label>
                      <Input
                        value={avatarUrl}
                        onChange={(e) => setAvatarUrl(e.target.value)}
                        placeholder="https://..."
                        className="rounded-2xl border-[#d8cfbe] bg-[#fcf8f1]"
                      />
                    </div>

                    <div className="rounded-[1.5rem] border border-[#d8cfbe] bg-[#eef3e8]/80 p-4">
                      <p className="text-sm font-semibold text-[#5f7358]">
                        Tip
                      </p>
                      <p className="mt-2 text-sm leading-6 text-[#667066]">
                        Start with a simple form now. Later, you can replace the
                        avatar URL field with a real image upload.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-[2rem] border-[#ddd3c2] bg-[#fffaf2]/95 shadow-sm">
                <CardContent className="p-6">
                  <div className="mb-6">
                    <h2 className="text-2xl font-semibold text-[#2f3a32]">
                      Edit your information
                    </h2>
                    <p className="mt-2 text-sm text-[#667066]">
                      These details will appear on your profile page.
                    </p>
                  </div>

                  {message && (
                    <div className="mb-6 rounded-2xl border border-[#c7d7bd] bg-[#edf4e8] px-4 py-3 text-sm text-[#5f7358]">
                      {message}
                    </div>
                  )}

                    <div className="space-y-5">
                    <div>
                      <label className="mb-2 flex items-center gap-2 text-sm font-medium text-[#5d675e]">
                        <User className="h-4 w-4" />
                        Display name
                      </label>
                      <Input
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Your public name"
                        className="rounded-2xl border-[#d8cfbe] bg-[#fcf8f1]"
                      />
                    </div>

                    <div>
                      <label className="mb-2 flex items-center gap-2 text-sm font-medium text-[#5d675e]">
                        <User className="h-4 w-4" />
                        Username
                      </label>
                      <Input
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Your username"
                        className="rounded-2xl border-[#d8cfbe] bg-[#fcf8f1]"
                      />
                    </div>

                    <div>
                      <label className="mb-2 flex items-center gap-2 text-sm font-medium text-[#5d675e]">
                        <Mail className="h-4 w-4" />
                        Email
                      </label>
                      <Input
                        value={user?.email || ""}
                        disabled
                        className="rounded-2xl border-[#d8cfbe] bg-[#f3ecdf] text-[#7b847b]"
                      />
                    </div>

                    <div>
                      <label className="mb-2 flex items-center gap-2 text-sm font-medium text-[#5d675e]">
                        <Pencil className="h-4 w-4" />
                        Bio
                      </label>
                      <Textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Write something about yourself..."
                        className="min-h-[130px] rounded-2xl border-[#d8cfbe] bg-[#fcf8f1]"
                      />
                    </div>

                    <div className="grid gap-5 md:grid-cols-2">
                      <div>
                        <label className="mb-2 flex items-center gap-2 text-sm font-medium text-[#5d675e]">
                          <MapPin className="h-4 w-4" />
                          Location
                        </label>
                        <Input
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          placeholder="Your location"
                          className="rounded-2xl border-[#d8cfbe] bg-[#fcf8f1]"
                        />
                      </div>

                      <div>
                        <label className="mb-2 flex items-center gap-2 text-sm font-medium text-[#5d675e]">
                          <Globe className="h-4 w-4" />
                          Website
                        </label>
                        <Input
                          value={website}
                          onChange={(e) => setWebsite(e.target.value)}
                          placeholder="your-site.com"
                          className="rounded-2xl border-[#d8cfbe] bg-[#fcf8f1]"
                        />
                      </div>
                    </div>

                    <div className="pt-2">
                      <Button
                        onClick={handleSave}
                        disabled={saving || loadingProfile}
                        className="rounded-full bg-[#6f8467] text-white hover:bg-[#5f7358]"
                      >
                        <Save className="mr-2 h-4 w-4" />
                        {loadingProfile ? "Loading..." : saving ? "Saving..." : "Save changes"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
  );
}
