#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
API="${API:-http://localhost:3001}"
PASS="${SEED_PASSWORD:-test1234}"
SEED_SCRIPT_KEY=""

if [ -f "$ROOT_DIR/backend/.env" ]; then
  SEED_SCRIPT_KEY="$(sed -n 's/^[[:space:]]*SEED_SCRIPT_KEY[[:space:]]*=[[:space:]]*//p' "$ROOT_DIR/backend/.env" | head -n 1)"
  SEED_SCRIPT_KEY="${SEED_SCRIPT_KEY%$'\r'}"

  case "$SEED_SCRIPT_KEY" in
    \"*\")
      SEED_SCRIPT_KEY="${SEED_SCRIPT_KEY#\"}"
      SEED_SCRIPT_KEY="${SEED_SCRIPT_KEY%\"}"
      ;;
    \'*\')
      SEED_SCRIPT_KEY="${SEED_SCRIPT_KEY#\'}"
      SEED_SCRIPT_KEY="${SEED_SCRIPT_KEY%\'}"
      ;;
  esac
fi

cd "$ROOT_DIR"

API="$API" PASS="$PASS" ROOT_DIR="$ROOT_DIR" SEED_SCRIPT_KEY="$SEED_SCRIPT_KEY" \
  node "$ROOT_DIR/other/seed/seed.mjs" "$@"
