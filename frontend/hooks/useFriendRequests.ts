"use client";

import { useEffect, useState } from "react";
import { useArchiveToasts } from "@/hooks/useArchiveToasts";
import { useI18n } from "@/i18n/I18nProvider";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

type UseFriendRequestsOptions = {
  token: string | null;
  onFriendAccepted?: (userId: number) => void;
};

type PendingFriendRequest = {
  id: number;
  sender?: {
    id?: number;
  } | null;
  receiver?: {
    id?: number;
  } | null;
};

type AcceptedFriend = {
  id: number;
  friendshipId?: number;
};

export function useFriendRequests({
  token,
  onFriendAccepted,
}: UseFriendRequestsOptions) {
  const { notifyError, notifySuccess } = useArchiveToasts();
  const { t } = useI18n();
  const [sentRequests, setSentRequests] = useState<number[]>([]);
  const [incomingRequestIdsBySender, setIncomingRequestIdsBySender] = useState<
    Record<number, number>
  >({});
  const [connectedFriendshipIdsByUser, setConnectedFriendshipIdsByUser] =
    useState<Record<number, number>>({});
  const [sendingFriendId, setSendingFriendId] = useState<number | null>(null);

  const mapFriendBackendMessage = (
    message: unknown,
    fallbackKey: string,
  ): string => {
    if (typeof message !== "string") {
      return t(fallbackKey);
    }

    switch (message) {
      case "receiverId is required":
        return t("friendRequests.errors.missingReceiver");
      case "You cannot add yourself":
        return t("friendRequests.errors.cannotAddSelf");
      case "User not found":
        return t("friendRequests.errors.userNotFound");
      case "Friend request already exists":
        return t("friendRequests.success.alreadySent");
      case "Friend request not found":
        return t("friendRequests.errors.requestNotFound");
      case "Not authorized":
        return t("friendRequests.errors.notAuthorized");
      case "Request already handled":
        return t("friendRequests.errors.requestHandled");
      case "Friend not found":
        return t("friendRequests.errors.friendNotFound");
      case "userId required":
      case "userId is required":
        return t("friendRequests.errors.userIdRequired");
      default:
        return t(fallbackKey);
    }
  };

  useEffect(() => {
    if (!token) {
      setSentRequests([]);
      setIncomingRequestIdsBySender({});
      setConnectedFriendshipIdsByUser({});
      return;
    }

    const fetchPendingRequests = async () => {
      try {
        const [incomingRes, sentRes, friendsRes] = await Promise.all([
          fetch(`${API_URL}/friends/requests`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch(`${API_URL}/friends/requests/sent`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch(`${API_URL}/friends`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

        const [incomingData, sentData, friendsData] = await Promise.all([
          incomingRes.json(),
          sentRes.json(),
          friendsRes.json(),
        ]);

        if (!incomingRes.ok || !Array.isArray(incomingData)) {
          return;
        }

        const nextIncomingRequests = incomingData.reduce<Record<number, number>>(
          (accumulator, request: PendingFriendRequest) => {
            const senderId = request.sender?.id;

            if (typeof request.id === "number" && typeof senderId === "number") {
              accumulator[senderId] = request.id;
            }

            return accumulator;
          },
          {},
        );

        const nextSentRequests =
          sentRes.ok && Array.isArray(sentData)
            ? sentData.reduce<number[]>((accumulator, request: PendingFriendRequest) => {
                const receiverId = request.receiver?.id;

                if (typeof receiverId === "number") {
                  accumulator.push(receiverId);
                }

                return accumulator;
              }, [])
            : [];

        const nextConnectedFriendshipIds =
          friendsRes.ok && Array.isArray(friendsData)
            ? friendsData.reduce<Record<number, number>>(
                (accumulator, friend: AcceptedFriend) => {
                  if (
                    typeof friend.id === "number" &&
                    typeof friend.friendshipId === "number"
                  ) {
                    accumulator[friend.id] = friend.friendshipId;
                  }

                  return accumulator;
                },
                {},
              )
            : {};

        setIncomingRequestIdsBySender(nextIncomingRequests);
        setSentRequests(nextSentRequests);
        setConnectedFriendshipIdsByUser(nextConnectedFriendshipIds);
      } catch (error) {
        console.error("fetchPendingRequests error:", error);
      }
    };

    fetchPendingRequests();
  }, [token]);

  const handleAddFriend = async (receiverId: number) => {
    if (!token) {
      notifyError(t("friendRequests.errors.loginSend"));
      return;
    }

    try {
      setSendingFriendId(receiverId);

      const res = await fetch(`${API_URL}/friends`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ receiverId }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.message === "Friend request already exists") {
          setSentRequests((prev) => (prev.includes(receiverId) ? prev : [...prev, receiverId]));
          notifySuccess(t("friendRequests.success.alreadySent"));
          return;
        }

        throw new Error(mapFriendBackendMessage(data.message, "friendRequests.errors.send"));
      }

      setSentRequests((prev) => (prev.includes(receiverId) ? prev : [...prev, receiverId]));
      notifySuccess(t("friendRequests.success.sent"));
    } catch (error) {
      console.error("handleAddFriend error:", error);
      notifyError(
        error instanceof Error ? error.message : t("friendRequests.errors.sendFallback"),
      );
    } finally {
      setSendingFriendId(null);
    }
  };

  const handleAcceptFriend = async (senderId: number) => {
    if (!token) {
      notifyError(t("friendRequests.errors.loginAccept"));
      return;
    }

    const requestId = incomingRequestIdsBySender[senderId];

    if (!requestId) {
      notifyError(t("friendRequests.errors.requestNotFound"));
      return;
    }

    try {
      setSendingFriendId(senderId);

      const res = await fetch(`${API_URL}/friends/${requestId}/accept`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(mapFriendBackendMessage(data.message, "friendRequests.errors.accept"));
      }

      setIncomingRequestIdsBySender((prev) => {
        const next = { ...prev };
        delete next[senderId];
        return next;
      });
      setConnectedFriendshipIdsByUser((prev) => ({
        ...prev,
        [senderId]: data.friend.id,
      }));

      notifySuccess(t("friendRequests.success.accepted"));
      onFriendAccepted?.(senderId);
    } catch (error) {
      console.error("handleAcceptFriend error:", error);
      notifyError(
        error instanceof Error ? error.message : t("friendRequests.errors.acceptFallback"),
      );
    } finally {
      setSendingFriendId(null);
    }
  };

  const handleRemoveFriend = async (userId: number) => {
    if (!token) {
      notifyError(t("friendRequests.errors.loginRemove"));
      return;
    }

    const friendshipId = connectedFriendshipIdsByUser[userId];

    if (!friendshipId) {
      notifyError(t("friendRequests.errors.friendshipNotFound"));
      return;
    }

    try {
      setSendingFriendId(userId);

      const res = await fetch(`${API_URL}/friends/${friendshipId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(mapFriendBackendMessage(data.message, "friendRequests.errors.remove"));
      }

      setConnectedFriendshipIdsByUser((prev) => {
        const next = { ...prev };
        delete next[userId];
        return next;
      });
      notifySuccess(t("friendRequests.success.removed"));
    } catch (error) {
      console.error("handleRemoveFriend error:", error);
      notifyError(
        error instanceof Error ? error.message : t("friendRequests.errors.removeFallback"),
      );
    } finally {
      setSendingFriendId(null);
    }
  };

  return {
    sentRequests,
    setSentRequests,
    incomingRequestIdsBySender,
    connectedFriendshipIdsByUser,
    sendingFriendId,
    handleAddFriend,
    handleAcceptFriend,
    handleRemoveFriend,
  };
}
