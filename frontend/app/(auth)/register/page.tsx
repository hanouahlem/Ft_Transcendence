"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import RegisterPaperCard from "@/components/auth/register/RegisterPaperCard";
import AuthPageShell from "@/components/auth/shared/AuthPageShell";
import { registerUser } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const GITHUB_OAUTH_URL =
  `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/auth/github`;
const FORTYTWO_OAUTH_URL =
  `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/auth/42`;

export default function RegisterPage() {
  const router = useRouter();
  const { isLoggedIn, isAuthLoading } = useAuth();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAuthLoading && isLoggedIn) {
      router.replace("/feed");
    }
  }, [isLoggedIn, isAuthLoading, router]);

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
    setSuccess(false);
    setError("");

    try {
      const result = await registerUser({ username, email, password });

      if (!result.ok) {
        setError(result.message);
        return;
      }

      setSuccess(true);
      setUsername("");
      setEmail("");
      setPassword("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthPageShell
      panelAlign="left"
      footer={
        <p className="inline-block border border-label/20 bg-paper-muted px-4 py-2 font-mono text-[11px] uppercase tracking-[0.3em] text-ink/65">
          Have an account?
          <Link
            href="/login"
            className="ml-2 font-bold text-accent-orange underline decoration-dotted underline-offset-4"
          >
            Access your log
          </Link>
        </p>
      }
    >
      <RegisterPaperCard
        username={username}
        email={email}
        password={password}
        loading={loading}
        success={success}
        error={error}
        dateLabel={dateLabel}
        fortyTwoHref={FORTYTWO_OAUTH_URL}
        githubHref={GITHUB_OAUTH_URL}
        onUsernameChange={(event) => setUsername(event.target.value)}
        onEmailChange={(event) => setEmail(event.target.value)}
        onPasswordChange={(event) => setPassword(event.target.value)}
        onSubmit={handleSubmit}
      />
    </AuthPageShell>
  );
}
