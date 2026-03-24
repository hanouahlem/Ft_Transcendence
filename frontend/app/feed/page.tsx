"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import {
  MessageCircle,
  Repeat2,
  Heart,
  Bookmark,
  SendHorizonal,
  Leaf,
  Image as ImageIcon,
  X,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";

type FeedComment = {
  id: number;
  content: string;
  createdAt: string;
  author: {
    id: number;
    username: string;
    email: string;
    avatar?: string | null;
  };
};

type FeedPost = {
  id: number;
  content: string;
  createdAt: string;
  author: {
    id: number;
    username: string;
    email: string;
    avatar?: string | null;
  };
  likesCount: number;
  commentsCount: number;
  favoritesCount: number;
  likedByCurrentUser: boolean;
  favoritedByCurrentUser: boolean;
  comments: FeedComment[];
  media: string[];

  repostsCount?: number;
  repostedByCurrentUser?: boolean;
};

function formatPostTime(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleString("fr-FR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function PostCard({
  post,
  currentUserId,
  onDelete,
  onDeleteComment,
  onToggleLike,
  onToggleFavorite,
  onToggleRepost,
  onCommentChange,
  onAddComment,
  commentValue,
  deletingPostId,
  deletingCommentId,
  likingPostId,
  favoritingPostId,
  repostingPostId,
  commentingPostId,
}: {
  post: FeedPost;
  currentUserId: number | undefined;
  onDelete: (postId: number) => Promise<void>;
  onDeleteComment: (commentId: number) => Promise<void>;
  onToggleLike: (post: FeedPost) => Promise<void>;
  onToggleFavorite: (post: FeedPost) => Promise<void>;
  onToggleRepost: (post: FeedPost) => Promise<void>;
  onCommentChange: (postId: number, value: string) => void;
  onAddComment: (postId: number) => Promise<void>;
  commentValue: string;
  deletingPostId: number | null;
  deletingCommentId: number | null;
  likingPostId: number | null;
  favoritingPostId: number | null;
  repostingPostId: number | null;
  commentingPostId: number | null;
}) {
  const isOwner = post.author.id === currentUserId;
  const isDeleting = deletingPostId === post.id;
  const isLiking = likingPostId === post.id;
  const isFavoriting = favoritingPostId === post.id;
  const isReposting = repostingPostId === post.id;
  const isCommenting = commentingPostId === post.id;

  const isReposted = post.repostedByCurrentUser ?? false;
  const repostsCount = post.repostsCount ?? 0;

  return (
    <Card className="overflow-hidden rounded-[1.75rem] border-[#ddd3c2] bg-[#fffaf2]/95 shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <Link href={`/profil/${post.author.id}`} className="shrink-0">
            <Avatar className="h-12 w-12 border border-[#d8cfbe] transition hover:opacity-90">
              <AvatarImage
                src={post.author.avatar || ""}
                alt={post.author.username}
              />
              <AvatarFallback className="bg-[#eef3e8] text-[#6f8467]">
                {post.author.username.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </Link>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <Link
                  href={`/profil/${post.author.id}`}
                  className="font-semibold text-[#2f3a32] transition hover:underline"
                >
                  {post.author.username}
                </Link>
                <p className="text-sm text-[#7b847b]">
                <Link
                  href={`/profil/${post.author.id}`}
                >
                  {post.author.username}
                </Link>
                  @{post.author.username.toLowerCase()}
                </p>
                <span className="text-sm text-[#a0a79f]">·</span>
                <p className="text-sm text-[#7b847b]">
                  
                  {formatPostTime(post.createdAt)}
                </p>
              </div>

              {isOwner && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onDelete(post.id)}
                  disabled={isDeleting}
                  className="rounded-full border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {isDeleting ? "Deleting..." : "Delete"}
                </Button>
              )}
            </div>

            <p className="mt-3 text-sm leading-7 text-[#4e5850]">
              {post.content}
            </p>

            {post.media.length > 0 && (
              <div className="mt-4 overflow-hidden rounded-2xl border border-[#d8cfbe] bg-[#fcf8f1]">
                <img
                  src={post.media[0]}
                  alt="Post media"
                  className="max-h-[420px] w-full object-cover"
                />
              </div>
            )}

            <div className="mt-5 flex flex-wrap items-center gap-5 text-sm text-[#6f786f]">
              <div className="inline-flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                <span>{post.commentsCount}</span>
              </div>

              <button
                type="button"
                onClick={() => onToggleRepost(post)}
                disabled={isReposting}
                className={`inline-flex items-center gap-2 transition ${
                  isReposted
                    ? "text-[#6f8467]"
                    : "text-[#6f786f] hover:text-[#2f3a32]"
                }`}
              >
                <Repeat2
                  className={`h-4 w-4 ${
                    isReposted ? "text-[#6f8467]" : ""
                  }`}
                />
                <span>{repostsCount}</span>
              </button>

              <button
                type="button"
                onClick={() => onToggleLike(post)}
                disabled={isLiking}
                className={`inline-flex items-center gap-2 transition ${
                  post.likedByCurrentUser
                    ? "text-red-600"
                    : "text-[#6f786f] hover:text-[#2f3a32]"
                }`}
              >
                <Heart
                  className={`h-4 w-4 ${
                    post.likedByCurrentUser ? "fill-current text-red-600" : ""
                  }`}
                />
                <span>{post.likesCount}</span>
              </button>

              <button
                type="button"
                onClick={() => onToggleFavorite(post)}
                disabled={isFavoriting}
                className={`inline-flex items-center gap-2 transition ${
                  post.favoritedByCurrentUser
                    ? "text-[#6f8467]"
                    : "text-[#6f786f] hover:text-[#2f3a32]"
                }`}
              >
                <Bookmark
                  className={`h-4 w-4 ${
                    post.favoritedByCurrentUser
                      ? "fill-current text-[#6f8467]"
                      : ""
                  }`}
                />
                <span>{post.favoritesCount}</span>
              </button>
            </div>

            <div className="mt-5 rounded-[1.5rem] border border-[#e3d9c8] bg-[#fcf8f1] p-4">
              <div className="space-y-3">
                {post.comments.length === 0 ? (
                  <p className="text-sm text-[#7b847b]">No comments yet.</p>
                ) : (
                  post.comments.map((comment) => {
                    const isCommentOwner = comment.author.id === currentUserId;
                    const isDeletingComment = deletingCommentId === comment.id;

                    return (
                      <div
                        key={comment.id}
                        className="rounded-2xl border border-[#e3d9c8] bg-[#fffaf2] px-4 py-3"
                      >
                        <div className="mb-2 flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-semibold text-[#2f3a32]">
                                {comment.author.username}
                              </p>
                              <span className="text-xs text-[#9aa19a]">
                                @{comment.author.username.toLowerCase()}
                              </span>
                            </div>
                          </div>

                          {isCommentOwner && (
                            <button
                              type="button"
                              onClick={() => onDeleteComment(comment.id)}
                              disabled={isDeletingComment}
                              className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-medium text-red-700 transition hover:bg-red-100 disabled:opacity-60"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              {isDeletingComment ? "Deleting..." : "Delete"}
                            </button>
                          )}
                        </div>

                        <p className="text-sm leading-6 text-[#4e5850]">
                          {comment.content}
                        </p>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <input
                  type="text"
                  value={commentValue}
                  onChange={(e) => onCommentChange(post.id, e.target.value)}
                  placeholder="Write a comment..."
                  className="w-full rounded-2xl border border-[#d8cfbe] bg-[#fffaf2] px-4 py-3 text-sm text-[#2f3a32] outline-none transition placeholder:text-[#98a091] focus:border-[#91a387] focus:ring-4 focus:ring-[#dfe8d7]"
                />

                <Button
                  type="button"
                  onClick={() => onAddComment(post.id)}
                  disabled={isCommenting}
                  className="rounded-full bg-[#6f8467] text-white hover:bg-[#5f7358]"
                >
                  {isCommenting ? "Sending..." : "Comment"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

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

  const [deletingPostId, setDeletingPostId] = useState<number | null>(null);
  const [deletingCommentId, setDeletingCommentId] = useState<number | null>(null);
  const [likingPostId, setLikingPostId] = useState<number | null>(null);
  const [favoritingPostId, setFavoritingPostId] = useState<number | null>(null);
  const [repostingPostId, setRepostingPostId] = useState<number | null>(null);

  const [commentInputs, setCommentInputs] = useState<Record<number, string>>({});
  const [commentingPostId, setCommentingPostId] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleDeleteComment = async (commentId: number) => {
    if (!token) {
      setError("Tu dois être connecté pour supprimer un commentaire.");
      return;
    }

    try {
      setDeletingCommentId(commentId);
      setError("");
      setMessage("");

      const response = await fetch(`http://localhost:3001/comments/${commentId}`, {
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
      setError(
        error instanceof Error ? error.message : "Erreur inconnue"
      );
    } finally {
      setDeletingCommentId(null);
    }
  };

  const fetchPosts = async () => {
    if (!token) return;

    try {
      setLoading(true);
      setError("");

      const res = await fetch("http://localhost:3001/posts", {
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

  useEffect(() => {
    if (token) {
      fetchPosts();
    }
  }, [token]);

  const handleCommentChange = (postId: number, value: string) => {
    setCommentInputs((prev) => ({
      ...prev,
      [postId]: value,
    }));
  };

  const handleAddComment = async (postId: number) => {
    if (!token) {
      setError("Tu dois être connecté pour commenter.");
      return;
    }

    const content = commentInputs[postId]?.trim();

    if (!content) {
      setError("Tu dois écrire un commentaire.");
      return;
    }

    try {
      setCommentingPostId(postId);
      setError("");
      setMessage("");

      const res = await fetch(`http://localhost:3001/posts/${postId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Impossible d'ajouter le commentaire.");
      }

      setCommentInputs((prev) => ({
        ...prev,
        [postId]: "",
      }));

      await fetchPosts();
    } catch (err) {
      console.error("Erreur commentaire :", err);
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

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setSelectedFile(file);

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
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

      const res = await fetch("http://localhost:3001/posts", {
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

      setPostContent("");
      handleRemoveFile();
      setMessage("Post publié avec succès.");

      await fetchPosts();
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

      const res = await fetch(`http://localhost:3001/posts/${postId}`, {
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
      await fetchPosts();
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

      const res = await fetch(`http://localhost:3001/posts/${post.id}/like`, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Impossible de modifier le like.");
      }

      await fetchPosts();
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

      const res = await fetch(`http://localhost:3001/posts/${post.id}/favorite`, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Impossible de modifier le favori.");
      }

      await fetchPosts();
    } catch (err) {
      console.error("Erreur favorite post :", err);
      setError(
        err instanceof Error ? err.message : "Erreur lors du favori."
      );
    } finally {
      setFavoritingPostId(null);
    }
  };

  const handleToggleRepost = async (post: FeedPost) => {
    if (!token) {
      setError("Tu dois être connecté pour repartager un post.");
      return;
    }

    try {
      setRepostingPostId(post.id);
      setError("");
      setMessage("");

      const method = post.repostedByCurrentUser ? "DELETE" : "POST";

      const res = await fetch(`http://localhost:3001/posts/${post.id}/repost`, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Impossible de modifier le repost.");
      }

      await fetchPosts();
    } catch (err) {
      console.error("Erreur repost post :", err);
      setError(
        err instanceof Error ? err.message : "Erreur lors du repost."
      );
    } finally {
      setRepostingPostId(null);
    }
  };

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-[#f6f1e8] text-[#2f3a32]">
        <section className="relative overflow-hidden px-4 py-6 sm:px-6 lg:px-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(125,148,112,0.16),transparent_26%),radial-gradient(circle_at_bottom_right,rgba(216,207,184,0.32),transparent_30%)]" />

          <div className="relative mx-auto max-w-[1100px] space-y-6">
            <Card className="rounded-[2rem] border-[#ddd3c2] bg-[#fffaf2]/95 shadow-sm">
              <CardContent className="p-6">
                <div className="mb-5">
                  <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#d8cfbe] bg-[#eef3e8] px-4 py-2 text-sm font-medium text-[#64785f]">
                    <Leaf className="h-4 w-4" />
                    Social feed
                  </div>

                  <h1 className="text-3xl font-bold tracking-tight text-[#2f3a32] md:text-4xl">
                    Feed
                  </h1>

                  <p className="mt-3 max-w-2xl text-sm leading-7 text-[#667066] md:text-base">
                    Publie et consulte les posts de la communauté.
                  </p>
                </div>

                <div className="rounded-[1.75rem] border border-[#e3d9c8] bg-[#fcf8f1] p-4">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12 border border-[#d8cfbe]">
                      <AvatarImage src="" alt="Avatar utilisateur" />
                      <AvatarFallback className="bg-[#eef3e8] text-[#6f8467]">
                        {(user?.username || "U").slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                      <textarea
                        value={postContent}
                        onChange={(e) => setPostContent(e.target.value)}
                        placeholder="Partage quelque chose avec la communauté..."
                        className="min-h-[110px] w-full resize-none rounded-2xl border border-[#d8cfbe] bg-[#fffaf2] px-4 py-3 text-sm text-[#2f3a32] outline-none placeholder:text-[#98a091] focus:border-[#91a387] focus:ring-4 focus:ring-[#dfe8d7]"
                      />

                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />

                      {previewUrl && (
                        <div className="relative mt-4 overflow-hidden rounded-2xl border border-[#d8cfbe] bg-[#fffaf2]">
                          <img
                            src={previewUrl}
                            alt="Preview"
                            className="max-h-[320px] w-full object-cover"
                          />

                          <button
                            type="button"
                            onClick={handleRemoveFile}
                            className="absolute right-3 top-3 rounded-full bg-[#2f3a32]/80 p-2 text-white transition hover:bg-[#2f3a32]"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      )}

                      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleOpenFilePicker}
                          className="rounded-full border-[#d8cfbe] bg-[#fffaf2]"
                        >
                          <ImageIcon className="mr-2 h-4 w-4" />
                          Media
                        </Button>

                        <Button
                          onClick={handlePublish}
                          disabled={publishing}
                          className="rounded-full bg-[#6f8467] text-white hover:bg-[#5f7358]"
                        >
                          <SendHorizonal className="mr-2 h-4 w-4" />
                          {publishing ? "Publication..." : "Publier"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {message && (
                  <div className="mt-4 rounded-2xl border border-[#c7d7bd] bg-[#edf4e8] px-4 py-3 text-sm text-[#5f7358]">
                    {message}
                  </div>
                )}

                {error && (
                  <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="rounded-[2rem] border-[#ddd3c2] bg-[#fffaf2]/95 shadow-sm">
              <CardContent className="p-5 sm:p-6">
                <div className="mb-5">
                  <h2 className="text-xl font-semibold text-[#2f3a32]">
                    Derniers posts
                  </h2>
                  <p className="text-sm text-[#7b847b]">
                    Les publications les plus récentes
                  </p>
                </div>

                {loading ? (
                  <div className="rounded-3xl border border-[#e4dacb] bg-[#faf5eb] p-6 text-sm text-[#6b746c]">
                    Chargement du feed...
                  </div>
                ) : posts.length === 0 ? (
                  <div className="rounded-3xl border border-[#e4dacb] bg-[#faf5eb] p-6 text-sm text-[#6b746c]">
                    Aucun post pour le moment.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {posts.map((post) => (
                      <PostCard
                        key={post.id}
                        post={post}
                        currentUserId={user?.id}
                        onDelete={handleDelete}
                        onDeleteComment={handleDeleteComment}
                        onToggleLike={handleToggleLike}
                        onToggleFavorite={handleToggleFavorite}
                        onToggleRepost={handleToggleRepost}
                        onCommentChange={handleCommentChange}
                        onAddComment={handleAddComment}
                        commentValue={commentInputs[post.id] || ""}
                        deletingPostId={deletingPostId}
                        deletingCommentId={deletingCommentId}
                        likingPostId={likingPostId}
                        favoritingPostId={favoritingPostId}
                        repostingPostId={repostingPostId}
                        commentingPostId={commentingPostId}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </ProtectedRoute>
  );
}