"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";

import ArchiveFilters from "@/components/decor/ArchiveFilters";
import AccentBeads from "@/components/decor/AccentBeads";
import { ProfilePicture } from "@/components/ui/ProfilePicture";
import { useAuth } from "@/context/AuthContext";
import { LocaleSwitcher } from "@/i18n/LocaleSwitcher";
import { useI18n } from "@/i18n/I18nProvider";
import { cn } from "@/lib/utils";

const STACK_ITEMS = [
	"Next.js",
	"Express.js",
	"Prisma",
	"PostgreSQL",
	"Socket.io",
	"JWT Auth",
	"Docker Compose",
	"Tailwind CSS",
];

const ROSTER_KEYS = [
	"ahlem",
	"curtis",
	"manar",
	"nabil",
	"walid",
] as const;

const CARD_TAPES = [
	"left-1/2 top-[-8px] h-4 w-12 -translate-x-1/2 -rotate-2 bg-accent-blue",
	"right-6 top-[-7px] h-4 w-10 rotate-3 bg-olive",
	"",
	"left-6 top-[-9px] h-4 w-14 -rotate-3 bg-accent-red",
	"right-10 top-[-8px] h-4 w-12 rotate-2 bg-accent-blue",
];

function LogoIcon() {
	return (
		<div className="relative h-6 w-6 border-2 border-ink">
			<div className="absolute -bottom-2 -right-2 h-6 w-6 border-2 border-ink" />
		</div>
	);
}

function Highlight({ children }: { children: ReactNode }) {
	return (
		<span className="relative inline-block whitespace-nowrap">
			<span className="absolute bottom-1 left-[-0.08em] right-[-0.16em] h-[28%] -rotate-1 bg-accent-blue/85" />
			<span className="relative">{children}</span>
		</span>
	);
}

function LandingNav() {
	const { t } = useI18n();

	return (
		<nav className="flex flex-wrap items-center justify-between gap-4 border-b border-dashed border-ink/10 py-6 lg:py-8">
			<Link href="/" className="flex items-center gap-4 text-ink">
				<LogoIcon />
				<span className="font-display text-xl font-semibold">Field Notes</span>
			</Link>

			<div className="flex items-center gap-3 sm:gap-5">
				<LocaleSwitcher compact />
				<Link
					href="/login"
					className="px-2 py-2 font-mono text-xs font-semibold uppercase tracking-[0.12em] text-ink underline-offset-4 hover:underline"
				>
					{t("landing.navSignIn")}
				</Link>
				<Link
					href="/register"
					className="border border-ink bg-ink px-4 py-2 font-mono text-xs font-semibold uppercase tracking-[0.12em] text-paper shadow-none transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-transparent hover:text-ink hover:shadow-[4px_4px_0_#1a1a1a]"
				>
					{t("landing.navRegister")}
				</Link>
			</div>
		</nav>
	);
}

function DispatchCard() {
	const { t } = useI18n();

	return (
		<aside className="relative pt-6 lg:pt-14">
			<div className="relative mx-auto max-w-[25rem] rotate-1 border border-ink/10 bg-paper p-6 shadow-[4px_8px_24px_rgba(26,26,26,0.12)] lg:ms-auto">
				<div className="archive-tape absolute left-6 top-[-12px] h-6 w-16 -rotate-3 bg-accent-green" />
				<div className="absolute right-5 top-5 flex h-20 w-20 rotate-12 flex-col items-center justify-center rounded-full border border-ink/45 text-center font-mono text-[0.56rem] uppercase leading-tight tracking-[0.08em] text-ink/65">
					<span className="mb-1 border-b border-ink/45 pb-1">{t("landing.dispatchStamp")}</span>
					42
				</div>

				<div className="mb-5 flex items-start justify-between gap-5 border-b border-dashed border-label/25 pb-4 pe-20">
					<div>
						<p className="font-mono text-[0.68rem] uppercase tracking-[0.16em] text-ink">
							{t("landing.dispatchEyebrow")}
						</p>
						<p className="mt-1 font-mono text-[0.68rem] uppercase tracking-[0.16em] text-label">
							{t("landing.dispatchHandle")}
						</p>
					</div>
					<span className="font-mono text-[0.68rem] font-bold uppercase tracking-[0.16em] text-accent-orange">
						{t("landing.dispatchState")}
					</span>
				</div>

				<h2 className="font-display text-2xl font-semibold leading-tight text-ink">
					{t("landing.dispatchTitle")}
				</h2>
				<p className="mt-4 font-display text-base italic leading-7 text-label">
					{t("landing.dispatchBody")}
				</p>

				<div className="mt-5 grid grid-cols-2 gap-3 border-t border-dashed border-label/25 pt-4 font-mono text-[0.65rem] uppercase tracking-[0.14em] text-label">
					<span>{t("landing.dispatchPrimary")}</span>
					<span>{t("landing.dispatchRealtime")}</span>
					<span>{t("landing.dispatchRepository")}</span>
					<span>{t("landing.dispatchReply")}</span>
				</div>
			</div>
		</aside>
	);
}

