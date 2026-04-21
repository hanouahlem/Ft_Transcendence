import { Button } from "@/components/ui/button";
import { ProfilePicture } from "@/components/ui/ProfilePicture";
import { UserIdentityLink } from "@/components/users/UserIdentityLink";
import { cn } from "@/lib/utils";
import type { RightRailSuggestion } from "@/lib/right-rail";

type RightRailSuggestionsProps = {
	sectionTitle: string;
	emptyFriendsTitle: string;
	emptySuggestionsTitle: string;
	addLabel: string;
	acceptLabel: string;
	addingLabel: string;
	acceptingLabel: string;
	sentLabel: string;
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
	emptyFriendsTitle,
	emptySuggestionsTitle,
	addLabel,
	acceptLabel,
	addingLabel,
	acceptingLabel,
	sentLabel,
	suggestions,
	sentRequests,
	incomingRequestIdsBySender,
	sendingFriendId,
	onAddFriend,
	onAcceptFriend,
	allowFollow = true,
}: RightRailSuggestionsProps) {
	const emptyState = allowFollow
		? { title: emptySuggestionsTitle }
		: { title: emptyFriendsTitle };

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
						const tileClasses = ["-rotate-2", "rotate-1", "-rotate-1"];
						const authorDisplayName =
							author.displayName?.trim() || author.username;

						return (
							<div
								key={author.id}
								className="flex items-center gap-3 border-b border-dashed border-black/15 pb-4 last:border-b-0 last:pb-0"
							>
								<UserIdentityLink
									user={author}
									className="shrink-0"
								>
									<ProfilePicture
										name={authorDisplayName}
										src={author.avatar}
										alt={authorDisplayName}
										className={cn(
											"h-9 w-9",
											tileClasses[
											author.id % tileClasses.length
											],
										)}
									/>
								</UserIdentityLink>

								<div className="min-w-0 flex-1">
									<UserIdentityLink
										user={author}
										className="block truncate text-sm font-bold text-ink transition-colors hover:text-accent-blue"
									>
										{authorDisplayName}
									</UserIdentityLink>
									<UserIdentityLink
										user={author}
										className="block truncate font-mono text-[10px] text-label"
									>
										@{author.username.toLowerCase()}
									</UserIdentityLink>
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
												? acceptingLabel
												: addingLabel
											: incomingRequestId
												? acceptLabel
												: sent
													? sentLabel
													: addLabel}
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
