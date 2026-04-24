import {
  createPost,
  getAllPosts,
  getFriendsPosts,
  searchPosts,
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
import { getOptionalEnv } from "../env.js";
import {
  createNotificationIfRelevant,
  deleteNotificationIfExists,
  NOTIFICATION_TYPES,
} from "../services/notificationService.js";

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

export const searchPostsHandler = async (req, res) => {
  try {
    const currentUserId = req.user?.id ?? req.user?.userId;
    const result = await searchPosts(currentUserId, {
      q: req.query.q,
      authorUsername: req.query.author,
      mediaType: req.query.mediaType,
      favoritesOnly: req.query.favoritesOnly === "true",
      sort: req.query.sort,
      page: req.query.page,
      limit: req.query.limit,
    });
    res.status(200).json(result);
  } catch (error) {
    console.error("Erreur searchPostsHandler :", error);
    res.status(500).json({ message: "Unable to search posts." });
  }
};

export const getFriendsPostsHandler = async (req, res) => {
  try {
    const currentUserId = req.user?.id ?? req.user?.userId;
    const posts = await getFriendsPosts(currentUserId);
    res.status(200).json(posts);
  } catch (error) {
    console.error("Erreur getFriendsPostsHandler :", error);
    res.status(500).json({ message: "Unable to fetch friends posts." });
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
      mediaUrl = `/uploads/${req.file.filename}`;
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

    const deleteResult = await deleteComment(commentId, userId);

    if (deleteResult?.postAuthorId) {
      await deleteNotificationIfExists({
        userId: deleteResult.postAuthorId,
        actorId: userId,
        type: NOTIFICATION_TYPES.COMMENT,
        postId: deleteResult.postId,
      });
    }

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

    const likeResult = await likePost(postId, userId);

    if (likeResult.created) {
      await createNotificationIfRelevant({
        userId: likeResult.postAuthorId,
        actorId: userId,
        type: NOTIFICATION_TYPES.LIKE,
        postId,
      });
    }

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

    const result = await unlikePost(postId, userId);

    if (result.removed) {
      await deleteNotificationIfExists({
        userId: result.postAuthorId,
        actorId: userId,
        type: NOTIFICATION_TYPES.LIKE,
        postId,
      });
    }

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

    if (!content || !content.trim()) {
      return res.status(400).json({
        message: "Comment content is required.",
      });
    }

    const seedScriptKey = getOptionalEnv("SEED_SCRIPT_KEY");
    const skipModeration =
      Boolean(seedScriptKey) && req.get("x-seed-script-key") === seedScriptKey;

    const { comment, postAuthorId } = await createComment({
      postId,
      userId,
      content: content.trim(),
      mediaUrl: null,
      skipModeration,
    });

    await createNotificationIfRelevant({
      userId: postAuthorId,
      actorId: userId,
      type: NOTIFICATION_TYPES.COMMENT,
      postId,
    });

    return res.status(201).json({
      message: "Comment created successfully.",
      comment,
    });
  } catch (error) {
    if (error.message === "This comment contains inappropriate content.") {
      return res.status(422).json({
        message: error.message,
      });
    }

    if (error.message === "Post not found" || error.message === "User not found") {
      return res.status(404).json({
        message: error.message,
      });
    }

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

    const favoriteResult = await favoritePost(postId, userId);

    if (favoriteResult.created) {
      await createNotificationIfRelevant({
        userId: favoriteResult.postAuthorId,
        actorId: userId,
        type: NOTIFICATION_TYPES.FAVORITE,
        postId,
      });
    }

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

    const unfavoriteResult = await unfavoritePost(postId, userId);

    if (unfavoriteResult.removed) {
      await deleteNotificationIfExists({
        userId: unfavoriteResult.postAuthorId,
        actorId: userId,
        type: NOTIFICATION_TYPES.FAVORITE,
        postId,
      });
    }

    return res.status(200).json({
      message: "Post unfavorited successfully.",
    });
  } catch (error) {
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

    const likeResult = await likeComment(commentId, userId);

    if (likeResult.created) {
      await createNotificationIfRelevant({
        userId: likeResult.commentAuthorId,
        actorId: userId,
        type: NOTIFICATION_TYPES.COMMENT_LIKE,
        postId: likeResult.postId,
      });
    }

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

    const unlikeResult = await unlikeComment(commentId, userId);

    if (unlikeResult.removed) {
      await deleteNotificationIfExists({
        userId: unlikeResult.commentAuthorId,
        actorId: userId,
        type: NOTIFICATION_TYPES.COMMENT_LIKE,
        postId: unlikeResult.postId,
      });
    }

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

    const favResult = await favoriteComment(commentId, userId);

    if (favResult.created) {
      await createNotificationIfRelevant({
        userId: favResult.commentAuthorId,
        actorId: userId,
        type: NOTIFICATION_TYPES.COMMENT_FAVORITE,
        postId: favResult.postId,
      });
    }

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

    const unfavResult = await unfavoriteComment(commentId, userId);

    if (unfavResult.removed) {
      await deleteNotificationIfExists({
        userId: unfavResult.commentAuthorId,
        actorId: userId,
        type: NOTIFICATION_TYPES.COMMENT_FAVORITE,
        postId: unfavResult.postId,
      });
    }

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


export default {
  createPostHandler,
  getPostsHandler,
  getFriendsPostsHandler,
  searchPostsHandler,
  deletePostHandler,
  likePostHandler,
  unlikePostHandler,
  createCommentHandler,
  deleteCommentHandler,
  likeCommentHandler,
  unlikeCommentHandler,
  favoritePostHandler,
  unfavoritePostHandler,
  favoriteCommentHandler,
  unfavoriteCommentHandler,
};
