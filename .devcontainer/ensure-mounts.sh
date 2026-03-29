#!/usr/bin/env bash
# Runs on the HOST before the container starts (initializeCommand).
# Creates any missing directories that devcontainer.json bind-mounts,
# so the build works on any machine regardless of which tools are installed.

set -euo pipefail

dirs=(
  "$HOME/.ssh"
  "$HOME/.claude"
  "$HOME/.codex"
  "$HOME/.config/opencode"
  "$HOME/.opencode"
)

for d in "${dirs[@]}"; do
  if [ ! -e "$d" ]; then
    mkdir -p "$d"
    echo "ensure-mounts: created $d"
  fi
done

# .gitconfig is mounted as a file, not a directory
if [ ! -e "$HOME/.gitconfig" ]; then
  touch "$HOME/.gitconfig"
  echo "ensure-mounts: created $HOME/.gitconfig"
fi
