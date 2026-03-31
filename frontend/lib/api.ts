const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";


export type RegisterData = {
  username: string;
  email: string;
  password: string;
};

export type LoginData = {
  email: string;
  password: string;
};

export type CurrentUser = {
  id: number;
  username: string;
  email: string;
};

export type ApiSuccess<T> = {
  ok: true;
  data: T;
};

export type ApiFailure = {
  ok: false;
  message: string;
};

export type ApiResult<T> = ApiSuccess<T> | ApiFailure;

async function handleResponse<T>(response: Response): Promise<ApiResult<T>> {
  const data = await response.json();

  if (!response.ok) {
    return {
      ok: false,
      message: data.message || "Request failed",
    };
  }

  return {
    ok: true,
    data,
  };
}

//Headers funcction
function getHeaders() {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token")
      : null;

  console.log("🔥 TOKEN FROM LOCALSTORAGE:", token);

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    "x-api-key": "super_secret_key",
  };

  console.log("🔥 HEADERS SENT:", headers);

  return headers;
}




export async function registerUser(userData: RegisterData) {
  const response = await fetch(`${API_URL}/registerUser`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(userData),
  });

  return handleResponse(response);
}

export async function loginUser(userData: LoginData) {
  const response = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(userData),
  });

  return handleResponse<{ token: string }>(response);
}


// ✅ Accepte un token optionnel (utile juste après le login)
export async function getCurrentUser(overrideToken?: string) {
  const headers = getHeaders();
  if (overrideToken) {
    headers["Authorization"] = `Bearer ${overrideToken}`;
  }

  const response = await fetch(`${API_URL}/user`, {
    method: "GET",
    headers,
  });

  if (response.status === 401) {
    localStorage.removeItem("token");
    window.location.href = "/login";
    return { ok: false, message: "Session expirée" } as ApiFailure;
  }

  return handleResponse<CurrentUser>(response);
}

export async function addFriend(receiverId: number) {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_URL}/friends`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ receiverId }),
  });

  return handleResponse(response);
}

export async function getFriends() {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_URL}/friends`, {
    headers: getHeaders(),
  });

  return handleResponse(response);
}

export async function acceptFriend(requestId: number) {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_URL}/friends/${requestId}`, {
    method: "PUT",
    headers: getHeaders(),
  });

  return handleResponse(response);
}

export async function deleteFriend(requestId: number) {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_URL}/friends/${requestId}`, {
    method: "DELETE",
    headers: getHeaders(),
  });

  return handleResponse(response);
}

export async function getFriendRequests() {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_URL}/friends/requests`, {
    headers: getHeaders(),
  });

  return handleResponse(response);
}

export async function searchUser(username: string) {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_URL}/users/search?username=${username}`, {
    headers: getHeaders(),
  });

  return handleResponse(response);
}