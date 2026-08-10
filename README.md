# Lustra

Агрегатор бьюти-мастеров (Минск). Монорепо: NestJS API + Next.js приложение + Astro-лендинг.

Источники правды: [`docs/PRD.md`](docs/PRD.md) (продукт), [`docs/TECH-DESIGN.md`](docs/TECH-DESIGN.md) (схема БД, архитектура, API).

## Требования

- Node ≥ 20.11
- pnpm 9.15 (`packageManager` в корневом `package.json`)
- Docker (Postgres 16 + Redis 7)

## Быстрый старт

```bash
# 1. зависимости
pnpm install

# 2. инфраструктура
docker compose up -d

# 3. БД
cp packages/db/.env.example packages/db/.env   # если ещё нет
cp apps/api/.env.example apps/api/.env         # если ещё нет
pnpm db:migrate:deploy
pnpm db:seed

# 4. сервисы (в разных терминалах)
pnpm dev:api       # http://localhost:3333  — health: /health, /health/deep
pnpm dev:web       # http://localhost:3000
pnpm dev:landing   # http://localhost:4321
```

Или всё сразу: `pnpm dev` (Turborepo).

| Сервис | Порт | Назначение |
|---|---|---|
| Postgres | 5432 | `lustra` / `lustra` / `lustra_dev` |
| Redis | 6379 | очереди / кэш |
| API | 3333 | NestJS (Fastify) |
| Web | 3000 | Next.js 15 (каталог, кабинеты) |
| Landing | 4321 | Astro (маркетинг, юр. страницы) |

Полезное:

```bash
pnpm db:studio          # Prisma Studio
pnpm typecheck
pnpm test
pnpm test:e2e
```

## Структура

```
lustra/
├─ apps/
│  ├─ api/          # NestJS 11 + Fastify — REST, Telegram, BullMQ
│  ├─ web/          # Next.js 15 — /catalog, /m/[slug], /app/**, /admin/**
│  └─ landing/      # Astro 5 — /, /for-masters, /privacy, /terms
├─ packages/
│  ├─ db/           # Prisma schema, миграции, seed
│  └─ config/       # shared tsconfig / eslint / prettier
├─ docs/
│  ├─ PRD.md
│  └─ TECH-DESIGN.md
├─ docker-compose.yml
└─ .cursor/
   ├─ rules/        # постоянные правила агента
   └─ skills/       # скиллы по фронту / беку / дизайну / тестам
```

Планируемые пакеты (ещё не заведены): `@lustra/contracts` (Zod DTO + typed client), `@lustra/ui` (токены + компоненты).

## Архитектура (кратко)

- **API** — модули по bounded contexts из tech design (`auth`, `masters`, `scheduling`, `bookings`…). Слои: `api/` → `app/` (use-cases) → `domain/` → `infra/`. Без god-сервисов.
- **Слоты** — намерения (`AvailabilityRule` / `Exception` / `TimeBlock`) → генератор → проекция `TimeSlot`. Бронь: `hold → confirm`.
- **Web** — feature-sliced: `app/` (роуты), `entities/`, `features/`, `shared/`.
- **Валидация** — жёстко на беке (Zod из contracts); на фронте — UX-второй уровень.
- **Роли** — `client` | `master` | `admin`; `masterId` / `userId` только из токена, никогда из тела запроса.

## Git Flow

Ветки:

| Ветка | Назначение |
|---|---|
| `main` | прод / стабильные релизы |
| `develop` | интеграция, дневная разработка |
| `feature/<slug>` | фича от `develop` → merge обратно в `develop` |
| `release/<x.y.z>` | подготовка релиза из `develop` → в `main` + обратно в `develop` |
| `hotfix/<slug>` | срочный фикс от `main` → в `main` + `develop` |

Обычный цикл:

```bash
git checkout develop
git checkout -b feature/auth-register
# …работа…
git checkout develop && git merge --no-ff feature/auth-register
```

Релиз: тег `v*` на `main` после merge `release/*`. Remote добавь после создания репо на GitHub:

```bash
git remote add origin git@github.com:<org>/<repo>.git
git push -u origin main
git push -u origin develop
```

## Конвенции кода


- **Имена файлов и папок — `kebab-case`:** `hold-slot.usecase.ts`, `master-card.tsx`, `use-hold-timer.ts`.
- Классы/компоненты в коде — PascalCase, хуки — `useCamelCase`; это не переносится в имя файла.

Подробности и инварианты БД — в `docs/TECH-DESIGN.md`. Cursor-правила: `.cursor/rules/`, скиллы: `.cursor/skills/`.
