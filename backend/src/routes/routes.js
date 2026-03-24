import ctrl from "../controllers/userController.js";
import friend from "../controllers/friendController.js";
import {
  createPostHandler,
  getPostsHandler,
  deletePostHandler,
  likePostHandler,
  unlikePostHandler,
  createCommentHandler,
  deleteCommentHandler,
  favoritePostHandler,
  unfavoritePostHandler,
  repostPostHandler,
  unrepostPostHandler,
} from "../controllers/postController.js";
import { Router } from "express";
import { authMiddleware } from "../middleware/auth.js";
import upload from "../middleware/upload.js";

const router = Router();

//user
router.post("/registerUser", ctrl.registerUser);
router.get("/users", ctrl.allUsers);
router.post("/login", ctrl.loginUser);
router.get("/user", authMiddleware, ctrl.getUser);
router.get("/users/search", authMiddleware, ctrl.searchUser);
router.put("/users/:id", authMiddleware, ctrl.updateUser);
router.get("/users/:id", authMiddleware, ctrl.getUserById);
router.put("/settings/security", authMiddleware, ctrl.updatePassword);

// router.post('/notifications', authMiddleware, notif.createNotif);
// router.get('/notifications', authMiddleware, notif.getNotif);
// router.patch('/notifications/:id/read', authMiddleware, notif.markAsRead);
// router.delete('/notifications/:id', authMiddleware, notif.deleteNotif);



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
router.post("/posts/:id/favorite", authMiddleware, favoritePostHandler);
router.delete("/posts/:id/favorite", authMiddleware, unfavoritePostHandler);
router.post("/posts/:id/repost", authMiddleware, repostPostHandler);
router.delete("/posts/:id/repost", authMiddleware, unrepostPostHandler);


export default router;
