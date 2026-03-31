import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { getEnv } from "../env.js";
import prisma from "../prisma.js";

const currentUserSelect = {
  id: true,
  username: true,
  email: true,
  avatar: true,
  bio: true,
  status: true,
  location: true,
  createdAt: true,
};

export async function allUsers(req, res) {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
      },
    });

    return res.json(users);
  } catch (error) {
    console.error("allUsers error:", error);
    return res.status(500).json({ message: "Failed to fetch users" });
  }
}

export async function  getUser(req, res) {
    const user = await prisma.user.findUnique({
        where: { id : req.user.id },
        select: currentUserSelect,
    });
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
};


export async function registerUser(req, res) {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const userExisting = await prisma.user.findFirst({
            where: {
                OR: [
                    {email},
                    {username}
                ]
            }
        });
        
        if(userExisting){
            return res.status(400).json({message: "Email or username already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                username,
                email,
                password: hashedPassword
            }
        });

        return res.status(201).json({
            message: 'User created successfully',
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        console.error('registerUser error:', error);
        return res.status(500).json({ message: 'Register failed' });
    }
}

export const loginUser = async (req, res) => {
  try {
    const { identifier, email, password } = req.body;
    const loginValue =
      typeof identifier === "string" && identifier.trim()
        ? identifier.trim()
        : typeof email === "string"
          ? email.trim()
          : "";

    if (!loginValue || !password) {
      return res.status(400).json({ message: "Login credentials are required." });
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: loginValue }, { username: loginValue }],
      },
    });

    if (!user) {
      return res.status(401).json({message: "Username/email or password is incorrect.",});
    }

    if (!user.password) {
      return res.status(401).json({
        message: "Username/email or password is incorrect.",
      });
    }

    const passwordOk = await bcrypt.compare(password, user.password);

    if (!passwordOk) {
      return res.status(401).json({message: "Username/email or password is incorrect.",});
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      getEnv("JWT_SECRET"),
      { expiresIn: "3h" }
    );

    return res.status(200).json({message: "Login successful",token,});
  }

  catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({message: "Server error during login."});
  }
};


export async function searchUser(req, res){

    try{
        const { username } = req.query;

        if (!username)
            return res.status(400).json({message: "Query is required"});

        const users = await prisma.user.findMany({
            where: {
                username: {
                    contains: username,
                    mode : "insensitive"
                }
            },
            select: {id: true, username: true, avatar: true}
        });
        return res.status(200).json(users);
    }
    catch(error)
    {
        console.error("searchUsers error:", error);
        return res.status(500).json({ message: "Failed to search users" });
    }
}

export async function updateUser(req, res) {
  const requestId = parseInt(req.params.id);
  const currentUserId = req.user?.id ?? req.user?.userId;
  const { username, avatar, bio, status, location, website } = req.body;

  if (Number.isNaN(requestId) || requestId < 1) {
    return res.status(400).json({
      message: "Invalid user id.",
    });
  }

  if (!currentUserId) {
    return res.status(401).json({
      message: "User not found in token.",
    });
  }

  if (currentUserId !== requestId) {
    return res.status(403).json({
      message: "You are not allowed to update this profile.",
    });
  }

  try {
    if (username) {
      const userExisting = await prisma.user.findFirst({
        where: {
          username,
          id: {
            not: requestId,
          },
        },
      });

      if (userExisting) {
        return res.status(400).json({
          message: "Username already exists",
        });
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: requestId },
      data: {
        username,
        avatar,
        bio,
        status,
        location,
        website,
      },
      select: {
        id: true,
        username: true,
        email: true,
        avatar: true,
        bio: true,
        status: true,
        location: true,
        website: true,
        createdAt: true,
      },
    });

    return res.json(updatedUser);
  } catch (error) {
    console.error("updateUser error:", error);
    return res.status(500).json({
      message: "Failed to update user",
    });
  }
}


export async function updatePassword(req, res){
    
    const { currentPassword, newPassword, confirmPassword} = req.body;
    
    
    try{
        if (!currentPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({ message: "Missing required fields" });
        }

         const user = await prisma.user.findUnique({
            where: { id: req.user.id }
        });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (!user.password) {
            return res.status(400).json({
                message: "This account does not have a local password yet.",
            });
        }

        const passwordOk = await bcrypt.compare(currentPassword, user.password);
        if (!passwordOk) {
            return res.status(401).json({ message: "Current password is incorrect" });
        }
    
        if(newPassword !== confirmPassword){
            return res.status(401).json({message: "Passwords do not match"});
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        await prisma.user.update({
        where:{id: req.user.id},
        data:{ password: hashedPassword}
        
        });
        res.json({message: "Password updated successfully" });
    }
    catch(error)
    {
        console.error("updatePassword error:", error);
        res.status(500).json({ message: "Failed to update password" });
    }
}

const getUserById = async (req, res) => {
  try {
    const userId = Number(req.params.id);

    if (Number.isNaN(userId) || userId < 1) {
      return res.status(400).json({
        message: "Invalid user id.",
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
            id: true,
            username: true,
            email: true,
            avatar: true,
            bio: true,
            status: true,
            location: true,
            website: true,
            createdAt: true,
            },
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error("Erreur getUserById :", error);
    return res.status(500).json({
      message: "Unable to fetch user.",
    });
  }
};

const formatFeedComment = (comment, currentUserId) => {
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
    likesCount: comment.commentLikes?.length || 0,
    favoritesCount: comment.commentFavorites?.length || 0,
    likedByCurrentUser: (comment.commentLikes || []).some(
      (like) => like.userId === Number(currentUserId)
    ),
    favoritedByCurrentUser: (comment.commentFavorites || []).some(
      (favorite) => favorite.userId === Number(currentUserId)
    ),
    media: comment.image ? [comment.image] : [],
    post: comment.post
      ? {
          id: comment.post.id,
          content: comment.post.content,
          author: {
            id: comment.post.author.id,
            username: comment.post.author.username,
          },
        }
      : null,
  };
};

const formatFeedPost = (post, currentUserId) => {
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
      formatFeedComment(comment, currentUserId)
    ),
    media: post.image ? [post.image] : [],
  };
};

