"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { loginUser } from "@/lib/api";
import LoginPaperCard from "@/components/auth/login/LoginPaperCard";
import AuthPageShell from "@/components/auth/shared/AuthPageShell";
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
    <AuthPageShell
      panelAlign="right"
      footer={
        <p className="inline-block border border-label/20 bg-paper-muted px-4 py-2 font-mono text-[11px] uppercase tracking-[0.3em] text-ink/65">
          Not a member?
          <Link
            href="/register"
            className="ml-2 font-bold text-accent-orange underline decoration-dotted underline-offset-4"
          >
            Apply for credentials
          </Link>
        </p>
      }
    >
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
    </AuthPageShell>
  );
}
