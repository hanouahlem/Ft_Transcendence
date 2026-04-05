import fs from "fs";
import path from "path";
import prisma from "../prisma.js";
import { checkComment } from './commentChecker.js';

const formatComment = (comment, currentUserId) => {
  return {
    id: comment.id,
    content: comment.content,
    createdAt: comment.createdAt,
    author: {
      id: comment.user.id,
      username: comment.user.username,
      email: comment.user.email,
      avatar: comment.user.avatar,
    },
    likesCount: comment.commentLikes.length,
    favoritesCount: comment.commentFavorites.length,
    likedByCurrentUser: comment.commentLikes.some(
      (like) => like.userId === Number(currentUserId)
    ),
    favoritedByCurrentUser: comment.commentFavorites.some(
      (favorite) => favorite.userId === Number(currentUserId)
    ),
    media: comment.image ? [comment.image] : [],
  };
};

const formatPost = (post, currentUserId) => {
  return {
    id: post.id,
    content: post.content,
    createdAt: post.createdAt,
    author: {
      id: post.author.id,
      username: post.author.username,
      email: post.author.email,
      avatar: post.author.avatar,
    },
    likesCount: post.likes.length,
    commentsCount: post.comments.length,
    favoritesCount: post.favorites.length,
    likedByCurrentUser: post.likes.some(
      (like) => like.userId === Number(currentUserId)
    ),
    favoritedByCurrentUser: post.favorites.some(
      (favorite) => favorite.userId === Number(currentUserId)
    ),
    comments: post.comments.map((comment) =>
      formatComment(comment, currentUserId)
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
      favorites: true,
      comments: {
        include: {
          user: true,
          commentLikes: true,
          commentFavorites: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      },
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
      favorites: true,
      reposts: true,
      comments: {
        include: {
          user: true,
        },
      },
    },
  });

  return formatPost(post, input.authorId);
};

