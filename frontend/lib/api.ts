import type { FeedPost } from "./feed-types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export type RegisterData = {
  username: string;
  email: string;
  password: string;
};

export type RegisterResponse = {
  message: string;
  user: {
    id: number;
    username: string;
    email: string;
  };
};

export type LoginData =
  | {
      identifier: string;
      password: string;
    }
  | {
      email: string;
      password: string;
    };

export type LoginSuccessResponse = {
  message: string;
  token: string;
};

export type LoginTwoFactorChallengeResponse = {
  message: string;
  twoFactorRequired: true;
  pendingToken: string;
  email: string;
};

export type LoginResponse = LoginSuccessResponse | LoginTwoFactorChallengeResponse;

export type CurrentUser = {
  id: number;
  username: string;
  displayName?: string | null;
  email: string;
  banner?: string | null;
  avatar?: string | null;
  bio?: string | null;
  status?: string | null;
  location?: string | null;
  website?: string | null;
  createdAt?: string;
  hasPassword?: boolean;
  twoFactorEnabled?: boolean;
};

export type PublicUser = {
  id: number;
  username: string;
  displayName?: string | null;
  banner?: string | null;
  avatar?: string | null;
  bio?: string | null;
  status?: string | null;
  location?: string | null;
  website?: string | null;
  createdAt?: string;
};

export type PublicUserListItem = Pick<
  PublicUser,
  "id" | "username" | "displayName" | "avatar"
>;

export type UpdateProfileData = {
  username: string;
  displayName?: string | null;
  banner?: string | null;
  avatar?: string | null;
  bio?: string | null;
  status?: string | null;
  location?: string | null;
  website?: string | null;
};

export type ChangePasswordData = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export type SetPasswordData = {
  newPassword: string;
  confirmPassword: string;
};

export type ApiSuccess<T> = {
  ok: true;
  data: T;
};

export type ApiFailure = {
  ok: false;
  message: string;
  fieldErrors?: Partial<Record<string, string>>;
};

export type ApiResult<T> = ApiSuccess<T> | ApiFailure;

export type FriendListItem = PublicUserListItem & {
  friendshipId: number;
};

export type FriendRequest = {
  id: number;
  senderId: number;
  receiverId: number;
  status: string;
  sender?: PublicUserListItem | null;
  receiver?: PublicUserListItem | null;
};

export type FriendSuggestionsResponse = {
  connectedUserIds: number[];
  suggestions: PublicUserListItem[];
};

export type ConversationMessage = {
  id: number;
  conversationId: number;
  senderId: number;
  content: string;
  createdAt: string;
  sender: PublicUserListItem;
};

export type ConversationItem = {
  id: number;
  createdAt: string;
  updatedAt: string;
  lastMessageAt: string | null;
  unreadCount: number;
  peer: PublicUserListItem | null;
  lastMessage: ConversationMessage | null;
};

export type FeedScope = "all" | "friends";

export type CreatePostResponse = {
  message: string;
  post: FeedPost;
};

export const NOTIFICATION_TYPES = [
  "FOLLOW",
  "UNFOLLOW",
  "FOLLOW_ACCEPT",
  "LIKE",
  "FAVORITE",
  "COMMENT",
  "COMMENT_LIKE",
  "COMMENT_FAVORITE",
  "MENTION",
  "MESSAGE",
] as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export type NotificationActor = {
  id: number;
  username: string;
  displayName?: string | null;
  avatar?: string | null;
};

export type NotificationItem = {
  id: number;
  type: NotificationType | string;
  read: boolean;
  createdAt: string;
  userId: number;
  actorId: number;
  actor: NotificationActor;
  postId: number | null;
  post?: {
    id: number;
    content?: string | null;
  } | null;
};

export type NotificationsResponse = {
  allNotifs: NotificationItem[];
};

export type NotificationActionResponse = {
  notification: NotificationItem;
};

export type ConversationListResponse = {
  conversations: ConversationItem[];
};

export type ConversationMessagesResponse = {
  messages: ConversationMessage[];
};

export type CreateDirectConversationResponse = {
  conversation: ConversationItem;
};

