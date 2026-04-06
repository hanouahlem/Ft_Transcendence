COMPOSE = docker compose
DB_URL = DATABASE_URL=postgresql://$$POSTGRES_USER:$$POSTGRES_PASSWORD@postgres:5432/$$POSTGRES_DB

up:
	$(COMPOSE) up

up-build:
	$(COMPOSE) up --build

down:
	$(COMPOSE) down

restart:
	$(COMPOSE) down
	$(COMPOSE) up

build:
	$(COMPOSE) build

rebuild:
	$(COMPOSE) build
	$(COMPOSE) up

logs:
	$(COMPOSE) logs -f

ps:
	$(COMPOSE) ps

clean:
	$(COMPOSE) down -v --remove-orphans

fclean:
	$(COMPOSE) down -v --remove-orphans
	docker system prune -af

re: fclean up

frontend:
	cd frontend && npm install && npm run dev

backend:
	cd backend && npm install && npm run dev

db:
	$(COMPOSE) up -d postgres

db-clean:
	$(COMPOSE) exec backend sh -c '$(DB_URL) npx prisma migrate reset --force'

seed: db-clean
	bash other/seed.sh

superseed: db-clean
	bash other/superseed.sh

prisma-generate:
	$(COMPOSE) exec backend npx prisma generate

prisma-migrate:
	$(COMPOSE) exec backend sh -c '$(DB_URL) npx prisma migrate dev'

prisma-studio:
	$(COMPOSE) exec backend sh -c '$(DB_URL) npx prisma studio --browser none --port 5555'

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

.PHONY: up up-build down restart build rebuild logs ps clean fclean re frontend backend db db-clean seed prisma-generate prisma-migrate prisma-studio studio migrate dc-build dc-stop dc-rm dc-rmi dc-clean