export const deletePost = async (postId, userId) => {
  const post = await prisma.post.findUnique({
    where: {
      id: Number(postId),
    },
    include: {
      comments: true,
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


  for (const comment of post.comments) {
    if (comment.image) {
      try {
        const filename = comment.image.split("/uploads/")[1];

        if (filename) {
          const filePath = path.resolve("uploads", filename);

          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        }
      } catch (error) {
        console.error("Erreur suppression image commentaire :", error);
      }
    }

  
    await prisma.commentLike.deleteMany({
      where: {
        commentId: comment.id,
      },
    });

    await prisma.commentFavorite.deleteMany({
      where: {
        commentId: comment.id,
      },
    });
  }

  await prisma.comment.deleteMany({
    where: {
      postId: Number(postId),
    },
  });

  await prisma.like.deleteMany({
    where: {
      postId: Number(postId),
    },
  });

  await prisma.favorite.deleteMany({
    where: {
      postId: Number(postId),
    },
  });

  await prisma.repost.deleteMany({
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

export const createComment = async (input) => {
  const post = await prisma.post.findUnique({
    where: {
      id: Number(input.postId),
    },
  });

  if (!post) {
    throw new Error("Post not found");
  }

  const allowed = await checkComment(input.content);
  
  if (!allowed) {
    throw new Error('Ce commentaire contient du contenu inapproprié.');
  }
  const user = await prisma.user.findUnique({
    where: {
      id: Number(input.userId),
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const comment = await prisma.comment.create({
    data: {
      content: input.content,
      image: input.mediaUrl || null,
      postId: Number(input.postId),
      userId: Number(input.userId),
    },
    include: {
      user: true,
      commentLikes: true,
      commentFavorites: true,
    },
  });

  return formatComment(comment, input.userId);
};

export const favoritePost = async (postId, userId) => {
  const post = await prisma.post.findUnique({
    where: {
      id: Number(postId),
    },
  });

  if (!post) {
    throw new Error("Post not found");
  }

  const existingFavorite = await prisma.favorite.findFirst({
    where: {
      postId: Number(postId),
      userId: Number(userId),
    },
  });

  if (existingFavorite) {
    return true;
  }

  await prisma.favorite.create({
    data: {
      postId: Number(postId),
      userId: Number(userId),
    },
  });

  return true;
};

export const unfavoritePost = async (postId, userId) => {
  const post = await prisma.post.findUnique({
    where: {
      id: Number(postId),
    },
  });

  if (!post) {
    throw new Error("Post not found");
  }

  const existingFavorite = await prisma.favorite.findFirst({
    where: {
      postId: Number(postId),
      userId: Number(userId),
    },
  });

  if (!existingFavorite) {
    return true;
  }

  await prisma.favorite.delete({
    where: {
      id: existingFavorite.id,
    },
  });

  return true;
};

export const repostPost = async (postId, userId) => {
  const post = await prisma.post.findUnique({
    where: {
      id: Number(postId),
    },
  });

  if (!post) {
    throw new Error("Post not found");
  }

  const existingRepost = await prisma.repost.findFirst({
    where: {
      postId: Number(postId),
      userId: Number(userId),
    },
  });

  if (existingRepost) {
    return true;
  }

  await prisma.repost.create({
    data: {
      postId: Number(postId),
      userId: Number(userId),
    },
  });

  return true;
};

export const unrepostPost = async (postId, userId) => {
  const post = await prisma.post.findUnique({
    where: {
      id: Number(postId),
    },
  });

  if (!post) {
    throw new Error("Post not found");
  }

  const existingRepost = await prisma.repost.findFirst({
    where: {
      postId: Number(postId),
      userId: Number(userId),
    },
  });

  if (!existingRepost) {
    return true;
  }

  await prisma.repost.delete({
    where: {
      id: existingRepost.id,
    },
  });

  return true;
};

export const deleteComment = async (commentId, userId) => {
  const comment = await prisma.comment.findUnique({
    where: {
      id: Number(commentId),
    },
  });

  if (!comment) {
    throw new Error("Comment not found");
  }

  if (comment.userId !== Number(userId)) {
    throw new Error("You are not allowed to delete this comment");
  }

  if (comment.image) {
    try {
      const filename = comment.image.split("/uploads/")[1];

      if (filename) {
        const filePath = path.resolve("uploads", filename);

        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
    } catch (error) {
      console.error("Erreur suppression image commentaire :", error);
    }
  }

  await prisma.commentLike.deleteMany({
    where: {
      commentId: Number(commentId),
    },
  });

  await prisma.commentFavorite.deleteMany({
    where: {
      commentId: Number(commentId),
    },
  });

  await prisma.comment.delete({
    where: {
      id: Number(commentId),
    },
  });

  return true;
};

export const likeComment = async (commentId, userId) => {
  const comment = await prisma.comment.findUnique({
    where: { id: Number(commentId) },
  });

  if (!comment) {
    throw new Error("Comment not found");
  }

  const existingLike = await prisma.commentLike.findFirst({
    where: {
      commentId: Number(commentId),
      userId: Number(userId),
    },
  });

  if (existingLike) {
    return true;
  }

  await prisma.commentLike.create({
    data: {
      commentId: Number(commentId),
      userId: Number(userId),
    },
  });

  return true;
};

export const unlikeComment = async (commentId, userId) => {
  const existingLike = await prisma.commentLike.findFirst({
    where: {
      commentId: Number(commentId),
      userId: Number(userId),
    },
  });

  if (!existingLike) {
    return true;
  }

  await prisma.commentLike.delete({
    where: {
      id: existingLike.id,
    },
  });

  return true;
};

export const favoriteComment = async (commentId, userId) => {
  const comment = await prisma.comment.findUnique({
    where: { id: Number(commentId) },
  });

  if (!comment) {
    throw new Error("Comment not found");
  }

  const existingFavorite = await prisma.commentFavorite.findFirst({
    where: {
      commentId: Number(commentId),
      userId: Number(userId),
    },
  });

  if (existingFavorite) {
    return true;
  }

  await prisma.commentFavorite.create({
    data: {
      commentId: Number(commentId),
      userId: Number(userId),
    },
  });

  return true;
};

export const unfavoriteComment = async (commentId, userId) => {
  const existingFavorite = await prisma.commentFavorite.findFirst({
    where: {
      commentId: Number(commentId),
      userId: Number(userId),
    },
  });

  if (!existingFavorite) {
    return true;
  }

  await prisma.commentFavorite.delete({
    where: {
      id: existingFavorite.id,
    },
  });

  return true;
};

