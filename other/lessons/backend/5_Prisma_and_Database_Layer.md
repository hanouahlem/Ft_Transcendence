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

## Self-Check Questions

- What is the difference between `schema.prisma` and a migration file?
- What does `prisma generate` change?
- What does `prisma migrate deploy` change?
- Why does backend code use `prisma.user.findUnique(...)` instead of raw SQL here?
