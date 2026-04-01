#!/usr/bin/env bash
set -euo pipefail

cd "${LOCAL_WORKSPACE_FOLDER:-$PWD}"

if [ ! -f backend/.env ] && [ -f backend/.env.example ]; then
  cp backend/.env.example backend/.env || echo "post-create: could not write backend/.env (check workspace permissions)."
fi

if [ ! -f frontend/.env.local ] && [ -f frontend/.env.local.example ]; then
  cp frontend/.env.local.example frontend/.env.local || echo "post-create: could not write frontend/.env.local (check workspace permissions)."
fi

mkdir -p "$HOME/.config/opencode"

for svc in backend frontend; do
  if [ -d "$svc/node_modules" ] && [ ! -f "$svc/node_modules/.package-lock.json" ] && [ -d "/usr/local/share/${svc}-node-modules" ]; then
    cp -a "/usr/local/share/${svc}-node-modules/." "$svc/node_modules/" || true
  fi
done

printf '%s\n' \
  "Devcontainer ready." \
  "Run 'make up' to start the Docker stack." \
  "Frontend stays on http://localhost:3000 and Prisma Studio on http://localhost:5555."
