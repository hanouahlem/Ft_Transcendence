import {
  createPost,
  getAllPosts,
  deletePost,
} from "../services/postService.js";

export const getPostsHandler = async (req, res) => {
  try {
    const posts = await getAllPosts();
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

    await deletePost(postId, userId, req);

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