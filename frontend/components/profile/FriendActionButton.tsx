"use client";

import { Button } from "@/components/ui/button";

type FriendActionButtonProps = {
  profileUserId: number | null;
  isConnected: boolean;
  incomingRequestId?: number;
  isPending: boolean;
  sendingFriendId: number | null;
  onAddFriend: (userId: number) => void;
  onAcceptFriend: (userId: number) => void;
  onRemoveFriend: (userId: number) => void;
};

function getFriendActionLabel({
  isConnected,
  incomingRequestId,
  isPending,
  isSubmitting,
}: {
  isConnected: boolean;
  incomingRequestId?: number;
  isPending: boolean;
  isSubmitting: boolean;
}) {
  if (isSubmitting) {
    if (isConnected) {
      return "Removing";
    }

    if (incomingRequestId) {
      return "Accepting";
    }

    return "Adding";
  }

  if (isConnected) {
    return "Remove";
  }

  if (incomingRequestId) {
    return "Accept";
  }

  if (isPending) {
    return "Pending";
  }

  return "Add";
}

function getFriendActionVariant({
  isConnected,
  incomingRequestId,
  isPending,
}: {
  isConnected: boolean;
  incomingRequestId?: number;
  isPending: boolean;
}) {
  if (isConnected) {
    return "destructive" as const;
  }

  if (incomingRequestId) {
    return "bluesh" as const;
  }

  if (isPending) {
    return "subtle" as const;
  }

  return "default" as const;
}

export function FriendActionButton({
  profileUserId,
  isConnected,
  incomingRequestId,
  isPending,
  sendingFriendId,
  onAddFriend,
  onAcceptFriend,
  onRemoveFriend,
}: FriendActionButtonProps) {
  const isSubmitting =
    profileUserId !== null && sendingFriendId === profileUserId;

  const handleClick = () => {
    if (profileUserId === null) {
      return;
    }

    if (isConnected) {
      onRemoveFriend(profileUserId);
      return;
    }

    if (incomingRequestId) {
      onAcceptFriend(profileUserId);
      return;
    }

    if (!isPending) {
      onAddFriend(profileUserId);
    }
  };

  return (
    <Button
      type="button"
      variant={getFriendActionVariant({
        isConnected,
        incomingRequestId,
        isPending,
      })}
      size="lg"
      disabled={isPending || isSubmitting}
      onClick={handleClick}
    >
      {getFriendActionLabel({
        isConnected,
        incomingRequestId,
        isPending,
        isSubmitting,
      })}
    </Button>
  );
}
