DOCKER ?= docker
# (faire DOCKER=podman make)
DEV_COMPOSE = $(DOCKER) compose
EVAL_COMPOSE = $(DOCKER) compose -f docker-compose.eval.yml
DB_URL = DATABASE_URL=postgresql://$$POSTGRES_USER:$$POSTGRES_PASSWORD@postgres:5432/$$POSTGRES_DB


# Eval Setup Commands

up: 
	$(EVAL_COMPOSE) up --build
	
init:
	./other/nginx/generate-eval-cert.sh

up-no-build:
	$(EVAL_COMPOSE) up

down:
	$(EVAL_COMPOSE) down

build:
	$(EVAL_COMPOSE) build

logs:
	$(EVAL_COMPOSE) logs -f

ps:
	$(EVAL_COMPOSE) ps
	
volume:
	$(EVAL_COMPOSE) volumes

clean:
	$(EVAL_COMPOSE) down --remove-orphans --rmi local

fclean:
	$(EVAL_COMPOSE) down -v --remove-orphans --rmi local

re: clean up


# Dev Setup Commands	

dev: dev-up

dev-up-no-build:
	$(DEV_COMPOSE) up

dev-up:
	$(DEV_COMPOSE) up --build

dev-down:
	$(DEV_COMPOSE) down

dev-build:
	$(DEV_COMPOSE) build

dev-logs:
	$(DEV_COMPOSE) logs -f

dev-ps:
	$(DEV_COMPOSE) ps
	
dev-volume:
	$(DEV_COMPOSE) volumes

dev-clean:
	$(DEV_COMPOSE) down --remove-orphans --rmi local

dev-fclean:
	$(DEV_COMPOSE) down -v --remove-orphans --rmi local

dev-re: dev-clean dev-up


# Database Commands

db-clean:
	$(DEV_COMPOSE) exec backend sh -c '$(DB_URL) npx prisma migrate reset --force'

seed: db-clean
	$(DEV_COMPOSE) exec backend node scripts/seed/seed.mjs

superseed: db-clean
	$(DEV_COMPOSE) exec backend node scripts/superseed/superseed.mjs

studio:
	$(DEV_COMPOSE) exec backend sh -c '$(DB_URL) npx prisma studio --browser none --port 5555'
	
	
# Devcontainer Commands

dc-build:
	$(DOCKER) build -f .devcontainer/Dockerfile -t ft_devcontainer .

dc-stop:
	-$(DOCKER) stop ft_devcontainer

dc-rm:
	-$(DOCKER) rm ft_devcontainer

dc-rmi:
	-$(DOCKER) rmi ft_devcontainer

dc-clean: dc-stop dc-rm dc-rmi
	-$(DOCKER) volume rm transcendance-backend-node-modules transcendance-frontend-node-modules
	$(DOCKER) builder prune -f

	

nuke:
	$(DOCKER) system prune -af --volumes


.PHONY: up up-build down restart build rebuild logs ps clean fclean re dev dev-up dev-up-build dev-down dev-restart dev-build dev-rebuild dev-logs dev-ps dev-clean dev-fclean dev-re nuke frontend backend db db-clean seed prisma-generate prisma-migrate prisma-studio studio migrate dc-build dc-stop dc-rm dc-rmi dc-clean init
