import {
  createPost,
  getAllPosts,
  deletePost,
  likePost,
  unlikePost,
  createComment,
  deleteComment,
  likeComment,
  unlikeComment,
  favoritePost,
  unfavoritePost,
  favoriteComment,
  unfavoriteComment,
} from "../services/postService.js";

export const getPostsHandler = async (req, res) => {
  try {
    const currentUserId = req.user?.id ?? req.user?.userId;
    const posts = await getAllPosts(currentUserId);
    res.status(200).json(posts);
  } catch (error) {
    console.error("Erreur getPostsHandler :", error);
    res.status(500).json({ message: "Unable to fetch posts." });
  }
};

export const createPostHandler = async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || typeof content !== "string" || !content.trim()) {
      return res.status(400).json({
        message: "Post content is required.",
      });
    }

    const authorId = req.user?.id ?? req.user?.userId;

    if (!authorId) {
      return res.status(401).json({
        message: "User not found in token.",
      });
    }

    let mediaUrl = null;

    if (req.file) {
      mediaUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    }

    const newPost = await createPost({
      content: content.trim(),
      mediaUrl,
      authorId,
    });

    return res.status(201).json({
      message: "Post created successfully.",
      post: newPost,
    });
  } catch (error) {
    console.error("Erreur createPostHandler :", error);
    return res.status(500).json({
      message: error.message || "Unable to create post.",
    });
  }
};

export const deleteCommentHandler = async (req, res) => {
  try {
    const commentId = Number(req.params.id);
    const userId = req.user?.id ?? req.user?.userId;

    if (Number.isNaN(commentId) || commentId < 1) {
      return res.status(400).json({
        message: "Invalid comment id.",
      });
    }

    if (!userId) {
      return res.status(401).json({
        message: "User not found in token.",
      });
    }

    await deleteComment(commentId, userId);

    return res.status(200).json({
      message: "Comment deleted successfully.",
    });
  } catch (error) {
    console.error("Erreur deleteCommentHandler :", error);

    if (error.message === "Comment not found") {
      return res.status(404).json({
        message: error.message,
      });
    }

    if (error.message === "You are not allowed to delete this comment") {
      return res.status(403).json({
        message: error.message,
      });
    }

    return res.status(500).json({
      message: error.message || "Unable to delete comment.",
    });
  }
};

export const deletePostHandler = async (req, res) => {
  try {
    const postId = Number(req.params.id);
    const userId = req.user?.id ?? req.user?.userId;

    if (!postId || Number.isNaN(postId)) {
      return res.status(400).json({
        message: "Invalid post id.",
      });
    }

    if (!userId) {
      return res.status(401).json({
        message: "User not found in token.",
      });
    }

    await deletePost(postId, userId);

    return res.status(200).json({
      message: "Post deleted successfully.",
    });
  } catch (error) {
    console.error("Erreur deletePostHandler :", error);
    return res.status(500).json({
      message: error.message || "Unable to delete post.",
    });
  }
};

export const likePostHandler = async (req, res) => {
  try {
    const postId = Number(req.params.id);
    const userId = req.user?.id ?? req.user?.userId;

    if (!postId || Number.isNaN(postId)) {
      return res.status(400).json({
        message: "Invalid post id.",
      });
    }

    if (!userId) {
      return res.status(401).json({
        message: "User not found in token.",
      });
    }

    await likePost(postId, userId);

    return res.status(200).json({
      message: "Post liked successfully.",
    });
  } catch (error) {
    console.error("Erreur likePostHandler :", error);
    return res.status(500).json({
      message: error.message || "Unable to like post.",
    });
  }
};

export const unlikePostHandler = async (req, res) => {
  try {
    const postId = Number(req.params.id);
    const userId = req.user?.id ?? req.user?.userId;

    if (!postId || Number.isNaN(postId)) {
      return res.status(400).json({
        message: "Invalid post id.",
      });
    }

    if (!userId) {
      return res.status(401).json({
        message: "User not found in token.",
      });
    }

    await unlikePost(postId, userId);

    return res.status(200).json({
      message: "Post unliked successfully.",
    });
  } catch (error) {
    console.error("Erreur unlikePostHandler :", error);
    return res.status(500).json({
      message: error.message || "Unable to unlike post.",
    });
  }
};

