import fs from "fs";
import path from "path";
import prisma from "../prisma.js";
import { checkComment } from './commentChecker.js';

const deleteUploadedFile = (mediaUrl) => {
  if (!mediaUrl) {
    return;
  }

  try {
    const filename = mediaUrl.split("/uploads/")[1];

    if (!filename) {
      return;
    }

    const filePath = path.resolve("uploads", filename);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error("Erreur suppression media :", error);
  }
};

const formatComment = (comment, currentUserId) => {
  return {
    id: comment.id,
    content: comment.content,
    createdAt: comment.createdAt,
    author: {
      id: comment.user.id,
      username: comment.user.username,
      displayName: comment.user.displayName,
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
      displayName: post.author.displayName,
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

const feedPostInclude = {
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
};

export const getAllPosts = async (currentUserId) => {
  const posts = await prisma.post.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: feedPostInclude,
  });

  return posts.map((post) => formatPost(post, currentUserId));
};

export const searchPosts = async (currentUserId, options = {}) => {
  const {
    q = "",
    authorUsername = "",
    dateFrom = null,
    dateTo = null,
    mediaType = "all",
    favoritesOnly = false,
    sort = "recent",
    page = 1,
    limit = 10,
  } = options;

  const resolvedUserId = Number(currentUserId);
  const filters = [];

  const trimmedQuery = typeof q === "string" ? q.trim() : "";
  if (trimmedQuery) {
    filters.push({
      OR: [
        { content: { contains: trimmedQuery, mode: "insensitive" } },
        {
          author: {
            OR: [
              { username: { contains: trimmedQuery, mode: "insensitive" } },
              { displayName: { contains: trimmedQuery, mode: "insensitive" } },
            ],
          },
        },
      ],
    });
  }

  const trimmedAuthor = typeof authorUsername === "string" ? authorUsername.trim().replace(/^@/, "") : "";
  if (trimmedAuthor) {
    filters.push({
      author: { username: { contains: trimmedAuthor, mode: "insensitive" } },
    });
  }

  if (dateFrom) {
    const parsed = new Date(dateFrom);
    if (!Number.isNaN(parsed.getTime())) {
      filters.push({ createdAt: { gte: parsed } });
    }
  }

  if (dateTo) {
    const parsed = new Date(dateTo);
    if (!Number.isNaN(parsed.getTime())) {
      parsed.setHours(23, 59, 59, 999);
      filters.push({ createdAt: { lte: parsed } });
    }
  }

  if (mediaType === "image") {
    filters.push({ image: { not: null } });
    filters.push({ NOT: { image: { endsWith: ".pdf", mode: "insensitive" } } });
  } else if (mediaType === "pdf") {
    filters.push({ image: { endsWith: ".pdf", mode: "insensitive" } });
  } else if (mediaType === "none") {
    filters.push({ image: null });
  }

  if (favoritesOnly && resolvedUserId) {
    filters.push({ favorites: { some: { userId: resolvedUserId } } });
  }

  const where = filters.length ? { AND: filters } : {};

  let orderBy;
  if (sort === "oldest") {
    orderBy = { createdAt: "asc" };
  } else if (sort === "likes") {
    orderBy = [{ likes: { _count: "desc" } }, { createdAt: "desc" }];
  } else {
    orderBy = { createdAt: "desc" };
  }

  const pageNum = Math.max(1, Number.parseInt(page, 10) || 1);
  const take = Math.max(1, Math.min(50, Number.parseInt(limit, 10) || 10));
  const skip = (pageNum - 1) * take;

  const [total, posts] = await Promise.all([
    prisma.post.count({ where }),
    prisma.post.findMany({
      where,
      orderBy,
      skip,
      take,
      include: feedPostInclude,
    }),
  ]);

  return {
    items: posts.map((post) => formatPost(post, currentUserId)),
    total,
    page: pageNum,
    limit: take,
    totalPages: Math.max(1, Math.ceil(total / take)),
  };
};

export const getFriendsPosts = async (currentUserId) => {
  const resolvedUserId = Number(currentUserId);
  const acceptedFriends = await prisma.friends.findMany({
    where: {
      status: "accepted",
      OR: [{ senderId: resolvedUserId }, { receiverId: resolvedUserId }],
    },
    select: {
      senderId: true,
      receiverId: true,
    },
  });

  const friendIds = acceptedFriends.map((relation) =>
    relation.senderId === resolvedUserId ? relation.receiverId : relation.senderId
  );

  if (friendIds.length === 0) {
    return [];
  }

  const posts = await prisma.post.findMany({
    where: {
      authorId: {
        in: friendIds,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    include: feedPostInclude,
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

const getPostForDeletion = async (postId) =>
  prisma.post.findUnique({
    where: { id: Number(postId) },
    include: {
      comments: true,
    },
  });

const deletePostWithRelations = async (post) => {
  deleteUploadedFile(post.image);

  const commentIds = post.comments.map((comment) => comment.id);

  if (commentIds.length > 0) {
    await prisma.commentLike.deleteMany({
      where: { commentId: { in: commentIds } },
    });
    await prisma.commentFavorite.deleteMany({
      where: { commentId: { in: commentIds } },
    });
  }

  await prisma.favorite.deleteMany({ where: { postId: post.id } });
  await prisma.like.deleteMany({ where: { postId: post.id } });
  await prisma.comment.deleteMany({ where: { postId: post.id } });
  await prisma.repost.deleteMany({ where: { postId: post.id } });
  await prisma.post.delete({ where: { id: post.id } });
};

export const deletePostById = async (postId) => {
  const post = await getPostForDeletion(postId);

  if (!post) {
    throw new Error("Post not found");
  }

  await deletePostWithRelations(post);
  return true;
};

export const deletePost = async (postId, userId) => {
  const post = await getPostForDeletion(postId);

  if (!post) throw new Error("Post not found");
  if (post.authorId !== Number(userId)) throw new Error("You are not allowed to delete this post");
  await deletePostWithRelations(post);

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
    return {
      created: false,
      postAuthorId: post.authorId,
    };
  }

  await prisma.like.create({
    data: {
      postId: Number(postId),
      userId: Number(userId),
    },
  });

  return {
    created: true,
    postAuthorId: post.authorId,
  };
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
    return { removed: false, postAuthorId: post.authorId };
  }

  await prisma.like.delete({
    where: {
      id: existingLike.id,
    },
  });

  return { removed: true, postAuthorId: post.authorId };
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

  if (!input.skipModeration) {
    const allowed = await checkComment(input.content);

    if (!allowed) {
      throw new Error("This comment contains inappropriate content.");
    }
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

  return {
    comment: formatComment(comment, input.userId),
    postAuthorId: post.authorId,
  };
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
    return { created: false, postAuthorId: post.authorId };
  }

  await prisma.favorite.create({
    data: {
      postId: Number(postId),
      userId: Number(userId),
    },
  });

  return { created: true, postAuthorId: post.authorId };
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
    return { removed: false, postAuthorId: post.authorId };
  }

  await prisma.favorite.delete({
    where: {
      id: existingFavorite.id,
    },
  });

  return { removed: true, postAuthorId: post.authorId };
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
    include: {
      post: { select: { authorId: true } },
    },
  });

  if (!comment) {
    throw new Error("Comment not found");
  }

  if (comment.userId !== Number(userId)) {
    throw new Error("You are not allowed to delete this comment");
  }

  deleteUploadedFile(comment.image);

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

  return {
    postId: comment.postId,
    postAuthorId: comment.post?.authorId ?? null,
  };
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
    return {
      created: false,
      commentAuthorId: comment.userId,
      postId: comment.postId,
    };
  }

  await prisma.commentLike.create({
    data: {
      commentId: Number(commentId),
      userId: Number(userId),
    },
  });

  return {
    created: true,
    commentAuthorId: comment.userId,
    postId: comment.postId,
  };
};

export const unlikeComment = async (commentId, userId) => {
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

  if (!existingLike) {
    return {
      removed: false,
      commentAuthorId: comment.userId,
      postId: comment.postId,
    };
  }

  await prisma.commentLike.delete({
    where: {
      id: existingLike.id,
    },
  });

  return {
    removed: true,
    commentAuthorId: comment.userId,
    postId: comment.postId,
  };
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
    return {
      created: false,
      commentAuthorId: comment.userId,
      postId: comment.postId,
    };
  }

  await prisma.commentFavorite.create({
    data: {
      commentId: Number(commentId),
      userId: Number(userId),
    },
  });

  return {
    created: true,
    commentAuthorId: comment.userId,
    postId: comment.postId,
  };
};

export const unfavoriteComment = async (commentId, userId) => {
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

  if (!existingFavorite) {
    return {
      removed: false,
      commentAuthorId: comment.userId,
      postId: comment.postId,
    };
  }

  await prisma.commentFavorite.delete({
    where: {
      id: existingFavorite.id,
    },
  });

  return {
    removed: true,
    commentAuthorId: comment.userId,
    postId: comment.postId,
  };
};
