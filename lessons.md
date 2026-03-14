# Lessons — ft_transcendence

This file logs the key concepts the team should understand to explain the project during evaluation.

---

## 1. Project Architecture

```
Browser (client)
  │
  ├──→ :3000  Frontend (Next.js)     → serves pages, makes API calls
  │
  └──→ :3001  Backend (Express.js)   → REST API, handles business logic
                  │
                  ▼
            :5432  PostgreSQL         → stores all data
```

- **Frontend** and **Backend** are separate services, each with their own `package.json`
- **Docker Compose** orchestrates all three containers with a single command
- The frontend never talks to the database directly — it always goes through the backend API

---

## 2. Authentication Flow

### How login works step by step:

1. User fills email + password in the login form
2. Frontend sends `POST /login` with `{ email, password }` to the backend
3. Backend finds the user by email in the database (via Prisma)
4. Backend compares the password using `bcrypt.compare()` (never stores plain text passwords)
5. If valid, backend creates a **JWT token** containing the user's ID: `jwt.sign({ id: user.id }, SECRET)`
6. Backend returns `{ token: "eyJhbG..." }` to the frontend
7. Frontend stores the token in `localStorage`
8. Frontend calls `GET /user` with the token in the `Authorization: Bearer <token>` header
9. Backend verifies the token in `authMiddleware`, extracts the user ID, returns user data
10. Frontend sets the global user state via `AuthContext`

### Key concepts:

- **JWT (JSON Web Token)** — a signed string that proves who the user is. The backend creates it, the frontend stores and sends it. The backend can verify it without hitting the database.
- **bcrypt** — a hashing algorithm. We hash passwords before storing them. `bcrypt.compare()` checks if a plain password matches a hash. We never store or compare plain passwords.
- **localStorage** — browser storage that persists across page refreshes. We store the JWT here so the user stays logged in.
- **Authorization header** — the standard way to send credentials with HTTP requests: `Authorization: Bearer <token>`

### JWT_SECRET and environment variables:

- **`JWT_SECRET`** is the key used to sign and verify JWT tokens. Without it, `jwt.sign()` crashes — the backend cannot create tokens.
- It lives in a `.env` file at the project root (never committed to git). `docker-compose.yml` reads it via `${JWT_SECRET}`.
- `.env.example` is committed to show teammates which variables they need. They copy it: `cp .env.example .env` and fill in their values.
- **Why not hardcode it?** Secrets in source code end up in git history. Anyone with repo access can see them. Environment variables keep secrets out of the codebase.

### Why not cookies?

Cookies would also work, but JWT in localStorage is simpler for a SPA (Single Page Application). The tradeoff is that localStorage is vulnerable to XSS attacks — for a school project this is acceptable, but in production you'd use HTTP-only cookies.

---

## 3. React Concepts

### useState
```tsx
const [email, setEmail] = useState("")
```
- Creates a reactive variable. When `setEmail("new value")` is called, the component re-renders with the new value.
- Used for: form inputs, loading states, error messages, any data that changes.

### useEffect
```tsx
useEffect(() => {
  // runs after the component mounts
  return () => { /* cleanup when component unmounts */ }
}, [dependencies])
```
- Runs side effects: API calls on page load, event listeners, timers.
- The dependency array controls when it re-runs. Empty `[]` = only once on mount.

### useContext
```tsx
const { token, user, login, logout } = useAuth()
```
- Shares state across the entire app without passing props through every component.
- `AuthContext` provides the logged-in user, token, and login/logout functions to any component.
- `SocketContext` provides the WebSocket connection and online users list.

### "use client" directive
```tsx
"use client"
```
- Next.js renders components on the server by default (Server Components).
- Adding `"use client"` makes it a Client Component — required when using `useState`, `useEffect`, event handlers, browser APIs (`localStorage`, `window`).

---

## 4. Form Handling

```tsx
async function handleSubmit(e: FormEvent) {
  e.preventDefault()  // Stop browser from reloading the page
  setLoading(true)
  setError("")

  try {
    const data = await loginUser({ email, password })
    await login(data.token)
    router.push("/")
  } catch (err) {
    setError(err.message)
  } finally {
    setLoading(false)
  }
}
```

- **`e.preventDefault()`** — HTML forms submit via full page reload by default. We prevent that to handle it with JavaScript instead.
- **`try/catch`** — wraps the API call. If the backend returns an error (wrong password, user not found), we catch it and display it to the user.
- **`finally`** — always runs, whether success or failure. We reset the loading state here.

---

## 5. Backend API Structure