const getUserPosts = async (req, res) => {
  try {
    const targetUserId = Number(req.params.id);
    const currentUserId = req.user?.id ?? req.user?.userId;

    if (Number.isNaN(targetUserId) || targetUserId < 1) {
      return res.status(400).json({ message: "Invalid user id." });
    }

    const posts = await prisma.post.findMany({
      where: {
        authorId: targetUserId,
      },
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

    return res.status(200).json(posts.map((post) => formatFeedPost(post, currentUserId)));
  } catch (error) {
    console.error("getUserPosts error:", error);
    return res.status(500).json({ message: "Failed to fetch user posts" });
  }
};

const getUserComments = async (req, res) => {
  try {
    const targetUserId = Number(req.params.id);
    const currentUserId = req.user?.id ?? req.user?.userId;

    if (Number.isNaN(targetUserId) || targetUserId < 1) {
      return res.status(400).json({ message: "Invalid user id." });
    }

    const comments = await prisma.comment.findMany({
      where: {
        userId: targetUserId,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: true,
        post: {
          include: {
            author: true,
          },
        },
        commentLikes: true,
        commentFavorites: true,
      },
    });

    return res.status(200).json(
      comments.map((comment) => formatFeedComment(comment, currentUserId))
    );
  } catch (error) {
    console.error("getUserComments error:", error);
    return res.status(500).json({ message: "Failed to fetch user comments" });
  }
};

const getUserLikes = async (req, res) => {
  try {
    const targetUserId = Number(req.params.id);
    const currentUserId = req.user?.id ?? req.user?.userId;

    if (Number.isNaN(targetUserId) || targetUserId < 1) {
      return res.status(400).json({ message: "Invalid user id." });
    }

    const likedPosts = await prisma.like.findMany({
      where: {
        userId: targetUserId,
      },
      orderBy: {
        id: "desc",
      },
      include: {
        post: {
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
        },
      },
    });

    const likedComments = await prisma.commentLike.findMany({
      where: {
        userId: targetUserId,
      },
      orderBy: {
        id: "desc",
      },
      include: {
        comment: {
          include: {
            user: true,
            post: {
              include: {
                author: true,
              },
            },
            commentLikes: true,
            commentFavorites: true,
          },
        },
      },
    });

    return res.status(200).json({
      posts: likedPosts.map((item) => formatFeedPost(item.post, currentUserId)),
      comments: likedComments.map((item) =>
        formatFeedComment(item.comment, currentUserId)
      ),
    });
  } catch (error) {
    console.error("getUserLikes error:", error);
    return res.status(500).json({ message: "Failed to fetch user likes" });
  }
};

const getUserFavorites = async (req, res) => {
  try {
    const targetUserId = Number(req.params.id);
    const currentUserId = req.user?.id ?? req.user?.userId;

    if (Number.isNaN(targetUserId) || targetUserId < 1) {
      return res.status(400).json({ message: "Invalid user id." });
    }

    const favoritePosts = await prisma.favorite.findMany({
      where: {
        userId: targetUserId,
      },
      orderBy: {
        id: "desc",
      },
      include: {
        post: {
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
        },
      },
    });

    const favoriteComments = await prisma.commentFavorite.findMany({
      where: {
        userId: targetUserId,
      },
      orderBy: {
        id: "desc",
      },
      include: {
        comment: {
          include: {
            user: true,
            post: {
              include: {
                author: true,
              },
            },
            commentLikes: true,
            commentFavorites: true,
          },
        },
      },
    });

    return res.status(200).json({
      posts: favoritePosts.map((item) => formatFeedPost(item.post, currentUserId)),
      comments: favoriteComments.map((item) =>
        formatFeedComment(item.comment, currentUserId)
      ),
    });
  } catch (error) {
    console.error("getUserFavorites error:", error);
    return res.status(500).json({ message: "Failed to fetch user favorites" });
  }
};

export default {
  registerUser,
  allUsers,
  loginUser,
  getUser,
  getUserById,
  getUserPosts,
  getUserComments,
  getUserLikes,
  getUserFavorites,
  searchUser,
  updateUser,
  updatePassword,
};