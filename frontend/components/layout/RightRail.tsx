"use client";

import type { RightRailSuggestion } from "@/lib/right-rail";
import { RightRailSearch } from "@/components/layout/RightRailSearch";
import { RightRailSuggestions } from "@/components/layout/RightRailSuggestions";
import { RightRailTrends } from "@/components/layout/RightRailTrends";

type RightRailProps = {
	totalPosts: number;
	totalLikes: number;
	totalComments: number;
	sectionTitle: string;
	suggestions: RightRailSuggestion[];
	sentRequests: number[];
	incomingRequestIdsBySender: Record<number, number>;
	sendingFriendId: number | null;
	onAddFriend: (receiverId: number) => Promise<void>;
	onAcceptFriend: (senderId: number) => Promise<void>;
	allowFollow?: boolean;
};

export function RightRail({
	totalPosts,
	totalLikes,
	totalComments,
	sectionTitle,
	suggestions,
	sentRequests,
	incomingRequestIdsBySender,
	sendingFriendId,
	onAddFriend,
	onAcceptFriend,
	allowFollow = true,
}: RightRailProps) {
	return (
		<aside className="hidden w-73 shrink-0 xl:block">
			<div
				className="fixed inset-y-0 z-20 hidden w-77 py-8 xl:block"
				style={{ right: "max(0px, calc(50vw - 604px))" }}
			>
				<div className="flex h-full w-full flex-col gap-10 overflow-y-auto pr-1">
					<RightRailSearch />
					<RightRailTrends />
					<RightRailSuggestions
						sectionTitle={sectionTitle}
						suggestions={suggestions}
						sentRequests={sentRequests}
						incomingRequestIdsBySender={incomingRequestIdsBySender}
						sendingFriendId={sendingFriendId}
						onAddFriend={onAddFriend}
						onAcceptFriend={onAcceptFriend}
						allowFollow={allowFollow}
					/>

					<footer className="mt-auto pb-2 font-mono text-[10px] leading-relaxed text-label">
						<p>Terms of Service · Privacy Policy · Cookie Policy</p>
						<p>
							{totalPosts} logs · {totalLikes} likes · {totalComments} notes
						</p>
					</footer>
				</div>
			</div>
		</aside>
	);
}
