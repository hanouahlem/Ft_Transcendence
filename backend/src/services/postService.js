import fs from "fs";
import path from "path";
import prisma from "../prisma.js";

const formatPost = (post) => {
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
    media: post.image ? [post.image] : [],
  };
};

export const getAllPosts = async () => {
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

  return posts.map(formatPost);
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

  return formatPost(post);
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

  await prisma.post.delete({
    where: {
      id: Number(postId),
    },
  });

  return true;
};