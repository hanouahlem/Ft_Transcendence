"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  House,
  Leaf,
  LogOut,
  Rss,
  UserRound,
  Users,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { isLoggedIn, user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const navLinkClass = (href: string) => {
    const isActive = pathname === href;

    return `inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
      isActive
        ? "bg-[#e8f0e2] text-[#2f3a32]"
        : "text-[#445046] hover:bg-[#eef3ea] hover:text-[#2f3a32]"
    }`;
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#d9cfbf] bg-[#f7f1e7]/85 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="group flex items-center gap-3 transition">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#d7ccb8] bg-[#eef3e8] shadow-sm transition group-hover:scale-[1.03]">
            <Leaf className="h-5 w-5 text-[#6f8467]" />
          </div>

          <div className="leading-tight">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#6f8467]">
              ft_transcendence
            </p>
            <p className="text-xs text-[#7e8678]">Social blog platform</p>
          </div>
        </Link>

        <div className="flex items-center gap-2 rounded-full border border-[#ddd3c2] bg-[#fffaf2]/90 p-1.5 shadow-[0_8px_30px_rgba(90,107,86,0.08)]">
          <Link href={isLoggedIn ? "/feed" : "/"} className={navLinkClass(isLoggedIn ? "/feed" : "/")}>
            <House className="h-4 w-4" />
            <span className="hidden sm:inline">Home</span>
          </Link>

          {isLoggedIn ? (
            <>
              <Link href="/feed" className={navLinkClass("/feed")}>
                <Rss className="h-4 w-4" />
                <span className="hidden sm:inline">Feed</span>
              </Link>

              <Link href="/profil" className={navLinkClass("/profil")}>
                <UserRound className="h-4 w-4" />
                <span className="hidden sm:inline">Profil</span>
              </Link>

              <Link href="/friends" className={navLinkClass("/friends")}>
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Friends</span>
              </Link>

              <Link
                href="/notifications"
                className={navLinkClass("/notifications")}
              >
                <Bell className="h-4 w-4" />
                <span className="hidden sm:inline">Notifications</span>
              </Link>

              {user && (
                <span className="hidden rounded-full border border-[#d9cfbf] bg-[#f3ecdf] px-4 py-2 text-sm font-medium text-[#6b7d64] md:inline-flex">
                  @{user.username}
                </span>
              )}

              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 rounded-full bg-[#6f8467] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#5f7358]"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="inline-flex items-center rounded-full px-4 py-2 text-sm font-medium text-[#445046] transition hover:bg-[#eef3ea] hover:text-[#2f3a32]"
              >
                Login
              </Link>

              <Link
                href="/register"
                className="inline-flex items-center rounded-full bg-[#6f8467] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#5f7358]"
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