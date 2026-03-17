"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const router = useRouter();
  const { isLoggedIn, user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-neutral-950/90 text-white backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="text-xl font-bold tracking-tight text-orange-400"
        >
          ft_transcendence
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="rounded-lg px-3 py-2 text-sm font-medium text-white/80 transition hover:bg-white/10 hover:text-white"
          >
            Home
          </Link>

          {isLoggedIn ? (
            <>
              <Link
                href="/profil"
                className="rounded-lg px-3 py-2 text-sm font-medium text-white/80 transition hover:bg-white/10 hover:text-white"
              >
                Profil
              </Link>

              <Link
                href="/friends"
                className="rounded-lg px-3 py-2 text-sm font-medium text-white/80 transition hover:bg-white/10 hover:text-white"
              >
                Friends
              </Link>

              <Link
                href="/notifications"
                className="rounded-lg px-3 py-2 text-sm font-medium text-white/80 transition hover:bg-white/10 hover:text-white"
              >
                Notifications
              </Link>

              {user && (
                <span className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-orange-300">
                  {user.username}
                </span>
              )}

              <button
                onClick={handleLogout}
                className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-lg px-3 py-2 text-sm font-medium text-white/80 transition hover:bg-white/10 hover:text-white"
              >
                Login
              </Link>

              <Link
                href="/register"
                className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}