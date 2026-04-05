"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { loginUser } from "@/lib/api";
import AuthGreenPanel from "@/components/auth/shared/AuthGreenPanel";
import AccentBeads from "@/components/decor/AccentBeads";
import ArchiveFilters from "@/components/decor/ArchiveFilters";
import LoginPaperCard from "@/components/auth/login/LoginPaperCard";
import { useAuth } from "@/context/AuthContext";

const GITHUB_OAUTH_URL =
  `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/auth/github`;
const FORTYTWO_OAUTH_URL =
  `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/auth/42`;

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isLoggedIn, isAuthLoading } = useAuth();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAuthLoading && isLoggedIn) {
      router.replace("/feed");
    }
  }, [isAuthLoading, isLoggedIn, router]);

  useEffect(() => {
    const oauthError = searchParams.get("error");

    if (oauthError) {
      setError(oauthError);
    }
  }, [searchParams]);

  if (isAuthLoading || isLoggedIn) {
    return null;
  }

  const dateLabel = new Date()
    .toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    })
    .toUpperCase();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await loginUser({ identifier, password });

      if (!result.ok) {
        setError(result.message);
        return;
      }

      if (result.data.token) {
        const loginSucceeded = await login(result.data.token);

        if (!loginSucceeded) {
          setError("Login failed while loading your account.");
          return;
        }

        router.push("/feed");
        return;
      }

      setError("Token not received.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="relative min-h-screen overflow-hidden bg-stage antialiased"
      style={{
        backgroundImage:
          "linear-gradient(rgba(26,26,26,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(26,26,26,0.05) 1px, transparent 1px)",
        backgroundSize: "40px 40px",
      }}
    >
      <ArchiveFilters />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[69rem] items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="relative flex w-full flex-col gap-6 lg:h-[700px] lg:justify-center">
          <AuthGreenPanel align="right" />

          <LoginPaperCard
            email={identifier}
            password={password}
            loading={loading}
            error={error}
            dateLabel={dateLabel}
            fortyTwoHref={FORTYTWO_OAUTH_URL}
            githubHref={GITHUB_OAUTH_URL}
            onEmailChange={(event) => setIdentifier(event.target.value)}
            onPasswordChange={(event) => setPassword(event.target.value)}
            onSubmit={handleSubmit}
          />

          <AccentBeads
            className="absolute z-30 hidden lg:left-0 lg:top-[20%] lg:flex lg:translate-x-1/2"
            vertical
          />

          <div className="text-center lg:absolute lg:-bottom-16 lg:left-0 lg:right-0">
            <p className="inline-block border border-label/20 bg-paper-muted px-4 py-2 font-mono text-[11px] uppercase tracking-[0.3em] text-ink/65">
              Not a member?
              <Link
                href="/register"
                className="ml-2 font-bold text-accent-orange underline decoration-dotted underline-offset-4"
              >
                Apply for credentials
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
