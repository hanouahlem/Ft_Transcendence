export type PostAuthor = {
  id: number;
  username: string;
  displayName?: string | null;
  email: string;
};

export type Post = {
  id: number;
  content: string;
  createdAt: string;
  author: PostAuthor;
  likesCount: number;
  commentsCount: number;
  media: string[];
};

export type CreatePostInput = {
  content: string;
};
