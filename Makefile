DEV_COMPOSE = docker compose
EVAL_COMPOSE = docker compose -f docker-compose.eval.yml
DB_URL = DATABASE_URL=postgresql://$$POSTGRES_USER:$$POSTGRES_PASSWORD@postgres:5432/$$POSTGRES_DB
export PATH := $(HOME)/.local/bin:$(PATH)

up: init
	$(EVAL_COMPOSE) up --build

up-build:
	$(EVAL_COMPOSE) up --build

down:
	$(EVAL_COMPOSE) down --remove-orphans

restart:
	$(EVAL_COMPOSE) down --remove-orphans
	$(EVAL_COMPOSE) up --build

build:
	$(EVAL_COMPOSE) build

rebuild:
	$(EVAL_COMPOSE) build
	$(EVAL_COMPOSE) up --build

logs:
	$(EVAL_COMPOSE) logs -f

ps:
	$(EVAL_COMPOSE) ps

clean:
	$(EVAL_COMPOSE) down -v --remove-orphans

fclean:
	$(EVAL_COMPOSE) down -v --remove-orphans
	docker system prune -af

re: fclean up

dev: dev-up

dev-up:
	$(DEV_COMPOSE) up

dev-up-build:
	$(DEV_COMPOSE) up --build

dev-down:
	$(DEV_COMPOSE) down

dev-restart:
	$(DEV_COMPOSE) down
	$(DEV_COMPOSE) up

dev-build:
	$(DEV_COMPOSE) build

dev-rebuild:
	$(DEV_COMPOSE) build
	$(DEV_COMPOSE) up

dev-logs:
	$(DEV_COMPOSE) logs -f

dev-ps:
	$(DEV_COMPOSE) ps

dev-clean:
	$(DEV_COMPOSE) down -v --remove-orphans

dev-fclean:
	$(DEV_COMPOSE) down -v --remove-orphans
	docker system prune -af

dev-re: dev-fclean dev-up

frontend:
	cd frontend && npm install && npm run dev

backend:
	cd backend && npm install && npm run dev

db:
	$(DEV_COMPOSE) up -d postgres

db-clean:
	$(DEV_COMPOSE) exec backend sh -c '$(DB_URL) npx prisma migrate reset --force'

seed: db-clean
	$(DEV_COMPOSE) exec backend node scripts/seed/seed.mjs

superseed: db-clean
	$(DEV_COMPOSE) exec backend node scripts/superseed/superseed.mjs

prisma-generate:
	$(DEV_COMPOSE) exec backend npx prisma generate

prisma-migrate:
	$(DEV_COMPOSE) exec backend sh -c '$(DB_URL) npx prisma migrate dev'

prisma-studio:
	$(DEV_COMPOSE) exec backend sh -c '$(DB_URL) npx prisma studio --browser none --port 5555'

studio: prisma-studio

migrate: prisma-migrate

ms: migrate studio

dc-build:
	docker build -f .devcontainer/Dockerfile -t ft_devcontainer .

dc-stop:
	-docker stop ft_devcontainer

dc-rm:
	-docker rm ft_devcontainer

dc-rmi:
	-docker rmi ft_devcontainer

dc-clean: dc-stop dc-rm dc-rmi
	-docker volume rm transcendance-backend-node-modules transcendance-frontend-node-modules
	docker builder prune -f

init:
	./other/nginx/generate-eval-cert.sh
	mkdir -p $(HOME)/.local/bin
	ln -snf /usr/bin/podman $(HOME)/.local/bin/docker
	touch $(HOME)/.zshrc $(HOME)/.bashrc
	grep -qxF 'export PATH="$$HOME/.local/bin:$$PATH"' $(HOME)/.zshrc || echo 'export PATH="$$HOME/.local/bin:$$PATH"' >> $(HOME)/.zshrc
	grep -qxF 'export PATH="$$HOME/.local/bin:$$PATH"' $(HOME)/.bashrc || echo 'export PATH="$$HOME/.local/bin:$$PATH"' >> $(HOME)/.bashrc
	mkdir -p $(HOME)/.config/fish
	touch $(HOME)/.config/fish/config.fish
	grep -qxF 'fish_add_path -m $$HOME/.local/bin' $(HOME)/.config/fish/config.fish || echo 'fish_add_path -m $$HOME/.local/bin' >> $(HOME)/.config/fish/config.fish
	@echo "Init complete. PATH is active for this make invocation and persisted for zsh, bash, and fish."

.PHONY: up up-build down restart build rebuild logs ps clean fclean re dev dev-up dev-up-build dev-down dev-restart dev-build dev-rebuild dev-logs dev-ps dev-clean dev-fclean dev-re frontend backend db db-clean seed prisma-generate prisma-migrate prisma-studio studio migrate dc-build dc-stop dc-rm dc-rmi dc-clean init
