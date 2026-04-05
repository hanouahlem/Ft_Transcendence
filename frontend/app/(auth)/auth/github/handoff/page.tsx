"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function GitHubHandoffPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isLoggedIn, isAuthLoading } = useAuth();

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    const token = searchParams.get("token");
    const oauthError = searchParams.get("error");

    if (oauthError) {
      router.replace(`/login?error=${encodeURIComponent(oauthError)}`);
      return;
    }

    if (isLoggedIn) {
      router.replace("/feed");
      return;
    }

    if (!token) {
      const fallbackError = "GitHub login did not return a token.";
      router.replace(`/login?error=${encodeURIComponent(fallbackError)}`);
      return;
    }

    let cancelled = false;

    const completeOAuthLogin = async () => {
      try {
        const loginSucceeded = await login(token);

        if (!loginSucceeded) {
          const message = "GitHub login failed while loading your account.";

          if (!cancelled) {
            router.replace(`/login?error=${encodeURIComponent(message)}`);
          }

          return;
        }

        if (!cancelled) {
          router.replace("/feed");
        }
      } catch (loginError) {
        const message =
          loginError instanceof Error
            ? loginError.message
            : "GitHub login failed.";

        if (!cancelled) {
          router.replace(`/login?error=${encodeURIComponent(message)}`);
        }
      }
    };

    void completeOAuthLogin();

    return () => {
      cancelled = true;
    };
  }, [isAuthLoading, isLoggedIn, login, router, searchParams]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-field-stage px-6 text-field-ink">
      <div className="w-full max-w-md border border-field-label/20 bg-field-paper px-8 py-10 shadow-[0_20px_50px_rgba(0,0,0,0.18)]">
        <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-field-label">
          GitHub Authentication
        </p>
        <h1 className="mt-4 font-display text-3xl font-black uppercase tracking-[-0.03em]">
          Completing sign-in
        </h1>
        <p className="mt-4 font-mono text-sm leading-6 text-field-label">
          We are finalizing your GitHub login and loading your account.
        </p>
      </div>
    </main>
  );
}
