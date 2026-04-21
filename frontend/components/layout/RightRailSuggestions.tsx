import { ProfilePicture } from "@/components/ui/ProfilePicture";
import { UserIdentityLink } from "@/components/users/UserIdentityLink";
import { cn } from "@/lib/utils";
import type { RightRailSuggestion } from "@/lib/right-rail";
import { Button } from "@/components/ui/button";

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
	connectedFriendshipIdsByUser?: Record<number, number>;
	sendingFriendId: number | null;
	onAddFriend: (receiverId: number) => Promise<void>;
	onAcceptFriend: (senderId: number) => Promise<void>;
	onRemoveFriend?: (userId: number) => Promise<void>;
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
	connectedFriendshipIdsByUser = {},
	sendingFriendId,
	onAddFriend,
	onAcceptFriend,
	onRemoveFriend,
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
						const isConnected =
							typeof connectedFriendshipIdsByUser[author.id] ===
							"number";
						const isSubmitting = sendingFriendId === author.id;
						const canRemoveFriend =
							typeof onRemoveFriend === "function";
						const tileClasses = ["-rotate-2", "rotate-1", "-rotate-1"];
						const authorDisplayName =
							author.displayName?.trim() || author.username;
						const actionLabel = isSubmitting
							? isConnected
								? "Removing"
								: incomingRequestId
									? "Accepting"
									: "Adding"
							: isConnected
								? "Remove"
								: incomingRequestId
									? "Accept"
									: sent
										? "Sent"
										: "Add";
						const actionVariant = isConnected
							? "destructive"
							: sent
								? "subtle"
								: incomingRequestId
									? "bluesh"
									: "paper";
						const handleAction = () => {
							if (isConnected) {
								onRemoveFriend?.(author.id);
								return;
							}

							if (incomingRequestId) {
								onAcceptFriend(author.id);
								return;
							}

							if (!sent) {
								onAddFriend(author.id);
							}
						};

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
									isConnected && !canRemoveFriend ? (
										<span className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-label">
											Friend
										</span>
									) : (
										<Button
											type="button"
											variant={actionVariant}
											size="sm"
											disabled={
												(!isConnected && sent) || isSubmitting
											}
											onClick={handleAction}
											className="hover:-rotate-1"
										>
											{actionLabel}
										</Button>
									)
								) : null}
							</div>
						);
					})
				)}
			</div>
		</section>
	);
}
