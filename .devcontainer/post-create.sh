#!/usr/bin/env bash
set -euo pipefail

cd "${LOCAL_WORKSPACE_FOLDER:-$PWD}"

if [ ! -f backend/.env ] && [ -f backend/.env.example ]; then
  cp backend/.env.example backend/.env
fi

if [ ! -f backend/.env.dev ] && [ -f backend/.env.dev.example ]; then
  cp backend/.env.dev.example backend/.env.dev
fi

if [ ! -f frontend/.env.local ] && [ -f frontend/.env.local.example ]; then
  cp frontend/.env.local.example frontend/.env.local
fi

mkdir -p "$HOME/.config/opencode"

for svc in backend frontend; do
  if [ -d "$svc/node_modules" ] && [ ! -f "$svc/node_modules/.package-lock.json" ] && [ -d "/usr/local/share/${svc}-node-modules" ]; then
    sudo chown node:node "$svc/node_modules"
    cp -a "/usr/local/share/${svc}-node-modules/." "$svc/node_modules/"
  fi
done

printf '%s\n' \
  "Devcontainer ready." \
  "Run 'make up' to start the Docker stack on the host daemon." \
  "Frontend stays on http://localhost:3000 and Prisma Studio on http://localhost:5555."