export const createCommentHandler = async (req, res) => {
  try {
    const postId = Number(req.params.id);
    const userId = req.user?.id ?? req.user?.userId;
    const { content } = req.body;

    if (Number.isNaN(postId) || postId < 1) {
      return res.status(400).json({
        message: "Invalid post id.",
      });
    }

    if (!userId) {
      return res.status(401).json({
        message: "User not found in token.",
      });
    }

    if ((!content || !content.trim()) && !req.file) {
      return res.status(400).json({
        message: "Comment content or media is required.",
      });
    }

    let mediaUrl = null;

    if (req.file) {
      mediaUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    }

    const comment = await createComment({
      postId,
      userId,
      content: content?.trim() || "",
      mediaUrl,
    });

    return res.status(201).json({
      message: "Comment created successfully.",
      comment,
    });
  } catch (error) {
    console.error("Erreur createCommentHandler :", error);
    return res.status(500).json({
      message: error.message || "Unable to create comment.",
    });
  }
};

export const favoritePostHandler = async (req, res) => {
  try {
    const postId = Number(req.params.id);
    const userId = req.user?.id ?? req.user?.userId;

    if (!postId || Number.isNaN(postId)) {
      return res.status(400).json({
        message: "Invalid post id.",
      });
    }

    if (!userId) {
      return res.status(401).json({
        message: "User not found in token.",
      });
    }

    await favoritePost(postId, userId);

    return res.status(200).json({
      message: "Post favorited successfully.",
    });
  } catch (error) {
    console.error("Erreur favoritePostHandler :", error);
    return res.status(500).json({
      message: error.message || "Unable to favorite post.",
    });
  }
};

export const unfavoritePostHandler = async (req, res) => {
  try {
    const postId = Number(req.params.id);
    const userId = req.user?.id ?? req.user?.userId;

    if (!postId || Number.isNaN(postId)) {
      return res.status(400).json({
        message: "Invalid post id.",
      });
    }

    if (!userId) {
      return res.status(401).json({
        message: "User not found in token.",
      });
    }

    await unfavoritePost(postId, userId);

    return res.status(200).json({
      message: "Post unfavorited successfully.",
    });
  } catch (error) {
    console.error("Erreur unfavoritePostHandler :", error);
    return res.status(500).json({
      message: error.message || "Unable to unfavorite post.",
    });
  }
};

export const likeCommentHandler = async (req, res) => {
  try {
    const commentId = Number(req.params.id);
    const userId = req.user?.id ?? req.user?.userId;

    if (Number.isNaN(commentId) || commentId < 1) {
      return res.status(400).json({
        message: "Invalid comment id.",
      });
    }

    if (!userId) {
      return res.status(401).json({
        message: "User not found in token.",
      });
    }

    await likeComment(commentId, userId);

    return res.status(200).json({
      message: "Comment liked successfully.",
    });
  } catch (error) {
    console.error("Erreur likeCommentHandler :", error);
    return res.status(500).json({
      message: error.message || "Unable to like comment.",
    });
  }
};

export const unlikeCommentHandler = async (req, res) => {
  try {
    const commentId = Number(req.params.id);
    const userId = req.user?.id ?? req.user?.userId;

    if (Number.isNaN(commentId) || commentId < 1) {
      return res.status(400).json({
        message: "Invalid comment id.",
      });
    }

    if (!userId) {
      return res.status(401).json({
        message: "User not found in token.",
      });
    }

    await unlikeComment(commentId, userId);

    return res.status(200).json({
      message: "Comment unliked successfully.",
    });
  } catch (error) {
    console.error("Erreur unlikeCommentHandler :", error);
    return res.status(500).json({
      message: error.message || "Unable to unlike comment.",
    });
  }
};

export const favoriteCommentHandler = async (req, res) => {
  try {
    const commentId = Number(req.params.id);
    const userId = req.user?.id ?? req.user?.userId;

    if (Number.isNaN(commentId) || commentId < 1) {
      return res.status(400).json({
        message: "Invalid comment id.",
      });
    }

    if (!userId) {
      return res.status(401).json({
        message: "User not found in token.",
      });
    }

    await favoriteComment(commentId, userId);

    return res.status(200).json({
      message: "Comment favorited successfully.",
    });
  } catch (error) {
    console.error("Erreur favoriteCommentHandler :", error);
    return res.status(500).json({
      message: error.message || "Unable to favorite comment.",
    });
  }
};

export const unfavoriteCommentHandler = async (req, res) => {
  try {
    const commentId = Number(req.params.id);
    const userId = req.user?.id ?? req.user?.userId;

    if (Number.isNaN(commentId) || commentId < 1) {
      return res.status(400).json({
        message: "Invalid comment id.",
      });
    }

    if (!userId) {
      return res.status(401).json({
        message: "User not found in token.",
      });
    }

    await unfavoriteComment(commentId, userId);

    return res.status(200).json({
      message: "Comment unfavorited successfully.",
    });
  } catch (error) {
    console.error("Erreur unfavoriteCommentHandler :", error);
    return res.status(500).json({
      message: error.message || "Unable to unfavorite comment.",
    });
  }
};