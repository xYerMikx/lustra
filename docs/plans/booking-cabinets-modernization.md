# План: запись из кабинетов мастера и клиента

Источник истины по протоколу и схеме: `docs/TECH-DESIGN.md` §7, §11, §18, §20. Продукт: `docs/PRD.md` F-07, F-10, F-12.

Это **план параллелизации**, не реализация. Код не меняется в этом документе.

## Что уже есть

| Поверхность | Сейчас |
|---|---|
| Календарь мастера `/app/master/calendar` | Ручная запись (`ManualBookingDialog` + `POST /master/bookings`), автокомплит `GET /master/clients?query=` |
| Список записей мастера `/app/master/bookings` | Только вкладки предстоящие / на подтверждение / прошлые. **Нет CTA «записать клиента»** |
| Книга клиентов | Роут `/app/master/clients` есть в TECH-DESIGN §20, **страницы нет** |
| Поиск клиентов API | Имя, телефон, подстрока в `note` (ник Instagram/Telegram парсится из заметки, отдельной колонки `socialHandle` нет) |
| `MasterClient.visitsCount` / `lastVisitAt` | Поля в Prisma **нигде не обновляются и не отдаются** |
| Клиент «Мои записи» | Предстоящие / прошлые. Пустое состояние ведёт в каталог текстом. **Нет флоу «записаться» из кабинета** |
| Онлайн-запись клиента | Только с `/m/[slug]` через `SlotPicker` (услуга → день → слот → hold → confirm) |
| Рекомендации услуг | Нет модуля, нет ручки |

Ручная запись требует телефон (`CreateManualBookingInput.phone`) — гость только с Instagram/Telegram без номера сейчас не проходит контракт.

## Цели (MVP этой волны)

1. **Мастер из списка записей** создаёт бронь за клиента (кнопка + та же форма, что в календаре), без ухода «в никуда».
2. **Мастер ищет постоянных клиентов** по имени, телефону, нику Instagram («стена») и Telegram, и видит **частых** отдельным списком/вкладкой.
3. **Клиент из кабинета** записывается: услуга → мастер → слот, переиспользуя hold/confirm.
4. **Подсказка услуги** — отдельный сервис `recommendations`, в v1 без ML: частота `completed` броней клиента.

Сложную персонализацию, коллаборативную фильтрацию, «похожие мастера» — **не делать**. Заложить порт, чтобы алгоритм менялся без переписывания UI.

## Не в этой волне

- Склейка гостя с аккаунтом по телефону без подтверждения (TECH-DESIGN § риски).
- Полноценный CRM (`PATCH /master/clients/:id`, теги, блок).
- Drag-to-book в календаре, депозит, Google Calendar.
- Рекомендации мастеру «кому написать».

---

## Контракты (заморозить до старта агентов)

Чтобы ветки не дрались за `packages/contracts/src/booking.ts`, новые схемы класть в **разные файлы**. `index.ts` трогать аккуратно (append-only экспорты).

### A. Книга клиентов — только агент **M2**

Файл: `packages/contracts/src/booking.ts` (расширение существующих схем).

```ts
// ListMasterClientsQuerySchema
{
  query: z.string().trim().max(80).default(''),
  sort: z.enum(['recent', 'frequent']).default('recent'),
}

// MasterClientViewSchema — добавить (не ломая текущие поля)
visitsCount: z.number().int().nonnegative()
lastVisitAt: z.string().datetime().nullable()
```

`CreateManualBookingInput`: телефон **опционален**, если есть `socialHandle` (хотя бы одно из `phone` | `socialHandle`). Иначе 400 `VALIDATION_FAILED`.

Не менять `POST /master/bookings` протокол слотов/EXCLUDE.

### B. Рекомендации — только агент **R1**

Новый файл: `packages/contracts/src/recommendations.ts`.

```ts
GET /client/recommendations
Response: {
  services: Array<{
    serviceTitle: string
    serviceId: string | null      // null, если услуга удалена — только снимок
    categoryId: string | null
    completedCount: number
    lastCompletedAt: string       // ISO
    lastMaster: {
      id: string
      slug: string
      displayName: string
    } | null
  }>
}
```

Лимит: 3. Пустой массив — валидный ответ, не 404.

### C. Клиентский букинг из кабинета — агент **C1**

Новых write-ручек нет. Чтение: существующие `GET /bookings?scope=past`, каталог, `GET /catalog/masters/:slug`, `POST /bookings/holds`. Рекомендации — опциональный read; UI обязан работать при пустом `services[]`.

---

## Алгоритмы v1 (намеренно тупые)

### Частые клиенты мастера

