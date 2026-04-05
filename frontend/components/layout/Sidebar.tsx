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
import { getInitials } from "@/lib/user-utils";
import { cn } from "@/lib/utils";
import { NavButton } from "@/components/layout/NavButton";
import { Button } from "@/components/ui/button";

type SidebarProps = {
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

export function Sidebar({
	user,
	onCreatePost,
	onLogout,
}: SidebarProps) {
	const pathname = usePathname();
	const [expanded, setExpanded] = useState(false);

	return (
		<aside
			className="fixed inset-y-0 z-30 hidden flex-col overflow-hidden border-r border-black/10 bg-paper-muted px-3 py-8 lg:flex"
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
						className="h-8 w-8 text-ink"
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
					className="whitespace-nowrap font-display text-[1.7rem] font-black tracking-[-0.05em] text-ink transition-opacity duration-150"
					style={{ opacity: expanded ? 1 : 0 }}
				>
					Field Notes
				</span>
			</Link>

			<nav className="flex flex-1 flex-col justify-center gap-1">
				{NAV_ITEMS.map((item) => (
					<NavButton
						key={item.href}
						href={item.href}
						label={item.label}
						icon={item.icon}
						active={pathname === item.href}
						expanded={expanded}
						badge={item.badge}
					/>
				))}

				<Button
					type="button"
					variant="black"
					className={cn(
						"mt-4 w-full font-sans",
						expanded
							? "justify-start gap-3 px-3"
							: "justify-start px-3",
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
						style={{
							opacity: expanded ? 1 : 0,
							maxWidth: expanded ? "200px" : "0px",
						}}
					>
						Log Entry
					</span>
				</Button>
			</nav>

			<div className="mt-auto space-y-3">
				<Link
					href="/profil"
					className="flex items-center gap-3 rounded-xl px-3 py-3 transition-all duration-200 hover:bg-black/5"
				>
					<div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-stage font-display text-sm font-black text-ink -rotate-3">
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
						<p className="truncate text-sm font-semibold text-ink">
							{user?.username || "Field User"}
						</p>
						<p className="truncate font-mono text-[11px] uppercase tracking-[0.16em] text-label">
							@{(user?.username || "observer").toLowerCase()}
						</p>
					</div>
				</Link>

				<Button
					type="button"
					variant="subtle"
					className={cn(
						"w-full rounded-xl border-black/10",
						expanded
							? "justify-start gap-3 px-3"
							: "justify-center px-0",
					)}
					onClick={onLogout}
				>
					<LogOut className="h-4 w-4" />
					<span
						className="overflow-hidden whitespace-nowrap transition-all duration-150"
						style={{
							opacity: expanded ? 1 : 0,
							maxWidth: expanded ? "200px" : "0px",
						}}
					>
						Logout
					</span>
				</Button>
			</div>
		</aside>
	);
}
