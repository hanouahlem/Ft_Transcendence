# 2. HTTP and Express Basics

Goal: understand HTTP, what a backend server is, and the core Express app methods before the more advanced route architecture in lesson 3.

## Start From Zero: What Is Happening At All?

When you open a website or click a button in the frontend, code often needs to ask another machine or process for data.

That communication usually happens with **HTTP**.

Very roughly:

- a client sends a request
- a server receives it
- the server sends back a response

In this project:

- the browser is the main client
- the backend is the HTTP server
- Express is the tool used to build that server

## What Is HTTP?

HTTP is a protocol, meaning a standard set of rules for communication between a client and a server.

It defines things like:

- the request method: `GET`, `POST`, `PUT`, `DELETE`
- the path: `/login`, `/posts`, `/friends`
- headers: extra information about the request
- an optional body: data sent with the request
- the response status: `200`, `401`, `404`, `500`
- the response body: the returned data

## Client And Server

### Client

A client is the thing making the request.

In your project that is usually:

- browser JavaScript running the frontend

Example:

- the frontend sends `POST /login`
- the frontend sends `GET /posts`

### Server

A server is the thing listening for requests and deciding how to respond.

In your project that is:

- the Express backend in `backend/src/server.js`

## What Is A Backend Server?

A backend server is just a program that:

- stays running
- listens on a port
- waits for requests
- runs some logic
- sends responses back

In your backend, the server listens on port `3001` by default.

So when the frontend calls:

```text
http://localhost:3001/login
```

it is talking to that running backend server.

## What Express Is

Express is a Node.js web framework.

That means:

- Node.js lets JavaScript run on the server
- Express gives structure and tools for building an HTTP API with Node

Without Express, you could still build a server in Node, but it would be lower-level and more tedious.

Express gives you easier ways to:

- define routes
- read request data
- use middleware
- send responses
- organize the backend

## What `const app = express()` Means

This line in `backend/src/server.js`:

```js
const app = express();
```

creates the main Express application.

You can think of `app` as:

- the main server object
- the place where you register behavior
- the thing that receives incoming HTTP requests

Later, this `app` is configured with middleware and routes, then started with `app.listen(...)`.

## What A Handler Function Is

A handler is just a function that Express runs when a request matches something.

Example:

```js
(_req, res) => {
  res.status(200).json({ status: "ok" });
}
```

This function:

- receives the request information
- decides what to do
- sends the response

So a route is basically:

- a rule for matching a request
- plus the handler function that should run

## HTTP Methods

The method tells the server what kind of action the client wants.

Common ones in your project:

- `GET` -> read data
- `POST` -> create something or send form data
- `PUT` -> replace or fully update something
- `PATCH` -> partially update something
- `DELETE` -> remove something

Examples from your routes:

- `POST /login`
- `GET /friends`
- `PATCH /friends/:id/accept`
- `DELETE /posts/:id`

These are defined in `backend/src/routes/routes.js`.

## Request And Response

Every HTTP interaction has two sides:

### Request

Sent by the client.

It contains things like:

- method
- URL/path
- headers
- maybe a body

### Response

Sent by the server.

It contains things like:

- status code
- headers
- response body

Example idea:

- request: `POST /login` with email and password
- response: `200 OK` with a token, or `401` if login fails

## Where `req` And `res` Come From

In Express handlers, you will often see:

```js
(req, res) => { ... }
```

These are objects given by Express:

- `req` = the incoming request
- `res` = the outgoing response

Examples:

- `req.body` = parsed request body
- `req.headers` = request headers
- `res.status(200)` = set response status
- `res.json(...)` = send JSON back

## `app.get(...)`: The Simplest Route

This is the simplest Express route shape:

```js
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});
```

Meaning:

- `app` = the Express application
- `.get` = only handle HTTP `GET` requests
- `"/health"` = only match that path
- handler function = run this function when the request matches

So `app.get(...)` is used to define a specific endpoint for the `GET` method.

You can mentally read it as:

- "when I receive `GET /health`, run this function"

## Why Middleware Exists

Before the final handler responds, the request often needs extra processing.

Examples:

- parse JSON body
- allow cross-origin requests
- verify JWT token
- serve static files

That is what middleware is for.

Middleware usually runs before the final handler.

## `app.use(...)`: Attach Behavior To The Request Flow

`app.use(...)` is more general than `app.get(...)`.

It is used to:

- register middleware
- mount routers
- attach behavior that should run as requests pass through the app

Examples from this project:

```js
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.resolve("uploads")));
app.use("/", route);
```

You can mentally read `app.use(...)` as:

- "plug this behavior into the app"

So:

- `app.get(...)` = define one specific route
- `app.use(...)` = attach middleware or mount broader behavior

## Middleware Used In This Project

### `cors()`

```js
app.use(cors());
```

Why it exists:

- frontend runs on port `3000`
- backend runs on port `3001`
- browser treats these as different origins

So CORS headers are needed to let frontend JavaScript read backend responses.

### `express.json()`

```js
app.use(express.json());
```

Why it exists:

- JSON request bodies need to be parsed
- after parsing, the data becomes available in `req.body`

Without it, `req.body` is usually undefined for JSON requests.

### `express.static(...)`

```js
app.use("/uploads", express.static(path.resolve("uploads")));
```

Why it exists:

- uploaded files are stored on disk
- this lets the backend serve them over HTTP under `/uploads/...`

## Light Introduction To Route Mounting

This line:

```js
app.use("/", route);
```

means:

- take the router object stored in `route`
- attach all its routes to the app under `/`

So if that router defines:

```js
router.post("/login", ctrl.loginUser);
```

the app exposes:

```text
POST /login
```

We will go deeper into routers and route organization in lesson 3.

## What Lesson 2 Should Leave You With

By the end of lesson 2, you should be comfortable with this picture:

```text
Browser/frontend
-> sends HTTP request
-> backend server receives it
-> middleware may run
-> matched handler runs
-> backend code runs
-> backend sends HTTP response
```

Express is the framework that organizes that backend side.

## Self-Check Questions

- What is a client in this project?
- What is a server in this project?
- What is HTTP used for?
- What does `const app = express()` create?
- What is the difference between a request and a response?
- What is the difference between `app.get(...)` and `app.use(...)`?
- Why do we need `express.json()`?
- Why does this project use `cors()`?
