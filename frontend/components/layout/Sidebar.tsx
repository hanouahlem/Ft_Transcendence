"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Menu } from "@ark-ui/react/menu";
import { Portal } from "@ark-ui/react/portal";
import {
	Home08Icon,
	Menu01Icon,
	Search01Icon,
	UserCircleIcon,
	Notification01Icon,
	UserGroupIcon,
	Message01Icon,
	Settings02Icon,
	Logout02Icon,
	QuillWrite02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
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

type SidebarNavItem = {
	href: string;
	label: string;
	icon: IconSvgElement;
};

type MobileNavButtonProps = SidebarNavItem & {
	active: boolean;
	badge?: number;
};

type TranslationFn = (key: string, params?: Record<string, string | number>) => string;

type AccountMenuContentProps = {
	t: TranslationFn;
	onLogout: () => void;
	showProfileLink?: boolean;
	onPointerEnter?: () => void;
	onPointerLeave?: () => void;
};

function MobileNavButton({
	href,
	label,
	icon: Icon,
	active,
	badge,
}: MobileNavButtonProps) {
	return (
		<Link
			href={href}
			aria-current={active ? "page" : undefined}
			className={cn(
				"flex h-14 min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-lg px-1 font-sans transition-colors",
				active
					? "bg-black/5 text-ink"
					: "text-label hover:bg-black/5 hover:text-ink",
			)}
		>
			<span className="relative flex h-6 w-6 items-center justify-center">
				<HugeiconsIcon icon={Icon} size={24} strokeWidth={1.8} />

				{typeof badge === "number" && badge > 0 && (
					<span
						className="absolute -top-2 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-paper bg-accent-red px-1 text-[10px] font-bold leading-none text-paper"
						style={{ insetInlineEnd: "-0.6rem" }}
					>
						{badge}
					</span>
				)}
			</span>

			<span className="max-w-full truncate text-[10px] font-semibold leading-none">
				{label}
			</span>
		</Link>
	);
}

function AccountMenuContent({
	t,
	onLogout,
	showProfileLink = false,
	onPointerEnter,
	onPointerLeave,
}: AccountMenuContentProps) {
	return (
		<Menu.Content
			className="w-52 rounded-xl border border-black/10 bg-paper p-1 shadow-[6px_8px_0_rgba(26,26,26,0.12)] outline-none"
			onPointerEnter={onPointerEnter}
			onPointerLeave={onPointerLeave}
			style={{ zIndex: 10000 }}
		>
			{showProfileLink ? (
				<>
					<Menu.Item value="profile" asChild>
						<Link
							href="/profile"
							className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-ink transition-colors hover:bg-paper-muted"
						>
							<HugeiconsIcon icon={UserCircleIcon} size={16} strokeWidth={1.7} />
							{t("nav.profile")}
						</Link>
					</Menu.Item>

					<div className="my-1 h-px bg-black/10" />
				</>
			) : null}

			<div className="px-2 py-2">
				<p className="px-1 pb-2 text-[11px] font-mono uppercase tracking-[0.16em] text-label">
					{t("locale.label")}
				</p>
				<LocaleSwitcher compact className="w-full justify-center" />
			</div>

			<div className="my-1 h-px bg-black/10" />

			<Menu.Item value="settings" asChild>
				<Link
					href="/settings"
					className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-ink transition-colors hover:bg-paper-muted"
				>
					<HugeiconsIcon icon={Settings02Icon} size={16} strokeWidth={1.7} />
					{t("nav.settings")}
				</Link>
			</Menu.Item>

			<Menu.Item value="disconnect" asChild>
				<button
					type="button"
					className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-ink transition-colors hover:bg-paper-muted"
					onClick={onLogout}
				>
					<HugeiconsIcon icon={Logout02Icon} size={16} strokeWidth={1.7} />
					{t("sidebar.logout")}
				</button>
			</Menu.Item>
		</Menu.Content>
	);
}

export function Sidebar({
	user,
	unreadNotificationsCount,
	unreadMessagesCount,
	onCreatePost,
	onLogout,
}: SidebarProps) {
	const pathname = usePathname();
	const router = useRouter();
	const [expanded, setExpanded] = useState(false);
	const [canExpand, setCanExpand] = useState(false);
	const [profileMenuOpen, setProfileMenuOpen] = useState(false);
	const closeMenuTimeoutRef = useRef<number | null>(null);
	const { t } = useI18n();
	const userDisplayName = user?.displayName?.trim() || user?.username || t("sidebar.profileFallback");
	const userHandle = user?.username || t("sidebar.profileHandleFallback");
	const isExpanded = canExpand && expanded;
	const navItems = [
		{ href: "/feed", label: t("nav.feed"), icon: Home08Icon },
		{ href: "/search", label: t("nav.search"), icon: Search01Icon },
		// { href: "/profile", label: t("nav.profile"), icon: UserCircleIcon },
		{ href: "/notifications", label: t("nav.notifications"), icon: Notification01Icon },
		{ href: "/friends", label: t("nav.friends"), icon: UserGroupIcon },
		{ href: "/message", label: t("nav.message"), icon: Message01Icon },
		// { href: "/settings", label: t("nav.settings"), icon: Settings02Icon },
	];
	const mobileNavItems = navItems.filter((item) =>
		item.href === "/feed" ||
		item.href === "/search" ||
		item.href === "/notifications" ||
		item.href === "/message"
	);
	const accountMenuActive = pathname === "/profile" || pathname === "/settings";

	const getNavBadge = (href: string) => {
		if (href === "/notifications") {
			return unreadNotificationsCount;
		}

		if (href === "/message") {
			return unreadMessagesCount;
		}

		return undefined;
	};

	const clearCloseMenuTimeout = () => {
		if (closeMenuTimeoutRef.current !== null) {
			window.clearTimeout(closeMenuTimeoutRef.current);
			closeMenuTimeoutRef.current = null;
		}
	};

	const openProfileMenu = () => {
		clearCloseMenuTimeout();
		setProfileMenuOpen(true);
	};

	const scheduleProfileMenuClose = () => {
		clearCloseMenuTimeout();
		closeMenuTimeoutRef.current = window.setTimeout(() => {
			setProfileMenuOpen(false);
			closeMenuTimeoutRef.current = null;
		}, 120);
	};

	useEffect(() => {
		return () => {
			clearCloseMenuTimeout();
		};
	}, []);

	useEffect(() => {
		const expandMedia = window.matchMedia("(min-width: 1280px) and (hover: hover) and (pointer: fine)");

		const syncCanExpand = () => {
			setCanExpand(expandMedia.matches);
			if (!expandMedia.matches) {
				setExpanded(false);
			}
		};

		syncCanExpand();
		expandMedia.addEventListener("change", syncCanExpand);

		return () => {
			expandMedia.removeEventListener("change", syncCanExpand);
		};
	}, []);

	return (
		<>
			<aside
				className="fixed inset-y-0 z-20 hidden flex-col overflow-hidden border-r border-black/10 bg-paper-muted px-3 py-8 lg:flex"
				style={{
					insetInlineStart: 0,
					width: isExpanded ? "240px" : "76px",
					transition: "width 0.2s ease-out",
				}}
				onMouseEnter={() => {
					if (canExpand) {
						setExpanded(true);
					}
				}}
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
						style={{ opacity: isExpanded ? 1 : 0 }}
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
							expanded={isExpanded}
							badge={getNavBadge(item.href)}
						/>
					))}

					<Button
						type="button"
						variant="black"
						className={cn(
							"mt-4 w-full font-sans font-semibold",
							isExpanded
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
								opacity: isExpanded ? 1 : 0,
								maxWidth: isExpanded ? "200px" : "0px",
							}}
						>
							{t("sidebar.newPost")}
						</span>
					</Button>
				</nav>

				<div className="mt-auto">
					<Menu.Root
						open={profileMenuOpen}
						onOpenChange={(details) => setProfileMenuOpen(details.open)}
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
								onPointerEnter={openProfileMenu}
								onPointerLeave={scheduleProfileMenuClose}
								onClick={() => {
									clearCloseMenuTimeout();
									setProfileMenuOpen(false);
									router.push("/profile");
								}}
							>
								<ProfilePicture
									name={userDisplayName}
									src={user?.avatar}
									alt={userDisplayName}
									className="h-8 w-8 shrink-0 -rotate-3"
								/>

								<div
									className="min-w-0 whitespace-nowrap transition-opacity duration-150"
									style={{ opacity: isExpanded ? 1 : 0 }}
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
								<AccountMenuContent
									t={t}
									onLogout={onLogout}
									onPointerEnter={openProfileMenu}
									onPointerLeave={scheduleProfileMenuClose}
								/>
							</Menu.Positioner>
						</Portal>
					</Menu.Root>
				</div>
			</aside>

			<div
				className="fixed inset-x-0 bottom-0 z-50 border-t border-black/10 bg-paper/95 px-2 pt-2 shadow-[0_-8px_24px_rgba(26,26,26,0.14)] backdrop-blur lg:hidden"
				style={{ paddingBottom: "var(--mobile-bottom-nav-padding)" }}
			>
				<nav className="flex items-center gap-1" aria-label={t("sidebar.menu")}>
					{mobileNavItems.map((item) => (
						<MobileNavButton
							key={item.href}
							href={item.href}
							label={item.label}
							icon={item.icon}
							active={pathname === item.href}
							badge={getNavBadge(item.href)}
						/>
					))}

					<Menu.Root
						positioning={{
							placement: "top",
							gutter: 14,
							strategy: "fixed",
						}}
					>
						<Menu.Trigger asChild>
							<button
								type="button"
								aria-label={t("sidebar.menu")}
								aria-current={accountMenuActive ? "page" : undefined}
								className={cn(
									"flex h-14 min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-lg px-1 font-sans transition-colors",
									accountMenuActive
										? "bg-black/5 text-ink"
										: "text-label hover:bg-black/5 hover:text-ink",
								)}
							>
								<HugeiconsIcon icon={Menu01Icon} size={24} strokeWidth={1.8} />
								<span className="max-w-full truncate text-[10px] font-semibold leading-none">
									{t("sidebar.menu")}
								</span>
							</button>
						</Menu.Trigger>

						<Portal>
							<Menu.Positioner
								className="z-[9999]"
								style={{ zIndex: 9999 }}
							>
								<AccountMenuContent
									t={t}
									onLogout={onLogout}
									showProfileLink
								/>
							</Menu.Positioner>
						</Portal>
					</Menu.Root>
				</nav>
			</div>
		</>
	);
}
