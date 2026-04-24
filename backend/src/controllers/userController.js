import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { getEnv } from "../env.js";
import prisma from "../prisma.js";
import { issueTwoFactorCode } from "../services/twoFactorService.js";

const APP_TOKEN_EXPIRATION = "3h";
const PENDING_TWO_FACTOR_EXPIRATION = "10m";

function signSessionToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email },
    getEnv("JWT_SECRET"),
    { expiresIn: APP_TOKEN_EXPIRATION }
  );
}

function signPendingTwoFactorToken(user) {
  return jwt.sign(
    { id: user.id, purpose: "login_2fa" },
    getEnv("JWT_SECRET"),
    { expiresIn: PENDING_TWO_FACTOR_EXPIRATION }
  );
}

function normalizeTwoFactorCode(input) {
  return typeof input === "string" ? input.trim() : "";
}

function verifyPendingTwoFactorToken(pendingToken) {
  if (typeof pendingToken !== "string" || !pendingToken.trim()) {
    return null;
  }

  try {
    const payload = jwt.verify(pendingToken.trim(), getEnv("JWT_SECRET"));

    if (
      typeof payload !== "object" ||
      payload === null ||
      payload.purpose !== "login_2fa" ||
      typeof payload.id !== "number"
    ) {
      return null;
    }

    return payload.id;
  } catch (error) {
    return null;
  }
}

const currentUserSelect = {
  id: true,
  username: true,
  displayName: true,
  email: true,
  banner: true,
  avatar: true,
  bio: true,
  status: true,
  location: true,
  website: true,
  createdAt: true,
  twoFactorEnabled: true,
  password: true,
};

const publicUserSelect = {
  id: true,
  username: true,
  displayName: true,
  banner: true,
  avatar: true,
  bio: true,
  status: true,
  location: true,
  website: true,
  createdAt: true,
};

const publicUserListSelect = {
  id: true,
  username: true,
  displayName: true,
  avatar: true,
};

function toSafeCurrentUser(user) {
  if (!user) {
    return null;
  }

  const { password, ...safeUser } = user;

  return {
    ...safeUser,
    hasPassword: Boolean(password),
  };
}

export async function allUsers(req, res) {
  try {
    const users = await prisma.user.findMany({
      select: publicUserListSelect,
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
    res.json(toSafeCurrentUser(user));
};


export async function registerUser(req, res) {
    try {
        const username = typeof req.body.username === "string" ? req.body.username.trim() : "";
        const email = typeof req.body.email === "string" ? req.body.email.trim() : "";
        const password = typeof req.body.password === "string" ? req.body.password : "";

        const fieldErrors = {};

        if (!username) fieldErrors.username = "Required";
        if (!email) fieldErrors.email = "Required";
        if (!password) fieldErrors.password = "Required";

        if (Object.keys(fieldErrors).length > 0) {
            return res.status(400).json({
                message: "Missing required fields",
                fieldErrors,
            });
        }

        const [emailExisting, usernameExisting] = await Promise.all([
            prisma.user.findFirst({
                where: { email },
                select: { id: true },
            }),
            prisma.user.findFirst({
                where: { username },
                select: { id: true },
            }),
        ]);

        const duplicateFieldErrors = {};
        if (emailExisting) duplicateFieldErrors.email = "Email already exists";
        if (usernameExisting) duplicateFieldErrors.username = "Username already exists";

        if (Object.keys(duplicateFieldErrors).length > 0) {
            return res.status(400).json({
                message: "Registration failed",
                fieldErrors: duplicateFieldErrors,
            });
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
    const passwordValue = typeof password === "string" ? password : "";

    if (!loginValue || !passwordValue) {
      const fieldErrors = {};

      if (!loginValue) {
        fieldErrors.identifier = "Login credentials are required.";
      }

      if (!passwordValue) {
        fieldErrors.password = "Login credentials are required.";
      }

      return res.status(400).json({
        message: "Login credentials are required.",
        fieldErrors,
      });
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: loginValue }, { username: loginValue }],
      },
    });

    if (!user) {
      return res.status(401).json({
        message: "Username/email or password is incorrect.",
        fieldErrors: {
          password: "Username/email or password is incorrect.",
        },
      });
    }

    if (!user.password) {
      return res.status(401).json({
        message: "Username/email or password is incorrect.",
        fieldErrors: {
          password: "Username/email or password is incorrect.",
        },
      });
    }

    const passwordOk = await bcrypt.compare(passwordValue, user.password);

    if (!passwordOk) {
      return res.status(401).json({
        message: "Username/email or password is incorrect.",
        fieldErrors: {
          password: "Username/email or password is incorrect.",
        },
      });
    }

    if (user.twoFactorEnabled) {
      return res.status(200).json({
        message: "2FA required. Send a code to continue.",
        twoFactorRequired: true,
        pendingToken: signPendingTwoFactorToken(user),
        email: user.email,
      });
    }

    const token = signSessionToken(user);

    return res.status(200).json({message: "Login successful",token,});
  }

  catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({message: "Server error during login."});
  }
};

