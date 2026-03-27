#!/usr/bin/env bash
set -euo pipefail

if [ ! -S /var/run/docker.sock ]; then
  exit 0
fi

SOCKET_GID="$(stat -c '%g' /var/run/docker.sock)"
GROUP_NAME="$(getent group "${SOCKET_GID}" | cut -d: -f1 || true)"

if [ -z "${GROUP_NAME}" ]; then
  GROUP_NAME="dockersock"
  sudo groupadd --gid "${SOCKET_GID}" "${GROUP_NAME}" >/dev/null 2>&1 || true
fi

if ! id -nG node | tr ' ' '\n' | grep -qx "${GROUP_NAME}"; then
  sudo usermod -aG "${GROUP_NAME}" node >/dev/null 2>&1 || true
  echo "Docker socket access was updated for the node user. Reopen the terminal if docker still says permission denied."
fi
