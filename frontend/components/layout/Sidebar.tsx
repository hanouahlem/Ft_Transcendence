"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
	Home08Icon,
	Search01Icon,
	UserCircleIcon,
	Notification01Icon,
	UserGroupIcon,
	Message01Icon,
	Settings02Icon,
	Logout02Icon,
	QuillWrite02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { CurrentUser } from "@/lib/api";
import { cn } from "@/lib/utils";
import { NavButton } from "@/components/layout/NavButton";
import { Button } from "@/components/ui/button";
import { ProfilePicture } from "@/components/ui/ProfilePicture";

type SidebarProps = {
	user: CurrentUser | null;
	unreadNotificationsCount: number;
	unreadMessagesCount: number;
	onCreatePost: () => void;
	onLogout: () => void;
};

const NAV_ITEMS = [
	{ href: "/feed", label: "Timeline", icon: Home08Icon },
	{ href: "/search", label: "Search", icon: Search01Icon },
	{ href: "/profile", label: "Profile", icon: UserCircleIcon },
	{ href: "/notifications", label: "Notifications", icon: Notification01Icon },
	{ href: "/friends", label: "Friends", icon: UserGroupIcon },
	{ href: "/message", label: "Message", icon: Message01Icon },
	{ href: "/settings", label: "Settings", icon: Settings02Icon },
];

export function Sidebar({
	user,
	unreadNotificationsCount,
	unreadMessagesCount,
	onCreatePost,
	onLogout,
}: SidebarProps) {
	const pathname = usePathname();
	const [expanded, setExpanded] = useState(false);
	const userDisplayName = user?.displayName?.trim() || user?.username || "Field User";
	const userHandle = user?.username || "observer";

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
						badge={
							item.href === "/notifications"
								? unreadNotificationsCount
								: item.href === "/message"
									? unreadMessagesCount
									: undefined
						}
					/>
				))}

				<Button
					type="button"
					variant="black"
					className={cn(
						"mt-4 w-full font-sans font-semibold",
						expanded
							? "justify-start gap-3 px-4"
							: "justify-start px-4",
					)}
					onClick={onCreatePost}
				>
					<HugeiconsIcon icon={QuillWrite02Icon} size={20} strokeWidth={1.9} />
					<span
						className="overflow-hidden whitespace-nowrap transition-all duration-150 ml-2 text-sm"
						style={{
							opacity: expanded ? 1 : 0,
							maxWidth: expanded ? "200px" : "0px",
						}}
					>
						New Post
					</span>
				</Button>
			</nav>

			<div className="mt-auto space-y-3">
				<Link
					href="/profile"
					className="flex items-center gap-3 rounded-xl px-3 py-3 transition-all duration-200 hover:bg-black/5"
				>
					<ProfilePicture
						name={userDisplayName}
						src={user?.avatar}
						alt={userDisplayName}
						className="h-8 w-8 shrink-0 -rotate-3"
					/>

					<div
						className="min-w-0 whitespace-nowrap transition-opacity duration-150"
						style={{ opacity: expanded ? 1 : 0 }}
					>
						<p className="truncate text-sm font-semibold text-ink">
							{userDisplayName}
						</p>
						<p className="truncate font-mono text-[11px] uppercase tracking-[0.16em] text-label">
							@{userHandle.toLowerCase()}
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
					<HugeiconsIcon icon={Logout02Icon} size={16} strokeWidth={1.7} />
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
