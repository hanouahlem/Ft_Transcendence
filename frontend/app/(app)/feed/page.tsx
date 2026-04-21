"use client";

import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import { Plus } from "lucide-react";
import {
  Pagination,
  PaginationControls,
  PaginationItems,
  PaginationNextTrigger,
  PaginationPrevTrigger,
  PaginationSummary,
} from "@/components/ui/pagination";
import type { FeedPost } from "@/lib/feed-types";
import { RightRail } from "@/components/layout/RightRail";
import { NewPostCard } from "@/components/posts/NewPostCard";
import { PostCard } from "@/components/posts/PostCard";
import { PostDialog } from "@/components/posts/PostDialog";
import { getRightRailTitle, type RightRailSuggestion } from "@/lib/right-rail";
import { useAuth } from "@/context/AuthContext";
import { useArchiveToasts } from "@/hooks/useArchiveToasts";
import { useFriendRequests } from "@/hooks/useFriendRequests";
import { usePostInteractions } from "@/hooks/usePostInteractions";
import { useI18n } from "@/i18n/I18nProvider";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
const POSTS_PER_PAGE = 50;

type FeedScope = "all" | "friends";

export default function FeedPage() {
  const { user, token } = useAuth();
  const { t } = useI18n();
  const { notifyError, notifySuccess } = useArchiveToasts();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [suggestions, setSuggestions] = useState<RightRailSuggestion[]>([]);
  const [feedScope, setFeedScope] = useState<FeedScope>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [composerResetToken, setComposerResetToken] = useState(0);

  const {
    sentRequests,
    incomingRequestIdsBySender,
    sendingFriendId,
    handleAddFriend,
    handleAcceptFriend,
  } = useFriendRequests({
    token,
    onFriendAccepted: (userId) => {
      setSuggestions((prev) =>
        prev.filter((suggestion) => suggestion.id !== userId),
      );
    },
  });

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const {
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
  } = usePostInteractions({ token });

  const totalLikes = useMemo(
    () => posts.reduce((sum, post) => sum + post.likesCount, 0),
    [posts],
  );

  const totalComments = useMemo(
    () => posts.reduce((sum, post) => sum + post.commentsCount, 0),
    [posts],
  );

  const rightRailLabels = {
    myFriends: t("rightRail.myFriends"),
    youMightKnow: t("rightRail.youMightKnow"),
    friendsSuffix: t("rightRail.friendsSuffix"),
  };

  const totalPages = Math.max(1, Math.ceil(posts.length / POSTS_PER_PAGE));

  const paginatedPosts = useMemo(() => {
    const startIndex = (currentPage - 1) * POSTS_PER_PAGE;

    return posts.slice(startIndex, startIndex + POSTS_PER_PAGE);
  }, [currentPage, posts]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  useEffect(() => {
    if (!token) {
      return;
    }

    fetchPosts();
    fetchRightRailSuggestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, user?.id, feedScope]);

  useEffect(() => {
    setCurrentPage(1);
  }, [feedScope]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  useEffect(() => {
    const handlePostCreated = (event: Event) => {
      const customEvent = event as CustomEvent<FeedPost | undefined>;
      const createdPost = customEvent.detail;

      if (!createdPost) {
        return;
      }

      if (feedScope === "friends") {
        return;
      }

      setPosts((prevPosts) => [
        createdPost,
        ...prevPosts.filter((post) => post.id !== createdPost.id),
      ]);
    };

    window.addEventListener("archive:post-created", handlePostCreated);
    return () => {
      window.removeEventListener("archive:post-created", handlePostCreated);
    };
  }, [feedScope, setPosts]);

  const resetComposer = () => {
    setComposerResetToken((previous) => previous + 1);
    handleRemoveFile();
  };

  const fetchPosts = async () => {
    if (!token) return;

    try {
      setLoading(true);
      const endpoint = feedScope === "friends" ? "/posts/friends" : "/posts";

      const res = await fetch(`${API_URL}${endpoint}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Unable to fetch posts.");
      }

      setPosts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Erreur fetchPosts :", err);
      notifyError(
        err instanceof Error ? err.message : "Failed to load the feed.",
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchRightRailSuggestions = async () => {
    if (!token) return;

    try {
      const res = await fetch(`${API_URL}/friends/suggestions`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message || "Unable to fetch right-rail suggestions.",
        );
      }

      const normalizedSuggestions = Array.isArray(data?.suggestions)
        ? data.suggestions
          .filter(
            (item: unknown): item is RightRailSuggestion =>
              typeof item === "object" &&
              item !== null &&
              "id" in item &&
              "username" in item &&
              typeof item.id === "number" &&
              typeof item.username === "string",
          )
          .map((item: RightRailSuggestion) => ({
            id: item.id,
            username: item.username,
            displayName: item.displayName || null,
            avatar: item.avatar || null,
          }))
        : [];

      setSuggestions(normalizedSuggestions);
    } catch (err) {
      console.error("Erreur suggestions right rail :", err);
    }
  };

  const handleOpenFilePicker = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleRemoveFile = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedFile(null);
    setPreviewUrl("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handlePublish = async (content: string) => {
    const trimmedContent = content.trim();

    if (!trimmedContent) {
      notifyError("You need to write something before publishing.");
      return;
    }

    if (!token) {
      notifyError("You must be logged in to publish.");
      return;
    }

    try {
      setPublishing(true);

      const formData = new FormData();
      formData.append("content", trimmedContent);

      if (selectedFile) {
        formData.append("media", selectedFile);
      }

      const res = await fetch(`${API_URL}/posts`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Unable to publish the post.");
      }

      notifySuccess("Post published successfully.");
      if (data.post) {
        if (feedScope === "all") {
          setPosts((prevPosts) => [data.post, ...prevPosts]);
        }
      }
      resetComposer();
    } catch (err) {
      console.error("Erreur publish post :", err);
      notifyError(
        err instanceof Error ? err.message : "Failed to publish the post.",
      );
    } finally {
      setPublishing(false);
    }
  };

  return (
    <>
      <div className="flex items-start justify-center gap-8 xl:gap-10">
        <section className="min-w-0 w-full max-w-[800px]">
          <div className="flex flex-col gap-8 lg:gap-12">
            <NewPostCard
              key={composerResetToken}
              previewUrl={previewUrl}
              selectedFileName={selectedFile?.name || ""}
              publishing={publishing}
              onPublish={handlePublish}
              onOpenFilePicker={handleOpenFilePicker}
              onRemoveFile={handleRemoveFile}
            />

            <div className="-rotate-1 self-end w-fit inline-flex border border-ink/0 bg-paper-muted p-1 -my-6">
              <button
                type="button"
                onClick={() => setFeedScope("all")}
                className={`px-4 py-2 font-mono text-[11px] uppercase tracking-[0.18em] transition ${feedScope === "all"
                  ? "bg-accent-blue text-paper"
                  : "text-label hover:bg-black/5"
                  }`}
              >
                {t("feed.scopeAll")}
              </button>
              <button
                type="button"
                onClick={() => setFeedScope("friends")}
                className={`px-4 py-2 font-mono text-[11px] uppercase tracking-[0.18em] transition ${feedScope === "friends"
                  ? "bg-accent-green text-paper"
                  : "text-label hover:bg-black/5"
                  }`}
              >
                {t("feed.scopeFriends")}
              </button>
            </div>

            {loading ? (
              <section className="border border-black/10 bg-paper px-5 py-6 shadow-[6px_8px_25px_rgba(26,26,26,0.12)]">
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-label">
                  {feedScope === "friends"
                    ? t("feed.loadingFriends")
                    : t("feed.loadingAll")}
                </p>
              </section>
            ) : posts.length === 0 ? (
              <section className="border border-black/10 bg-paper px-5 py-6 shadow-[6px_8px_25px_rgba(26,26,26,0.12)]">
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-label">
                  {feedScope === "friends"
                    ? t("feed.emptyFriends")
                    : t("feed.emptyAll")}
                </p>
              </section>
            ) : (
              <div className="flex flex-col gap-10">
                {paginatedPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    currentUserId={user?.id}
                    onOpenPost={handleOpenPost}
                    onDelete={handleDelete}
                    onToggleLike={handleToggleLike}
                    onToggleFavorite={handleToggleFavorite}
                    deletingPostId={deletingPostId}
                    likingPostId={likingPostId}
                    favoritingPostId={favoritingPostId}
                  />
                ))}
              </div>
            )}

            {posts.length > POSTS_PER_PAGE ? (
              <Pagination
                count={posts.length}
                page={currentPage}
                pageSize={POSTS_PER_PAGE}
                siblingCount={1}
                onPageChange={(details) => setCurrentPage(details.page)}
                className="border-t border-dashed border-label/30 py-8"
              >
                <PaginationSummary itemLabel={t("feed.posts")} />
                <PaginationControls>
                  <PaginationPrevTrigger />
                  <PaginationItems />
                  <PaginationNextTrigger />
                </PaginationControls>
              </Pagination>
            ) : null}

            <div className="border-t border-dashed border-label py-8 text-center font-mono text-sm text-label">
              {t("feed.endOfLogs")}
            </div>
          </div>
        </section>

        <RightRail
          totalPosts={posts.length}
          totalLikes={totalLikes}
          totalComments={totalComments}
          sectionTitle={getRightRailTitle({}, rightRailLabels)}
          suggestions={suggestions}
          sentRequests={sentRequests}
          incomingRequestIdsBySender={incomingRequestIdsBySender}
          sendingFriendId={sendingFriendId}
          onAddFriend={handleAddFriend}
          onAcceptFriend={handleAcceptFriend}
        />
      </div>

      <button
        type="button"
        onClick={() => window.dispatchEvent(new Event("archive:create-post"))}
        className="fixed bottom-6 right-6 z-40 flex h-16 w-16 items-center justify-center rounded-full border border-ink bg-ink text-paper shadow-[3px_6px_0_#d32f2f] transition hover:scale-105 lg:hidden"
        aria-label={t("feed.newPostAria")}
      >
        <Plus className="h-6 w-6" />
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      <PostDialog
        open={postDialogOpen}
        post={activePost}
        focusCommentInput={focusCommentInput}
        currentUserId={user?.id}
        onOpenChange={handlePostDialogChange}
        onDelete={handleDelete}
        onDeleteComment={handleDeleteComment}
        onToggleLike={handleToggleLike}
        onToggleFavorite={handleToggleFavorite}
        onToggleCommentLike={handleToggleCommentLike}
        onToggleCommentFavorite={handleToggleCommentFavorite}
        onCommentChange={handleCommentChange}
        onAddComment={handleAddComment}
        commentValue={commentValue}
        deletingPostId={deletingPostId}
        deletingCommentId={deletingCommentId}
        likingPostId={likingPostId}
        favoritingPostId={favoritingPostId}
        likingCommentId={likingCommentId}
        favoritingCommentId={favoritingCommentId}
        commentingPostId={commentingPostId}
      />
    </>
  );
}
