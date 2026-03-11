"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { loginUser } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  setLoading(true);
  setError("");

  try {
    const data = await loginUser({ email, password });

    if (data.token) {
      await login(data.token);
      router.push("/profil");
    } else {
      setError("Token not received.");
    }
  } catch (err) {
    console.error(err);
    setError(err instanceof Error ? err.message : "Login failed.");
  } finally {
    setLoading(false);
  }
};

  return (
    <section className="flex min-h-screen items-center justify-center bg-neutral-950 px-6 py-10 text-white">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-md">
        <div className="mb-8">
          <p className="mb-2 text-xs uppercase tracking-[0.25em] text-orange-400">
            ft_transcendence
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Welcome back
          </h1>
          <p className="mt-2 text-sm text-white/60">
            Sign in to access your profile, friends, and notifications.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-white/50"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-orange-500/60"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-white/50"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-orange-500/60"
            />
          </div>

          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-3 rounded-xl bg-orange-500 px-4 py-3 text-sm font-bold uppercase tracking-[0.15em] text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>

        <div className="mt-8 border-t border-white/10 pt-6 text-center">
          <p className="mb-3 text-sm text-white/45">Don’t have an account?</p>
          <Link
            href="/register"
            className="inline-flex w-full items-center justify-center rounded-xl border border-white/15 px-4 py-3 text-sm font-semibold uppercase tracking-[0.15em] text-white/70 transition hover:border-orange-500/50 hover:text-white"
          >
            Create account
          </Link>
        </div>
      </div>
    </section>
  );
}