import ctrl from "../controllers/userController.js";
import friend from "../controllers/friendController.js";
import notif from "../controllers/notifController.js";
import {
  createPostHandler,
  getPostsHandler,
  deletePostHandler,
  likePostHandler,
  unlikePostHandler,
  createCommentHandler,
  deleteCommentHandler,
  likeCommentHandler,
  unlikeCommentHandler,
  favoritePostHandler,
  unfavoritePostHandler,
  favoriteCommentHandler,
  unfavoriteCommentHandler,
} from "../controllers/postController.js";
import { Router } from "express";
import { authMiddleware } from "../middleware/auth.js";
import upload from "../middleware/upload.js";

const router = Router();

// user
// user
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
router.get("/posts", authMiddleware, getPostsHandler);
router.post("/posts", authMiddleware, upload.single("media"), createPostHandler);
router.delete("/posts/:id", authMiddleware, deletePostHandler);
router.post("/posts/:id/like", authMiddleware, likePostHandler);
router.delete("/posts/:id/like", authMiddleware, unlikePostHandler);
router.post("/posts/:id/favorite", authMiddleware, favoritePostHandler);
router.delete("/posts/:id/favorite", authMiddleware, unfavoritePostHandler);

// commentaire
router.post("/posts/:id/comments", authMiddleware, upload.single("media"), createCommentHandler);
router.delete("/comments/:id", authMiddleware, deleteCommentHandler);
router.post("/comments/:id/like", authMiddleware, likeCommentHandler);
router.delete("/comments/:id/like", authMiddleware, unlikeCommentHandler);
router.post("/comments/:id/favorite", authMiddleware, favoriteCommentHandler);
router.delete("/comments/:id/favorite", authMiddleware, unfavoriteCommentHandler);

export default router;