export const verifyLoginTwoFactor = async (req, res) => {
  try {
    const userId = verifyPendingTwoFactorToken(req.body?.pendingToken);
    const code = normalizeTwoFactorCode(req.body?.code);

    if (!userId) {
      return res.status(401).json({ message: "Invalid or expired 2FA session." });
    }

    if (!/^\d{4}$/.test(code)) {
      return res.status(400).json({ message: "Code must contain exactly 4 digits." });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.twoFactorEnabled) {
      return res.status(401).json({ message: "Invalid 2FA challenge." });
    }

    if (!user.twoFactorcode || !user.twoFactorExpires) {
      return res.status(400).json({ message: "No code sent." });
    }

    if (new Date() > user.twoFactorExpires) {
      return res.status(400).json({ message: "Code expired." });
    }

    if (user.twoFactorcode !== code) {
      return res.status(401).json({ message: "Invalid code." });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        twoFactorcode: null,
        twoFactorExpires: null,
      },
    });

    return res.status(200).json({
      message: "Login successful",
      token: signSessionToken(user),
    });
  } catch (error) {
    console.error("verifyLoginTwoFactor error:", error);
    return res.status(500).json({ message: "Failed to verify 2FA code." });
  }
};

export const resendLoginTwoFactor = async (req, res) => {
  try {
    const userId = verifyPendingTwoFactorToken(req.body?.pendingToken);

    if (!userId) {
      return res.status(401).json({ message: "Invalid or expired 2FA session." });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.twoFactorEnabled) {
      return res.status(401).json({ message: "Invalid 2FA challenge." });
    }

    await issueTwoFactorCode(user);

    return res.status(200).json({
      message: "Code sent by email.",
      email: user.email,
    });
  } catch (error) {
    console.error("resendLoginTwoFactor error:", error);
    return res.status(500).json({ message: "Failed to resend 2FA code." });
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
            select: {id: true, username: true, displayName: true, avatar: true}
        });
        return res.status(200).json(users);
    }
    catch(error)
    {
        console.error("searchUsers error:", error);
        return res.status(500).json({ message: "Failed to search users" });
    }
}

