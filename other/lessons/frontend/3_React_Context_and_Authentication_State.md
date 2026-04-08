# 3. React Context and Authentication State

Goal: understand how the frontend stores auth state once and shares it with the rest of the app.

## Why This File Exists

Many pages need the same auth information:

- is the user logged in?
- who is the current user?
- what is the JWT token?
- how do we log in or log out?

Instead of passing these values manually through many components, this repo uses React Context.

## The Main Idea

In this project:

- `AuthProvider` stores the auth state
- `AuthContext.Provider` shares that state
- `useAuth()` lets components read that state

Mental model:

```text
AuthProvider creates auth state
Provider exposes auth state
useAuth reads auth state
```

## Where It Lives In This Repo

The main file is:

- `frontend/context/AuthContext.tsx`

It is used at the top of the app in:

- `frontend/app/layout.tsx`

And it is consumed by frontend code such as:

- `frontend/components/auth/ProtectedRoute.tsx`

## `createContext(...)`

This line creates the auth context:

```tsx
const AuthContext = createContext<AuthContextType | undefined>(undefined);
```

What that means:

- React creates a shared context object
- its value is `undefined` until a provider gives it a real value

Why start with `undefined`?

Because the custom hook can then detect when a component tries to use auth outside the provider and throw a clear error.

## `AuthProvider`

`AuthProvider` is the component that owns the auth logic.

Real code from `frontend/context/AuthContext.tsx`:

```tsx
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
```

This is the real auth state:

- `token`: the JWT stored by the frontend
- `user`: the current logged-in user data
- `isAuthLoading`: whether auth bootstrap or login is still in progress

So `AuthProvider` is not just a wrapper. It is the place where auth state actually lives.

## `AuthContext.Provider`

Later in the same file, `AuthProvider` returns:

```tsx
<AuthContext.Provider
  value={{
    isLoggedIn: !!token,
    isAuthLoading,
    token,
    user,
    login,
    logout,
  }}
>
  {children}
</AuthContext.Provider>
```

This is the important part.

It means:

- take the auth values from `AuthProvider`
- share them with all child components below

So any component inside this provider can access:

- `isLoggedIn`
- `isAuthLoading`
- `token`
- `user`
- `login()`
- `logout()`

## Why The Whole App Can Access Auth

The app is wrapped in `AuthProvider` in `frontend/app/layout.tsx`:

```tsx
<AuthProvider>
  {children}
</AuthProvider>
```

That means all pages rendered under the root layout can use auth state.

If this wrapper was missing, `useAuth()` would not have a real context value to read.

## `useAuth()`

`useAuth()` is a custom React hook:

```tsx
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside an AuthProvider");
  }

  return context;
}
```

Its purpose is simple:

- read the auth context with `useContext(AuthContext)`
- enforce that the provider exists
- give components a clean way to access auth

Instead of writing:

```tsx
const context = useContext(AuthContext);
```

everywhere, components can just write:

```tsx
const { user, isLoggedIn, login, logout } = useAuth();
```

## Why The Current User Is Loaded From The JWT

The frontend stores a JWT token, not the whole user record.

So when the app starts, `AuthContext` reads the token from `localStorage` and asks the backend:

- does this token still belong to a valid user?
- if yes, who is that user?

That logic is here:

```tsx
useEffect(() => {
  const storedToken = localStorage.getItem("token");

  const loadUser = async () => {
    if (!storedToken) {
      setToken(null);
      setUser(null);
      setIsAuthLoading(false);
      return;
    }

    setToken(storedToken);

    try {
      const result = await getCurrentUser(storedToken);

      if (!result.ok) {
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
        setIsAuthLoading(false);
        return;
      }

      setUser(result.data);
    } finally {
      setIsAuthLoading(false);
    }
  };

  loadUser();
}, []);
```

So "load the current user from the JWT" really means:

1. read the saved token
2. send it to `GET /user`
3. let the backend verify it
4. store the returned user in React state

## Where `getCurrentUser(...)` Comes From

The helper lives in `frontend/lib/api.ts`:

```ts
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
```

This is how the frontend turns a raw token into real user data.

## `login(...)`

`login(...)` is called after a successful login response from the backend.

Real code:

```tsx
const login = async (newToken: string) => {
  localStorage.setItem("token", newToken);
  setToken(newToken);
  setIsAuthLoading(true);

  try {
    const result = await getCurrentUser(newToken);

    if (!result.ok) {
      localStorage.removeItem("token");
      setToken(null);
      setUser(null);
      return;
    }

    setUser(result.data);
  } finally {
    setIsAuthLoading(false);
  }
};
```

What it does:

1. save the token
2. update React state
3. fetch the current user from the backend
4. store that user in context

So logging in is not just "save token". It is "save token and initialize auth state correctly".

## `logout(...)`

`logout()` clears the session:

```tsx
const logout = () => {
  localStorage.removeItem("token");
  setToken(null);
  setUser(null);
  setIsAuthLoading(false);
};
```

This removes the token and resets the frontend back to a logged-out state.

## Example Consumer: `ProtectedRoute`

`frontend/components/auth/ProtectedRoute.tsx` uses the auth context like this:

```tsx
const { isLoggedIn, isAuthLoading } = useAuth();
```

Then it decides:

- if auth is still loading, show a loading screen
- if loading is finished and user is not logged in, redirect to `/login`
- otherwise, render the protected page

This is a good example of why shared auth state matters: many pages can reuse one auth source instead of each page re-implementing login checks.

## Key Terms

- React Context: a way to share data across many components without passing props through every level
- Provider: the component that supplies the shared value
- `useContext(...)`: the React hook that reads a context value
- custom hook: your own hook that wraps other hooks, like `useAuth()`
- auth state: frontend state describing login status, current user, and auth loading

## Mental Model To Remember

Think of this file like this:

```text
token saved in localStorage
AuthProvider reads token
AuthProvider asks backend who the token belongs to
AuthProvider stores user + token in React state
Provider shares those values
useAuth lets components read them
```

## Self-Check Questions

- Why does this repo use React Context for auth instead of passing props everywhere?
- What is the difference between `AuthProvider` and `useAuth()`?
- Why does `createContext(...)` start with `undefined` here?
- Why does the frontend call `getCurrentUser(token)` instead of trusting the token alone?
- What does `ProtectedRoute` get from `useAuth()`?

## Related Next Step

To see how pages use this auth state in navigation and route protection, read:

- `lessons/frontend/4_Protected_Pages_and_Navigation_Flow.md`

## Settings Refresh Addition

The centralized settings page introduced one extra auth-context capability:

- `refreshUser()`

File:

- `frontend/context/AuthContext.tsx`

Real code:

```tsx
const refreshUser = useCallback(async () => {
  if (!token) {
    setUser(null);
    return null;
  }

  return loadUserFromToken(token);
}, [loadUserFromToken, token]);
```

Why this matters:

- after saving settings, the sidebar should immediately show the new avatar or display name
- after a first-time password is set, the frontend must see `hasPassword` switch from `false` to `true`
- pages do not need to duplicate current-user refresh logic

Mental model:

- `login()` is for receiving a new token
- `refreshUser()` is for reloading the same logged-in user with the existing token
