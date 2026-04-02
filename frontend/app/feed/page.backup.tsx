"use client";

import Link from "next/link";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useEffect, useMemo, useRef, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import { useAuth } from "@/context/AuthContext";
import {
  MessageCircle,
  Heart,
  Bookmark,
  SendHorizonal,
  Plus,
  Users,
  Image as ImageIcon,
  X,
  Trash2,
  Sparkles,
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
  likesCount: number;
  favoritesCount: number;
  likedByCurrentUser: boolean;
  favoritedByCurrentUser: boolean;
  media: string[];
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
  onToggleCommentLike,
  onToggleCommentFavorite,
  onCommentChange,
  onAddComment,
  commentValue,
  deletingPostId,
  deletingCommentId,
  likingPostId,
  favoritingPostId,
  likingCommentId,
  favoritingCommentId,
  commentingPostId,
}: {
  post: FeedPost;
  currentUserId: number | undefined;
  onDelete: (postId: number) => Promise<void>;
  onDeleteComment: (commentId: number) => Promise<void>;
  onToggleLike: (post: FeedPost) => Promise<void>;
  onToggleFavorite: (post: FeedPost) => Promise<void>;
  onToggleCommentLike: (comment: FeedComment) => Promise<void>;
  onToggleCommentFavorite: (comment: FeedComment) => Promise<void>;
  onCommentChange: (postId: number, value: string) => void;
  onAddComment: (postId: number) => Promise<void>;
  commentValue: string;
  deletingPostId: number | null;
  deletingCommentId: number | null;
  likingPostId: number | null;
  favoritingPostId: number | null;
  likingCommentId: number | null;
  favoritingCommentId: number | null;
  commentingPostId: number | null;
}) {
  const isOwner = post.author.id === currentUserId;
  const isDeleting = deletingPostId === post.id;
  const isLiking = likingPostId === post.id;
  const isFavoriting = favoritingPostId === post.id;
  const isCommenting = commentingPostId === post.id;

  return (
    <Card className="overflow-hidden rounded-[2rem] border-0 bg-white/95 shadow-[0_20px_60px_rgba(74,100,64,0.14)] backdrop-blur">
      <CardContent className="p-0">
        <div className="p-5">
          <div className="flex items-start gap-4">
            <Link href={`/profil/${post.author.id}`} className="shrink-0">
              <Avatar className="h-14 w-14 border-2 border-[#d8e3d1] transition hover:scale-[1.02]">
                <AvatarImage
                  src={post.author.avatar || ""}
                  alt={post.author.username}
                />
                <AvatarFallback className="bg-[#EAF1E6] font-semibold text-[#4A6440]">
                  {post.author.username.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Link>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <Link
                    href={`/profil/${post.author.id}`}
                    className="block truncate text-lg font-semibold text-[#33412c] transition hover:text-[#6B7C5D]"
                  >
                    {post.author.username}
                  </Link>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-[#73816b]">
                    <span>@{post.author.username.toLowerCase()}</span>
                    <span>•</span>
                    <span>{formatPostTime(post.createdAt)}</span>
                  </div>
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

              <p className="mt-4 text-[15px] leading-7 text-[#465241]">
                {post.content}
              </p>
            </div>
          </div>
        </div>

        {post.media.length > 0 && (
          <div className="overflow-hidden border-y border-[#edf2e9]">
            <img
              src={post.media[0]}
              alt="Post media"
              className="max-h-[560px] w-full object-cover"
            />
          </div>
        )}

        <div className="flex flex-wrap items-center gap-6 px-5 py-4 text-sm">
          <button
            type="button"
            onClick={() => onToggleLike(post)}
            disabled={isLiking}
            className={`inline-flex items-center gap-2 font-medium transition ${
              post.likedByCurrentUser
                ? "text-red-600"
                : "text-[#6B7C5D] hover:scale-105"
            }`}
          >
            <Heart
              className={`h-5 w-5 ${
                post.likedByCurrentUser ? "fill-current text-red-600" : ""
              }`}
            />
            <span>{post.likesCount}</span>
          </button>

          <div className="inline-flex items-center gap-2 font-medium text-[#7B9270]">
            <MessageCircle className="h-5 w-5" />
            <span>{post.commentsCount}</span>
          </div>

          <button
            type="button"
            onClick={() => onToggleFavorite(post)}
            disabled={isFavoriting}
            className={`inline-flex items-center gap-2 font-medium transition ${
              post.favoritedByCurrentUser
                ? "text-[#4A6440]"
                : "text-[#7B9270] hover:scale-105"
            }`}
          >
            <Bookmark
              className={`h-5 w-5 ${
                post.favoritedByCurrentUser
                  ? "fill-current text-[#4A6440]"
                  : ""
              }`}
            />
            <span>{post.favoritesCount}</span>
          </button>
        </div>

        <div className="border-t border-[#edf2e9] bg-[#fbfdf9] px-5 py-5">
          <div className="space-y-3">
            {post.comments.length === 0 ? (
              <p className="text-sm text-[#7d8b76]">No comments yet.</p>
            ) : (
              post.comments.map((comment) => {
                const isCommentOwner = comment.author.id === currentUserId;
                const isDeletingComment = deletingCommentId === comment.id;
                const isLikingComment = likingCommentId === comment.id;
                const isFavoritingComment = favoritingCommentId === comment.id;

                return (
                  <div
                    key={comment.id}
                    className="rounded-2xl border border-[#e9efe4] bg-white px-4 py-3 shadow-sm"
                  >
                    <div className="mb-2 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/profil/${comment.author.id}`}
                            className="font-semibold text-[#33412c] transition hover:text-[#6B7C5D]"
                          >
                            {comment.author.username}
                          </Link>

                          <span className="text-xs text-[#8f9b88]">
                            @{comment.author.username.toLowerCase()}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-[#92a08b]">
                          {formatPostTime(comment.createdAt)}
                        </p>
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

                    <p className="text-sm leading-6 text-[#4a5645]">
                      {comment.content}
                    </p>

                    {comment.media.length > 0 && (
                      <div className="mt-3 overflow-hidden rounded-2xl border border-[#dfe8d7] bg-[#f7faf4]">
                        <img
                          src={comment.media[0]}
                          alt="Comment media"
                          className="max-h-[280px] w-full object-cover"
                        />
                      </div>
                    )}

                    <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
                      <button
                        type="button"
                        onClick={() => onToggleCommentLike(comment)}
                        disabled={isLikingComment}
                        className={`inline-flex items-center gap-2 font-medium transition ${
                          comment.likedByCurrentUser
                            ? "text-red-600"
                            : "text-[#6B7C5D] hover:scale-105"
                        }`}
                      >
                        <Heart
                          className={`h-4 w-4 ${
                            comment.likedByCurrentUser
                              ? "fill-current text-red-600"
                              : ""
                          }`}
                        />
                        <span>{comment.likesCount}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onToggleCommentFavorite(comment)}
                        disabled={isFavoritingComment}
                        className={`inline-flex items-center gap-2 font-medium transition ${
                          comment.favoritedByCurrentUser
                            ? "text-[#4A6440]"
                            : "text-[#7B9270] hover:scale-105"
                        }`}
                      >
                        <Bookmark
                          className={`h-4 w-4 ${
                            comment.favoritedByCurrentUser
                              ? "fill-current text-[#4A6440]"
                              : ""
                          }`}
                        />
                        <span>{comment.favoritesCount}</span>
                      </button>
                    </div>
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
              className="w-full rounded-2xl border border-[#dbe7d2] bg-white px-4 py-3 text-sm text-[#2f3a32] outline-none transition placeholder:text-[#99a692] focus:border-[#8AA678] focus:ring-4 focus:ring-[#dce9d1]"
            />

            <Button
              type="button"
              onClick={() => onAddComment(post.id)}
              disabled={isCommenting}
              className="rounded-full bg-[#8AA678] px-6 text-white hover:bg-[#79956a]"
            >
              {isCommenting ? "Sending..." : "Comment"}
            </Button>
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

  const fileInputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
    if (token) {
      fetchPosts();
      fetchExistingFriendRelations();
    }
  }, [token, user?.id]);

  const suggestions = useMemo(() => {
    const unique = posts.filter(
      (post, index, array) =>
        array.findIndex((item) => item.author.id === post.author.id) === index
    );

    return unique
      .filter((post) => post.author.id !== user?.id)
      .slice(0, 4)
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
      setError(error instanceof Error ? error.message : "Erreur inconnue");
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

      const res = await fetch(`http://localhost:3001/posts/${postId}/comments`, {
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
      await fetchPosts();
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
      setCreateOpen(false);
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

const handleAddFriend = async (receiverId: number) => {
  if (!token) {
    setError("Tu dois être connecté pour envoyer une demande d'ami.");
    return;
  }

  try {
    setSendingFriendId(receiverId);
    setError("");
    setMessage("");

    const res = await fetch("http://localhost:3001/friends", {
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

  const fetchExistingFriendRelations = async () => {
    if (!token || !user?.id) return;

    try {
      const res = await fetch("http://localhost:3001/friends", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      console.log("GET /friends data =", data);

      if (!res.ok) {
        throw new Error(data.message || "Impossible de récupérer les relations.");
      }

      if (!Array.isArray(data)) {
        console.log("GET /friends n'est pas un tableau");
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

          return { senderId, receiverId, status, raw: item };
        })
        .filter((item) => {
          return (
            item.senderId === user.id &&
            (item.status === "pending" || item.status === "accepted")
          );
        })
        .map((item) => item.receiverId)
        .filter((id): id is number => typeof id === "number");

      console.log("sentIds =", sentIds);
      setSentRequests(sentIds);
    } catch (err) {
      console.error("Erreur fetch relations amis :", err);
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

      const res = await fetch(`http://localhost:3001/comments/${comment.id}/like`, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Impossible de modifier le like du commentaire.");
      }

      await fetchPosts();
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

      const res = await fetch(`http://localhost:3001/comments/${comment.id}/favorite`, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Impossible de modifier le favori du commentaire.");
      }

      await fetchPosts();
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
    <ProtectedRoute>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-br from-[#EAF1E6] via-[#dbe7d2] to-[#9CAF88] text-black">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm font-medium text-[#4A6440] shadow-md backdrop-blur">
              <Sparkles className="h-4 w-4" />
              Social feed
            </div>

            <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-[#33412c]">
              Community feed
            </h1>

            <p className="mt-3 max-w-2xl text-base leading-7 text-[#4f5d49]">
              Découvre les publications de la communauté.
            </p>
          </div>

          {message && (
            <div className="mb-6 rounded-2xl border border-[#cfe0c4] bg-white/85 px-4 py-3 text-sm text-[#4A6440] shadow-md">
              {message}
            </div>
          )}

          {error && (
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-md">
              {error}
            </div>
          )}

          <div className="grid gap-10 lg:grid-cols-[2fr_1fr]">
            <div className="space-y-8">
              {loading ? (
                <Card className="rounded-3xl border-0 bg-white/90 shadow-2xl">
                  <CardContent className="p-6 text-sm text-[#5f6c59]">
                    Chargement du feed...
                  </CardContent>
                </Card>
              ) : posts.length === 0 ? (
                <Card className="rounded-3xl border-0 bg-white/90 shadow-2xl">
                  <CardContent className="p-6 text-sm text-[#5f6c59]">
                    Aucun post pour le moment.
                  </CardContent>
                </Card>
              ) : (
                posts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    currentUserId={user?.id}
                    onDelete={handleDelete}
                    onDeleteComment={handleDeleteComment}
                    onToggleLike={handleToggleLike}
                    onToggleFavorite={handleToggleFavorite}
                    onToggleCommentLike={handleToggleCommentLike}
                    onToggleCommentFavorite={handleToggleCommentFavorite}
                    onCommentChange={handleCommentChange}
                    onAddComment={handleAddComment}
                    commentValue={commentInputs[post.id] || ""}
                    deletingPostId={deletingPostId}
                    deletingCommentId={deletingCommentId}
                    likingPostId={likingPostId}
                    favoritingPostId={favoritingPostId}
                    likingCommentId={likingCommentId}
                    favoritingCommentId={favoritingCommentId}
                    commentingPostId={commentingPostId}
                  />
                ))
              )}
            </div>

            <div className="space-y-8">
              <div className="sticky top-24 space-y-8">
                <Card className="rounded-3xl border-0 bg-white/90 shadow-2xl backdrop-blur">
                  <CardContent className="p-6">
                    <div className="mb-5 flex items-center gap-3">
                      <Avatar className="h-14 w-14">
                        <AvatarImage src="" alt={user?.username || "User"} />
                        <AvatarFallback className="bg-[#EAF1E6] font-semibold text-[#4A6440]">
                          {(user?.username || "U").slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <div>
                        <p className="text-lg font-semibold text-[#33412c]">
                          {user?.username || "Utilisateur"}
                        </p>
                        <p className="text-sm text-[#70806a]">
                          @{(user?.username || "user").toLowerCase()}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="rounded-2xl bg-[#F4F8F1] p-4 text-center">
                        <p className="text-xl font-bold text-[#4A6440]">
                          {posts.length}
                        </p>
                        <p className="mt-1 text-xs text-[#72826c]">Posts</p>
                      </div>

                      <div className="rounded-2xl bg-[#F4F8F1] p-4 text-center">
                        <p className="text-xl font-bold text-[#4A6440]">
                          {totalLikes}
                        </p>
                        <p className="mt-1 text-xs text-[#72826c]">Likes</p>
                      </div>

                      <div className="rounded-2xl bg-[#F4F8F1] p-4 text-center">
                        <p className="text-xl font-bold text-[#4A6440]">
                          {totalComments}
                        </p>
                        <p className="mt-1 text-xs text-[#72826c]">
                          Comments
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-3xl border-0 bg-white/90 shadow-2xl backdrop-blur">
                  <CardContent className="p-6">
                    <div className="mb-5 flex items-center gap-2 text-[#4A6440]">
                      <Users className="h-5 w-5" />
                      <p className="text-base font-semibold">Suggestions</p>
                    </div>

                    {suggestions.length === 0 ? (
                      <p className="text-sm text-[#73816b]">
                        Les suggestions apparaîtront quand le feed sera rempli.
                      </p>
                    ) : (
                      <div className="space-y-4">
                        {suggestions.map((author) => (
                          <div
                            key={author.id}
                            className="flex items-center justify-between gap-3"
                          >
                            <div className="flex items-center gap-3">
                              <Link href={`/profil/${author.id}`}>
                                <Avatar className="h-11 w-11">
                                  <AvatarImage
                                    src={author.avatar || ""}
                                    alt={author.username}
                                  />
                                  <AvatarFallback className="bg-[#EAF1E6] text-[#4A6440]">
                                    {author.username.slice(0, 2).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                              </Link>

                              <div className="min-w-0">
                                <Link
                                  href={`/profil/${author.id}`}
                                  className="block truncate font-medium text-[#33412c] hover:text-[#6B7C5D]"
                                >
                                  {author.username}
                                </Link>
                                <p className="text-sm text-[#7a8874]">
                                  @{author.username.toLowerCase()}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                            <Link
                              href={`/profil/${author.id}`}
                              className="rounded-full bg-[#EAF1E6] px-3 py-1.5 text-sm font-medium text-[#4A6440] transition hover:bg-[#d9e6d0]"
                            >
                              Voir
                            </Link>

                            <button
                              type="button"
                              onClick={() => handleAddFriend(author.id)}
                              disabled={sendingFriendId === author.id || sentRequests.includes(author.id)}
                              className="rounded-full bg-[#8AA678] px-3 py-1.5 text-sm font-medium text-white transition hover:bg-[#79956a] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {sendingFriendId === author.id
                                ? "Sending..."
                                : sentRequests.includes(author.id)
                                ? "Sent"
                                : "Add"}
                            </button>
                          </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

              </div>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="fixed bottom-8 right-8 z-40 flex h-20 w-20 items-center justify-center rounded-full bg-[#8AA678] text-white shadow-[0_15px_40px_rgba(74,100,64,0.35)] transition hover:scale-110 hover:bg-[#79956a]"
        >
          <Plus className="h-8 w-8" />
        </button>

        {createOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4">
            <div className="w-full max-w-2xl rounded-[2rem] bg-white p-6 shadow-[0_30px_80px_rgba(0,0,0,0.25)]">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#7a8874]">
                    Nouveau post
                  </p>
                  <h2 className="text-2xl font-bold text-[#33412c]">
                    Créer une publication
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setCreateOpen(false);
                    setPostContent("");
                    handleRemoveFile();
                  }}
                  className="rounded-full bg-[#f2f5ef] p-2 text-[#5d6c56] transition hover:bg-[#e6ede0]"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex items-start gap-4">
                <Avatar className="h-14 w-14">
                  <AvatarImage src="" alt="Avatar utilisateur" />
                  <AvatarFallback className="bg-[#EAF1E6] font-semibold text-[#4A6440]">
                    {(user?.username || "U").slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <textarea
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    placeholder="Partage quelque chose avec la communauté..."
                    className="min-h-[160px] w-full resize-none rounded-3xl border border-[#dbe7d2] bg-[#fbfdf9] px-5 py-4 text-sm text-[#2f3a32] outline-none placeholder:text-[#98a091] focus:border-[#8AA678] focus:ring-4 focus:ring-[#dce9d1]"
                  />

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  {previewUrl && (
                    <div className="relative mt-4 overflow-hidden rounded-3xl border border-[#d8e3d1] bg-[#f7faf4]">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="max-h-[360px] w-full object-cover"
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

                  <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleOpenFilePicker}
                      className="rounded-full border-[#d8e3d1] bg-[#fbfdf9] text-[#4A6440] hover:bg-[#eef4e8]"
                    >
                      <ImageIcon className="mr-2 h-4 w-4" />
                      Ajouter un media
                    </Button>

                    <Button
                      onClick={handlePublish}
                      disabled={publishing}
                      className="rounded-full bg-[#8AA678] px-6 text-white hover:bg-[#79956a]"
                    >
                      <SendHorizonal className="mr-2 h-4 w-4" />
                      {publishing ? "Publication..." : "Publier"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="pointer-events-none fixed bottom-0 right-0 h-full w-full bg-gradient-to-tl from-[#9CAF88]/30 via-[#C3D1B2]/20 to-transparent" />
      </main>
    </ProtectedRoute>
  );
}