### Express routing chain:
```
Request → cors() → express.json() → route handler → response
```

- **cors()** — allows the frontend (port 3000) to call the backend (port 3001). Without this, browsers block cross-origin requests.
- **express.json()** — parses the JSON body from `POST`/`PUT` requests into `req.body`.

### Auth middleware:
```js
export function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1]  // Extract token from "Bearer <token>"
  const payload = jwt.verify(token, process.env.JWT_SECRET) // Verify and decode
  req.user = payload   // Attach user info to the request
  next()               // Continue to the route handler
}
```

- Applied to protected routes: `router.get('/user', authMiddleware, ctrl.getUser)`
- If the token is missing or invalid, returns 401 Unauthorized

---

## 6. Prisma ORM

### What it does:
- Defines the database schema in `schema.prisma` (models, fields, relations)
- Generates a type-safe client: `prisma.user.findUnique({ where: { email } })`
- Handles migrations: `prisma migrate deploy` creates/updates database tables

### Why an ORM?
- Write database queries in JavaScript instead of raw SQL
- Type safety — TypeScript knows the shape of your data
- Migrations — version-controlled database changes
- This also counts as a module (Minor, 1pt)

---

## 7. WebSockets (Socket.io)

### How it differs from HTTP:
- **HTTP** = request/response. Client asks, server answers. Connection closes.
- **WebSocket** = persistent connection. Both sides can send messages at any time.

### Our setup:
```
Backend: Socket.io server attached to the Express HTTP server (same port 3001)
Frontend: Socket.io client connects when user is logged in (via SocketContext)
```

### Authentication:
- The socket sends the JWT token during the handshake: `io("url", { auth: { token } })`
- The server verifies it in `io.use()` middleware — same JWT secret as the REST API
- If invalid, the connection is rejected

### Rooms:
- Each user joins a personal room: `socket.join("user:${userId}")`
- To send a notification to a specific user from any route handler:
  ```js
  req.app.get("io").to(`user:${userId}`).emit("notification", data)
  ```

### Online tracking:
- A `Map<userId, Set<socketId>>` tracks who's connected
- On connect/disconnect, the server broadcasts the updated list to all clients
- One user can have multiple tabs open (multiple socket IDs)

---

## 8. Next.js Route Groups

```
app/
├── (auth)/          ← no navbar (login, signup)
│   ├── layout.tsx
│   ├── login/
│   └── signup/
├── (main)/          ← has navbar (all other pages)
│   ├── layout.tsx
│   ├── page.tsx
│   └── profil/
└── layout.tsx       ← root layout (fonts, providers)
```

- Parentheses `(auth)` and `(main)` are **route groups** — they affect layout nesting but NOT the URL
- `/login` still works, not `/(auth)/login`
- Each group can have its own `layout.tsx` to add or remove shared UI (like the navbar)

---

## 9. Theming (shadcn + next-themes)

### How it works:
- CSS custom properties (`--primary`, `--background`, etc.) define all colors
- `:root` block = light mode values, `.dark` block = dark mode values
- `next-themes` adds/removes the `dark` class on `<html>` based on user preference
- All shadcn components use these variables, so changing the theme changes everything

### ThemeProvider:
- Wraps the entire app
- `defaultTheme="light"` — starts in light mode
- `attribute="class"` — toggles via CSS class, not media query
- Press `D` key to toggle dark/light (custom hotkey we added)

---

## 10. Docker Compose

```yaml
services:
  postgres:    # Starts first, has healthcheck
  backend:     # Waits for postgres, runs migrations, then starts Express
  frontend:    # Waits for backend, runs Next.js dev server
```

### Key concepts:
- **`depends_on` + `condition: service_healthy`** — ensures postgres is ready before backend starts
- **`volumes: ./Backend:/app`** — mounts local code into the container for hot reload
- **`/app/node_modules`** — anonymous volume prevents container's node_modules from being overwritten by the local mount
- All services communicate via Docker's internal network using service names (e.g., `postgres:5432`)

---

## 11. Component Library (shadcn/ui + custom)

### shadcn/ui:
- Not a traditional npm package — components are copied into your codebase (`components/ui/`)
- You own the code, can modify anything
- Uses Radix UI primitives (accessibility) + Tailwind CSS (styling) + CVA (variants)

### Custom ft_ components:
- **`FtInput`** — brutalist input with bottom border only, Instrument Serif font
- **`FtInputLabel`** — tiny uppercase label matching the editorial design
- **`FtHighlight`** — lime highlight tag with variants (default/tag/flat)
- These extend the design language from the reference react-app examples
