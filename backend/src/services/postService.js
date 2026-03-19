import fs from "fs";
import path from "path";
import prisma from "../prisma.js";

const formatPost = (post, currentUserId) => {
  return {
    id: post.id,
    content: post.content,
    createdAt: post.createdAt,
    author: {
      id: post.author.id,
      username: post.author.username,
      email: post.author.email,
    },
    likesCount: post.likes.length,
    commentsCount: post.comments.length,
    likedByCurrentUser: post.likes.some(
      (like) => like.userId === Number(currentUserId)
    ),
    media: post.image ? [post.image] : [],
  };
};

export const getAllPosts = async (currentUserId) => {
  const posts = await prisma.post.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      author: true,
      likes: true,
      comments: true,
    },
  });

  return posts.map((post) => formatPost(post, currentUserId));
};

export const createPost = async (input) => {
  const author = await prisma.user.findUnique({
    where: {
      id: Number(input.authorId),
    },
  });

  if (!author) {
    throw new Error("User not found");
  }

  const post = await prisma.post.create({
    data: {
      content: input.content,
      image: input.mediaUrl || null,
      authorId: author.id,
    },
    include: {
      author: true,
      likes: true,
      comments: true,
    },
  });

  return formatPost(post, input.authorId);
};

export const deletePost = async (postId, userId) => {
  const post = await prisma.post.findUnique({
    where: {
      id: Number(postId),
    },
  });

  if (!post) {
    throw new Error("Post not found");
  }

  if (post.authorId !== Number(userId)) {
    throw new Error("You are not allowed to delete this post");
  }

  if (post.image) {
    try {
      const filename = post.image.split("/uploads/")[1];

      if (filename) {
        const filePath = path.resolve("uploads", filename);

        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
    } catch (error) {
      console.error("Erreur suppression image :", error);
    }
  }

  await prisma.like.deleteMany({
    where: {
      postId: Number(postId),
    },
  });

  await prisma.comment.deleteMany({
    where: {
      postId: Number(postId),
    },
  });

  await prisma.post.delete({
    where: {
      id: Number(postId),
    },
  });

  return true;
};

export const likePost = async (postId, userId) => {
  const post = await prisma.post.findUnique({
    where: {
      id: Number(postId),
    },
  });

  if (!post) {
    throw new Error("Post not found");
  }

  const existingLike = await prisma.like.findFirst({
    where: {
      postId: Number(postId),
      userId: Number(userId),
    },
  });

  if (existingLike) {
    return true;
  }

  await prisma.like.create({
    data: {
      postId: Number(postId),
      userId: Number(userId),
    },
  });

  return true;
};

export const unlikePost = async (postId, userId) => {
  const post = await prisma.post.findUnique({
    where: {
      id: Number(postId),
    },
  });

  if (!post) {
    throw new Error("Post not found");
  }

  const existingLike = await prisma.like.findFirst({
    where: {
      postId: Number(postId),
      userId: Number(userId),
    },
  });

  if (!existingLike) {
    return true;
  }

  await prisma.like.delete({
    where: {
      id: existingLike.id,
    },
  });

  return true;
};