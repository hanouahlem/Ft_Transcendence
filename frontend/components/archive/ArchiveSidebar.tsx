"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Bell,
  Bookmark,
  Home,
  LogOut,
  MessageCircle,
  Search,
  UserRound,
} from "lucide-react";
import type { CurrentUser } from "@/lib/api";
import { cn } from "@/lib/utils";
import { ArchiveButton } from "@/components/archive/ArchiveButton";
import { ArchiveNavButton } from "@/components/archive/ArchiveNavButton";
import { getInitials } from "@/components/archive/archiveUtils";

type ArchiveSidebarProps = {
  user: CurrentUser | null;
  onCreatePost: () => void;
  onLogout: () => void;
};

const NAV_ITEMS = [
  { href: "/feed", label: "Timeline", icon: Home },
  { href: "/friends", label: "Discoveries", icon: Search },
  { href: "/notifications", label: "Notifications", icon: Bell, badge: 3 },
  { href: "/settings/notifications", label: "Messages", icon: MessageCircle },
  { href: "/settings/profile", label: "Bookmarks", icon: Bookmark },
  { href: "/profil", label: "Profile", icon: UserRound },
];

export function ArchiveSidebar({
  user,
  onCreatePost,
  onLogout,
}: ArchiveSidebarProps) {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState(false);

  return (
    <aside
      className="fixed inset-y-0 z-30 hidden flex-col overflow-hidden border-r border-black/10 bg-field-paper-muted px-3 py-8 lg:flex"
      style={{
        left: 0,
        width: expanded ? "240px" : "76px",
        transition: "width 0.2s ease-out",
      }}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
    >
      <Link href="/feed" className="mb-10 flex items-center gap-4 px-2">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center -rotate-6">
          <svg
            className="h-8 w-8 text-field-ink"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
            />
          </svg>
        </div>

        <span
          className="whitespace-nowrap font-field-display text-[1.7rem] font-black tracking-[-0.05em] text-field-ink transition-opacity duration-150"
          style={{ opacity: expanded ? 1 : 0 }}
        >
          Field Notes
        </span>
      </Link>

      <nav className="flex flex-1 flex-col justify-center gap-1">
        {NAV_ITEMS.map((item) => (
          <ArchiveNavButton
            key={item.href}
            href={item.href}
            label={item.label}
            icon={item.icon}
            active={pathname === item.href}
            expanded={expanded}
            badge={item.badge}
          />
        ))}

        <ArchiveButton
          type="button"
          variant="ink"
          className={cn(
            "mt-4 w-full rounded-xl rotate-1 hover:-rotate-1",
            expanded ? "justify-start gap-3 px-3" : "justify-center px-0"
          )}
          onClick={onCreatePost}
        >
          <svg
            className="h-5 w-5 shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 4v16m8-8H4"
            />
          </svg>
          <span
            className="overflow-hidden whitespace-nowrap transition-all duration-150"
            style={{ opacity: expanded ? 1 : 0, maxWidth: expanded ? "200px" : "0px" }}
          >
            Log Entry
          </span>
        </ArchiveButton>
      </nav>

      <div className="mt-auto space-y-3">
        <Link
          href="/profil"
          className="flex items-center gap-3 rounded-xl px-3 py-3 transition-all duration-200 hover:bg-black/5"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-field-stage font-field-display text-sm font-black text-field-ink -rotate-3">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.username}
                className="h-full w-full object-cover archive-photo"
              />
            ) : (
              getInitials(user?.username || "Field User")
            )}
          </div>

          <div
            className="min-w-0 whitespace-nowrap transition-opacity duration-150"
            style={{ opacity: expanded ? 1 : 0 }}
          >
            <p className="truncate text-sm font-semibold text-field-ink">
              {user?.username || "Field User"}
            </p>
            <p className="truncate font-field-mono text-[11px] uppercase tracking-[0.16em] text-field-label">
              @{(user?.username || "observer").toLowerCase()}
            </p>
          </div>
        </Link>

        <ArchiveButton
          type="button"
          variant="subtle"
          className={cn(
            "w-full rounded-xl border-black/10",
            expanded ? "justify-start gap-3 px-3" : "justify-center px-0"
          )}
          onClick={onLogout}
        >
          <LogOut className="h-4 w-4" />
          <span
            className="overflow-hidden whitespace-nowrap transition-all duration-150"
            style={{ opacity: expanded ? 1 : 0, maxWidth: expanded ? "200px" : "0px" }}
          >
            Logout
          </span>
        </ArchiveButton>
      </div>
    </aside>
  );
}
