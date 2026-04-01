FROM mcr.microsoft.com/devcontainers/javascript-node:1-20-bookworm

USER root

RUN apt-get update \
    && export DEBIAN_FRONTEND=noninteractive \
    && apt-get install -y --no-install-recommends \
        ca-certificates \
        curl \
        git \
        jq \
        make \
        openssh-client \
        postgresql-client \
        ripgrep \
        zsh \
    && rm -rf /var/lib/apt/lists/*

# Install AI coding assistants
RUN npm install -g @anthropic-ai/claude-code @openai/codex opencode-ai

# Pre-install project dependencies so named volumes are seeded on first run
COPY backend/package.json backend/package-lock.json /tmp/backend/
RUN npm --prefix /tmp/backend ci && mv /tmp/backend/node_modules /usr/local/share/backend-node-modules && rm -rf /tmp/backend \
    && chown -R node:node /usr/local/share/backend-node-modules

COPY frontend/package.json frontend/package-lock.json /tmp/frontend/
RUN npm --prefix /tmp/frontend ci && mv /tmp/frontend/node_modules /usr/local/share/frontend-node-modules && rm -rf /tmp/frontend \
    && chown -R node:node /usr/local/share/frontend-node-modules

USER node
