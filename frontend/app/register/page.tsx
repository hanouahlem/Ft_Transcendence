"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Leaf, ShieldCheck, Sparkles } from "lucide-react";
import { registerUser } from "@/lib/api";

export default function RegisterPage() {
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
      await registerUser({ username, email, password });

      setSuccess(true);
      setUsername("");
      setEmail("");
      setPassword("");
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Unable to create account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f6f1e8] text-[#2f3a32]">
      <section className="relative overflow-hidden px-6 py-12 lg:px-8">
        {/* Background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(125,148,112,0.18),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(216,207,184,0.35),transparent_30%)]" />
        <div className="absolute left-[-60px] top-20 h-72 w-72 rounded-full bg-[#dbe4d3]/40 blur-3xl" />
        <div className="absolute bottom-0 right-[-60px] h-80 w-80 rounded-full bg-[#ddd1bb]/50 blur-3xl" />

        <div className="relative mx-auto grid min-h-[calc(100vh-6rem)] max-w-6xl items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          {/* Left side */}
          <div className="hidden lg:block">
            <div className="max-w-xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#d8cfbe] bg-[#eef3e8] px-4 py-2 text-sm font-medium text-[#64785f]">
                <Leaf className="h-4 w-4" />
                Calm social blogging experience
              </div>

              <h1 className="text-5xl font-bold leading-tight tracking-tight text-[#2f3a32]">
                Create your space in a softer, warmer social universe
              </h1>

              <p className="mt-6 text-lg leading-8 text-[#667066]">
                Join a platform designed for storytelling, connection, and clean
                visual sharing with an elegant editorial atmosphere.
              </p>

              <div className="mt-10 space-y-4">
                <div className="flex items-start gap-4 rounded-2xl border border-[#ddd3c2] bg-[#fffaf2]/80 p-4 shadow-sm">
                  <div className="rounded-xl bg-[#eef3e8] p-2 text-[#6f8467]">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-[#2f3a32]">
                      Elegant onboarding
                    </p>
                    <p className="mt-1 text-sm leading-6 text-[#697268]">
                      A clean and welcoming entry point for your users.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 rounded-2xl border border-[#ddd3c2] bg-[#fffaf2]/80 p-4 shadow-sm">
                  <div className="rounded-xl bg-[#f3ecdf] p-2 text-[#8a7a5d]">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-[#2f3a32]">
                      Familiar logic
                    </p>
                    <p className="mt-1 text-sm leading-6 text-[#697268]">
                      Same backend communication, same form behavior, new visual
                      identity only.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right side / form */}
          <div className="mx-auto w-full max-w-md">
            <div className="rounded-[2rem] border border-[#ddd3c2] bg-[#fffaf2]/90 p-8 shadow-[0_20px_60px_rgba(92,108,91,0.12)] backdrop-blur-xl sm:p-10">
              <div className="mb-8">
                <p className="mb-3 text-xs uppercase tracking-[0.28em] text-[#7a8d72]">
                  ft_transcendence
                </p>

                <h1 className="text-3xl font-bold tracking-tight text-[#2f3a32]">
                  Create your account
                </h1>

                <p className="mt-3 text-sm leading-6 text-[#6b746c]">
                  Join the platform and start building your social space in a
                  warm and modern interface.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label
                    htmlFor="username"
                    className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#7a8376]"
                  >
                    Username
                  </label>
                  <input
                    id="username"
                    type="text"
                    placeholder="your_username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="w-full rounded-2xl border border-[#d8cfbe] bg-[#fcf8f1] px-4 py-3 text-sm text-[#2f3a32] outline-none transition placeholder:text-[#9aa296] focus:border-[#91a387] focus:ring-4 focus:ring-[#dfe8d7]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#7a8376]"
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
                    className="w-full rounded-2xl border border-[#d8cfbe] bg-[#fcf8f1] px-4 py-3 text-sm text-[#2f3a32] outline-none transition placeholder:text-[#9aa296] focus:border-[#91a387] focus:ring-4 focus:ring-[#dfe8d7]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#7a8376]"
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
                    className="w-full rounded-2xl border border-[#d8cfbe] bg-[#fcf8f1] px-4 py-3 text-sm text-[#2f3a32] outline-none transition placeholder:text-[#9aa296] focus:border-[#91a387] focus:ring-4 focus:ring-[#dfe8d7]"
                  />
                </div>

                {success && (
                  <div className="rounded-2xl border border-[#b7c9ae] bg-[#edf4e8] px-4 py-3 text-sm text-[#5f7358]">
                    Account created successfully.
                  </div>
                )}

                {error && (
                  <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-3 rounded-2xl bg-[#6f8467] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#5f7358] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading && (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  )}
                  {loading ? "Creating..." : "Create account"}
                  {!loading && <ArrowRight className="h-4 w-4" />}
                </button>
              </form>

              <div className="mt-8 border-t border-[#e5dccd] pt-6 text-center">
                <p className="mb-3 text-sm text-[#7a8376]">
                  Already have an account?
                </p>

                <Link
                  href="/login"
                  className="inline-flex w-full items-center justify-center rounded-2xl border border-[#d8cfbe] bg-[#faf5eb] px-4 py-3 text-sm font-semibold text-[#4c584d] transition hover:bg-[#f3ecdf]"
                >
                  Login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}