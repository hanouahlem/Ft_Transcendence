#!/bin/sh
set -eu

CERT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)/certs"

mkdir -p "$CERT_DIR"

openssl req \
  -x509 \
  -nodes \
  -days 365 \
  -newkey rsa:2048 \
  -keyout "$CERT_DIR/eval.key" \
  -out "$CERT_DIR/eval.crt" \
  -subj "/CN=localhost" \
  -addext "subjectAltName=DNS:localhost,IP:127.0.0.1"