function HeroSection() {
	const { t, isRtl } = useI18n();

	return (
		<section className="grid gap-12 py-14 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,0.72fr)] lg:gap-20 lg:py-24">
			<div className="relative z-10">
				<div className="mb-8 flex items-center gap-4 font-mono text-sm uppercase tracking-[0.16em] text-label sm:text-base">
					<span>{t("landing.heroKickerPrimary")}</span>
					<span>{t("landing.heroKickerSecondary")}</span>
					<div className="h-px flex-1 bg-[repeating-linear-gradient(to_right,#1a1a1a,#1a1a1a_4px,transparent_4px,transparent_8px)] opacity-45" />
				</div>

				<h1 className="max-w-4xl font-display text-5xl font-semibold leading-[1.05] text-ink sm:text-6xl lg:text-7xl">
					{t("landing.heroTitle")}
					<br />
					<Highlight>{t("landing.heroHighlight")}</Highlight>
				</h1>

				<p className="mt-7 max-w-2xl font-display text-lg italic leading-8 text-label sm:text-xl">
					{t("landing.heroText")}
				</p>

				<div className="mt-9 flex flex-wrap items-center gap-3">
					<Link
						href="/register"
						className="inline-flex items-center gap-2 border border-ink bg-ink px-5 py-3 font-mono text-xs font-semibold uppercase tracking-[0.12em] text-paper transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-transparent hover:text-ink hover:shadow-[4px_4px_0_#1a1a1a]"
					>
						{t("landing.ctaStart")}
						<ArrowRight
							className="h-4 w-4"
							style={{ transform: isRtl ? "rotate(180deg)" : undefined }}
						/>
					</Link>
					<Link
						href="/login"
						className="inline-flex items-center gap-2 border border-ink/15 bg-paper px-5 py-3 font-mono text-xs font-semibold uppercase tracking-[0.12em] text-ink shadow-[4px_4px_0_rgba(26,26,26,0.08)] transition-colors hover:bg-paper-muted"
					>
						{t("landing.ctaLogin")}
					</Link>
					<a
						href="#roster"
						className="px-2 py-3 font-mono text-xs font-semibold uppercase tracking-[0.12em] text-label underline-offset-4 hover:text-ink hover:underline"
					>
						{t("landing.ctaRoster")}
					</a>
				</div>
			</div>

			<DispatchCard />
		</section>
	);
}

function MarqueeSection() {
	return (
		<div className="relative left-1/2 mb-16 flex w-screen -translate-x-1/2 overflow-hidden border-y border-dashed border-ink/45 bg-stage/80 py-4 backdrop-blur-sm lg:mb-24">
			<div className="landing-marquee-track flex min-w-max whitespace-nowrap">
				{[...STACK_ITEMS, ...STACK_ITEMS].map((item, index) => (
					<span
						key={`${item}-${index}`}
						className="inline-flex items-center px-8 font-mono text-xs font-semibold uppercase tracking-[0.16em] text-ink"
					>
						{item}
						<span className="ms-8 font-bold text-accent-orange">{"///"}</span>
					</span>
				))}
			</div>
		</div>
	);
}

