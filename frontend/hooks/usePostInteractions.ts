"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { FeedComment, FeedPost } from "@/lib/feed-types";
import { useArchiveToasts } from "@/hooks/useArchiveToasts";
import { normalizeUploadedMediaPayload } from "@/lib/api";
import { useI18n } from "@/i18n/I18nProvider";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

type UsePostInteractionsOptions = {
  token: string | null;
};

export function usePostInteractions({ token }: UsePostInteractionsOptions) {
  const { notifyError, notifySuccess } = useArchiveToasts();
  const { t } = useI18n();
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [deletingPostId, setDeletingPostId] = useState<number | null>(null);
  const [deletingCommentId, setDeletingCommentId] = useState<number | null>(null);
  const [likingPostId, setLikingPostId] = useState<number | null>(null);
  const [favoritingPostId, setFavoritingPostId] = useState<number | null>(null);
  const [likingCommentId, setLikingCommentId] = useState<number | null>(null);
  const [favoritingCommentId, setFavoritingCommentId] = useState<number | null>(null);
  const [commentInputs, setCommentInputs] = useState<Record<number, string>>({});
  const [commentingPostId, setCommentingPostId] = useState<number | null>(null);
  const [dialogPostId, setDialogPostId] = useState<number | null>(null);
  const [dialogPostSnapshot, setDialogPostSnapshot] = useState<FeedPost | null>(null);
  const [postDialogOpen, setPostDialogOpen] = useState(false);
  const [focusCommentInput, setFocusCommentInput] = useState(false);
  const translateApiMessage = (message?: string | null) => (message ? t(message) : "");

  const activePost = useMemo(
    () => posts.find((post) => post.id === dialogPostId) ?? dialogPostSnapshot ?? null,
    [posts, dialogPostId, dialogPostSnapshot],
  );

  const commentValue = dialogPostId ? commentInputs[dialogPostId] || "" : "";

  useEffect(() => {
    if (dialogPostId === null) {
      return;
    }

    const nextPost = posts.find((post) => post.id === dialogPostId) ?? dialogPostSnapshot;

    if (nextPost) {
      setDialogPostSnapshot(nextPost);
    }
  }, [posts, dialogPostId, dialogPostSnapshot]);

  const resetInteractionState = useCallback(() => {
    setDeletingPostId(null);
    setDeletingCommentId(null);
    setLikingPostId(null);
    setFavoritingPostId(null);
    setLikingCommentId(null);
    setFavoritingCommentId(null);
    setCommentInputs({});
    setCommentingPostId(null);
    setDialogPostId(null);
    setDialogPostSnapshot(null);
    setPostDialogOpen(false);
    setFocusCommentInput(false);
  }, []);

  const updatePostInState = (postId: number, updater: (post: FeedPost) => FeedPost) => {
    setPosts((prevPosts) => prevPosts.map((post) => (post.id === postId ? updater(post) : post)));
  };

  const updateCommentInState = (
    commentId: number,
    updater: (comment: FeedComment) => FeedComment,
  ) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) => {
        const hasComment = post.comments.some((comment) => comment.id === commentId);

        if (!hasComment) {
          return post;
        }

        return {
          ...post,
          comments: post.comments.map((comment) =>
            comment.id === commentId ? updater(comment) : comment,
          ),
        };
      }),
    );
  };

  const handleCommentChange = (postId: number, value: string) => {
    setCommentInputs((prev) => ({
      ...prev,
      [postId]: value,
    }));
  };

  const handleOpenPost = (postId: number, shouldFocusCommentInput = false) => {
    const post = posts.find((item) => item.id === postId) ?? null;

    setDialogPostId(postId);
    setDialogPostSnapshot(post);
    setPostDialogOpen(true);
    setFocusCommentInput(shouldFocusCommentInput);
  };

  const handlePostDialogChange = (open: boolean) => {
    setPostDialogOpen(open);

    if (!open) {
      setFocusCommentInput(false);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!token) {
      notifyError(t("postInteractions.errors.loginDeleteComment"));
      return;
    }

    try {
      setDeletingCommentId(commentId);

      const response = await fetch(`${API_URL}/comments/${commentId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "api.posts.errors.unableDeleteComment");
      }

      setPosts((prevPosts) =>
        prevPosts.map((post) => {
          const hasComment = post.comments.some((comment) => comment.id === commentId);

          if (!hasComment) {
            return post;
          }

          return {
            ...post,
            comments: post.comments.filter((comment) => comment.id !== commentId),
            commentsCount: Math.max(0, post.commentsCount - 1),
          };
        }),
      );

      notifySuccess(t("postInteractions.success.commentDeleted"));
    } catch (error) {
      console.error("handleDeleteComment error:", error);
      notifyError(
        error instanceof Error ? translateApiMessage(error.message) : t("postInteractions.errors.unknown"),
      );
    } finally {
      setDeletingCommentId(null);
    }
  };

  const handleAddComment = async (postId: number) => {
    if (!token) {
      notifyError(t("postInteractions.errors.loginComment"));
      return;
    }

    const content = commentInputs[postId]?.trim() || "";

    if (!content) {
      notifyError(t("postInteractions.errors.commentRequired"));
      return;
    }

    try {
      setCommentingPostId(postId);

      const res = await fetch(`${API_URL}/posts/${postId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content }),
      });

      const data = await res.json();

      if (!res.ok) {
        notifyError(translateApiMessage(data.message) || t("postInteractions.errors.addComment"));
        return;
      }

      setCommentInputs((prev) => ({ ...prev, [postId]: "" }));
      if (data.comment) {
        const normalizedComment = normalizeUploadedMediaPayload(data.comment);

        updatePostInState(postId, (post) => ({
          ...post,
          comments: [...post.comments, normalizedComment],
          commentsCount: post.commentsCount + 1,
        }));
      }
    } catch (error) {
      notifyError(
        error instanceof Error ? translateApiMessage(error.message) : t("postInteractions.errors.addCommentFallback"),
      );
    } finally {
      setCommentingPostId(null);
    }
  };

  const handleDelete = async (postId: number) => {
    if (!token) {
      notifyError(t("postInteractions.errors.loginDeletePost"));
      return;
    }

    try {
      setDeletingPostId(postId);

      const res = await fetch(`${API_URL}/posts/${postId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "api.posts.errors.unableDeletePost");
      }

      notifySuccess(t("postInteractions.success.postDeleted"));
      setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId));
      setPostDialogOpen((prevOpen) => (prevOpen && dialogPostId === postId ? false : prevOpen));
    } catch (error) {
      console.error("handleDelete error:", error);
      notifyError(
        error instanceof Error ? translateApiMessage(error.message) : t("postInteractions.errors.deletePostFallback"),
      );
    } finally {
      setDeletingPostId(null);
    }
  };

  const handleToggleLike = async (post: FeedPost) => {
    if (!token) {
      notifyError(t("postInteractions.errors.loginLikePost"));
      return;
    }

    try {
      setLikingPostId(post.id);

      const method = post.likedByCurrentUser ? "DELETE" : "POST";
      const res = await fetch(`${API_URL}/posts/${post.id}/like`, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "api.posts.errors.unableLikePost");
      }

      updatePostInState(post.id, (currentPost) => ({
        ...currentPost,
        likedByCurrentUser: !currentPost.likedByCurrentUser,
        likesCount: Math.max(
          0,
          currentPost.likesCount + (currentPost.likedByCurrentUser ? -1 : 1),
        ),
      }));
    } catch (error) {
      console.error("handleToggleLike error:", error);
      notifyError(
        error instanceof Error ? translateApiMessage(error.message) : t("postInteractions.errors.updateLikeFallback"),
      );
    } finally {
      setLikingPostId(null);
    }
  };

  const handleToggleFavorite = async (post: FeedPost) => {
    if (!token) {
      notifyError(t("postInteractions.errors.loginFavoritePost"));
      return;
    }

    try {
      setFavoritingPostId(post.id);

      const method = post.favoritedByCurrentUser ? "DELETE" : "POST";
      const res = await fetch(`${API_URL}/posts/${post.id}/favorite`, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "api.posts.errors.unableFavoritePost");
      }

      updatePostInState(post.id, (currentPost) => ({
        ...currentPost,
        favoritedByCurrentUser: !currentPost.favoritedByCurrentUser,
        favoritesCount: Math.max(
          0,
          currentPost.favoritesCount + (currentPost.favoritedByCurrentUser ? -1 : 1),
        ),
      }));
    } catch (error) {
      console.error("handleToggleFavorite error:", error);
      notifyError(
        error instanceof Error
          ? translateApiMessage(error.message)
          : t("postInteractions.errors.updateFavoriteFallback"),
      );
    } finally {
      setFavoritingPostId(null);
    }
  };

  const handleToggleCommentLike = async (comment: FeedComment) => {
    if (!token) {
      notifyError(t("postInteractions.errors.loginLikeComment"));
      return;
    }

    try {
      setLikingCommentId(comment.id);

      const method = comment.likedByCurrentUser ? "DELETE" : "POST";
      const res = await fetch(`${API_URL}/comments/${comment.id}/like`, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "api.posts.errors.unableLikeComment");
      }

      updateCommentInState(comment.id, (currentComment) => ({
        ...currentComment,
        likedByCurrentUser: !currentComment.likedByCurrentUser,
        likesCount: Math.max(
          0,
          currentComment.likesCount + (currentComment.likedByCurrentUser ? -1 : 1),
        ),
      }));
    } catch (error) {
      console.error("handleToggleCommentLike error:", error);
      notifyError(
        error instanceof Error
          ? translateApiMessage(error.message)
          : t("postInteractions.errors.updateCommentLikeFallback"),
      );
    } finally {
      setLikingCommentId(null);
    }
  };

  const handleToggleCommentFavorite = async (comment: FeedComment) => {
    if (!token) {
      notifyError(t("postInteractions.errors.loginFavoriteComment"));
      return;
    }

    try {
      setFavoritingCommentId(comment.id);

      const method = comment.favoritedByCurrentUser ? "DELETE" : "POST";
      const res = await fetch(`${API_URL}/comments/${comment.id}/favorite`, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "api.posts.errors.unableFavoriteComment");
      }

      updateCommentInState(comment.id, (currentComment) => ({
        ...currentComment,
        favoritedByCurrentUser: !currentComment.favoritedByCurrentUser,
        favoritesCount: Math.max(
          0,
          currentComment.favoritesCount + (currentComment.favoritedByCurrentUser ? -1 : 1),
        ),
      }));
    } catch (error) {
      console.error("handleToggleCommentFavorite error:", error);
      notifyError(
        error instanceof Error
          ? translateApiMessage(error.message)
          : t("postInteractions.errors.updateCommentFavoriteFallback"),
      );
    } finally {
      setFavoritingCommentId(null);
    }
  };

  return {
    posts,
    setPosts,
    activePost,
    postDialogOpen,
    focusCommentInput,
    commentValue,
    deletingPostId,
    deletingCommentId,
    likingPostId,
    favoritingPostId,
    likingCommentId,
    favoritingCommentId,
    commentingPostId,
    handleCommentChange,
    handleOpenPost,
    handlePostDialogChange,
    handleDeleteComment,
    handleAddComment,
    handleDelete,
    handleToggleLike,
    handleToggleFavorite,
    handleToggleCommentLike,
    handleToggleCommentFavorite,
    resetInteractionState,
  };
}
