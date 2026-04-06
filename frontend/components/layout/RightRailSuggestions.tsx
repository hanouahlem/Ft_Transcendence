import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getInitials } from "@/lib/user-utils";
import { cn } from "@/lib/utils";
import type { RightRailSuggestion } from "@/lib/right-rail";

type RightRailSuggestionsProps = {
	sectionTitle: string;
	suggestions: RightRailSuggestion[];
	sentRequests: number[];
	incomingRequestIdsBySender: Record<number, number>;
	sendingFriendId: number | null;
	onAddFriend: (receiverId: number) => Promise<void>;
	onAcceptFriend: (senderId: number) => Promise<void>;
	allowFollow?: boolean;
};

export function RightRailSuggestions({
	sectionTitle,
	suggestions,
	sentRequests,
	incomingRequestIdsBySender,
	sendingFriendId,
	onAddFriend,
	onAcceptFriend,
	allowFollow = true,
}: RightRailSuggestionsProps) {
	const emptyState = (() => {
		if (sectionTitle === "My Friends") {
			return { title: "You have no friend.." };
		}

		if (sectionTitle === "You Might Know") {
			return { title: "You are on your own.." };
		}

		return { title: "No Friend" };
	})();

	return (
		<section className="relative rotate-1 border border-black/10 bg-paper-muted px-6 py-6 shadow-sm">
			<div className="mb-4 border-b-2 border-ink pb-2 font-mono text-xs uppercase tracking-[0.28em] text-label">
				{sectionTitle}
			</div>

			<div className="space-y-4">
				{suggestions.length === 0 ? (
					<div className="border border-dashed border-black/15 bg-paper/70 px-4 py-4 text-center">
						<p className="font-mono text-xs uppercase tracking-[0.24em] text-label">
							{emptyState.title}
						</p>
					</div>
				) : (
					suggestions.map((author) => {
						const sent = sentRequests.includes(author.id);
						const incomingRequestId =
							incomingRequestIdsBySender[author.id];
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
										tileClasses[
											author.id % tileClasses.length
										],
									)}
								>
									{initials}
								</div>

								<div className="min-w-0 flex-1">
									<Link
										href={`/profil/${author.id}`}
										className="truncate text-sm font-bold text-ink transition-colors hover:text-accent-blue"
									>
										{author.username}
									</Link>
									<p className="truncate font-mono text-[10px] text-label">
										@{author.username.toLowerCase()}
									</p>
								</div>

								{allowFollow ? (
									<Button
										type="button"
										variant={
											sent
												? "subtle"
												: incomingRequestId
													? "bluesh"
													: "paper"
										}
										size="sm"
										disabled={
											sent ||
											sendingFriendId === author.id
										}
										onClick={() =>
											incomingRequestId
												? onAcceptFriend(author.id)
												: onAddFriend(author.id)
										}
										className="hover:-rotate-1"
									>
										{sendingFriendId === author.id
											? incomingRequestId
												? "Accepting"
												: "Adding"
											: incomingRequestId
												? "Accept"
												: sent
													? "Sent"
													: "Add"}
									</Button>
								) : null}
							</div>
						);
					})
				)}
			</div>
		</section>
	);
}