export type SendMessageResponse = {
  message: ConversationMessage;
};

export type MarkConversationReadResponse = {
  read: {
    conversationId: number;
    lastReadMessageId: number | null;
    unreadCount: number;
  };
};

function getStoredToken() {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem("token");
}

function withAuthHeaders(token?: string | null, headers?: HeadersInit) {
  const resolvedHeaders = new Headers(headers);
  const resolvedToken = token ?? getStoredToken();

  if (resolvedToken) {
    resolvedHeaders.set("Authorization", `Bearer ${resolvedToken}`);
  }

  return resolvedHeaders;
}

async function handleResponse<T>(response: Response): Promise<ApiResult<T>> {
  const contentType = response.headers.get("content-type") || "";
  let data: unknown = null;

  if (contentType.includes("application/json")) {
    data = await response.json().catch(() => null);
  } else {
    const text = await response.text().catch(() => "");
    data = text ? { message: text } : null;
  }

  const message =
    typeof data === "object" && data !== null && "message" in data
      ? String(data.message)
      : response.ok
        ? "Request succeeded"
        : response.status === 413
          ? "Files must be 10 MB or smaller."
          : "Request failed";

  if (!response.ok) {
    return {
      ok: false,
      message,
      fieldErrors:
        typeof data === "object" && data !== null && "fieldErrors" in data
          ? (data.fieldErrors as Partial<Record<string, string>> | undefined)
          : undefined,
    };
  }

  return {
    ok: true,
    data: normalizeUploadedMedia(data) as T,
  };
}

function resolveUploadUrl(path: string) {
  if (!path.startsWith("/uploads/")) {
    return path;
  }

  return new URL(path, API_URL).toString();
}

export function normalizeUploadedMediaPayload<T>(value: T): T {
  return normalizeUploadedMedia(value) as T;
}

function normalizeUploadedMedia(value: unknown, parentKey?: string): unknown {
  if (typeof value === "string") {
    const shouldResolve =
      parentKey === "url" ||
      parentKey === "avatar" ||
      parentKey === "banner" ||
      parentKey === "image" ||
      parentKey === "media";

    return shouldResolve ? resolveUploadUrl(value) : value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => normalizeUploadedMedia(item, parentKey));
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, entryValue]) => [
        key,
        normalizeUploadedMedia(entryValue, key),
      ]),
    );
  }

  return value;
}

async function requestJson<T>(
  path: string,
  options: {
    method?: string;
    token?: string | null;
    headers?: HeadersInit;
    body?: unknown;
  } = {},
) {
  const { method = "GET", token, headers, body } = options;
  const resolvedHeaders = withAuthHeaders(token, headers);
  resolvedHeaders.set("Content-Type", "application/json");

  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers: resolvedHeaders,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  return handleResponse<T>(response);
}

async function requestWithAuth<T>(
  path: string,
  options: {
    method?: string;
    token?: string | null;
    headers?: HeadersInit;
    body?: BodyInit;
  } = {},
) {
  const { method = "GET", token, headers, body } = options;
  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers: withAuthHeaders(token, headers),
    body,
  });

  return handleResponse<T>(response);
}

export async function registerUser(userData: RegisterData) {
  return requestJson<RegisterResponse>("/registerUser", {
    method: "POST",
    body: userData,
  });
}

export async function loginUser(userData: LoginData) {
  return requestJson<LoginResponse>("/login", {
    method: "POST",
    body: userData,
  });
}

export async function verifyLoginTwoFactorCode(
  pendingToken: string,
  code: string,
) {
  return requestJson<{ message: string; token: string }>("/login/2fa/verify", {
    method: "POST",
    body: { pendingToken, code },
  });
}

export async function resendLoginTwoFactorCode(pendingToken: string) {
  return requestJson<{ message: string; email: string }>("/login/2fa/resend", {
    method: "POST",
    body: { pendingToken },
  });
}

export async function getCurrentUser(token: string) {
  return requestWithAuth<CurrentUser>("/user", { token });
}

