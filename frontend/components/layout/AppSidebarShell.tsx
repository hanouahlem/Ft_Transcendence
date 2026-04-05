"use client";

import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { ArchiveSidebar } from "@/components/archive/ArchiveSidebar";
import { NatureCanvas } from "@/components/archive/NatureCanvas";
import { useAuth } from "@/context/AuthContext";

export default function AppSidebarShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <ProtectedRoute>
      <main className="archive-page relative min-h-screen overflow-x-hidden text-field-ink">
        <NatureCanvas />

        <div className="relative z-10 min-h-screen lg:pl-[76px]">
          <ArchiveSidebar
            user={user}
            onCreatePost={() => router.push("/feed")}
            onLogout={handleLogout}
          />

          <div className="mx-auto w-full max-w-[1132px] px-4 py-10 sm:px-6 lg:px-10 lg:py-12">
            {children}
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
}