Не полагаться на мёртвый `visitsCount`. В `listMasterClients`:

- `sort=recent` — как сейчас (`updatedAt desc`).
- `sort=frequent` — `COUNT(Booking WHERE status=completed)` desc, tie-break `MAX(completedAt)` desc, затем имя.

В ответе отдать вычисленный `visitsCount` (count completed) и `lastVisitAt`. Фоновый sync колонок Prisma — отдельный follow-up, не блокер.

Поиск `query`: имя **или** телефон **или** `socialHandle` из `note` (как сейчас) **или** подстрока `note`. Нормализация ника: trim, без ведущего `@`, case-insensitive.

### Рекомендации услуг клиенту

Модуль `apps/api/src/modules/recommendations/`:

- Порт `ClientBookingStatsStore.listCompletedByClient(userId)`.
- Чистая функция `rankServiceRecommendations(rows, limit=3)`: группа по `serviceId ?? serviceTitle`, сортировка `count desc, lastCompletedAt desc`.
- Не фильтровать по городу/цене. Не подмешивать глобальный топ.
- Auth: только `client` (мастер 403).

Позже тот же порт может читать другую таблицу — UI не меняется.

---

## UX

### Мастер: `/app/master/bookings`

- Кнопка **«Записать клиента»** в шапке (и в empty state).
- Открывает ту же форму ручной записи, что календарь: услуга, дата/время, клиент (suggest), канал, ник при instagram/telegram, заметка.
- После успеха — остаёмся в списке, вкладка предстоящие, тост, инвалидация query.
- Не дублировать вторую копию диалога. Вынести шаренную фичу (см. M1).

### Мастер: `/app/master/clients` (новое)

Вкладки:

1. **Поиск** — поле + список совпадений (имя, тел, @ник).
2. **Частые** — `sort=frequent`, без обязательного query.

Строка: имя, телефон/@ник, число визитов. Действие **«Записать»** открывает ту же форму с префиллом имени/телефона/ника/канала.

Календарь продолжает жить; книга — быстрый вход «постоянный клиент → слот».

### Клиент: `/app/client/bookings`

- Кнопка **«Записаться»** в шапке и в empty upcoming.
- Мастер: `/app/client/book` (client-only), не ломая публичный `/m/[slug]`.
- Шаги: услуга (рекомендации сверху, если есть) → мастер (рекомендованный lastMaster, избранное, иначе каталог) → существующий `SlotPicker` / hold-confirm.
- Если рекомендаций нет — шаг услуги = категории каталога / поиск, как на публичной витрине, без фейковых чипов.

---

## Нарезка веток (4 агента)

База каждой ветки: свежий `develop`. Имена для cloud-агентов: `cursor/<slug>-505e`. Слияние в `develop` по очереди, если конфликты в `contracts/src/index.ts`.

```
                    ┌─ M1 web: CTA + shared manual form ─┐
develop ────────────┼─ M2 api+web: clients search/frequent ┼──► develop
                    ├─ C1 web: client book from cabinet ───┤
                    └─ R1 api: recommendations module ─────┘
```

| ID | Ветка (пример) | Владеет | Не трогает |
|---|---|---|---|
| **M1** | `cursor/master-book-from-list-505e` | `features/manual-booking/` (extract из calendar), CTA в `master-bookings-shell`, e2e «записать с /bookings» | `booking.ts` contracts, recommendations, client cabinet |
| **M2** | `cursor/master-client-book-505e` | contracts query/view + optional phone, `list-master-clients*`, страница `/app/master/clients`, вкладки поиск/частые, префилл формы | extract диалога (импортирует то, что уже в calendar **или** ждёт M1) |
| **C1** | `cursor/client-book-from-cabinet-505e` | `client-bookings-shell` CTA, `features/client-book-flow/`, роут `/app/client/book`, reuse `SlotPicker` | `POST /master/bookings`, книга мастера |
| **R1** | `cursor/client-recommendations-505e` | `modules/recommendations/**`, `contracts/src/recommendations.ts`, unit-тесты ранжирования | UI кабинета (C1 читает API, если 404/пусто — fallback) |

### Зависимости и как не ждать

- **M1 ∥ M2:** M1 выносит диалог, **не** меняя поиск. M2 расширяет API и `ClientSuggest`/фильтр. Если M1 ещё не влит — M2 вешает «Записать» на календарный диалог по текущему импорту; после merge M1 переключить импорт на `features/manual-booking`.
- **C1 ∥ R1:** C1 рисует слот «рекомендации» только если `services.length > 0`. Пока R1 нет — всегда каталог. Контракт B зафиксирован здесь: R1 не меняет форму после старта C1.
- **R1 не зависит от M\***. Модуль читает `Booking` + `MasterProfile` через свой порт, не через `BookingsModule` god-service.

