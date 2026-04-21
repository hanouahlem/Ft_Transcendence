"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu } from "@ark-ui/react/menu";
import { Portal } from "@ark-ui/react/portal";
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
import { LocaleSwitcher } from "@/i18n/LocaleSwitcher";
import { useI18n } from "@/i18n/I18nProvider";

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
	const { t } = useI18n();
	const userDisplayName = user?.displayName?.trim() || user?.username || t("sidebar.profileFallback");
	const userHandle = user?.username || t("sidebar.profileHandleFallback");
	const navItems = [
		{ href: "/feed", label: t("nav.feed"), icon: Home08Icon },
		{ href: "/search", label: t("nav.search"), icon: Search01Icon },
		{ href: "/profile", label: t("nav.profile"), icon: UserCircleIcon },
		{ href: "/notifications", label: t("nav.notifications"), icon: Notification01Icon },
		{ href: "/friends", label: t("nav.friends"), icon: UserGroupIcon },
		{ href: "/message", label: t("nav.message"), icon: Message01Icon },
		{ href: "/settings", label: t("nav.settings"), icon: Settings02Icon },
	];

	return (
		<aside
			className="fixed inset-y-0 z-20 hidden flex-col overflow-hidden border-r border-black/10 bg-paper-muted px-3 py-8 lg:flex"
			style={{
				insetInlineStart: 0,
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
					{t("sidebar.fieldNotes")}
				</span>
			</Link>

			<nav className="flex flex-1 flex-col justify-center gap-1">
				{navItems.map((item) => (
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
						className="overflow-hidden whitespace-nowrap text-sm transition-all duration-150"
						style={{
							marginInlineStart: "0.5rem",
							opacity: expanded ? 1 : 0,
							maxWidth: expanded ? "200px" : "0px",
						}}
					>
						{t("sidebar.newPost")}
					</span>
				</Button>
			</nav>

			<div className="mt-auto space-y-3">
				<Menu.Root
					positioning={{
						placement: "top",
						gutter: 10,
						strategy: "fixed",
					}}
				>
					<Menu.Trigger
						asChild
					>
						<button
							type="button"
							className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-all duration-200 hover:bg-black/5"
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
						</button>
					</Menu.Trigger>

					<Portal>
						<Menu.Positioner
							className="z-[9999]"
							style={{ zIndex: 9999 }}
						>
							<Menu.Content
								className="w-52 rounded-xl border border-black/10 bg-paper p-1 shadow-[6px_8px_0_rgba(26,26,26,0.12)] outline-none"
								style={{ zIndex: 10000 }}
							>
								<Menu.Item value="settings" asChild>
									<Link
										href="/settings"
										className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-ink transition-colors hover:bg-paper-muted"
									>
										<HugeiconsIcon icon={Settings02Icon} size={16} strokeWidth={1.7} />
										Settings
									</Link>
								</Menu.Item>

								<Menu.Item value="disconnect" asChild>
									<button
										type="button"
										className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-ink transition-colors hover:bg-paper-muted"
										onClick={onLogout}
									>
										<HugeiconsIcon icon={Logout02Icon} size={16} strokeWidth={1.7} />
										Disconnect
									</button>
								</Menu.Item>
							</Menu.Content>
						</Menu.Positioner>
					</Portal>
				</Menu.Root>
			</div>
		</aside>
	);
}
