import { Router } from "express";
import {
  getPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
} from "../controllers/publicApiController.js";

import { apiKeyMiddleware } from "../middleware/apiKey.js";
import { rateLimitMiddleware } from "../middleware/rateLimit.js";

const router = Router();

// sécurité API publique
router.use(apiKeyMiddleware);
router.use(rateLimitMiddleware);

// endpoints
router.get("/posts", getPosts);
router.get("/posts/:id", getPostById);
router.post("/posts", createPost);
router.put("/posts/:id", updatePost);
router.delete("/posts/:id", deletePost);


/**
 * @swagger
 * /api/public/posts:
 *   get:
 *     summary: Get all posts
 *     responses:
 *       200:
 *         description: Success
*/
router.get("/posts", getPosts);


export default router;