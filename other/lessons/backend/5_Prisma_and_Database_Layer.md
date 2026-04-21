# 5. Prisma and Database Layer

Goal: understand how backend code talks to PostgreSQL through Prisma.

## Big Picture

This project uses:

- PostgreSQL as the database
- Prisma as the ORM

ORM means Object-Relational Mapper.

It lets backend code read and write database rows using JavaScript calls instead of raw SQL in every controller.

## Where Prisma Is Set Up

Main files:

- `backend/prisma/schema.prisma`
- `backend/prisma/migrations/`
- `backend/src/prisma.js`

## `schema.prisma`

This file defines the database models.

Examples in this project:

- `User`
- `Post`
- `Like`
- `Comment`
- `Friends`
- `Notification`

It also defines:

- fields
- types
- relations
- constraints like `@unique`

So `schema.prisma` is the model blueprint of the database.

## What `backend/src/prisma.js` Does

This file creates the Prisma client used by the backend.

It:

1. reads `DATABASE_URL`
2. creates the Postgres adapter
3. creates `PrismaClient`
4. exports it as `prisma`

That exported `prisma` object is then used in controllers and services.

Examples:

- `prisma.user.findUnique(...)`
- `prisma.friends.findMany(...)`
- `prisma.post.create(...)`

## Why `DATABASE_URL` Matters

`DATABASE_URL` tells Prisma where the database is.

Without it:

- Prisma cannot connect
- any DB operation fails

In local dev it points to `localhost`.
In Docker it is overridden to point to service host `postgres`.

## What Migrations Are

Migrations are versioned database changes.

They live in:

- `backend/prisma/migrations/`

Each migration contains SQL that changes the database schema.

Examples of what migrations do:

- create tables
- add columns
- add constraints
- update relations

## `prisma generate`

This command:

- reads `schema.prisma`
- generates Prisma client code

Important:

- it does **not** change the database
- it changes the generated Prisma client used by backend code

So it keeps your backend-side Prisma API in sync with the schema definition.

## `prisma migrate deploy`

This command:

- reads migration files
- connects to the target DB
- applies pending migrations

Important:

- this **does** affect the database
- it changes the schema inside Postgres if migrations are pending

Prisma tracks applied migrations in the database so they are not blindly re-run every time.

## Controllers vs Services

Prisma is used directly in some controllers:

- `userController.js`
- `friendController.js`

For posts, there is also a service layer:

- `backend/src/services/postService.js`

That means:

- controller handles HTTP concerns
- service handles more reusable business/data logic

## Examples From This Project

Create a user:

```js
await prisma.user.create({ data: { ... } });
```

Find a user by email:

```js
await prisma.user.findUnique({
  where: { email },
});
```

Fetch posts with related data:

```js
await prisma.post.findMany({
  include: {
    author: true,
    likes: true,
    comments: true,
  },
});
```

## Mental Model To Remember

Think of Prisma as the backend’s database API:

- schema defines the data model
- migrations update the real DB schema
- generated client gives JS methods to query the DB
- controllers/services call those methods

## Foreign Keys and Relations

A model is like a struct in C — it defines what fields a row in the database has.

Some fields are **foreign keys (FK)**: they store the ID of a row in another table, creating a link between the two.

Example from the Notification model:

```prisma
model Notification {
  id       Int    @id @default(autoincrement())
  type     String

  userId   Int                                                                                  // FK value — stored in DB
  user     User   @relation("notificationRecipient", fields: [userId], references: [id])       // pointer — NOT a real column

  actorId  Int                                                                                  // FK value — stored in DB
  actor    User   @relation("notificationActor", fields: [actorId], references: [id])          // pointer — NOT a real column

  postId   Int?                                                                                 // nullable FK (the ? means it can be null)
  post     Post?  @relation(fields: [postId], references: [id])                                // nullable pointer
}
```

Each FK is always a pair:
- The `Int` field (e.g. `actorId`) holds the actual value stored in the database row.
- The relation line (e.g. `actor User @relation(...)`) tells Prisma how to follow that value to fetch the related record. It does **not** exist as a column in the database.

