#!/usr/bin/env bash
set -euo pipefail

cd "${LOCAL_WORKSPACE_FOLDER:-$PWD}"

if [ ! -f backend/.env ] && [ -f backend/.env.example ]; then
  cp backend/.env.example backend/.env
fi

if [ ! -f frontend/.env.local ] && [ -f frontend/.env.local.example ]; then
  cp frontend/.env.local.example frontend/.env.local
fi

if [ -f backend/package-lock.json ]; then
  npm --prefix backend install
fi

if [ -f frontend/package-lock.json ]; then
  npm --prefix frontend install
fi

mkdir -p "$HOME/.config/opencode"

printf '%s\n' \
  "Devcontainer ready." \
  "Run 'make up' to start the Docker stack on the host daemon." \
  "Frontend stays on http://localhost:3000 and Prisma Studio on http://localhost:5555."
