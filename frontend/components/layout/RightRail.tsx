"use client";

import type { RightRailSuggestion } from "@/lib/right-rail";
import { RightRailSearch } from "@/components/layout/RightRailSearch";
import { RightRailSuggestions } from "@/components/layout/RightRailSuggestions";
import { RightRailTrends } from "@/components/layout/RightRailTrends";
import { useI18n } from "@/i18n/I18nProvider";

type RightRailProps = {
	totalPosts: number;
	totalLikes: number;
	totalComments: number;
	sectionTitle: string;
	suggestions: RightRailSuggestion[];
	sentRequests: number[];
	incomingRequestIdsBySender: Record<number, number>;
	connectedFriendshipIdsByUser?: Record<number, number>;
	sendingFriendId: number | null;
	onAddFriend: (receiverId: number) => Promise<void>;
	onAcceptFriend: (senderId: number) => Promise<void>;
	onRemoveFriend?: (userId: number) => Promise<void>;
	allowFollow?: boolean;
	reserveSpace?: boolean;
	rightAnchorBase?: number;
};

export function RightRail({
	totalPosts,
	totalLikes,
	totalComments,
	sectionTitle,
	suggestions,
	sentRequests,
	incomingRequestIdsBySender,
	connectedFriendshipIdsByUser,
	sendingFriendId,
	onAddFriend,
	onAcceptFriend,
	onRemoveFriend,
	allowFollow = true,
	reserveSpace = true,
	rightAnchorBase = 604,
}: RightRailProps) {
	const { t } = useI18n();
	const sectionTitleLabel = sectionTitle || t("rightRail.youMightKnow");
	const searchLabel = (title: string) => `${t("rightRail.searchButtonLabel")} ${title}`;
	const emptySuggestionsTitle = t("rightRail.emptySuggestions");
	const emptyFriendsTitle = t("rightRail.emptyFriends");
	return (
		<aside
			className={reserveSpace ? "hidden w-73 shrink-0 xl:block" : "hidden shrink-0 xl:block xl:w-0"}
		>
			<div
				className="fixed inset-y-0 z-20 hidden w-77 py-8 xl:block"
				style={{ insetInlineEnd: `max(0px, calc(50vw - ${rightAnchorBase}px))` }}
			>
				<div className="flex h-full w-full flex-col gap-10 overflow-y-auto pr-1">
					<RightRailSearch />
					<RightRailTrends title={t("rightRail.trendsTitle")} searchLabel={searchLabel} />
					<RightRailSuggestions
						sectionTitle={sectionTitleLabel}
						emptyFriendsTitle={emptyFriendsTitle}
						emptySuggestionsTitle={emptySuggestionsTitle}
						addLabel={t("common.add")}
						acceptLabel={t("common.accept")}
						addingLabel={t("common.adding")}
						acceptingLabel={t("common.accepting")}
						sentLabel={t("common.sent")}
						suggestions={suggestions}
						sentRequests={sentRequests}
						incomingRequestIdsBySender={incomingRequestIdsBySender}
						connectedFriendshipIdsByUser={connectedFriendshipIdsByUser}
						sendingFriendId={sendingFriendId}
						onAddFriend={onAddFriend}
						onAcceptFriend={onAcceptFriend}
						onRemoveFriend={onRemoveFriend}
						allowFollow={allowFollow}
					/>

					<footer className="mt-auto pb-2 font-mono text-[10px] leading-relaxed text-label">
						<p>{t("rightRail.footerTerms")}</p>
						<p>{t("rightRail.stats", { posts: totalPosts, likes: totalLikes, comments: totalComments })}</p>
					</footer>
				</div>
			</div>
		</aside>
	);
}
