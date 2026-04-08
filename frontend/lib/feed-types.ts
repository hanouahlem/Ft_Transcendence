export type FeedAuthor = {
  id: number;
  username: string;
  displayName?: string | null;
  email: string;
  avatar?: string | null;
};

export type FeedComment = {
  id: number;
  content: string;
  createdAt: string;
  author: FeedAuthor;
  likesCount: number;
  favoritesCount: number;
  likedByCurrentUser: boolean;
  favoritedByCurrentUser: boolean;
  media: string[];
};

export type FeedPost = {
  id: number;
  content: string;
  createdAt: string;
  author: FeedAuthor;
  likesCount: number;
  commentsCount: number;
  favoritesCount: number;
  likedByCurrentUser: boolean;
  favoritedByCurrentUser: boolean;
  comments: FeedComment[];
  media: string[];
};