Think of the `Int` as the raw pointer value in C, and the relation line as the type that tells you how to dereference it.

## Why Store the FK Value Directly?

The `userId Int` field is what makes filtering fast:

```js
prisma.notification.findMany({ where: { userId: 5 } })
```

This runs directly on the stored column — no joins needed. If you only had the relation and no `userId` field, the database would have to join the User table just to find which notifications belong to user 5.

Rule: store the FK value for filtering, use the relation line only when you need to fetch the related data.

## Nullable Fields

The `?` after a type means the field can be null:

```prisma
postId  Int?   // can be null
post    Post?  // relation is also nullable when postId is nullable
```

Use this when not all rows need that field. For example, a FOLLOW notification has no related post, so `postId` is null.

## Current Project Change

The old project model stored only `content String` on `Notification`.
That was easy to render, but weak for navigation and hard to trust because the backend could not reliably know:

- who triggered the event
- what action happened
- whether a post was involved

The refactor moved that meaning into structured fields in [backend/prisma/schema.prisma](/Users/curtis/Desktop/DEV/last_jeune/backend/prisma/schema.prisma):

- `type` tells the frontend what happened
- `userId` is the recipient
- `actorId` is the user who triggered the event
- `postId` is optional because not every notification points to a post

For existing rows, the migration backfills:

- `type = "MESSAGE"`
- `actorId = userId`

That fallback keeps the migration runnable on old data, even though those legacy rows did not originally store actor information.

## `select` Inside `include`

`include: { actor: true }` fetches the entire actor User object. To fetch only specific fields, use `select` inside the include:

```js
prisma.notification.findMany({
  where: { userId: 5 },
  include: {
    actor: { select: { username: true, avatar: true } },
    post:  { select: { id: true } }
  }
})
```

Each notification in the result then looks like:

```json
{
  "id": 1,
  "type": "LIKE",
  "actorId": 3,
  "actor": { "username": "alice", "avatar": "..." },
  "postId": 12,
  "post": { "id": 12 }
}
```

This is how the backend sends the actor's current username to the frontend without storing it as a separate column — Prisma follows the `actorId` FK at fetch time and grabs the latest value.

## Database Integrity

Foreign keys also enforce data integrity. The database ensures that `actorId: 5` must point to an existing user — you cannot create a notification referencing a user that does not exist.

When a user is deleted, you can configure the FK to cascade: automatically delete all notifications where `actorId` matched that user. This prevents broken references in the database.

## Delete Order Matters

One important real project case is post deletion.

In our schema:

- `Comment` points to `Post`
- `CommentLike` points to `Comment`
- `CommentFavorite` points to `Comment`

That means deleting a post is not just `delete post`.
If a comment still has child rows in `CommentLike` or `CommentFavorite`, PostgreSQL rejects the delete because the foreign keys would become invalid.

Current backend logic in [backend/src/services/postService.js](/media/ahbey/%20HANOU/ahlem/backend/src/services/postService.js) deletes in this order:

```js
await tx.commentLike.deleteMany({ where: { commentId: { in: commentIds } } });
await tx.commentFavorite.deleteMany({ where: { commentId: { in: commentIds } } });
await tx.comment.deleteMany({ where: { postId: resolvedPostId } });
await tx.post.delete({ where: { id: resolvedPostId } });
```

Why this is needed:

- child rows must be removed before parent rows
- otherwise the database blocks the request
- doing it in a Prisma transaction keeps the delete consistent

Evaluator keywords:

- foreign key
- parent row / child row
- referential integrity
- transaction
- delete cascade vs manual cleanup

## Self-Check Questions

- What is the difference between `schema.prisma` and a migration file?
- What does `prisma generate` change?
- What does `prisma migrate deploy` change?
- Why does backend code use `prisma.user.findUnique(...)` instead of raw SQL here?
- What is the difference between the `actorId Int` field and the `actor User @relation(...)` line?
- Why is `userId` stored directly on the Notification model instead of only using the relation?
- What does the `?` after a type mean in a Prisma model?
- When would you use `select` inside an `include`?