function RosterCard({ itemKey, index }: { itemKey: (typeof ROSTER_KEYS)[number]; index: number }) {
	const { t } = useI18n();
	const tapeClassName = CARD_TAPES[index];
	const displayName = t(`landing.roster.${itemKey}.name`);
	const role = t(`landing.roster.${itemKey}.role`);

	return (
		<article className="group relative w-full max-w-sm border border-label/25 bg-paper p-5 shadow-[4px_8px_24px_rgba(26,26,26,0.1)] transition-transform duration-200 hover:-translate-y-1 hover:rotate-1">
			{tapeClassName ? (
				<div className={cn("archive-tape absolute", tapeClassName)} />
			) : null}

			<div className="flex items-center gap-4">
				<ProfilePicture
					name={displayName}
					alt={displayName}
					className="h-14 w-14 border border-ink/20 bg-stage"
					frameClassName="p-1"
					fallbackClassName="text-ink"
				/>
				<div className="min-w-0 flex-1">
					<h3 className="truncate font-display text-xl font-semibold text-ink">
						{displayName}
					</h3>
					<p className="truncate font-mono text-[0.66rem] uppercase tracking-[0.16em] text-label">
						{role}
					</p>
				</div>
				<div
					className={cn(
						"h-2 w-2 rounded-full",
						index % 2 === 0 ? "bg-accent-orange" : "bg-accent-blue",
					)}
				/>
			</div>

			<p className="mt-5 border-t border-dashed border-label/20 pt-4 font-display text-sm italic leading-7 text-ink">
				{t(`landing.roster.${itemKey}.quote`)}
			</p>
		</article>
	);
}

function RosterSection() {
	const { t } = useI18n();

	return (
		<section id="roster" className="pb-16 lg:pb-24">
			<div className="mb-10 flex flex-col items-start justify-between gap-3 border-b border-ink pb-3 sm:flex-row sm:items-end">
				<h2 className="font-display text-3xl font-semibold uppercase text-ink">
					{t("landing.rosterTitle")}
				</h2>
				<span className="shrink-0 font-mono text-[0.68rem] uppercase tracking-[0.18em] text-label">
					{t("landing.rosterMeta")}
				</span>
			</div>

			<div className="flex flex-wrap justify-center gap-8">
				{ROSTER_KEYS.map((itemKey, index) => (
					<RosterCard key={itemKey} itemKey={itemKey} index={index} />
				))}
			</div>
		</section>
	);
}

export default function HomePage() {
	const router = useRouter();
	const { isLoggedIn, isAuthLoading } = useAuth();
	const { t } = useI18n();

	useEffect(() => {
		if (!isAuthLoading && isLoggedIn) {
			router.replace("/feed");
		}
	}, [isLoggedIn, isAuthLoading, router]);

	if (isAuthLoading || isLoggedIn) return null;

	return (
		<main className="archive-page relative min-h-screen overflow-hidden">
			<ArchiveFilters />

			<div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
				<LandingNav />
				<HeroSection />
				<MarqueeSection />
				<RosterSection />

				<footer className="flex flex-col gap-4 border-t border-ink/10 py-6 sm:flex-row sm:items-center sm:justify-between">
					<p className="font-mono text-[10px] uppercase tracking-[0.3em] text-label/60">
						{t("auth.panel.repository")}
					</p>
					<div className="flex items-center gap-4">
						<div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.22em] text-label/70">
							<Link href="/privacy" className="transition-colors hover:text-ink">
								{t("rightRail.footerLinks.privacy")}
							</Link>
							<span className="text-label/35">/</span>
							<Link href="/terms" className="transition-colors hover:text-ink">
								{t("rightRail.footerLinks.terms")}
							</Link>
						</div>
						<AccentBeads />
					</div>
				</footer>
			</div>
		</main>
	);
}
