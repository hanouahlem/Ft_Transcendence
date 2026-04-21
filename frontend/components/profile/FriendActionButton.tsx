"use client";

import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n/I18nProvider";

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
  t,
}: {
  isConnected: boolean;
  incomingRequestId?: number;
  isPending: boolean;
  isSubmitting: boolean;
  t: (key: string) => string;
}) {
  if (isSubmitting) {
    if (isConnected) {
      return t("common.removing");
    }

    if (incomingRequestId) {
      return t("common.accepting");
    }

    return t("common.adding");
  }

  if (isConnected) {
    return t("common.remove");
  }

  if (incomingRequestId) {
    return t("common.accept");
  }

  if (isPending) {
    return t("common.pending");
  }

  return t("common.add");
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
  const { t } = useI18n();
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
        t,
      })}
    </Button>
  );
}
