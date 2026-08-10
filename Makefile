# Lustra — local orchestration
# Run from repo root: `make` / `make start`

.DEFAULT_GOAL := help

COMPOSE ?= docker compose
PNPM    ?= pnpm

.PHONY: help setup install env infra up down wait-db db migrate seed \
	start dev stop restart status studio build test typecheck logs

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
	@echo ".env на месте"

up: ## поднять Postgres + Redis
	$(COMPOSE) up -d
	@echo "Postgres :5432  Redis :6379"

infra: up ## алиас на up

down: ## остановить контейнеры (данные сохраняются)
	$(COMPOSE) down

wait-db: ## дождаться healthy Postgres
	@echo "Ждём Postgres..."
	@i=0; \
	until $(COMPOSE) exec -T postgres pg_isready -U lustra -d lustra_dev >/dev/null 2>&1; do \
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

typecheck: ## tsc по монорепо
	$(PNPM) typecheck
