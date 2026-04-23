DOCKER ?= docker
# (faire DOCKER=podman make)
DEV_COMPOSE = $(DOCKER) compose -f docker-compose.dev.yml
EVAL_COMPOSE = $(DOCKER) compose


# Eval Setup Commands

up: 
	$(EVAL_COMPOSE) up --build
	
init:
	./other/nginx/generate-eval-cert.sh

down:
	$(EVAL_COMPOSE) down

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

dev-up:
	$(DEV_COMPOSE) up --build

dev-down:
	$(DEV_COMPOSE) down

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
	$(DEV_COMPOSE) exec backend npx prisma migrate reset --force

seed: db-clean
	$(DEV_COMPOSE) exec backend node scripts/seed/seed.mjs

superseed: db-clean
	$(DEV_COMPOSE) exec backend node scripts/superseed/superseed.mjs

studio:
	$(DEV_COMPOSE) exec backend npx prisma studio --browser none --port 5555
	
	
# Devcontainer Commands

dc-build:
	$(DOCKER) build -f .devcontainer/Dockerfile -t ft_devcontainer .

dc-clean:
	-$(DOCKER) rm -f ft_devcontainer
	-$(DOCKER) rmi ft_devcontainer
	-$(DOCKER) volume rm ft_devcontainer_backend_modules ft_devcontainer_frontend_modules
	$(DOCKER) builder prune -f


.PHONY: up init down ps volume clean fclean re dev dev-up dev-down dev-ps dev-volume dev-clean dev-fclean dev-re db-clean seed superseed studio dc-build dc-clean
