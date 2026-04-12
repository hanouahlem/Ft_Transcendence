import { FriendActionButton } from "@/components/profile/FriendActionButton";
import { UserArchiveCard } from "@/components/users/UserArchiveCard";
import { buildProfileHref } from "@/lib/user-preview";
import type { PublicUser } from "@/lib/api";

export type SearchUserRecord = PublicUser & {
  friendCount: number;
  postCount: number;
  totalLikes: number;
  totalComments: number;
};

type SearchUserCardProps = {
  user: SearchUserRecord;
  currentUserId?: number;
  sentRequests: number[];
  incomingRequestIdsBySender: Record<number, number>;
  connectedFriendshipIdsByUser: Record<number, number>;
  sendingFriendId: number | null;
  onAddFriend: (userId: number) => void | Promise<void>;
  onAcceptFriend: (userId: number) => void | Promise<void>;
  onRemoveFriend: (userId: number) => void | Promise<void>;
};

export function SearchUserCard({
  user,
  currentUserId,
  sentRequests,
  incomingRequestIdsBySender,
  connectedFriendshipIdsByUser,
  sendingFriendId,
  onAddFriend,
  onAcceptFriend,
  onRemoveFriend,
}: SearchUserCardProps) {
  const isOwnUser = currentUserId === user.id;
  const isPending = sentRequests.includes(user.id);
  const incomingRequestId = incomingRequestIdsBySender[user.id];
  const isConnected = typeof connectedFriendshipIdsByUser[user.id] === "number";
  const showFriendAction = !isOwnUser && !isConnected;
  const profileHref = buildProfileHref(user.username);

  return (
    <UserArchiveCard
      user={user}
      cardHref={profileHref}
      topRightContent={
        showFriendAction ? (
          <FriendActionButton
            profileUserId={user.id}
            isConnected={isConnected}
            incomingRequestId={incomingRequestId}
            isPending={isPending}
            sendingFriendId={sendingFriendId}
            onAddFriend={onAddFriend}
            onAcceptFriend={onAcceptFriend}
            onRemoveFriend={onRemoveFriend}
          />
        ) : null
      }
    />
  );
}
