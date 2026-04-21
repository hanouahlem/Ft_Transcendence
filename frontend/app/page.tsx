"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
	Heart,
	MessageCircle,
	Bookmark,
	Leaf,
	ArrowRight,
	Users,
	Bell,
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { ProfilePicture } from "@/components/ui/ProfilePicture";
import { LocaleSwitcher } from "@/i18n/LocaleSwitcher";
import { useI18n } from "@/i18n/I18nProvider";
import ArchiveFilters from "@/components/decor/ArchiveFilters";
import AccentBeads from "@/components/decor/AccentBeads";

export default function HomePage() {
	const router = useRouter();
	const { isLoggedIn, isAuthLoading } = useAuth();
	const { t, isRtl } = useI18n();

	useEffect(() => {
		if (!isAuthLoading && isLoggedIn) {
			router.replace("/feed");
		}
	}, [isLoggedIn, isAuthLoading, router]);

	if (isAuthLoading || isLoggedIn) return null;

	return (
		<main
			className="relative min-h-screen overflow-hidden bg-stage antialiased"
			style={{
				backgroundImage:
					"linear-gradient(rgba(26,26,26,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(26,26,26,0.05) 1px, transparent 1px)",
				backgroundSize: "40px 40px",
			}}
		>
			<ArchiveFilters />

			<div className="absolute top-5 z-40" style={{ insetInlineEnd: "1.5rem" }}>
				<LocaleSwitcher compact />
			</div>

			<div className="relative z-10 mx-auto max-w-7xl px-6 pb-16 pt-24 lg:px-8 lg:pt-28">

				{/* ── Main grid ───────────────────────────────────────── */}
				<div className="grid items-start gap-10 lg:grid-cols-2">

					{/* ── Left column ── */}
					<div>
						<h1 className="text-4xl font-bold leading-tight tracking-tight text-ink sm:text-5xl lg:text-6xl">
							{t("landing.heroTitle")}
						</h1>

						<p className="mt-5 max-w-xl text-base leading-8 text-label sm:text-lg">
							{t("landing.heroText")}
						</p>

						{/* CTAs */}
						<div className="mt-8 flex flex-wrap gap-3">
							<Link
								href="/register"
								className="inline-flex items-center gap-2 bg-olive px-6 py-3 text-sm font-semibold text-paper shadow-[4px_4px_0_rgba(0,0,0,0.15)] transition-transform hover:-translate-y-px"
							>
								{t("landing.ctaStart")}
								<ArrowRight
									className="h-4 w-4"
									style={{ transform: isRtl ? "rotate(180deg)" : undefined }}
								/>
							</Link>
							<Link
								href="/login"
								className="inline-flex items-center gap-2 border border-ink/15 bg-paper px-6 py-3 text-sm font-semibold text-ink shadow-[4px_4px_0_rgba(0,0,0,0.08)] transition-colors hover:bg-paper-muted"
							>
								Login
							</Link>
						</div>

						{/* Feature mini-cards */}
						<div className="mt-10 grid gap-3 sm:grid-cols-3">
							{[
								{ icon: <Users className="h-4 w-4" />, title: t("landing.communityTitle"), text: t("landing.communityText") },
								{ icon: <Heart className="h-4 w-4" />, title: t("landing.reactionsTitle"), text: t("landing.reactionsText") },
								{ icon: <Bell className="h-4 w-4" />,  title: t("landing.updatesTitle"),   text: t("landing.updatesText")   },
							].map((item) => (
								<div
									key={item.title}
									className="border border-paper-muted bg-paper p-4 shadow-[3px_3px_0_rgba(0,0,0,0.07)]"
								>
									<div className="mb-2 inline-flex items-center justify-center border border-ink/10 bg-olive/10 p-1.5 text-olive">
										{item.icon}
									</div>
									<p className="text-xs font-semibold text-ink">
										{item.title}
									</p>
									<p className="mt-1 text-xs leading-5 text-label">
										{item.text}
									</p>
								</div>
							))}
						</div>
					</div>

					{/* ── Right column ── */}
					<div className="grid gap-4 md:grid-cols-[1.15fr_0.85fr]">

						{/* Main featured post card */}
						<div className="border border-paper-muted bg-paper shadow-[6px_6px_0_rgba(0,0,0,0.1)]">
							<div className="h-48 bg-gradient-to-b from-ink/25 via-stage to-paper-muted" />
							<div className="space-y-4 p-5">
								<div className="flex items-center gap-3">
									<ProfilePicture
										name="emma.journal"
										src="https://i.pravatar.cc/100?img=32"
										className="h-9 w-9"
									/>
									<div>
										<p className="text-sm font-semibold text-ink">
											@emma.journal
										</p>
										<p className="font-mono text-[10px] uppercase tracking-[0.15em] text-label">
											3 min ago
										</p>
									</div>
								</div>

								<div>
									<h2 className="text-base font-semibold leading-snug text-ink">
										Creating a slower, warmer social experience for modern storytelling
									</h2>
									<p className="mt-2 text-sm leading-6 text-label">
										Thoughtful design, quiet tones, and elegant content cards help users focus on stories and everyday inspiration.
									</p>
								</div>

								<div className="flex items-center gap-5 border-t border-paper-muted pt-3 text-sm text-label">
									<div className="flex items-center gap-1.5">
										<Heart className="h-4 w-4" />
										<span>864</span>
									</div>
									<div className="flex items-center gap-1.5">
										<MessageCircle className="h-4 w-4" />
										<span>92</span>
									</div>
									<div className="flex items-center gap-1.5">
										<Bookmark className="h-4 w-4" />
										<span>Saved</span>
									</div>
								</div>
							</div>
						</div>

						{/* Side blocks */}
						<div className="space-y-4">

							{/* Featured creators */}
							<div className="border border-paper-muted bg-paper p-5 shadow-[3px_3px_0_rgba(0,0,0,0.07)]">
								<p className="mb-4 font-mono text-[10px] uppercase tracking-[0.2em] text-label">
									{t("landing.featuredCreators")}
								</p>
								<div className="space-y-4">
									{[
										{ name: "lina.home",      role: "Interior moments"  },
										{ name: "youssef.notes",  role: "Daily reflections" },
										{ name: "sara.studio",    role: "Creative lifestyle"},
									].map((user) => (
										<div key={user.name} className="flex items-center justify-between gap-2">
											<div className="flex items-center gap-2.5">
												<ProfilePicture name={user.name} className="h-8 w-8" />
												<div>
													<p className="text-xs font-medium text-ink">
														@{user.name}
													</p>
													<p className="text-[11px] text-label">
														{user.role}
													</p>
												</div>
											</div>
											<button className="border border-ink/15 bg-paper-muted px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.1em] text-ink hover:bg-stage">
												{t("common.add")}
											</button>
										</div>
									))}
								</div>
							</div>

							{/* Weekly mood */}
							<div className="border border-paper-muted bg-paper p-5 shadow-[3px_3px_0_rgba(0,0,0,0.07)]">
								<p className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-label">
									{t("landing.weeklyMood")}
								</p>
								<div className="space-y-2">
									{[
										{ tag: "#SlowLiving",     desc: t("landing.communityText"), leaf: true },
										{ tag: "#NaturePalette",  desc: "Sage, sand, olive and warm neutral tones" },
										{ tag: "#PersonalStories",desc: "Everyday moments shaped into beautiful narratives" },
									].map((item) => (
										<div
											key={item.tag}
											className="border border-paper-muted bg-stage p-3"
										>
											<div className="mb-1 flex items-center gap-1.5 text-olive">
												{item.leaf && <Leaf className="h-3.5 w-3.5" />}
												<p className="text-xs font-semibold">{item.tag}</p>
											</div>
											<p className="text-[11px] leading-4 text-label">{item.desc}</p>
										</div>
									))}
								</div>
							</div>

						</div>
					</div>
				</div>

				{/* ── Bottom feature cards ─────────────────────────────── */}
				<div className="mt-14 grid gap-5 md:grid-cols-3">
					{[
						{ label: t("landing.communityTitle"), title: t("landing.heroTitle"),      body: t("landing.heroText") },
						{ label: t("landing.reactionsTitle"), title: t("landing.reactionsText"),  body: "Likes, comments, saves, and notifications wrapped in a quieter and more refined interface." },
						{ label: t("landing.updatesTitle"),   title: t("landing.featuredCreators"), body: "Something between a social app, a journal platform, and an aesthetic content hub." },
					].map((card) => (
						<div
							key={card.label}
							className="border border-paper-muted bg-paper p-6 shadow-[3px_3px_0_rgba(0,0,0,0.07)]"
						>
							<p className="font-mono text-[10px] uppercase tracking-[0.2em] text-olive">
								{card.label}
							</p>
							<h3 className="mt-2 text-base font-semibold leading-snug text-ink">
								{card.title}
							</h3>
							<p className="mt-3 text-sm leading-6 text-label">{card.body}</p>
						</div>
					))}
				</div>

				{/* ── Footer strip ─────────────────────────────────────── */}
				<div className="mt-10 flex items-center justify-between border-t border-ink/10 pt-5">
					<p className="font-mono text-[10px] uppercase tracking-[0.3em] text-label/60">
						{t("auth.panel.repository")}
					</p>
					<AccentBeads />
				</div>

			</div>
		</main>
	);
}
