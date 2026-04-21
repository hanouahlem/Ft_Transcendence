#!/bin/sh
set -eu

if [ -n "${POSTGRES_USER:-}" ] && [ -n "${POSTGRES_PASSWORD:-}" ] && [ -n "${POSTGRES_DB:-}" ]; then
  export DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${DATABASE_HOST:-postgres}:5432/${POSTGRES_DB}"
fi

mkdir -p /app/uploads
npx prisma migrate deploy

exec node src/server.js
