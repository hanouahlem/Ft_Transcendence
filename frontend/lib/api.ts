const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";


export type RegisterData = {
  username: string;
  email: string;
  password: string;
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

export async function registerUser(userData: RegisterData) {
  const response = await fetch(`${API_URL}/registerUser`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  return handleResponse(response);
}

export async function loginUser(userData: LoginData) {
  const response = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  return handleResponse<{ token: string }>(response);
}

export async function getCurrentUser(token: string) {
  const response = await fetch(`${API_URL}/user`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  return handleResponse<CurrentUser>(response);
}

export async function updateUserProfile(
  userId: number,
  token: string,
  profileData: UpdateProfileData,
) {
  const response = await fetch(`${API_URL}/users/${userId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(profileData),
  });

  return handleResponse<CurrentUser>(response);
}

export async function uploadSettingsMedia(file: File, token: string) {
  const formData = new FormData();
  formData.append("media", file);

  const response = await fetch(`${API_URL}/settings/media`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  return handleResponse<{ url: string }>(response);
}

export async function setLocalPassword(
  token: string,
  payload: SetPasswordData,
) {
  const response = await fetch(`${API_URL}/settings/setpassword`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  return handleResponse<{ message: string }>(response);
}

export async function changeLocalPassword(
  token: string,
  payload: ChangePasswordData,
) {
  const response = await fetch(`${API_URL}/settings/security`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  return handleResponse<{ message: string }>(response);
}

export async function addFriend(receiverId: number) {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_URL}/friends`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ receiverId }),
  });

  return handleResponse(response);
}

export async function getFriends() {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_URL}/friends`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return handleResponse(response);
}

export async function acceptFriend(requestId: number) {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_URL}/friends/${requestId}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
  });

  return handleResponse(response);
}

export async function deleteFriend(requestId: number) {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_URL}/friends/${requestId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  return handleResponse(response);
}

export async function getFriendRequests() {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_URL}/friends/requests`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return handleResponse(response);
}

export async function searchUser(username: string) {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_URL}/users/search?username=${username}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return handleResponse(response);
}
