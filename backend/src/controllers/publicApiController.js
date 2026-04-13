import prisma from "../prisma.js";

export const getPosts = async (req, res) => {
  const posts = await prisma.post.findMany();
  res.json(posts);
};

export const getPostById = async (req, res) => {
  const post = await prisma.post.findUnique({
    where: { id: Number(req.params.id) },
  });

  if (!post) return res.status(404).json({ message: "Post not found" });

  res.json(post);
};

export const createPost = async (req, res) => {
  const { content } = req.body;

  const post = await prisma.post.create({
    data: { content },
  });

  res.status(201).json(post);
};

export const updatePost = async (req, res) => {
  const { content } = req.body;

  const post = await prisma.post.update({
    where: { id: Number(req.params.id) },
    data: { content },
  });

  res.json(post);
};

export const deletePost = async (req, res) => {
  await prisma.post.delete({
    where: { id: Number(req.params.id) },
  });

  res.json({ message: "Post deleted" });
};

