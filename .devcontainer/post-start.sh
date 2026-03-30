#!/usr/bin/env bash
set -euo pipefail

if [ ! -S /var/run/docker.sock ]; then
  exit 0
fi

sudo chmod 666 /var/run/docker.sock
