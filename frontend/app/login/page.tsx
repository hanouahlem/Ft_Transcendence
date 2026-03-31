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
    const result = await loginUser({ email, password });

    if (!result.ok) {
      setError(result.message);
      return;
    }

    if (result.data.token) {
      await login(result.data.token);
      router.push("/profil");
    } else {
      setError("Token not received.");
    }
  } finally {
    setLoading(false);
  }
};

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#EAF1E6] via-[#dbe7d2] to-[#9CAF88] text-[#33412c]">
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(74,100,64,0.18),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(156,175,136,0.30),transparent_35%)]" />
      <div className="absolute left-[-80px] top-24 h-72 w-72 rounded-full bg-[#EAF1E6]/50 blur-3xl" />
      <div className="absolute bottom-[-60px] right-[-40px] h-80 w-80 rounded-full bg-[#c8dbbf]/60 blur-3xl" />

      <section className="relative flex min-h-screen items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* top intro */}
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border-0 bg-white/80 shadow-md backdrop-blur">
              <Leaf className="h-7 w-7 text-[#4A6440]" />
            </div>

            <p className="text-xs uppercase tracking-[0.28em] text-[#4A6440]">
              ft_transcendence
            </p>

            <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#33412c]">
              Welcome back
            </h1>

            <p className="mt-3 text-sm leading-6 text-[#4f5d49]">
              Sign in to continue to your profile, community, and notifications.
            </p>
          </div>

          {/* card */}
          <div className="rounded-[2rem] border-0 bg-white/90 p-8 shadow-2xl backdrop-blur sm:p-10">
            <div className="mb-6 rounded-2xl border border-[#cfe0c4] bg-[#F4F8F1] p-4">
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-[#EAF1E6] p-2 text-[#4A6440]">
                  <LockKeyhole className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#33412c]">
                    Secure access
                  </p>
                  <p className="mt-1 text-xs leading-5 text-[#4f5d49]">
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
                  className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#5a6b54]"
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
                  className="w-full rounded-2xl border border-[#d8e3d1] bg-[#fbfdf9] px-4 py-3 text-sm text-[#33412c] outline-none transition placeholder:text-[#9aac94] focus:border-[#6B7C5D] focus:ring-4 focus:ring-[#d9e6d0]"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#5a6b54]"
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
                  className="w-full rounded-2xl border border-[#d8e3d1] bg-[#fbfdf9] px-4 py-3 text-sm text-[#33412c] outline-none transition placeholder:text-[#9aac94] focus:border-[#6B7C5D] focus:ring-4 focus:ring-[#d9e6d0]"
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
                className="flex w-full items-center justify-center gap-3 rounded-2xl bg-[#4A6440] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#3a5230] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading && (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                )}
                {loading ? "Signing in..." : "Login"}
                {!loading && <ArrowRight className="h-4 w-4" />}
              </button>
            </form>

            <div className="mt-8 border-t border-[#d8e3d1] pt-6 text-center">
              <p className="mb-3 text-sm text-[#5a6b54]">
                Don’t have an account?
              </p>

              <Link
                href="/register"
                className="inline-flex w-full items-center justify-center rounded-2xl border border-[#d8e3d1] bg-[#EAF1E6] px-4 py-3 text-sm font-semibold text-[#4A6440] transition hover:bg-[#d9e6d0]"
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