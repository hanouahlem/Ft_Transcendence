"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, RefreshCcw } from "lucide-react";
import ArchiveFilters from "@/components/decor/ArchiveFilters";
import { BannerUploader } from "@/components/settings/BannerUploader";
import { ProfilePhotoUploader } from "@/components/settings/ProfilePhotoUploader";
import { SettingsField, SettingsTextarea } from "@/components/settings/SettingsField";
import { SettingsPaper } from "@/components/settings/SettingsPaper";
import { SettingsPasswordSection } from "@/components/settings/SettingsPasswordSection";
import StampButton from "@/components/ui/StampButton";
import {
  changeLocalPassword,
  setLocalPassword,
  updateUserProfile,
  uploadSettingsMedia,
  type CurrentUser,
} from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useArchiveToasts } from "@/hooks/useArchiveToasts";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

type SettingsUser = CurrentUser & {
  bio?: string | null;
  location?: string | null;
  createdAt?: string;
};

type SettingsPostSummary = {
  id: number;
  likesCount?: number;
  commentsCount?: number;
};

type ProfileFormState = {
  displayName: string;
  username: string;
  location: string;
  email: string;
  bio: string;
  avatar: string | null;
  banner: string | null;
};

const EMPTY_FORM: ProfileFormState = {
  displayName: "",
  username: "",
  location: "",
  email: "",
  bio: "",
  avatar: null,
  banner: null,
};

function normalizeUserForm(user: SettingsUser): ProfileFormState {
  return {
    displayName: user.displayName || "",
    username: user.username || "",
    location: user.location || "",
    email: user.email || "",
    bio: user.bio || "",
    avatar: user.avatar || null,
    banner: user.banner || null,
  };
}

