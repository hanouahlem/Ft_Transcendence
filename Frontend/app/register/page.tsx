"use client";

import Link from "next/link";
import { useState } from "react";

export default function Signup() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setError("");

    try {
      const res = await fetch("http://localhost:3001/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.message || "Une erreur est survenue lors de l’inscription.");
        return;
      }

      console.log(data);
      setSuccess(true);
      setUsername("");
      setEmail("");
      setPassword("");
    } catch (err) {
      console.error("Erreur :", err);
      setError("Impossible de contacter le serveur.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative flex min-h-[calc(100vh-80px)] items-center justify-center overflow-hidden bg-neutral-950 px-6 py-12">
      <div className="absolute right-[-120px] top-[-120px] h-80 w-80 rounded-full bg-orange-500/10 blur-3xl" />
      <div className="absolute bottom-[-120px] left-[-120px] h-80 w-80 rounded-full bg-amber-400/10 blur-3xl" />

      <div className="relative w-full max-w-md border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-md sm:p-10">
        <div className="pointer-events-none absolute left-0 top-0 h-5 w-5 border-l-2 border-t-2 border-orange-500" />
        <div className="pointer-events-none absolute right-0 top-0 h-5 w-5 border-r-2 border-t-2 border-orange-500" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-5 w-5 border-b-2 border-l-2 border-orange-500" />
        <div className="pointer-events-none absolute bottom-0 right-0 h-5 w-5 border-b-2 border-r-2 border-orange-500" />

        <div className="mb-8">
          <p className="mb-2 text-xs uppercase tracking-[0.25em] text-orange-400">
            ft_transcendence
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Create account
          </h1>
          <p className="mt-2 text-sm text-white/60">
            Rejoins la plateforme et crée ton profil pour commencer.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="username"
              className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-white/50"
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              placeholder="your_nickname"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-orange-500/70 focus:bg-orange-500/5"
            />
          </div>

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
              className="w-full border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-orange-500/70 focus:bg-orange-500/5"
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
              className="w-full border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-orange-500/70 focus:bg-orange-500/5"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-3 bg-orange-500 px-4 py-3 text-sm font-bold uppercase tracking-[0.18em] text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading && (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            )}
            {loading ? "Creating..." : "Sign up"}
          </button>

          {success && (
            <div className="border border-green-500/30 bg-green-500/10 px-4 py-3 text-center text-sm text-green-400">
              ✓ Account created successfully!
            </div>
          )}

          {error && (
            <div className="border border-red-500/30 bg-red-500/10 px-4 py-3 text-center text-sm text-red-400">
              {error}
            </div>
          )}
        </form>

        <div className="mt-8 border-t border-white/10 pt-6 text-center">
          <p className="mb-3 text-sm text-white/45">Already have an account?</p>

          <Link
            href="/login"
            className="inline-flex w-full items-center justify-center border border-white/15 px-4 py-3 text-sm font-semibold uppercase tracking-[0.15em] text-white/70 transition hover:border-orange-500/50 hover:text-white"
          >
            Log in
          </Link>
        </div>
      </div>
    </section>
  );
}