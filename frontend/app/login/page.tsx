"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Leaf, LockKeyhole, ArrowRight } from "lucide-react";
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
    <main className="relative min-h-screen overflow-hidden bg-[#f6f1e8] text-[#2f3a32]">
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(125,148,112,0.16),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(216,207,184,0.38),transparent_35%)]" />
      <div className="absolute left-[-80px] top-24 h-72 w-72 rounded-full bg-[#dbe4d3]/50 blur-3xl" />
      <div className="absolute bottom-[-60px] right-[-40px] h-80 w-80 rounded-full bg-[#e2d6c3]/60 blur-3xl" />

      <section className="relative flex min-h-screen items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* top intro */}
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#d8cfbe] bg-[#eef3e8] shadow-sm">
              <Leaf className="h-7 w-7 text-[#6f8467]" />
            </div>

            <p className="text-xs uppercase tracking-[0.28em] text-[#7a8d72]">
              ft_transcendence
            </p>

            <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#2f3a32]">
              Welcome back
            </h1>

            <p className="mt-3 text-sm leading-6 text-[#6b746c]">
              Sign in to continue to your profile, community, and notifications.
            </p>
          </div>

          {/* card */}
          <div className="rounded-[2rem] border border-[#ddd3c2] bg-[#fffaf2]/92 p-8 shadow-[0_20px_60px_rgba(92,108,91,0.12)] backdrop-blur-xl sm:p-10">
            <div className="mb-6 rounded-2xl border border-[#e4dacb] bg-[#faf5eb] p-4">
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-[#eef3e8] p-2 text-[#6f8467]">
                  <LockKeyhole className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#2f3a32]">
                    Secure access
                  </p>
                  <p className="mt-1 text-xs leading-5 text-[#6b746c]">
                    Same authentication logic, redesigned with a calmer and more
                    minimal interface.
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
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
                {loading ? "Signing in..." : "Login"}
                {!loading && <ArrowRight className="h-4 w-4" />}
              </button>
            </form>

            <div className="mt-8 border-t border-[#e5dccd] pt-6 text-center">
              <p className="mb-3 text-sm text-[#7a8376]">
                Don’t have an account?
              </p>

              <Link
                href="/register"
                className="inline-flex w-full items-center justify-center rounded-2xl border border-[#d8cfbe] bg-[#faf5eb] px-4 py-3 text-sm font-semibold text-[#4c584d] transition hover:bg-[#f3ecdf]"
              >
                Create account
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}