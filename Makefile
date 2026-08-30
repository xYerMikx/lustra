# Lumira — local orchestration
# Run from repo root: `make` / `make start`

.DEFAULT_GOAL := help

COMPOSE ?= docker compose
PNPM    ?= pnpm

.PHONY: help setup install env infra up down wait-db db migrate seed \
	start dev stop restart status studio build test test-e2e test-e2e-headed \
	test-e2e-ui typecheck logs prod-env prod-build prod-build-api prod-up prod-down prod-logs

help: ## список команд
	@grep -E '^[a-zA-Z_-]+:.*?## ' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-12s\033[0m %s\n", $$1, $$2}'

setup: install env up wait-db db ## первый запуск: deps + .env + docker + миграции
	@echo ""
	@echo "Готово. Дальше: make start"

install: ## pnpm install
	$(PNPM) install

env: ## скопировать .env из example, если ещё нет
	@test -f packages/db/.env || cp packages/db/.env.example packages/db/.env
	@test -f apps/api/.env || cp apps/api/.env.example apps/api/.env
	@test -f apps/web/.env || (test -f apps/web/.env.example && cp apps/web/.env.example apps/web/.env || true)
	@test -f apps/landing/.env || cp apps/landing/.env.example apps/landing/.env
	@echo ".env на месте"

up: ## поднять Postgres + Redis + MinIO
	$(COMPOSE) up -d
	@echo "Postgres :5432  Redis :6379  MinIO :9000 (console :9001)"

infra: up ## алиас на up

down: ## остановить контейнеры (данные сохраняются)
	$(COMPOSE) down

wait-db: ## дождаться healthy Postgres
	@echo "Ждём Postgres..."
	@i=0; \
	until $(COMPOSE) exec -T postgres pg_isready -U lumira -d lumira_dev >/dev/null 2>&1; do \
		i=$$((i+1)); \
		if [ $$i -gt 60 ]; then echo "Postgres не поднялся"; exit 1; fi; \
		sleep 1; \
	done
	@echo "Postgres ready"

migrate: ## prisma migrate deploy
	$(PNPM) db:migrate:deploy

seed: ## seed районов / категорий
	$(PNPM) db:seed

db: migrate seed ## миграции + seed

start: env up wait-db ## вся прилагу: docker + api + web + landing
	@echo ""
	@echo "  landing  http://localhost:4321"
	@echo "  web      http://localhost:3000"
	@echo "  api      http://localhost:3333/health"
	@echo ""
	$(PNPM) dev

dev: start ## алиас на start

stop: down ## остановить infra (dev-процессы — Ctrl+C в терминале make start)

restart: down start ## перезапуск infra + приложений

status: ## статус контейнеров и портов
	@$(COMPOSE) ps
	@echo ""
	@curl -sf http://localhost:3333/health >/dev/null && echo "api     ok" || echo "api     down"
	@curl -sf -o /dev/null http://localhost:3000/ && echo "web     ok" || echo "web     down"
	@curl -sf -o /dev/null http://localhost:4321/ && echo "landing ok" || echo "landing down"

logs: ## логи docker (postgres/redis)
	$(COMPOSE) logs -f --tail=100

studio: ## Prisma Studio
	$(PNPM) db:studio

build: ## production build всех пакетов
	$(PNPM) build

test: ## unit-тесты
	$(PNPM) test

test-e2e: ## Playwright UI e2e (мок API, без Postgres)
	$(PNPM) --filter @lumira/web test:e2e

test-e2e-headed: ## те же e2e с видимым браузером
	$(PNPM) --filter @lumira/web test:e2e:headed

test-e2e-ui: ## Playwright UI Mode (таймлайн, шаги, трейсы)
	$(PNPM) --filter @lumira/web test:e2e:ui

typecheck: ## tsc по монорепо
	$(PNPM) typecheck

prod-env: ## скопировать .env.production из example, если ещё нет
	@test -f .env.production || cp .env.production.example .env.production
	@echo "Заполни .env.production (пароли, JWT, DOMAIN) перед prod-up"

prod-build: prod-env ## собрать prod-образы (api, web, caddy+landing)
	$(COMPOSE) -f deploy/docker-compose.yml --env-file .env.production build

prod-build-api: ## linux/amd64 api image (как Railway), без compose
	docker build --platform linux/amd64 -f deploy/api/Dockerfile -t lumira-api:local .

prod-up: prod-env ## поднять prod-стек (нужен заполненный .env.production)
	$(COMPOSE) -f deploy/docker-compose.yml --env-file .env.production up -d
	@echo "Caddy :80/:443  — домен из DOMAIN в .env.production"

prod-down: ## остановить prod-стек (тома сохраняются)
	$(COMPOSE) -f deploy/docker-compose.yml --env-file .env.production down

prod-logs: ## логи prod-стека
	$(COMPOSE) -f deploy/docker-compose.yml --env-file .env.production logs -f --tail=100