export async function searchUsersAdvanced(req, res) {
  try {
    const {
      q = "",
      onlineOnly,
      friendsOnly,
      sort = "alpha-asc",
      page = "1",
      limit = "12",
    } = req.query;

    const currentUserId = req.user?.id ?? req.user?.userId;
    const resolvedUserId = Number(currentUserId);
    const filters = [];

    const trimmedQuery = typeof q === "string" ? q.trim() : "";
    if (trimmedQuery) {
      filters.push({
        OR: [
          { username: { contains: trimmedQuery, mode: "insensitive" } },
          { displayName: { contains: trimmedQuery, mode: "insensitive" } },
        ],
      });
    }

    if (onlineOnly === "true") {
      filters.push({ status: "online" });
    }

    if (friendsOnly === "true" && resolvedUserId) {
      const friendships = await prisma.friends.findMany({
        where: {
          status: "accepted",
          OR: [{ senderId: resolvedUserId }, { receiverId: resolvedUserId }],
        },
        select: { senderId: true, receiverId: true },
      });
      const friendIds = friendships.map((relation) =>
        relation.senderId === resolvedUserId ? relation.receiverId : relation.senderId,
      );

      if (friendIds.length === 0) {
        return res.status(200).json({
          items: [],
          total: 0,
          page: 1,
          limit: 12,
          totalPages: 1,
        });
      }

      filters.push({ id: { in: friendIds } });
    }

    const where = filters.length ? { AND: filters } : {};

    let orderBy;
    if (sort === "alpha-desc") {
      orderBy = { username: "desc" };
    } else if (sort === "recent") {
      orderBy = { createdAt: "desc" };
    } else if (sort === "oldest") {
      orderBy = { createdAt: "asc" };
    } else {
      orderBy = { username: "asc" };
    }

    const pageNum = Math.max(1, Number.parseInt(page, 10) || 1);
    const take = Math.max(1, Math.min(50, Number.parseInt(limit, 10) || 12));
    const skip = (pageNum - 1) * take;

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        orderBy,
        skip,
        take,
        select: {
          id: true,
          username: true,
          displayName: true,
          avatar: true,
          status: true,
          createdAt: true,
        },
      }),
    ]);

    return res.status(200).json({
      items: users,
      total,
      page: pageNum,
      limit: take,
      totalPages: Math.max(1, Math.ceil(total / take)),
    });
  } catch (error) {
    console.error("searchUsersAdvanced error:", error);
    return res.status(500).json({ message: "Failed to search users" });
  }
}

export async function getUserByUsername(req, res) {
  try {
    const username =
      typeof req.params.username === "string" ? req.params.username.trim() : "";

    if (!username) {
      return res.status(400).json({
        message: "Username is required.",
      });
    }

    const user = await prisma.user.findUnique({
      where: { username },
      select: publicUserSelect,
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error("getUserByUsername error:", error);
    return res.status(500).json({
      message: "Unable to fetch user.",
    });
  }
}

export async function updateUser(req, res) {
  const requestId = parseInt(req.params.id);
  const currentUserId = req.user?.id ?? req.user?.userId;
  const {
    username,
    displayName,
    banner,
    avatar,
    bio,
    status,
    location,
    website,
  } = req.body;

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
        displayName,
        banner,
        avatar,
        bio,
        status,
        location,
        website,
      },
      select: currentUserSelect,
    });

    return res.json(toSafeCurrentUser(updatedUser));
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

export async function setPassword(req, res) {
  const { newPassword, confirmPassword } = req.body;

  try {
    if (!newPassword || !confirmPassword) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        password: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.password) {
      return res.status(400).json({
        message: "This account already has a local password.",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashedPassword },
    });

    return res.json({ message: "Password set successfully" });
  } catch (error) {
    console.error("setPassword error:", error);
    return res.status(500).json({ message: "Failed to set password" });
  }
}

export async function uploadUserMedia(req, res) {
  if (!req.file) {
    return res.status(400).json({ message: "Image file is required." });
  }

  const mediaUrl = `/uploads/${req.file.filename}`;

  return res.status(201).json({ url: mediaUrl });
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
      select: publicUserSelect,
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
      displayName: comment.user.displayName,
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
            displayName: comment.post.author.displayName,
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
  verifyLoginTwoFactor,
  resendLoginTwoFactor,
  getUser,
  getUserById,
  getUserPosts,
  getUserComments,
  getUserLikes,
  getUserFavorites,
  searchUser,
  searchUsersAdvanced,
  getUserByUsername,
  updateUser,
  updatePassword,
  setPassword,
  uploadUserMedia,
};
