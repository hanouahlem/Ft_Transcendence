import ctrl from "../controllers/userController.js";
import oauth from "../controllers/oauthController.js";
import friend from "../controllers/friendController.js";
import notif from "../controllers/notifController.js";
import post from "../controllers/postController.js";
import { Router } from "express";
import { authMiddleware } from "../middleware/auth.js";
import upload from "../middleware/upload.js";
import twoFa from '../controllers/twoFactorController.js';
const router = Router();

//oauth
router.get("/auth/github", oauth.startGitHubOAuth);
router.get("/auth/github/callback", oauth.handleGitHubCallback);
router.get("/auth/42", oauth.startFortyTwoOAuth);
router.get("/auth/42/callback", oauth.handleFortyTwoCallback);

//user
router.post("/registerUser", ctrl.registerUser);
router.get("/users", ctrl.allUsers);
router.post("/login", ctrl.loginUser);
router.get("/user", authMiddleware, ctrl.getUser);
router.get("/users/search", authMiddleware, ctrl.searchUser);

router.get("/users/:id/posts", authMiddleware, ctrl.getUserPosts);
router.get("/users/:id/comments", authMiddleware, ctrl.getUserComments);
router.get("/users/:id/likes", authMiddleware, ctrl.getUserLikes);
router.get("/users/:id/favorites", authMiddleware, ctrl.getUserFavorites);
router.get("/users/:id", authMiddleware, ctrl.getUserById);

router.put("/users/:id", authMiddleware, ctrl.updateUser);
router.put("/settings/security", authMiddleware, ctrl.updatePassword);

// notifications
router.get("/notifications", authMiddleware, notif.getNotif);
router.post("/notifications", authMiddleware, notif.createNotif);
router.patch("/notifications/:id/read", authMiddleware, notif.markAsRead);
router.delete("/notifications/:id", authMiddleware, notif.deleteNotif);

// friends
router.post("/friends", authMiddleware, friend.addFriend);
router.get("/friends", authMiddleware, friend.getFriends);
router.put("/friends/:id", authMiddleware, friend.acceptFriend);
router.delete("/friends/:id", authMiddleware, friend.deleteFriend);
router.get("/friends/requests", authMiddleware, friend.getFriendRequests);
router.get("/users/:id/friends", authMiddleware, friend.getUserFriends);

// post
router.get("/posts", authMiddleware, post.getPostsHandler);
router.post("/posts", authMiddleware, upload.single("media"), post.createPostHandler);
router.delete("/posts/:id", authMiddleware, post.deletePostHandler);
router.post("/posts/:id/like", authMiddleware, post.likePostHandler);
router.delete("/posts/:id/like", authMiddleware, post.unlikePostHandler);
router.post("/posts/:id/favorite", authMiddleware, post.favoritePostHandler);
router.delete("/posts/:id/favorite", authMiddleware, post.unfavoritePostHandler);

// commentaire
router.post("/posts/:id/comments", authMiddleware, upload.single("media"), post.createCommentHandler);
router.delete("/comments/:id", authMiddleware, post.deleteCommentHandler);
router.post("/comments/:id/like", authMiddleware, post.likeCommentHandler);
router.delete("/comments/:id/like", authMiddleware, post.unlikeCommentHandler);
router.post("/comments/:id/favorite", authMiddleware, post.favoriteCommentHandler);
router.delete("/comments/:id/favorite", authMiddleware, post.unfavoriteCommentHandler);

router.post("/posts/:id/comments", authMiddleware,  post.createCommentHandler);



// 2FA
router.post('/settings/auth/2fa/setup',   authMiddleware, twoFa.setupCodeTwoFa);
router.post('/settings/auth/2fa/confirm',  authMiddleware, twoFa.checkTwoFaCode);
router.post('/settings/auth/2fa/disable', authMiddleware, twoFa.disableTwoFA);
router.post('/auth/2fa/login', twoFa.verifyLoginTwoFa);

export default router;
