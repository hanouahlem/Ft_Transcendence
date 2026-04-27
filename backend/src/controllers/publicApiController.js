import prisma from "../prisma.js";
import { deletePostById } from "../services/postService.js";
import { POST_MESSAGES } from "../constants/postMessages.js";

// Minimal public representation — no user-specific fields (likedBy, favoritedBy)
function formatPost(post) {
  return {
    id: post.id,
    content: post.content,
    createdAt: post.createdAt,
    author: {
      id: post.author.id,
      username: post.author.username,
      displayName: post.author.displayName ?? null,
      avatar: post.author.avatar ?? null,
    },
    likesCount: post.likes.length,
    commentsCount: post.comments.length,
    media: post.image ?? null,
  };
}

const postInclude = {
  author: true,
  likes: true,
  comments: true,
};

export const getPosts = async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      orderBy: { createdAt: "desc" },
      include: postInclude,
    });
    res.status(200).json(posts.map(formatPost));
  } catch (error) {
    console.error("Public API getPosts:", error);
    res.status(500).json({ message: POST_MESSAGES.errors.unableFetchPosts });
  }
};

export const getPostById = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id) || id < 1) {
      return res.status(400).json({ message: POST_MESSAGES.errors.invalidPostId });
    }

    const post = await prisma.post.findUnique({
      where: { id },
      include: postInclude,
    });

    if (!post) {
      return res.status(404).json({ message: POST_MESSAGES.errors.postNotFound });
    }

    res.status(200).json(formatPost(post));
  } catch (error) {
    console.error("Public API getPostById:", error);
    res.status(500).json({ message: POST_MESSAGES.errors.unableFetchPost });
  }
};

export const createPost = async (req, res) => {
  try {
    const { content, authorId } = req.body;

    if (!content || typeof content !== "string" || !content.trim()) {
      return res.status(400).json({ message: POST_MESSAGES.errors.contentRequired });
    }

    const id = Number(authorId);
    if (Number.isNaN(id) || id < 1) {
      return res.status(400).json({ message: POST_MESSAGES.errors.authorIdInvalid });
    }

    const author = await prisma.user.findUnique({ where: { id } });
    if (!author) {
      return res.status(404).json({ message: POST_MESSAGES.errors.authorNotFound });
    }

    const post = await prisma.post.create({
      data: { content: content.trim(), authorId: id },
      include: postInclude,
    });

    res.status(201).json(formatPost(post));
  } catch (error) {
    console.error("Public API createPost:", error);
    res.status(500).json({ message: POST_MESSAGES.errors.unableCreatePost });
  }
};

export const updatePost = async (req, res) => {
  try {
    const postId = Number(req.params.id);
    if (Number.isNaN(postId) || postId < 1) {
      return res.status(400).json({ message: POST_MESSAGES.errors.invalidPostId });
    }

    const { content } = req.body;
    if (!content || typeof content !== "string" || !content.trim()) {
      return res.status(400).json({ message: POST_MESSAGES.errors.contentRequired });
    }

    const existing = await prisma.post.findUnique({ where: { id: postId } });
    if (!existing) {
      return res.status(404).json({ message: POST_MESSAGES.errors.postNotFound });
    }

    const post = await prisma.post.update({
      where: { id: postId },
      data: { content: content.trim() },
      include: postInclude,
    });

    res.status(200).json(formatPost(post));
  } catch (error) {
    console.error("Public API updatePost:", error);
    res.status(500).json({ message: POST_MESSAGES.errors.unableUpdatePost });
  }
};

export const deletePost = async (req, res) => {
  try {
    const postId = Number(req.params.id);
    if (Number.isNaN(postId) || postId < 1) {
      return res.status(400).json({ message: POST_MESSAGES.errors.invalidPostId });
    }

    await deletePostById(postId);

    res.status(200).json({ message: POST_MESSAGES.success.postDeleted });
  } catch (error) {
    console.error("Public API deletePost:", error);

    if (error instanceof Error && error.message === POST_MESSAGES.errors.postNotFound) {
      return res.status(404).json({ message: error.message });
    }

    res.status(500).json({ message: POST_MESSAGES.errors.unableDeletePost });
  }
};
