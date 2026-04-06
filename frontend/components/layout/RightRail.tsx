"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { getInitials } from "@/lib/user-utils";
import { cn } from "@/lib/utils";
import type { RightRailSuggestion } from "@/lib/right-rail";

type RightRailProps = {
	totalPosts: number;
	totalLikes: number;
	totalComments: number;
	sectionTitle: string;
	suggestions: RightRailSuggestion[];
	sentRequests: number[];
	sendingFriendId: number | null;
	onAddFriend: (receiverId: number) => Promise<void>;
	allowFollow?: boolean;
};

const TRENDS = [
	{ rank: "01", title: "#ArchiveDrop", meta: "Fresh entries / Daily" },
	{ rank: "02", title: "Guild Notes", meta: "Community / 84 logs" },
	{ rank: "03", title: "Retro Layouts", meta: "Design / 41 mentions" },
];

export function RightRail({
	totalPosts,
	totalLikes,
	totalComments,
	sectionTitle,
	suggestions,
	sentRequests,
	sendingFriendId,
	onAddFriend,
	allowFollow = true,
}: RightRailProps) {
	const [query, setQuery] = useState("");

	const filteredSuggestions = useMemo(() => {
		const term = query.trim().toLowerCase();

		if (!term) {
			return suggestions;
		}

		return suggestions.filter((author) =>
			author.username.toLowerCase().includes(term),
		);
	}, [query, suggestions]);

	return (
		<aside className="hidden w-73 shrink-0 xl:block">
			<div
				className="fixed inset-y-0 z-20 hidden w-77 py-8 xl:block"
				style={{ right: "max(0px, calc(50vw - 604px))" }}
			>
				<div className="flex h-full w-full flex-col gap-10 overflow-y-auto pr-1">
					<section className="relative">
						<Search className="pointer-events-none absolute left-4 top-3 h-4 w-4 text-label" />
						<input
							type="text"
							value={query}
							onChange={(event) => setQuery(event.target.value)}
							placeholder="Search archives..."
							className="archive-input w-full rounded-lg border-0 bg-paper-muted py-2.5 pl-11 pr-9 font-mono text-sm shadow-inner"
						/>
						<span className="absolute right-3 top-2.5 font-mono text-sm text-label">
							/
						</span>
					</section>

					<section className="relative">
						<div className="mb-6 inline-block -rotate-1 bg-ink px-4 py-1 text-paper">
							<span className="font-display text-lg font-bold uppercase tracking-[0.08em]">
								Current Trends
							</span>
						</div>

						<div className="flex flex-col">
							{TRENDS.map((trend, index) => (
								<article
									key={trend.rank}
									className={cn(
										"flex items-center gap-3 border border-black/10 px-3 py-3 shadow-sm",
										index % 2 === 0
											? "bg-paper"
											: "bg-paper-muted",
										index === 0 && "-rotate-1",
										index === 1 && "rotate-1",
										index === 2 && "-rotate-2",
									)}
								>
									<span className="border-r border-black/15 pr-3 font-mono text-xs text-label">
										{trend.rank}
									</span>
									<div className="min-w-0 flex-1">
										<p className="truncate text-base font-bold leading-none text-ink">
											{trend.title}
										</p>
										<p className="mt-1 font-mono text-[10px] text-label">
											{trend.meta}
										</p>
									</div>
									<button
										type="button"
										className="font-mono text-xs text-label transition-colors hover:text-ink"
										aria-label={`Track ${trend.title}`}
									>
										[+]
									</button>
								</article>
							))}
						</div>
					</section>

					<section className="relative rotate-1 border border-black/10 bg-paper-muted px-6 py-6 shadow-sm">
						<div className="mb-4 border-b-2 border-ink pb-2 font-mono text-xs uppercase tracking-[0.28em] text-label">
							{sectionTitle}
						</div>

						<div className="space-y-4">
							{filteredSuggestions.length === 0 ? (
								<p className="font-mono text-[11px] uppercase tracking-[0.16em] text-label">
									No fellows match this search yet.
								</p>
							) : (
								filteredSuggestions.map((author) => {
									const sent = sentRequests.includes(author.id);
									const initials = getInitials(author.username);
									const tileClasses = [
										"-rotate-2 bg-stage text-ink",
										"rotate-1 bg-accent-green text-paper",
										"-rotate-1 bg-accent-blue text-paper",
									];

									return (
										<div
											key={author.id}
											className="flex items-center gap-3 border-b border-dashed border-black/15 pb-4 last:border-b-0 last:pb-0"
										>
											<div
												className={cn(
													"flex h-9 w-9 items-center justify-center border-2 border-label font-display text-sm font-bold",
													tileClasses[author.id % tileClasses.length],
												)}
											>
												{initials}
											</div>

											<div className="min-w-0 flex-1">
												<p className="truncate text-sm font-bold text-ink">
													{author.username}
												</p>
												<p className="truncate font-mono text-[10px] text-label">
													@{author.username.toLowerCase()}
												</p>
											</div>

											<div className="flex items-center gap-2">
												<Link
													href={`/profil/${author.id}`}
													className={buttonVariants({
														variant: "outline",
														size: "sm",
													})}
												>
													View
												</Link>

												{allowFollow ? (
													<Button
														type="button"
														variant={sent ? "subtle" : "paper"}
														size="sm"
														disabled={sent || sendingFriendId === author.id}
														onClick={() => onAddFriend(author.id)}
														className="rounded-md border-ink/20 bg-stage/80 px-3 py-1.5 text-[10px] tracking-[0.16em] text-ink shadow-none hover:-rotate-1 hover:bg-stage"
													>
														{sendingFriendId === author.id
															? "Sending"
															: sent
																? "Sent"
																: "Follow"}
													</Button>
												) : null}
											</div>
										</div>
									);
								})
							)}
						</div>
					</section>

					<footer className="mt-auto pb-2 font-mono text-[10px] leading-relaxed text-label">
						<p>Terms of Service · Privacy Policy · Cookie Policy</p>
						<p>
							{totalPosts} logs · {totalLikes} likes · {" "}
							{totalComments} notes
						</p>
					</footer>
				</div>
			</div>
		</aside>
	);
}