function toNullable(value: string | null) {
  if (value === null) {
    return null;
  }

  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function formatJoinedDate(value?: string) {
  if (!value) {
    return "Unknown";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(date);
}

export default function SettingsPage() {
  const { user, token, refreshUser } = useAuth();
  const { notifyError, notifySuccess } = useArchiveToasts();

  const [settingsUser, setSettingsUser] = useState<SettingsUser | null>(null);
  const [form, setForm] = useState<ProfileFormState>(EMPTY_FORM);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);
  const [bannerPreviewUrl, setBannerPreviewUrl] = useState<string | null>(null);
  const [posts, setPosts] = useState<SettingsPostSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [stampText, setStampText] = useState("PENDING VERIFICATION");
  const [statusLine, setStatusLine] = useState("No changes recorded yet.");
  const [passwordLine, setPasswordLine] = useState<string | null>(null);
  const [lastSyncAt, setLastSyncAt] = useState(Date.now());
  const [secondsSinceSync, setSecondsSinceSync] = useState(0);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const totalLikes = useMemo(
    () =>
      posts.reduce((sum, post) => sum + (post.likesCount || 0), 0),
    [posts],
  );

  const totalComments = useMemo(
    () =>
      posts.reduce((sum, post) => sum + (post.commentsCount || 0), 0),
    [posts],
  );

  const accountTags = useMemo(
    () => [
      {
        label: settingsUser?.hasPassword ? "#LocalAuth" : "#OAuthOnly",
        active: Boolean(settingsUser?.hasPassword),
        tone: settingsUser?.hasPassword
          ? "border-accent-green/30 text-accent-green"
          : "border-accent-blue/30 text-accent-blue",
      },
      {
        label: form.avatar ? "#AvatarReady" : "#NoAvatar",
        active: Boolean(form.avatar),
        tone: form.avatar
          ? "border-accent-orange/30 text-accent-orange"
          : "border-label/30 text-label",
      },
      {
        label: form.banner ? "#BannerReady" : "#NoBanner",
        active: Boolean(form.banner),
        tone: form.banner
          ? "border-accent-red/30 text-accent-red"
          : "border-label/30 text-label",
      },
    ],
    [form.avatar, form.banner, settingsUser?.hasPassword],
  );

  const updateFormField = <K extends keyof ProfileFormState>(
    field: K,
    value: ProfileFormState[K],
    message: string,
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
    setStampText("PENDING VERIFICATION");
    setStatusLine(message);
  };

  useEffect(() => {
    const interval = window.setInterval(() => {
      setSecondsSinceSync(Math.max(0, Math.floor((Date.now() - lastSyncAt) / 1000)));
    }, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, [lastSyncAt]);

  useEffect(() => {
    return () => {
      if (avatarPreviewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(avatarPreviewUrl);
      }
    };
  }, [avatarPreviewUrl]);

  useEffect(() => {
    return () => {
      if (bannerPreviewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(bannerPreviewUrl);
      }
    };
  }, [bannerPreviewUrl]);

  useEffect(() => {
    if (!token || !user?.id) {
      return;
    }

    const fetchSettingsData = async () => {
      try {
        setLoading(true);

        const [currentUserRes, postsRes] = await Promise.all([
          fetch(`${API_URL}/user`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch(`${API_URL}/users/${user.id}/posts`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

        const [currentUserData, postsData] = await Promise.all([
          currentUserRes.json(),
          postsRes.json(),
        ]);

        if (!currentUserRes.ok) {
          throw new Error(currentUserData.message || "Unable to load settings.");
        }

        if (!postsRes.ok) {
          throw new Error(postsData.message || "Unable to load archive totals.");
        }

        const nextUser = currentUserData as SettingsUser;
        setSettingsUser(nextUser);
        setForm(normalizeUserForm(nextUser));
        setPosts(Array.isArray(postsData) ? postsData : []);
        setStampText("PENDING VERIFICATION");
      } catch (error) {
        console.error("settings fetch error:", error);
        notifyError(
          error instanceof Error ? error.message : "Failed to load settings.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSettingsData();
  }, [notifyError, token, user?.id]);

  const handleAvatarSelect = (file: File) => {
    if (!file.type.startsWith("image/")) {
      notifyError("Only image files are allowed.");
      return;
    }

    if (avatarPreviewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(avatarPreviewUrl);
    }

    const previewUrl = URL.createObjectURL(file);
    setAvatarFile(file);
    setAvatarPreviewUrl(previewUrl);
    setForm((previous) => ({ ...previous, avatar: previewUrl }));
    setStampText("MEDIA STAGED");
    setStatusLine("Profile photo queued for the next commit.");
  };

  const handleBannerSelect = (file: File) => {
    if (!file.type.startsWith("image/")) {
      notifyError("Only image files are allowed.");
      return;
    }

    if (bannerPreviewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(bannerPreviewUrl);
    }

    const previewUrl = URL.createObjectURL(file);
    setBannerFile(file);
    setBannerPreviewUrl(previewUrl);
    setForm((previous) => ({ ...previous, banner: previewUrl }));
    setStampText("MEDIA STAGED");
    setStatusLine("Banner update queued for the next commit.");
  };

  const handleClearAvatar = () => {
    if (avatarPreviewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(avatarPreviewUrl);
    }

    setAvatarFile(null);
    setAvatarPreviewUrl(null);
    setForm((previous) => ({ ...previous, avatar: null }));
    setStampText("PENDING VERIFICATION");
    setStatusLine("Profile photo cleared from the staged record.");
  };

  const handleClearBanner = () => {
    if (bannerPreviewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(bannerPreviewUrl);
    }

    setBannerFile(null);
    setBannerPreviewUrl(null);
    setForm((previous) => ({ ...previous, banner: null }));
    setStampText("PENDING VERIFICATION");
    setStatusLine("Banner cleared from the staged record.");
  };

  const handleProfileSave = async () => {
    if (!token || !user?.id) {
      notifyError("You must be logged in to update settings.");
      return;
    }

    const trimmedUsername = form.username.trim();

    if (!trimmedUsername) {
      notifyError("Username is required.");
      return;
    }

    try {
      setSavingProfile(true);
      setStampText("WRITING TO LEDGER");

      let nextAvatar = form.avatar;
      let nextBanner = form.banner;

      if (avatarFile) {
        const uploadResult = await uploadSettingsMedia(avatarFile, token);

        if (!uploadResult.ok) {
          throw new Error(uploadResult.message || "Unable to upload profile photo.");
        }

        nextAvatar = uploadResult.data.url;
      }

      if (bannerFile) {
        const uploadResult = await uploadSettingsMedia(bannerFile, token);

        if (!uploadResult.ok) {
          throw new Error(uploadResult.message || "Unable to upload banner.");
        }

        nextBanner = uploadResult.data.url;
      }

      const updateResult = await updateUserProfile(user.id, token, {
        username: trimmedUsername,
        displayName: toNullable(form.displayName),
        location: toNullable(form.location),
        bio: toNullable(form.bio),
        avatar: toNullable(nextAvatar),
        banner: toNullable(nextBanner),
      });

      if (!updateResult.ok) {
        throw new Error(updateResult.message || "Unable to save settings.");
      }

      const nextUser = updateResult.data as SettingsUser;
      setSettingsUser(nextUser);
      setForm(normalizeUserForm(nextUser));
      setAvatarFile(null);
      setBannerFile(null);
      setAvatarPreviewUrl(null);
      setBannerPreviewUrl(null);
      setStampText("COMMITTED");
      setStatusLine("Profile configuration committed to the ledger.");
      setLastSyncAt(Date.now());
      await refreshUser();
      notifySuccess("Settings saved.");
    } catch (error) {
      console.error("save settings error:", error);
      setStampText("COMMIT FAILED");
      notifyError(
        error instanceof Error ? error.message : "Failed to save settings.",
      );
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async () => {
    if (!token) {
      notifyError("You must be logged in to update the password.");
      return;
    }

    const { currentPassword, newPassword, confirmPassword } = passwordForm;

    if (!newPassword.trim()) {
      notifyError("A new password is required.");
      return;
    }

    if (settingsUser?.hasPassword && (!currentPassword || !confirmPassword)) {
      notifyError("Complete all password fields.");
      return;
    }

    if (settingsUser?.hasPassword && newPassword !== confirmPassword) {
      notifyError("New password and confirmation do not match.");
      return;
    }

    try {
      setSavingPassword(true);
      setPasswordLine(null);

      const result = settingsUser?.hasPassword
        ? await changeLocalPassword(token, {
            currentPassword,
            newPassword,
            confirmPassword,
          })
        : await setLocalPassword(token, {
            newPassword,
            confirmPassword: newPassword,
          });

      if (!result.ok) {
        throw new Error(result.message || "Unable to update the password.");
      }

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setPasswordLine(result.data.message);
      setStampText("PASSWORD SEALED");
      setStatusLine("Local password state updated and sealed.");
      setLastSyncAt(Date.now());
      await refreshUser();
      setSettingsUser((previous) =>
        previous
          ? {
              ...previous,
              hasPassword: true,
            }
          : previous,
      );
      notifySuccess(result.data.message);
    } catch (error) {
      console.error("password update error:", error);
      setStampText("PASSWORD FAILED");
      notifyError(
        error instanceof Error ? error.message : "Failed to update the password.",
      );
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="flex justify-center">
      <ArchiveFilters />
      <section className="min-w-0 w-full max-w-[896px]">
        {loading ? (
          <section className="archive-paper border border-black/10 px-6 py-8">
            <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.18em] text-label">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading settings archive...
            </div>
          </section>
        ) : settingsUser ? (
          <>
            <SettingsPaper
              title="Profile Configuration"
              subtitle="User Settings / Registry Alpha"
              footer={
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex gap-2">
                    <div className="h-4 w-4 bg-ink" />
                    <div className="h-4 w-4 bg-ink" />
                    <div className="h-4 w-4 bg-ink" />
                  </div>
                  <p className="font-mono text-[8px] uppercase tracking-[0.42em] text-ink">
                    AUTHENTIC FIELD DOCUMENTATION / PROPERTY OF FIELD NOTES
                  </p>
                </div>
              }
            >
              <div className="space-y-6 md:col-span-4">
                <SettingsField
                  label="01. Display name"
                  placeholder="Display name"
                  value={form.displayName}
                  onChange={(event) =>
                    updateFormField(
                      "displayName",
                      event.target.value,
                      "Display name edited. Ready for commit.",
                    )
                  }
                />
                <SettingsField
                  label="02. Username"
                  placeholder="@username"
                  value={form.username}
                  onChange={(event) =>
                    updateFormField(
                      "username",
                      event.target.value,
                      "Username edited. Ready for commit.",
                    )
                  }
                  inputClassName="italic"
                />
                <SettingsField
                  label="03. Location"
                  placeholder="Paris, FR"
                  value={form.location}
                  onChange={(event) =>
                    updateFormField(
                      "location",
                      event.target.value,
                      "Location edited. Ready for commit.",
                    )
                  }
                />
                <SettingsField
                  label="04. Email"
                  type="email"
                  value={form.email}
                  readOnly
                />
                <ProfilePhotoUploader
                  name={form.displayName || form.username || "Field User"}
                  imageUrl={form.avatar}
                  disabled={savingProfile}
                  onSelect={handleAvatarSelect}
                  onClear={handleClearAvatar}
                />
              </div>

              <div className="space-y-6 md:col-span-8">
                <BannerUploader
                  name={form.displayName || form.username || "Field User"}
                  imageUrl={form.banner}
                  disabled={savingProfile}
                  onSelect={handleBannerSelect}
                  onClear={handleClearBanner}
                />

                <SettingsTextarea
                  label="07. Narrative field observations"
                  placeholder="Describe behavior, habitat, and interactions..."
                  value={form.bio}
                  onChange={(event) =>
                    updateFormField(
                      "bio",
                      event.target.value,
                      "Narrative observations edited. Ready for commit.",
                    )
                  }
                />
              </div>

              <div className="md:col-span-12">
                <SettingsPasswordSection
                  hasPassword={Boolean(settingsUser.hasPassword)}
                  currentPassword={passwordForm.currentPassword}
                  newPassword={passwordForm.newPassword}
                  confirmPassword={passwordForm.confirmPassword}
                  saving={savingPassword}
                  message={passwordLine}
                  onCurrentPasswordChange={(value) =>
                    setPasswordForm((previous) => ({
                      ...previous,
                      currentPassword: value,
                    }))
                  }
                  onNewPasswordChange={(value) =>
                    setPasswordForm((previous) => ({
                      ...previous,
                      newPassword: value,
                    }))
                  }
                  onConfirmPasswordChange={(value) =>
                    setPasswordForm((previous) => ({
                      ...previous,
                      confirmPassword: value,
                    }))
                  }
                  onSubmit={handlePasswordSubmit}
                />
              </div>

              <div className="border-t border-dashed border-label/40 pt-6 md:col-span-12">
                <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                  <div className="flex-1">
                    <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.18em] text-label">
                      09. Account Markers
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {accountTags.map((tag) => (
                        <span
                          key={tag.label}
                          className={`rounded-sm border px-2 py-1 font-mono text-xs ${tag.tone} ${
                            tag.active ? "bg-black/5" : "bg-transparent"
                          }`}
                        >
                          {tag.label}
                        </span>
                      ))}
                    </div>
                    <p className="mt-4 text-sm italic text-label">
                      Joined archive: {formatJoinedDate(settingsUser.createdAt)}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-4">
                    <StampButton
                      type="button"
                      textClassName="text-5xl"
                      onClick={handleProfileSave}
                      disabled={savingProfile}
                    >
                      {savingProfile ? "Confirming..." : "Confirm"}
                    </StampButton>
                  </div>
                </div>
              </div>
            </SettingsPaper>

            <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2 font-mono text-[10px] italic text-label">
                <div className="h-2 w-2 rounded-full bg-accent-orange" />
                Auto-save disabled: last sync {secondsSinceSync}s ago
              </div>

              <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-label">
                <RefreshCcw className="h-3 w-3" />
                {statusLine}
              </div>
            </div>
          </>
        ) : (
          <section className="archive-paper border border-black/10 px-6 py-8">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-label">
              Unable to resolve the account record.
            </p>
          </section>
        )}
      </section>

    </div>
  );
}
