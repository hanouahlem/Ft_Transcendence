# 7. File Uploads and Static Media

Goal: understand how image uploads are received, stored, and served back by the backend.

## Big Picture

This project allows post creation with an optional uploaded media file.

That involves two separate things:

- receiving the uploaded file
- serving the stored file later over HTTP

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
file.mimetype.startsWith("image/")
```

So only image uploads are accepted.

If the uploaded file is not an image:

- Multer rejects it with an error

## Route Integration

The upload middleware is used in:

```js
router.post("/posts", authMiddleware, upload.single("media"), createPostHandler);
```

Meaning:

1. request must be authenticated
2. Multer parses one uploaded file under field name `media`
3. file info becomes available in `req.file`
4. controller creates the post

## What `req.file` Is Used For

In `createPostHandler`:

- if `req.file` exists, backend builds a public media URL
- that URL is stored in the post’s `image` field through the service

So the database stores:

- the file URL/path

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
```

So uploaded media becomes accessible over normal HTTP.

## Deleting Uploaded Files

When a post is deleted, `postService.js` tries to:

- extract the uploaded filename from the post image URL
- find the matching file in `uploads/`
- delete it from disk

That keeps orphaned files from accumulating for deleted posts.

## Important Distinction

The database does **not** store the actual image bytes.

Instead:

- database stores metadata / URL reference
- filesystem stores the real file

That is a common and normal design.

## Current Project Tradeoff

Because the backend source is bind-mounted in Docker, uploads currently land in:

- `backend/uploads`

So runtime-generated files are currently written into the repo working tree.

That is convenient for dev, but not the cleanest long-term storage strategy.

## Self-Check Questions

- What does Multer do in this project?
- Why does the route use `upload.single("media")`?
- Where is the actual uploaded file stored?
- What is stored in the database: the file bytes or the file URL/path?
