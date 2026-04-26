"use client";

import { useCallback, useState } from "react";
import type { FeedPost } from "@/lib/feed-types";
import { createPostRequest } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useArchiveToasts } from "@/hooks/useArchiveToasts";
import { useI18n } from "@/i18n/I18nProvider";

export function useCreatePost() {
  const { token } = useAuth();
  const { notifyError, notifySuccess } = useArchiveToasts();
  const { t } = useI18n();
  const [publishing, setPublishing] = useState(false);

  const createPost = useCallback(
    async (content: string, file: File | null): Promise<FeedPost> => {
      const trimmedContent = content.trim();

      if (!trimmedContent) {
        const error = new Error(t("toasts.needContent"));
        notifyError(error.message);
        throw error;
      }

      if (!token) {
        const error = new Error(t("toasts.needLogin"));
        notifyError(error.message);
        throw error;
      }

      try {
        setPublishing(true);

        const result = await createPostRequest(trimmedContent, file, token);

        if (!result.ok) {
          throw new Error(result.message || t("toasts.publishFailed"));
        }

        notifySuccess(t("toasts.published"));
        return result.data.post;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : t("toasts.publishFailed");
        notifyError(message);
        throw error;
      } finally {
        setPublishing(false);
      }
    },
    [notifyError, notifySuccess, t, token],
  );

  return {
    createPost,
    publishing,
  };
}