export async function updateUserProfile(
  userId: number,
  token: string,
  profileData: UpdateProfileData,
) {
  return requestJson<CurrentUser>(`/users/${userId}`, {
    method: "PUT",
    token,
    body: profileData,
  });
}

export async function uploadSettingsMedia(file: File, token: string) {
  const formData = new FormData();
  formData.append("media", file);

  return requestWithAuth<{ url: string }>("/settings/media", {
    method: "POST",
    token,
    body: formData,
  });
}

export async function setLocalPassword(
  token: string,
  payload: SetPasswordData,
) {
  return requestJson<{ message: string }>("/settings/setpassword", {
    method: "PUT",
    token,
    body: payload,
  });
}

export async function changeLocalPassword(
  token: string,
  payload: ChangePasswordData,
) {
  return requestJson<{ message: string }>("/settings/security", {
    method: "PUT",
    token,
    body: payload,
  });
}

export async function sendTwoFactorSetupCode(token: string) {
  return requestWithAuth<{ message: string }>("/settings/auth/2fa/setup", {
    method: "POST",
    token,
  });
}

export async function confirmTwoFactorSetup(token: string, code: string) {
  return requestJson<{ message: string }>("/settings/auth/2fa/confirm", {
    method: "POST",
    token,
    body: { code },
  });
}

export async function disableTwoFactor(token: string) {
  return requestWithAuth<{ message: string }>("/settings/auth/2fa/disable", {
    method: "POST",
    token,
  });
}

export async function getUsers(token?: string | null) {
  return requestWithAuth<PublicUserListItem[]>("/users", { token });
}

export async function searchUser(username: string, token?: string | null) {
  const query = encodeURIComponent(username);
  return requestWithAuth<PublicUserListItem[]>(`/users/search?username=${query}`, {
    token,
  });
}

export async function getUserById(userId: number, token?: string | null) {
  return requestWithAuth<PublicUser>(`/users/${userId}`, { token });
}

export async function getUserByUsername(username: string, token?: string | null) {
  const encodedUsername = encodeURIComponent(username);
  return requestWithAuth<PublicUser>(`/users/by-username/${encodedUsername}`, { token });
}

export async function getUserPosts(userId: number, token?: string | null) {
  return requestWithAuth<FeedPost[]>(`/users/${userId}/posts`, { token });
}

export async function getUserFriends(userId: number, token?: string | null) {
  return requestWithAuth<PublicUserListItem[]>(`/users/${userId}/friends`, { token });
}

export async function getFeedPosts(
  scope: FeedScope = "all",
  token?: string | null,
) {
  const path = scope === "friends" ? "/posts/friends" : "/posts";
  return requestWithAuth<FeedPost[]>(path, { token });
}

export async function getFriendsPosts(token?: string | null) {
  return getFeedPosts("friends", token);
}

export async function getPosts(token?: string | null) {
  return getFeedPosts("all", token);
}

export type PostSortOption = "recent" | "oldest" | "likes";
export type MediaTypeFilter = "all" | "image" | "pdf" | "none";

export type SearchPostsParams = {
  q?: string;
  author?: string;
  mediaType?: MediaTypeFilter;
  favoritesOnly?: boolean;
  sort?: PostSortOption;
  page?: number;
  limit?: number;
};

export type SearchPostsResponse = {
  items: FeedPost[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export async function searchPostsAdvanced(
  params: SearchPostsParams,
  token?: string | null,
) {
  const query = new URLSearchParams();

  if (params.q) query.set("q", params.q);
  if (params.author) query.set("author", params.author);
  if (params.mediaType && params.mediaType !== "all") query.set("mediaType", params.mediaType);
  if (params.favoritesOnly) query.set("favoritesOnly", "true");
  if (params.sort) query.set("sort", params.sort);
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));

  const suffix = query.toString();
  const path = suffix ? `/search/posts?${suffix}` : "/search/posts";
  return requestWithAuth<SearchPostsResponse>(path, { token });
}

export type UserSortOption = "alpha-asc" | "alpha-desc" | "recent" | "oldest";

export type SearchUsersParams = {
  q?: string;
  onlineOnly?: boolean;
  friendsOnly?: boolean;
  sort?: UserSortOption;
  page?: number;
  limit?: number;
};

