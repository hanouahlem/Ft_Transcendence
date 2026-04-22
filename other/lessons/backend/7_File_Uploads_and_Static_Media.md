# 7. File Uploads and Static Media

Goal: understand how post attachments are received, stored, served back by the backend, and seeded without committing media assets into git.

## Big Picture

This project allows post creation with one optional uploaded media file.

That involves two separate things:

- receiving the uploaded file
- serving the stored file later over HTTP

The seed script uses that same real upload flow for post images, while profile avatars stay simple remote URLs.

## Multer

The upload middleware uses Multer in:

- `backend/src/middleware/upload.js`

Multer is middleware for handling `multipart/form-data`, which is the format commonly used for file uploads.

Without Multer:

- Express would not automatically handle uploaded files for you

## Storage Configuration

This project uses `multer.diskStorage(...)`.

That means:

- uploaded files are written to disk
- not stored directly in the database

The configured destination is:

- `uploads/`

Because the backend container uses `/app` as its working directory, this resolves to the uploads folder under the backend app path.

## Filename Generation

Uploaded files are renamed using:

- timestamp
- random number
- original extension

That helps avoid filename collisions.

Example shape:

- `post-1773831846467-945605467.webp`

## File Type Filtering

The middleware checks:

```js
file.mimetype.startsWith("image/") || file.mimetype === "application/pdf"
```

So post uploads now accept:

- images
- PDF documents

There is also a 10 MB size limit for post attachments.

If the uploaded file is not an allowed type:

- Multer rejects it with an error

## Route Integration

The upload middleware is used in:

```js
router.post("/posts", authMiddleware, upload.single("media"), post.createPostHandler);
```

Meaning:

1. request must be authenticated
2. Multer parses one uploaded file under field name `media`
3. file info becomes available in `req.file`
4. controller creates the post

## What `req.file` Is Used For

In `createPostHandler`:

- if `req.file` exists, backend builds the relative path `/uploads/<filename>`
- that relative path is stored in the post’s `image` field through the service

So the database stores:

- the file path, not an environment-specific full URL

The filesystem stores:

- the actual file bytes

## Serving Uploaded Files

The backend uses:

```js
app.use("/uploads", express.static(path.resolve("uploads")));
```

That means files in the uploads folder can be served through URLs like:

```text
/uploads/post-123.webp
/uploads/post-123.pdf
```

So uploaded media becomes accessible over normal HTTP.

## Why Relative Paths Are Better Here

This project has two public entry points:

- dev uses `http://localhost:3001`
- eval uses `https://localhost` through nginx

If the backend stored absolute URLs, the database would contain different values depending on which stack created the upload.

Storing only `/uploads/<filename>` avoids that coupling.

Then the frontend turns that relative path into the correct full URL using its own `NEXT_PUBLIC_API_URL`.

That keeps the database independent from dev vs eval hostnames and protocols.

## Deleting Uploaded Files

When a post is deleted, `postService.js` tries to:

- extract the uploaded filename from the post image URL
- find the matching file in `uploads/`
- delete it from disk

That keeps orphaned files from accumulating for deleted posts.

## Avatar URLs vs Post Uploads

The new seed flow uses two different media strategies on purpose.

Profile media and identity fields are stored through `PUT /users/:id`.

Real code from `backend/scripts/seed/legacy-seed.mjs`:

```js
user.displayName = titleCaseUsername(user.username);
user.avatar = USERS_WITH_AVATARS.has(user.username)
  ? `https://i.pravatar.cc/300?img=${user.avatarId}`
  : null;
user.banner = USERS_WITH_BANNERS.has(user.username)
  ? `https://picsum.photos/seed/${encodeURIComponent(`banner-${user.username}`)}/1400/420`
  : null;

await apiRequest(`/users/${currentUser.id}`, {
  method: "PUT",
  token,
  json: {
    username: user.username,
    displayName: user.displayName,
    banner: user.banner,
    avatar: user.avatar,
    bio: user.bio,
    status: user.status,
    location: user.location,
    website: user.website,
  },
});
```

What this means:

- every seeded user gets a `displayName`
- only a deterministic subset gets avatar URLs
- only a deterministic subset gets banner URLs
- avatar and banner images are still remote URLs, not uploaded files

Post attachments still go through the real upload pipeline.

Real code from `backend/scripts/seed/legacy-seed.mjs`:

```js
const response = await fetch(spec.url);
const mimeType = response.headers.get("content-type") || "image/jpeg";
const buffer = Buffer.from(await response.arrayBuffer());

formData.set("media", new Blob([buffer], { type: mimeType }), upload.filename);
await apiRequest("/posts", {
  method: "POST",
  token: TOKENS.get(entry.user.username),
  formData,
});
```

Why this split is useful:

- profile avatars and banners stay lightweight and do not add files to the repo
- posts still exercise the real Multer upload path
- the seed can use deterministic remote providers like `pravatar` and `picsum`
- seeded post media still ends up in backend `/uploads`, exactly like a normal user upload
- the seed scripts now also verify that uploaded post responses come back as relative `/uploads/...` paths, which protects the new dev/eval-agnostic media model

## Deterministic Seed Media

The seed script now creates media with stable external inputs instead of committed assets.

For post images it builds URLs like:

```js
url: `https://picsum.photos/seed/${encodeURIComponent(seed)}/${width}/${height}`,
```

Important details:

- the `seed` keeps the image deterministic across reruns
- width and height vary so the feed gets landscape, portrait, and square-ish posts
- only some posts receive media, which makes the feed look more believable than “image on every post”

## Docker Persistence Choice

In Docker, the backend still writes to:

- `uploads/`

But both compose files now mount that path as:

- `uploads_data:/app/uploads`

So:

- the app code keeps the same simple relative path
- uploaded media survives container restarts
- runtime-generated files do not clutter the repo working tree

This keeps development and evaluation behavior aligned while still letting the dev stack bind-mount source code for hot reload.

## Self-Check Questions

- What does Multer do in this project?
- Why does the route use `upload.single("media")`?
- Where is the actual uploaded file stored?
- What is stored in the database: the file bytes or the file URL/path?
- Why are avatars seeded as URLs while post images are still uploaded through the backend?
- Why does the seed script use deterministic `picsum` seeds and varying dimensions?

## Settings Media Uploads

Avatar and banner uploads use the same backend upload pipeline as other image features.

Files:

- `backend/src/middleware/upload.js`
- `backend/src/routes/routes.js`
- `backend/src/controllers/userController.js`

How it works:

- `createImageUpload(prefix)` creates a Multer upload middleware with naming rules for one image category
- the settings route uses a `user` prefix, so uploaded files get `user-*` filenames
- `POST /settings/media` accepts one file under the `media` field
- the controller returns a public URL that the frontend can store as the avatar or banner path

Real route:

```js
router.post(
  "/settings/media",
  authMiddleware,
  userMediaUpload.single("media"),
  ctrl.uploadUserMedia
);
```

How the full flow works:

1. frontend sends one local image or PDF file with `multipart/form-data`
2. Multer writes the file into `uploads/`
3. backend returns the public file URL
4. frontend saves that URL into `User.avatar` or `User.banner` through `PUT /users/:id`

Why this is a good split:

- upload logic stays small and reusable
- profile updates still go through the normal user update route
- the database continues storing a URL, not raw image bytes
