"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isLoggedIn, isAuthLoading } = useAuth();

  useEffect(() => {
    if (!isAuthLoading && !isLoggedIn) {
      router.push("/login");
    }
  }, [isAuthLoading, isLoggedIn, router]);

  if (isAuthLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f1e8] text-[#2f3a32]">
        <p className="text-sm text-[#6b746c]">Loading...</p>
      </div>
    );
  }

  if (!isLoggedIn) {
    return null;
  }

  return <>{children}</>;
}