export type SearchUsersResultUser = {
  id: number;
  username: string;
  displayName: string | null;
  avatar: string | null;
  status: string | null;
  createdAt?: string;
};

export type SearchUsersResponse = {
  items: SearchUsersResultUser[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export async function searchUsersAdvanced(
  params: SearchUsersParams,
  token?: string | null,
) {
  const query = new URLSearchParams();

  if (params.q) query.set("q", params.q);
  if (params.onlineOnly) query.set("onlineOnly", "true");
  if (params.friendsOnly) query.set("friendsOnly", "true");
  if (params.sort) query.set("sort", params.sort);
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));

  const suffix = query.toString();
  const path = suffix ? `/search/users?${suffix}` : "/search/users";
  return requestWithAuth<SearchUsersResponse>(path, { token });
}

export async function createPostRequest(
  content: string,
  file?: File | null,
  token?: string | null,
) {
  const formData = new FormData();
  formData.append("content", content);

  if (file) {
    formData.append("media", file);
  }

  return requestWithAuth<CreatePostResponse>("/posts", {
    method: "POST",
    token,
    body: formData,
  });
}

export async function addFriend(receiverId: number, token?: string | null) {
  return requestJson<{ message: string; request: FriendRequest }>("/friends", {
    method: "POST",
    token,
    body: { receiverId },
  });
}

export async function getFriends(token?: string | null) {
  return requestWithAuth<FriendListItem[]>("/friends", { token });
}

export async function getFriendRequests(token?: string | null) {
  return requestWithAuth<FriendRequest[]>("/friends/requests", { token });
}

export async function getSentFriendRequests(token?: string | null) {
  return requestWithAuth<FriendRequest[]>("/friends/requests/sent", { token });
}

export async function getFriendSuggestions(
  token?: string | null,
  limit?: number,
) {
  const query = typeof limit === "number" ? `?limit=${limit}` : "";
  return requestWithAuth<FriendSuggestionsResponse>(`/friends/suggestions${query}`, {
    token,
  });
}

export async function acceptFriend(requestId: number, token?: string | null) {
  return requestWithAuth<{ friend: FriendRequest }>(`/friends/${requestId}/accept`, {
    method: "PATCH",
    token,
  });
}

export async function deleteFriend(requestId: number, token?: string | null) {
  return requestWithAuth<{ message: string }>(`/friends/${requestId}`, {
    method: "DELETE",
    token,
  });
}

export async function getNotifications(token?: string | null) {
  return requestWithAuth<NotificationsResponse>("/notifications", { token });
}

export async function createDirectConversation(
  targetUserId: number,
  token?: string | null,
) {
  return requestJson<CreateDirectConversationResponse>("/conversations/direct", {
    method: "POST",
    token,
    body: { targetUserId },
  });
}

export async function getConversations(token?: string | null) {
  return requestWithAuth<ConversationListResponse>("/conversations", { token });
}

export async function getConversationMessages(
  conversationId: number,
  token?: string | null,
) {
  return requestWithAuth<ConversationMessagesResponse>(
    `/conversations/${conversationId}/messages`,
    { token },
  );
}

export async function sendConversationMessage(
  conversationId: number,
  content: string,
  token?: string | null,
) {
  return requestJson<SendMessageResponse>(`/conversations/${conversationId}/messages`, {
    method: "POST",
    token,
    body: { content },
  });
}

export async function markConversationAsRead(
  conversationId: number,
  token?: string | null,
) {
  return requestWithAuth<MarkConversationReadResponse>(
    `/conversations/${conversationId}/read`,
    {
      method: "POST",
      token,
    },
  );
}

export async function markNotificationAsRead(
  notificationId: number,
  token?: string | null,
) {
  return requestWithAuth<NotificationActionResponse>(
    `/notifications/${notificationId}/read`,
    {
      method: "PATCH",
      token,
    },
  );
}

export async function deleteNotification(
  notificationId: number,
  token?: string | null,
) {
  return requestWithAuth<{ message: string }>(`/notifications/${notificationId}`, {
    method: "DELETE",
    token,
  });
}
