import ctrl from "../controllers/userController.js";
import oauth from "../controllers/oauthController.js";
import friend from "../controllers/friendController.js";
import {createPostHandler,getPostsHandler,deletePostHandler,likePostHandler,unlikePostHandler,createCommentHandler,} from "../controllers/postController.js";
import { Router } from "express";
import { authMiddleware } from "../middleware/auth.js";
import upload from "../middleware/upload.js";
import notif from '../controllers/notifController.js';

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
router.put("/users/:id", authMiddleware, ctrl.updateUser);
router.put("/settings/security", authMiddleware, ctrl.updatePassword);

router.post('/notifications', authMiddleware, notif.createNotif);
router.get('/notifications', authMiddleware, notif.getNotif);
router.patch('/notifications/:id/read', authMiddleware, notif.markAsRead);
router.delete('/notifications/:id', authMiddleware, notif.deleteNotif);



//friends
router.post("/friends", authMiddleware, friend.addFriend);
router.get("/friends", authMiddleware, friend.getFriends);
router.put("/friends/:id", authMiddleware, friend.acceptFriend);
router.delete("/friends/:id", authMiddleware, friend.deleteFriend);
router.get("/friends/requests", authMiddleware, friend.getFriendRequests);



//post
router.get("/posts", authMiddleware, getPostsHandler);
router.post("/posts", authMiddleware, upload.single("media"), createPostHandler);
router.delete("/posts/:id", authMiddleware, deletePostHandler);
router.post("/posts/:id/like", authMiddleware, likePostHandler);
router.delete("/posts/:id/like", authMiddleware, unlikePostHandler);
router.post("/posts/:id/comments", authMiddleware, createCommentHandler);
export default router;
