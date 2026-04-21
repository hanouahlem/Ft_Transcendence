"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { LiveInboxToasts } from "@/components/layout/LiveInboxToasts";
import { NatureCanvas } from "@/components/layout/NatureCanvas";
import { Sidebar } from "@/components/layout/Sidebar";
import { NewPostDialog } from "@/components/posts/NewPostDialog";
import { useAuth } from "@/context/AuthContext";
import { InboxUnreadProvider, useInboxUnread } from "@/context/InboxUnreadContext";
import { SocketProvider } from "@/context/SocketContext";
import { useCreatePost } from "@/hooks/useCreatePost";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n/I18nProvider";

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
  const { user, logout } = useAuth();
  const { unreadMessagesCount, unreadNotificationsCount } = useInboxUnread();
  const { isRtl, t } = useI18n();
  const isMessagePage = pathname === "/message";

  const [createOpen, setCreateOpen] = useState(false);
  const { createPost, publishing } = useCreatePost();

  useEffect(() => {
    const handleCreatePost = () => {
      setCreateOpen(true);
    };

    window.addEventListener("archive:create-post", handleCreatePost);
    return () => {
      window.removeEventListener("archive:create-post", handleCreatePost);
    };
  }, []);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const handleCloseComposer = () => {
    setCreateOpen(false);
  };

  const handlePublish = async (content: string, file: File | null) => {
    const post = await createPost(content, file);

    window.dispatchEvent(
      new CustomEvent("archive:post-created", {
        detail: post,
      }),
    );

    setCreateOpen(false);
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
            key={pathname}
            open={createOpen}
            publishing={publishing}
            onClose={handleCloseComposer}
            onPublish={handlePublish}
          />
        </div>
      </main>
    </ProtectedRoute>
  );
}