### Порядок merge при конфликте `index.ts`

1. R1 (новый файл, почти без пересечений)
2. M1 (только web)
3. M2 (booking contracts)
4. C1 (web + вызов recommendations)

Или merge M1 и R1 сразу параллельно.

---

## Файлы по агентам (ориентир)

**M1**

- `apps/web/src/features/manual-booking/` ← перенос `manual-booking-dialog`, `client-suggest`, `build-manual-*`, `channel-options`
- `apps/web/src/features/master-calendar/ui/calendar-shell.tsx` — импорт из новой фичи
- `apps/web/src/features/booking-cabinets/ui/master-bookings-shell.tsx`
- `apps/web/e2e/specs/` — сценарий с мастера bookings
- Не раздувать shell > 300 строк: кнопка + диалог в дочернем компоненте

**M2**

- `packages/contracts/src/booking.ts`
- `apps/api/.../list-master-clients-in-store.ts` + usecase + tests
- `CreateManualBookingInputSchema` refine phone XOR socialHandle
- `apps/web/src/app/app/master/clients/page.tsx`
- `apps/web/src/features/master-clients/` (список, вкладки, поиск)
- Навигация в `master-cabinet` hub
- Тесты: поиск по `@nick`, sort frequent, IDOR чужой книги

**C1**

- `apps/web/src/app/app/client/book/page.tsx`
- `apps/web/src/features/client-book-flow/`
- `client-bookings-shell.tsx`, `cabinet-home-panel.tsx` (вторая кнопка)
- Переиспользовать `SlotPicker` (пропсы masterId/slug/services). Не копировать hold-логику.
- Playwright: клиент из кабинета доходит до выбора слота (можно мок API)

**R1**

- `packages/contracts/src/recommendations.ts` + export
- `apps/api/src/modules/recommendations/` (`app/get-client-recommendations.usecase.ts`, `domain/rank-service-recommendations.ts`, `infra/`, `api/`)
- Регистрация модуля в `AppModule`
- Vitest: два completed manicure + один brows → manicure первый; чужой userId не виден

---

## Тесты (минимум на волну)

См. `.cursor/skills/lustra-testing/SKILL.md`. Smoke-маркеры: `{role}.smoke.{runId}@example.com`.

| Агент | Обязательно |
|---|---|
| M1 | e2e: мастер открывает форму с `/app/master/bookings` |
| M2 | unit store/usecase: query по нику и телефону; frequent order; чужой masterId пусто |
| C1 | e2e или component: CTA → шаг услуги; пустые рекомендации не ломают |
| R1 | domain rank + usecase mock repo; DTO без `trustScore` / `masterNote` |

Гонки hold/EXCLUDE не переписывать — ручная запись уже покрыта.

Postman: новые ручки через MCP (`GET /master/clients?sort=frequent`, `GET /client/recommendations`), не JSON в git.

---

## Промпты субагентам

Каждый агент: ветка от `develop`, kebab-case файлы, `@/` импорты, braces, без `as never`, PR в `develop`, не в `main`.

**M1.** Extract manual booking UI from `features/master-calendar` into `features/manual-booking`. Add «Записать клиента» on `/app/master/bookings` (header + empty). Reuse `POST /master/bookings`. No contract changes. Calendar must keep working. File ≤ 300 lines.

**M2.** Extend `ListMasterClientsQuery` with `sort=recent|frequent` and `MasterClientView` visitsCount/lastVisitAt. Search name, phone, Instagram/Telegram handle. New `/app/master/clients` with Search and Frequent tabs; «Записать» prefills the existing manual form. Make phone optional when socialHandle is set. Do not invent a recommendations module.

**C1.** Client cabinet: «Записаться» → `/app/client/book` (service → master → existing SlotPicker). If `GET /client/recommendations` returns services, show them first; if empty/error, catalog/favorites/past bookings only. Do not change master booking APIs.

**R1.** New Nest module `recommendations`, `GET /client/recommendations`, contracts in `recommendations.ts`. Rank by completed booking frequency, limit 3, last master per service. No ML. Unit tests on rank function. No web UI in this PR.

---

## Критерии готовности волны

- Мастер создаёт бронь со страницы записей ≤ тех же полей, что в календаре.
- Мастер находит клиента по имени, телефону и @нику; вкладка частых показывает completed-count.
- Клиент из кабинета проходит услуга → мастер → слот без обязательного захода в каталог.
- Рекомендации — отдельный модуль; UI жив без них.
- Приватные поля мастера не светятся в клиентских DTO.
