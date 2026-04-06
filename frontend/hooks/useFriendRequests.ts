"use client";

import { useState } from "react";
import { useArchiveToasts } from "@/hooks/useArchiveToasts";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

type UseFriendRequestsOptions = {
  token: string | null;
};

export function useFriendRequests({ token }: UseFriendRequestsOptions) {
  const { notifyError, notifySuccess } = useArchiveToasts();
  const [sentRequests, setSentRequests] = useState<number[]>([]);
  const [sendingFriendId, setSendingFriendId] = useState<number | null>(null);

  const handleAddFriend = async (receiverId: number) => {
    if (!token) {
      notifyError("You must be logged in to send a friend request.");
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
          notifySuccess("Friend request already sent.");
          return;
        }

        throw new Error(data.message || "Unable to send the friend request.");
      }

      setSentRequests((prev) => (prev.includes(receiverId) ? prev : [...prev, receiverId]));
      notifySuccess(data.message || "Friend request sent.");
    } catch (error) {
      console.error("handleAddFriend error:", error);
      notifyError(error instanceof Error ? error.message : "Failed to send the friend request.");
    } finally {
      setSendingFriendId(null);
    }
  };

  return {
    sentRequests,
    setSentRequests,
    sendingFriendId,
    handleAddFriend,
  };
}
