"use client";

import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import { Plus } from "lucide-react";
import { ArchiveRightRail } from "@/components/archive/ArchiveRightRail";
import type { FeedComment, FeedPost } from "@/components/feed/types";
import { NewPostCard } from "@/components/posts/NewPostCard";
import { NewPostDialog } from "@/components/posts/NewPostDialog";
import { PostCard } from "@/components/posts/PostCard";
import { PostDialog } from "@/components/posts/PostDialog";
import { useAuth } from "@/context/AuthContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function FeedPage() {
  const { user, token } = useAuth();

  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [postContent, setPostContent] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [sentRequests, setSentRequests] = useState<number[]>([]);
  const [sendingFriendId, setSendingFriendId] = useState<number | null>(null);

  const [deletingPostId, setDeletingPostId] = useState<number | null>(null);
  const [deletingCommentId, setDeletingCommentId] = useState<number | null>(null);
  const [likingPostId, setLikingPostId] = useState<number | null>(null);
  const [favoritingPostId, setFavoritingPostId] = useState<number | null>(null);
  const [likingCommentId, setLikingCommentId] = useState<number | null>(null);
  const [favoritingCommentId, setFavoritingCommentId] = useState<number | null>(null);

  const [commentInputs, setCommentInputs] = useState<Record<number, string>>({});
  const [commentingPostId, setCommentingPostId] = useState<number | null>(null);
  const [dialogPostId, setDialogPostId] = useState<number | null>(null);
  const [dialogPostSnapshot, setDialogPostSnapshot] = useState<FeedPost | null>(
    null
  );
  const [postDialogOpen, setPostDialogOpen] = useState(false);
  const [focusCommentInput, setFocusCommentInput] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const suggestions = useMemo(() => {
    const unique = posts.filter(
      (post, index, array) =>
        array.findIndex((item) => item.author.id === post.author.id) === index
    );

    return unique
      .filter((post) => post.author.id !== user?.id)
      .slice(0, 5)
      .map((post) => post.author);
  }, [posts, user?.id]);

  const totalLikes = useMemo(
    () => posts.reduce((sum, post) => sum + post.likesCount, 0),
    [posts]
  );

  const totalComments = useMemo(
    () => posts.reduce((sum, post) => sum + post.commentsCount, 0),
    [posts]
  );

  const activePost = useMemo(
    () =>
      posts.find((post) => post.id === dialogPostId) ?? dialogPostSnapshot ?? null,
    [posts, dialogPostId, dialogPostSnapshot]
  );

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
    fetchExistingFriendRelations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, user?.id]);

  useEffect(() => {
    if (dialogPostId === null) {
      return;
    }

    const nextPost =
      posts.find((post) => post.id === dialogPostId) ?? dialogPostSnapshot;

    if (nextPost) {
      setDialogPostSnapshot(nextPost);
    }
  }, [posts, dialogPostId, dialogPostSnapshot]);

  const resetComposer = () => {
    setPostContent("");
    handleRemoveFile();
    setCreateOpen(false);
  };

  const fetchPosts = async () => {
    if (!token) return;

    try {
      setLoading(true);
      setError("");

      const res = await fetch(`${API_URL}/posts`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Impossible de récupérer les posts.");
      }

      setPosts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Erreur fetchPosts :", err);
      setError(
        err instanceof Error
          ? err.message
          : "Erreur lors du chargement du feed."
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchExistingFriendRelations = async () => {
    if (!token || !user?.id) return;

    try {
      const res = await fetch(`${API_URL}/friends`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Impossible de récupérer les relations.");
      }

      if (!Array.isArray(data)) {
        return;
      }

      const sentIds = data
        .map((item) => {
          const senderId =
            item.senderId ??
            item.sender?.id ??
            item.sender?.userId ??
            item.userId;

          const receiverId =
            item.receiverId ??
            item.receiver?.id ??
            item.receiver?.userId ??
            item.friend?.id;

          const status = item.status;

          return { senderId, receiverId, status };
        })
        .filter(
          (item) =>
            item.senderId === user.id &&
            (item.status === "pending" || item.status === "accepted")
        )
        .map((item) => item.receiverId)
        .filter((id): id is number => typeof id === "number");

      setSentRequests(sentIds);
    } catch (err) {
      console.error("Erreur fetch relations amis :", err);
    }
  };

  const handleCommentChange = (postId: number, value: string) => {
    setCommentInputs((prev) => ({
      ...prev,
      [postId]: value,
    }));
  };

  const updatePostInState = (
    postId: number,
    updater: (post: FeedPost) => FeedPost
  ) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) => (post.id === postId ? updater(post) : post))
    );
  };

  const updateCommentInState = (
    commentId: number,
    updater: (comment: FeedComment) => FeedComment
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
            comment.id === commentId ? updater(comment) : comment
          ),
        };
      })
    );
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
      setError("Tu dois être connecté pour supprimer un commentaire.");
      return;
    }

    try {
      setDeletingCommentId(commentId);
      setError("");
      setMessage("");

      const response = await fetch(`${API_URL}/comments/${commentId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Erreur lors de la suppression du commentaire"
        );
      }

      setPosts((prevPosts) =>
        prevPosts.map((post) => {
          const hasComment = post.comments.some(
            (comment) => comment.id === commentId
          );

          if (!hasComment) {
            return post;
          }

          return {
            ...post,
            comments: post.comments.filter((comment) => comment.id !== commentId),
            commentsCount: Math.max(0, post.commentsCount - 1),
          };
        })
      );

      setMessage("Commentaire supprimé avec succès.");
    } catch (error) {
      console.error(error);
      setError(error instanceof Error ? error.message : "Erreur inconnue");
    } finally {
      setDeletingCommentId(null);
    }
  };

  const handleAddComment = async (postId: number) => {
    if (!token) {
      setError("Tu dois être connecté pour commenter.");
      return;
    }

    const content = commentInputs[postId]?.trim() || "";

    if (!content) {
      setError("Tu dois écrire un commentaire.");
      return;
    }

    try {
      setCommentingPostId(postId);
      setError("");
      setMessage("");

      const formData = new FormData();
      formData.append("content", content);

      const res = await fetch(`${API_URL}/posts/${postId}/comments`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Impossible d'ajouter le commentaire.");
      }

      setCommentInputs((prev) => ({ ...prev, [postId]: "" }));
      if (data.comment) {
        updatePostInState(postId, (post) => ({
          ...post,
          comments: [...post.comments, data.comment],
          commentsCount: post.commentsCount + 1,
        }));
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Erreur lors de l'ajout du commentaire."
      );
    } finally {
      setCommentingPostId(null);
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

  const handlePublish = async () => {
    if (!postContent.trim()) {
      setMessage("Tu dois écrire quelque chose avant de publier.");
      return;
    }

    if (!token) {
      setError("Tu dois être connecté pour publier.");
      return;
    }

    try {
      setPublishing(true);
      setMessage("");
      setError("");

      const formData = new FormData();
      formData.append("content", postContent);

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
        throw new Error(data.message || "Impossible de publier le post.");
      }

      setMessage("Post publié avec succès.");
      if (data.post) {
        setPosts((prevPosts) => [data.post, ...prevPosts]);
      }
      resetComposer();
    } catch (err) {
      console.error("Erreur publish post :", err);
      setError(
        err instanceof Error ? err.message : "Erreur lors de la publication."
      );
    } finally {
      setPublishing(false);
    }
  };

  const handleDelete = async (postId: number) => {
    if (!token) {
      setError("Tu dois être connecté pour supprimer un post.");
      return;
    }

    try {
      setDeletingPostId(postId);
      setError("");
      setMessage("");

      const res = await fetch(`${API_URL}/posts/${postId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Impossible de supprimer le post.");
      }

      setMessage("Post supprimé avec succès.");
      setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId));
      setPostDialogOpen((prevOpen) =>
        prevOpen && dialogPostId === postId ? false : prevOpen
      );
    } catch (err) {
      console.error("Erreur suppression post :", err);
      setError(
        err instanceof Error ? err.message : "Erreur lors de la suppression."
      );
    } finally {
      setDeletingPostId(null);
    }
  };

  const handleToggleLike = async (post: FeedPost) => {
    if (!token) {
      setError("Tu dois être connecté pour liker un post.");
      return;
    }

    try {
      setLikingPostId(post.id);
      setError("");
      setMessage("");

      const method = post.likedByCurrentUser ? "DELETE" : "POST";

      const res = await fetch(`${API_URL}/posts/${post.id}/like`, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Impossible de modifier le like.");
      }

      updatePostInState(post.id, (currentPost) => ({
        ...currentPost,
        likedByCurrentUser: !currentPost.likedByCurrentUser,
        likesCount: Math.max(
          0,
          currentPost.likesCount + (currentPost.likedByCurrentUser ? -1 : 1)
        ),
      }));
    } catch (err) {
      console.error("Erreur like post :", err);
      setError(err instanceof Error ? err.message : "Erreur lors du like.");
    } finally {
      setLikingPostId(null);
    }
  };

  const handleToggleFavorite = async (post: FeedPost) => {
    if (!token) {
      setError("Tu dois être connecté pour gérer les favoris.");
      return;
    }

    try {
      setFavoritingPostId(post.id);
      setError("");
      setMessage("");

      const method = post.favoritedByCurrentUser ? "DELETE" : "POST";

      const res = await fetch(`${API_URL}/posts/${post.id}/favorite`, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Impossible de modifier le favori.");
      }

      updatePostInState(post.id, (currentPost) => ({
        ...currentPost,
        favoritedByCurrentUser: !currentPost.favoritedByCurrentUser,
        favoritesCount: Math.max(
          0,
          currentPost.favoritesCount +
            (currentPost.favoritedByCurrentUser ? -1 : 1)
        ),
      }));
    } catch (err) {
      console.error("Erreur favorite post :", err);
      setError(err instanceof Error ? err.message : "Erreur lors du favori.");
    } finally {
      setFavoritingPostId(null);
    }
  };

  const handleAddFriend = async (receiverId: number) => {
    if (!token) {
      setError("Tu dois être connecté pour envoyer une demande d'ami.");
      return;
    }

    try {
      setSendingFriendId(receiverId);
      setError("");
      setMessage("");

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
          setSentRequests((prev) =>
            prev.includes(receiverId) ? prev : [...prev, receiverId]
          );
          setMessage("Demande déjà envoyée.");
          return;
        }

        throw new Error(data.message || "Impossible d'envoyer la demande d'ami.");
      }

      setSentRequests((prev) =>
        prev.includes(receiverId) ? prev : [...prev, receiverId]
      );
      setMessage(data.message || "Demande d'ami envoyée.");
    } catch (err) {
      console.error("Erreur demande d'ami :", err);
      setError(
        err instanceof Error
          ? err.message
          : "Erreur lors de l'envoi de la demande d'ami."
      );
    } finally {
      setSendingFriendId(null);
    }
  };

  const handleToggleCommentLike = async (comment: FeedComment) => {
    if (!token) {
      setError("Tu dois être connecté pour liker un commentaire.");
      return;
    }

    try {
      setLikingCommentId(comment.id);
      setError("");
      setMessage("");

      const method = comment.likedByCurrentUser ? "DELETE" : "POST";

      const res = await fetch(`${API_URL}/comments/${comment.id}/like`, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message || "Impossible de modifier le like du commentaire."
        );
      }

      updateCommentInState(comment.id, (currentComment) => ({
        ...currentComment,
        likedByCurrentUser: !currentComment.likedByCurrentUser,
        likesCount: Math.max(
          0,
          currentComment.likesCount +
            (currentComment.likedByCurrentUser ? -1 : 1)
        ),
      }));
    } catch (err) {
      console.error("Erreur like commentaire :", err);
      setError(
        err instanceof Error
          ? err.message
          : "Erreur lors du like du commentaire."
      );
    } finally {
      setLikingCommentId(null);
    }
  };

  const handleToggleCommentFavorite = async (comment: FeedComment) => {
    if (!token) {
      setError("Tu dois être connecté pour gérer les favoris d'un commentaire.");
      return;
    }

    try {
      setFavoritingCommentId(comment.id);
      setError("");
      setMessage("");

      const method = comment.favoritedByCurrentUser ? "DELETE" : "POST";

      const res = await fetch(`${API_URL}/comments/${comment.id}/favorite`, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message || "Impossible de modifier le favori du commentaire."
        );
      }

      updateCommentInState(comment.id, (currentComment) => ({
        ...currentComment,
        favoritedByCurrentUser: !currentComment.favoritedByCurrentUser,
        favoritesCount: Math.max(
          0,
          currentComment.favoritesCount +
            (currentComment.favoritedByCurrentUser ? -1 : 1)
        ),
      }));
    } catch (err) {
      console.error("Erreur favori commentaire :", err);
      setError(
        err instanceof Error
          ? err.message
          : "Erreur lors du favori du commentaire."
      );
    } finally {
      setFavoritingCommentId(null);
    }
  };

  return (
    <>
      <div className="flex items-start justify-start gap-8 xl:gap-10">
        <section className="min-w-0 w-full max-w-[800px]">
          <div className="flex flex-col gap-8 lg:gap-12">
            <NewPostCard
              content={postContent}
              previewUrl={previewUrl}
              selectedFileName={selectedFile?.name || ""}
              publishing={publishing}
              onPublish={handlePublish}
              onContentChange={setPostContent}
              onOpenFilePicker={handleOpenFilePicker}
              onRemoveFile={handleRemoveFile}
            />

            {message && (
              <section className="rotate-[-1deg] border border-field-accent/25 bg-field-paper px-5 py-4 text-sm text-field-ink shadow-[6px_8px_25px_rgba(26,26,26,0.12)]">
                <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-field-accent">
                  Notice
                </p>
                <p className="mt-2">{message}</p>
              </section>
            )}

            {error && (
              <section className="rotate-[1deg] border border-red-400/35 bg-[#fff3ef] px-5 py-4 text-sm text-red-700 shadow-[6px_8px_25px_rgba(26,26,26,0.12)]">
                <p className="font-mono text-[11px] uppercase tracking-[0.16em]">
                  Error
                </p>
                <p className="mt-2">{error}</p>
              </section>
            )}

            {loading ? (
              <section className="border border-black/10 bg-field-paper px-5 py-6 shadow-[6px_8px_25px_rgba(26,26,26,0.12)]">
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-field-label">
                  Loading feed archive...
                </p>
              </section>
            ) : posts.length === 0 ? (
              <section className="border border-black/10 bg-field-paper px-5 py-6 shadow-[6px_8px_25px_rgba(26,26,26,0.12)]">
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-field-label">
                  No posts have been recorded yet.
                </p>
              </section>
            ) : (
              <div className="flex flex-col gap-10">
                {posts.map((post, index) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    currentUserId={user?.id}
                    variantIndex={index}
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

            <div className="border-t border-dashed border-field-label py-8 text-center font-mono text-sm text-field-label">
              --- END OF RECENT LOGS ---
            </div>
          </div>
        </section>

        <ArchiveRightRail
          totalPosts={posts.length}
          totalLikes={totalLikes}
          totalComments={totalComments}
          suggestions={suggestions}
          sentRequests={sentRequests}
          sendingFriendId={sendingFriendId}
          onAddFriend={handleAddFriend}
        />
      </div>

      <button
        type="button"
        onClick={() => setCreateOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex h-16 w-16 items-center justify-center rounded-full border border-field-ink bg-field-ink text-field-paper shadow-[3px_6px_0_#ff4a1c] transition hover:scale-105 lg:hidden"
        aria-label="Create a new post"
      >
        <Plus className="h-6 w-6" />
      </button>

      <NewPostDialog
        open={createOpen}
        content={postContent}
        previewUrl={previewUrl}
        selectedFileName={selectedFile?.name || ""}
        publishing={publishing}
        onClose={resetComposer}
        onPublish={handlePublish}
        onContentChange={setPostContent}
        onOpenFilePicker={handleOpenFilePicker}
        onRemoveFile={handleRemoveFile}
      />

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
        commentValue={dialogPostId ? commentInputs[dialogPostId] || "" : ""}
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
