import { Router } from "express";
import { apiKeyMiddleware } from "../middleware/apiKey.js";
import { publicApiRateLimit } from "../middleware/rateLimit.js";
import {
  getPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
} from "../controllers/publicApiController.js";

const router = Router();

router.use(apiKeyMiddleware);
router.use(publicApiRateLimit);

/**
 * @swagger
 * /api/public/posts:
 *   get:
 *     summary: List all posts
 *     tags: [Posts]
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: Array of posts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Post'
 *       401:
 *         description: Invalid or missing API key
 */
router.get("/posts", getPosts);

/**
 * @swagger
 * /api/public/posts/{id}:
 *   get:
 *     summary: Get a post by ID
 *     tags: [Posts]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: A single post
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       404:
 *         description: Post not found
 */
router.get("/posts/:id", getPostById);

/**
 * @swagger
 * /api/public/posts:
 *   post:
 *     summary: Create a new post
 *     tags: [Posts]
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [content, authorId]
 *             properties:
 *               content:
 *                 type: string
 *               authorId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Post created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Author not found
 */
router.post("/posts", createPost);

/**
 * @swagger
 * /api/public/posts/{id}:
 *   put:
 *     summary: Update a post's content
 *     tags: [Posts]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [content]
 *             properties:
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: Updated post
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       404:
 *         description: Post not found
 */
router.put("/posts/:id", updatePost);

/**
 * @swagger
 * /api/public/posts/{id}:
 *   delete:
 *     summary: Delete a post
 *     tags: [Posts]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Post deleted
 *       404:
 *         description: Post not found
 */
router.delete("/posts/:id", deletePost);

export default router;
