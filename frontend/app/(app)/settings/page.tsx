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
import { useI18n } from "@/i18n/I18nProvider";

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

function formatJoinedDate(value: string | undefined, locale: string, fallback: string) {
  if (!value) {
    return fallback;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return fallback;
  }

  return new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(date);
}

export default function SettingsPage() {
  const { user, token, refreshUser } = useAuth();
  const { notifyError, notifySuccess } = useArchiveToasts();
  const { locale, t } = useI18n();

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
  const [stampText, setStampText] = useState(t("settingsPage.stamp.pending"));
  const [statusLine, setStatusLine] = useState(t("settingsPage.status.idle"));
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
    setStampText(t("settingsPage.stamp.pending"));
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
          throw new Error(currentUserData.message || t("settingsPage.errors.loadSettings"));
        }

        if (!postsRes.ok) {
          throw new Error(postsData.message || t("settingsPage.errors.loadTotals"));
        }

        const nextUser = currentUserData as SettingsUser;
        setSettingsUser(nextUser);
        setForm(normalizeUserForm(nextUser));
        setPosts(Array.isArray(postsData) ? postsData : []);
        setStampText(t("settingsPage.stamp.pending"));
      } catch (error) {
        console.error("settings fetch error:", error);
        notifyError(
          error instanceof Error ? error.message : t("settingsPage.errors.loadFallback"),
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSettingsData();
  }, [notifyError, token, user?.id]);

  const handleAvatarSelect = (file: File) => {
    if (!file.type.startsWith("image/")) {
      notifyError(t("settingsPage.errors.imageOnly"));
      return;
    }

    if (avatarPreviewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(avatarPreviewUrl);
    }

    const previewUrl = URL.createObjectURL(file);
    setAvatarFile(file);
    setAvatarPreviewUrl(previewUrl);
    setForm((previous) => ({ ...previous, avatar: previewUrl }));
    setStampText(t("settingsPage.stamp.media"));
    setStatusLine(t("settingsPage.status.avatarQueued"));
  };

  const handleBannerSelect = (file: File) => {
    if (!file.type.startsWith("image/")) {
      notifyError(t("settingsPage.errors.imageOnly"));
      return;
    }

    if (bannerPreviewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(bannerPreviewUrl);
    }

    const previewUrl = URL.createObjectURL(file);
    setBannerFile(file);
    setBannerPreviewUrl(previewUrl);
    setForm((previous) => ({ ...previous, banner: previewUrl }));
    setStampText(t("settingsPage.stamp.media"));
    setStatusLine(t("settingsPage.status.bannerQueued"));
  };

  const handleClearAvatar = () => {
    if (avatarPreviewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(avatarPreviewUrl);
    }

    setAvatarFile(null);
    setAvatarPreviewUrl(null);
    setForm((previous) => ({ ...previous, avatar: null }));
    setStampText(t("settingsPage.stamp.pending"));
    setStatusLine(t("settingsPage.status.avatarCleared"));
  };

  const handleClearBanner = () => {
    if (bannerPreviewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(bannerPreviewUrl);
    }

    setBannerFile(null);
    setBannerPreviewUrl(null);
    setForm((previous) => ({ ...previous, banner: null }));
    setStampText(t("settingsPage.stamp.pending"));
    setStatusLine(t("settingsPage.status.bannerCleared"));
  };

  const handleProfileSave = async () => {
    if (!token || !user?.id) {
      notifyError(t("settingsPage.errors.loginRequired"));
      return;
    }

    const trimmedUsername = form.username.trim();

    if (!trimmedUsername) {
      notifyError(t("settingsPage.errors.usernameRequired"));
      return;
    }

    try {
      setSavingProfile(true);
      setStampText(t("settingsPage.stamp.writing"));

      let nextAvatar = form.avatar;
      let nextBanner = form.banner;

      if (avatarFile) {
        const uploadResult = await uploadSettingsMedia(avatarFile, token);

        if (!uploadResult.ok) {
          throw new Error(uploadResult.message || t("settingsPage.errors.uploadAvatar"));
        }

        nextAvatar = uploadResult.data.url;
      }

      if (bannerFile) {
        const uploadResult = await uploadSettingsMedia(bannerFile, token);

        if (!uploadResult.ok) {
          throw new Error(uploadResult.message || t("settingsPage.errors.uploadBanner"));
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
        throw new Error(updateResult.message || t("settingsPage.errors.save"));
      }

      const nextUser = updateResult.data as SettingsUser;
      setSettingsUser(nextUser);
      setForm(normalizeUserForm(nextUser));
      setAvatarFile(null);
      setBannerFile(null);
      setAvatarPreviewUrl(null);
      setBannerPreviewUrl(null);
      setStampText(t("settingsPage.stamp.committed"));
      setStatusLine(t("settingsPage.status.profileCommitted"));
      setLastSyncAt(Date.now());
      await refreshUser();
      notifySuccess(t("settingsPage.toasts.saved"));
    } catch (error) {
      console.error("save settings error:", error);
      setStampText(t("settingsPage.stamp.commitFailed"));
      notifyError(
        error instanceof Error ? error.message : t("settingsPage.errors.saveFallback"),
      );
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async () => {
    if (!token) {
      notifyError(t("settingsPage.errors.passwordLoginRequired"));
      return;
    }

    const { currentPassword, newPassword, confirmPassword } = passwordForm;

    if (!newPassword.trim()) {
      notifyError(t("settingsPage.errors.newPasswordRequired"));
      return;
    }

    if (settingsUser?.hasPassword && (!currentPassword || !confirmPassword)) {
      notifyError(t("settingsPage.errors.completePasswordFields"));
      return;
    }

    if (settingsUser?.hasPassword && newPassword !== confirmPassword) {
      notifyError(t("settingsPage.errors.passwordMismatch"));
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
        throw new Error(result.message || t("settingsPage.errors.passwordUpdate"));
      }

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setPasswordLine(result.data.message);
      setStampText(t("settingsPage.stamp.passwordSealed"));
      setStatusLine(t("settingsPage.status.passwordSealed"));
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
      setStampText(t("settingsPage.stamp.passwordFailed"));
      notifyError(
        error instanceof Error ? error.message : t("settingsPage.errors.passwordUpdateFallback"),
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
              {t("settingsPage.loading")}
            </div>
          </section>
        ) : settingsUser ? (
          <>
            <SettingsPaper
              title={t("settingsPage.paper.title")}
              subtitle={t("settingsPage.paper.subtitle")}
              footer={
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex gap-2">
                    <div className="h-4 w-4 bg-ink" />
                    <div className="h-4 w-4 bg-ink" />
                    <div className="h-4 w-4 bg-ink" />
                  </div>
                  <p className="font-mono text-[8px] uppercase tracking-[0.42em] text-ink">
                    {t("settingsPage.paper.footer")}
                  </p>
                </div>
              }
            >
              <div className="space-y-6 md:col-span-4">
                {/*
                  Translation note:
                  all visible field labels/placeholders route through `t(...)`
                  so this settings page stays consistent across EN/FR/ES/AR.
                */}
                <SettingsField
                  label={t("settingsPage.fields.displayNameLabel")}
                  placeholder={t("settingsPage.fields.displayNamePlaceholder")}
                  value={form.displayName}
                  onChange={(event) =>
                    updateFormField(
                      "displayName",
                      event.target.value,
                      t("settingsPage.status.displayNameEdited"),
                    )
                  }
                />
                <SettingsField
                  label={t("settingsPage.fields.usernameLabel")}
                  placeholder={t("settingsPage.fields.usernamePlaceholder")}
                  value={form.username}
                  onChange={(event) =>
                    updateFormField(
                      "username",
                      event.target.value,
                      t("settingsPage.status.usernameEdited"),
                    )
                  }
                  inputClassName="italic"
                />
                <SettingsField
                  label={t("settingsPage.fields.locationLabel")}
                  placeholder={t("settingsPage.fields.locationPlaceholder")}
                  value={form.location}
                  onChange={(event) =>
                    updateFormField(
                      "location",
                      event.target.value,
                      t("settingsPage.status.locationEdited"),
                    )
                  }
                />
                <SettingsField
                  label={t("settingsPage.fields.emailLabel")}
                  type="email"
                  value={form.email}
                  readOnly
                />
                <ProfilePhotoUploader
                  name={form.displayName || form.username || t("sidebar.profileFallback")}
                  imageUrl={form.avatar}
                  disabled={savingProfile}
                  onSelect={handleAvatarSelect}
                  onClear={handleClearAvatar}
                />
              </div>

              <div className="space-y-6 md:col-span-8">
                <BannerUploader
                  name={form.displayName || form.username || t("sidebar.profileFallback")}
                  imageUrl={form.banner}
                  disabled={savingProfile}
                  onSelect={handleBannerSelect}
                  onClear={handleClearBanner}
                />

                <SettingsTextarea
                  label={t("settingsPage.fields.bioLabel")}
                  placeholder={t("settingsPage.fields.bioPlaceholder")}
                  value={form.bio}
                  onChange={(event) =>
                    updateFormField(
                      "bio",
                      event.target.value,
                      t("settingsPage.status.bioEdited"),
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
                      {t("settingsPage.accountMarkers")}
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {accountTags.map((tag) => (
                        <span
                          key={tag.label}
                          className={`rounded-sm border px-2 py-1 font-mono text-xs ${tag.tone} ${tag.active ? "bg-black/5" : "bg-transparent"
                            }`}
                        >
                          {tag.label}
                        </span>
                      ))}
                    </div>
                    <p className="mt-4 text-sm italic text-label">
                      {t("settingsPage.joinedArchive", {
                        date: formatJoinedDate(
                          settingsUser.createdAt,
                          locale,
                          t("settingsPage.unknown"),
                        ),
                      })}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-4">
                    <StampButton
                      type="button"
                      textClassName="text-5xl"
                      onClick={handleProfileSave}
                      disabled={savingProfile}
                    >
                      {savingProfile ? t("settingsPage.confirming") : t("settingsPage.confirm")}
                    </StampButton>
                  </div>
                </div>
              </div>
            </SettingsPaper>

            <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2 font-mono text-[10px] italic text-label">
                <div className="h-2 w-2 rounded-full bg-accent-orange" />
                {t("settingsPage.lastSync", { seconds: secondsSinceSync })}
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
              {t("settingsPage.unableToResolve")}
            </p>
          </section>
        )}
      </section>

    </div>
  );
}
