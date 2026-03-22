COMPOSE = docker compose

up:
	$(COMPOSE) up --build

down:
	$(COMPOSE) down

restart:
	$(COMPOSE) down
	$(COMPOSE) up --build

build:
	$(COMPOSE) build

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

prisma-generate:
	$(COMPOSE) exec backend npx prisma generate

prisma-migrate:
	$(COMPOSE) exec backend sh -c 'npx prisma migrate dev'

prisma-studio:
	$(COMPOSE) exec backend npx prisma studio
