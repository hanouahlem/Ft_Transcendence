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

export type FriendPreview = PublicUserListItem;

export type FriendListItem = FriendPreview & {
  friendshipId: number;
};

export type FriendRequest = {
  id: number;
  senderId: number;
  receiverId: number;
  status: string;
  sender?: FriendPreview | null;
  receiver?: FriendPreview | null;
};

export type FriendSuggestionsResponse = {
  connectedUserIds: number[];
  suggestions: FriendPreview[];
};

export type FeedScope = "all" | "friends";

export const NOTIFICATION_TYPES = [
  "FOLLOW",
  "UNFOLLOW",
  "FOLLOW_ACCEPT",
  "LIKE",
  "COMMENT",
  "MENTION",
  "MESSAGE",
] as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export type NotificationActor = {
  id: number;
  username: string;
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
  } | null;
};

export type NotificationsResponse = {
  allNotifs: NotificationItem[];
};

export type NotificationActionResponse = {
  notification: NotificationItem;
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
  const data = await response.json();

  if (!response.ok) {
    return {
      ok: false,
      message: data.message || "Request failed",
      fieldErrors: data.fieldErrors,
    };
  }

  return {
    ok: true,
    data,
  };
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
  return requestJson<{ token: string }>("/login", {
    method: "POST",
    body: userData,
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
  return requestWithAuth<FriendPreview[]>(`/users/${userId}/friends`, { token });
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
