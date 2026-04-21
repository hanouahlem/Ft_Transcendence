"use client";

import { useCallback, useState } from "react";
import type { FeedPost } from "@/lib/feed-types";
import { createPostRequest } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useArchiveToasts } from "@/hooks/useArchiveToasts";

export function useCreatePost() {
  const { token } = useAuth();
  const { notifyError, notifySuccess } = useArchiveToasts();
  const [publishing, setPublishing] = useState(false);

  const createPost = useCallback(
    async (content: string, file: File | null): Promise<FeedPost> => {
      const trimmedContent = content.trim();

      if (!trimmedContent) {
        const error = new Error("You need to write something before publishing.");
        notifyError(error.message);
        throw error;
      }

      if (!token) {
        const error = new Error("You must be logged in to publish.");
        notifyError(error.message);
        throw error;
      }

      try {
        setPublishing(true);

        const result = await createPostRequest(trimmedContent, file, token);

        if (!result.ok) {
          throw new Error(result.message || "Unable to publish the post.");
        }

        notifySuccess("Post published successfully.");
        return result.data.post;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to publish the post.";
        notifyError(message);
        throw error;
      } finally {
        setPublishing(false);
      }
    },
    [notifyError, notifySuccess, token],
  );

  return {
    createPost,
    publishing,
  };
}
