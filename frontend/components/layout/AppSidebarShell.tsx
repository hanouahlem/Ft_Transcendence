"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { usePathname, useRouter } from "next/navigation";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { LiveInboxToasts } from "@/components/layout/LiveInboxToasts";
import { NatureCanvas } from "@/components/layout/NatureCanvas";
import { Sidebar } from "@/components/layout/Sidebar";
import { NewPostDialog } from "@/components/posts/NewPostDialog";
import { archiveToaster } from "@/components/ui/toaster";
import { useAuth } from "@/context/AuthContext";
import { InboxUnreadProvider, useInboxUnread } from "@/context/InboxUnreadContext";
import { SocketProvider } from "@/context/SocketContext";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n/I18nProvider";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function AppSidebarShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const { token } = useAuth();

  return (
    <SocketProvider key={token ?? "anonymous"}>
      <InboxUnreadProvider>
        <AppSidebarShellContent>{children}</AppSidebarShellContent>
      </InboxUnreadProvider>
    </SocketProvider>
  );
}

function AppSidebarShellContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, token, logout } = useAuth();
  const { unreadMessagesCount, unreadNotificationsCount } = useInboxUnread();
  const { isRtl, t } = useI18n();
  const isMessagePage = pathname === "/message";

  const [createOpen, setCreateOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [composerResetToken, setComposerResetToken] = useState(0);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  useEffect(() => {
    const handleCreatePost = () => {
      setCreateOpen(true);
    };

    window.addEventListener("archive:create-post", handleCreatePost);
    return () => {
      window.removeEventListener("archive:create-post", handleCreatePost);
    };
  }, []);

  const notifyError = (description: string) => {
    archiveToaster.error({
      title: t("common.error"),
      description,
      duration: 6000,
    });
  };

  const notifySuccess = (description: string) => {
    archiveToaster.success({
      title: t("common.fieldNotice"),
      description,
    });
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const handleOpenFilePicker = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleRemoveFile = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedFile(null);
    setPreviewUrl("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const resetComposer = () => {
    setComposerResetToken((previous) => previous + 1);
    handleRemoveFile();
    setCreateOpen(false);
  };

  const handlePublish = async (content: string) => {
    const trimmedContent = content.trim();

    if (!trimmedContent) {
      notifyError(t("toasts.needContent"));
      return;
    }

    if (!token) {
      notifyError(t("toasts.needLogin"));
      return;
    }

    try {
      setPublishing(true);

      const formData = new FormData();
      formData.append("content", trimmedContent);

      if (selectedFile) {
        formData.append("media", selectedFile);
      }

      const res = await fetch(`${API_URL}/posts`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message || t("toasts.publishFailed"),
        );
      }

      notifySuccess(t("toasts.published"));
      if (data.post) {
        window.dispatchEvent(
          new CustomEvent("archive:post-created", {
            detail: data.post,
          }),
        );
      }
      resetComposer();
    } catch (err) {
      notifyError(
        err instanceof Error
          ? err.message
          : t("toasts.publishFailed"),
      );
    } finally {
      setPublishing(false);
    }
  };

  return (
    <ProtectedRoute>
      <main className="archive-page relative min-h-screen overflow-x-hidden text-ink">
        <NatureCanvas />

        <div
          className={cn(
            "relative z-10 min-h-screen",
            isRtl ? "lg:pr-[76px]" : "lg:pl-[76px]",
          )}
        >
          <LiveInboxToasts />

          <Sidebar
            user={user}
            unreadMessagesCount={unreadMessagesCount}
            unreadNotificationsCount={unreadNotificationsCount}
            onCreatePost={() => setCreateOpen(true)}
            onLogout={handleLogout}
          />

          <div
            className={cn(
              "w-full",
              isMessagePage
                ? "min-h-screen max-w-none px-0 py-0"
                : "mx-auto max-w-[1132px] px-4 py-10 sm:px-6 lg:px-10 lg:py-12",
            )}
          >
            {children}
          </div>

          <NewPostDialog
            open={createOpen}
            resetToken={composerResetToken}
            previewUrl={previewUrl}
            selectedFileName={selectedFile?.name || ""}
            publishing={publishing}
            onClose={resetComposer}
            onPublish={handlePublish}
            onOpenFilePicker={handleOpenFilePicker}
            onRemoveFile={handleRemoveFile}
          />

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </main>
    </ProtectedRoute>
  );
}
