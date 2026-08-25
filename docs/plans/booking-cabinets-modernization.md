# План: запись из кабинетов мастера и клиента

Источник истины по протоколу и схеме: `docs/TECH-DESIGN.md` §7, §11, §18, §20. Продукт: `docs/PRD.md` F-07, F-10, F-12.

## База для субагентов

Общая ветка: **`cursor/booking-cabinets-foundation-505e`** (после merge — `develop`).

Субагенты **M1 / M2 / C1 / R1** ветвятся **от этой базы**, не от голого `develop` до merge.

Уже в базе (не повторять в фича-ветках):

- Ручная запись: **имя + ник Instagram или Telegram обязательны**. Телефон **никогда** не обязателен (в том числе на канале «Телефон»).
- Идентичность гостя (**A + телефон если есть**): сначала точный phone, иначе `(masterId, instagramHandle|telegramHandle)` в lower-case. Имя не ключ.
- Колонки `MasterClient.instagramHandle` / `telegramHandle` + частичные unique-индексы. `GET /master/clients` ищет и по ним.
- `CreateManualBookingInput.identityNetwork` + обязательный `socialHandle`.
- `GET /master/clients?query=&sort=recent|frequent` + `visitsCount` / `lastVisitAt`.
- Контракт `recommendations.ts`. Ручки нет — **R1**.

## Что уже есть (продукт)

| Поверхность | Сейчас |
|---|---|
| Календарь мастера `/app/master/calendar` | Ручная запись, автокомплит `GET /master/clients?query=` |
| Список записей мастера `/app/master/bookings` | Только вкладки. **Нет CTA «записать клиента»** |
| Книга клиентов | Роут в TECH-DESIGN §20, **страницы нет** |
| Ник | Колонки `instagramHandle` / `telegramHandle` + fallback из `note` |
| Клиент «Мои записи» | Нет флоу «записаться» из кабинета |
| Онлайн-запись клиента | Только `/m/[slug]` + `SlotPicker` |

## Цели (MVP волны после базы)

1. **M1** — мастер из списка записей создаёт бронь той же формой.
2. **M2** — страница `/app/master/clients`, поиск и вкладка «Частые» (считать `completed`, не верить мёртвому `visitsCount`).
3. **C1** — клиент из кабинета: услуга → мастер → слот.
4. **R1** — модуль `recommendations`, частота completed.

## Identity (решено)

Выбрано **A + телефон если есть**. Не склеивать по имени. Не искать `ClientProfile`. Merge двух карточек вручную — не в этой волне: при конфликте уникального ника/телефона API отвечает `VALIDATION_FAILED`.

Две разные сущности:

| | `ClientProfile` | `MasterClient` |
|---|---|---|
| Чья | Платформенный аккаунт клиента (`User.role=client`) | Карточка **в книге одного мастера** |
| ID | UUID, мастер его не вводит | UUID, мастер его не вводит |
| Уникальность | email/userId | Сейчас фактически только `(masterId, userId)` unique; телефон **не unique** |

Онлайн-запись клиента с аккаунтом: `upsertMasterClient` по `(masterId, userId)` — одна карточка.

Ручная запись: мастер печатает имя и/или ник. Имя не уникально («Анна»). UUID мастер не наберёт. `ClientProfile` мастер не видит и не должен — это чужой аккаунт.

**Почему сейчас плодятся карточки:** матч гостя идёт **только по точному телефону**. Без номера каждый `POST` = новый `MasterClient`. Suggest в форме ищет уже созданные карточки, но если мастер не выбрал строку из списка, а заново вбил то же имя — это снова новый гость.

Ник Instagram/Telegram **почти** уникален в своей сети (нормализовать: lower, без `@`). Это лучший ручной ключ без телефона. Риски: смена ника; два канала (IG и TG) у одного человека; опечатка = вторая карточка; теоретический collision между сетями (`@anna` в IG ≠ `@anna` в TG — ключ должен быть `(channel, handle)`).

Варианты (выбрать одно, потом кодить):

**A. Ключ `(masterId, channel, normalizedHandle)`**  
Повторная запись с тем же `@nick` в Instagram обновляет карточку. Имя можно менять. Телефон, если позже появился, дописывается. Нет ника и нет телефона (`walk_in`) — всегда новая карточка (осознанно).  
Нужна колонка `socialHandle` + unique частичный индекс, не парсинг `note`.

**B. Как A, плюс телефон как второй ключ**  
Сначала phone, иначе handle. Если нашли две разные карточки (старая по телефону, новая по нику) — **не склеивать автоматически**; показать мастеру «это один человек?» (UI merge). Auto-merge без подтверждения опасен.

**C. Явный выбор из книги**  
Форма требует pick из suggest либо «новый клиент». Свободный ввод имени без pick всегда создаёт новую карточку. Идентичность = то, что мастер ткнул. Просто, честно, больше кликов.

**D. Связь с `ClientProfile`**  
Только если у брони есть `userId` (человек записался сам) или клиент подтвердил «это я» по ссылке. Мастер **не** ищет по глобальному каталогу пользователей (приватность, IDOR).

Рекомендация к обсуждению: **C для UX ввода + A для серверного upsert**, B как follow-up для merge. Не делать D в этой волне.

---

## Контракты (уже в базе; фича-ветки не переписывают форму)

`packages/contracts/src/booking.ts` — manual input + list clients.  
`packages/contracts/src/recommendations.ts` — ответ `{ recommendations }`, не каталог услуг.


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

База каждой ветки: **`cursor/booking-cabinets-foundation-505e`** (или `develop` после merge базы). Не трогать `CreateManualBookingInputSchema`. Ответ рекомендаций: `{ recommendations }`.

```
foundation ──┬─ M1 web: CTA + shared manual form
             ├─ M2 web+api: /app/master/clients + COUNT completed
             ├─ C1 web: client book from cabinet
             └─ R1 api: recommendations module
```

| ID | Ветка (пример) | Владеет | Не трогает |
|---|---|---|---|
| **M1** | `cursor/master-book-from-list-505e` | extract `features/manual-booking/`, CTA на `/app/master/bookings` | contracts, recommendations module |
| **M2** | `cursor/master-client-book-505e` | страница клиентов, COUNT для `sort=frequent`, префилл формы | schema manual booking, identity upsert |
| **C1** | `cursor/client-book-from-cabinet-505e` | `/app/client/book`, CTA в кабинете | master bookings API |
| **R1** | `cursor/client-recommendations-505e` | Nest-модуль + тесты ранжирования | ключ ответа `recommendations` |

Склейку по нику (раздел «кто такой клиент») **не класть** в M2, пока не выбран вариант A–D.

### Зависимости

- **M1 ∥ M2:** M1 выносит диалог. M2 импортирует его из calendar или из `manual-booking` после M1.
- **C1 ∥ R1:** пустой/отсутствующий recommendations → каталог.
- **R1** не зависит от M*.

### Порядок merge

1. foundation → develop
2. R1 и M1 параллельно
3. M2 (после решения identity — или без upsert)
4. C1


---

## Файлы по агентам (ориентир)

**M1**

- `apps/web/src/features/manual-booking/` ← перенос `manual-booking-dialog`, `client-suggest`, `build-manual-*`, `channel-options`
- `apps/web/src/features/master-calendar/ui/calendar-shell.tsx` — импорт из новой фичи
- `apps/web/src/features/booking-cabinets/ui/master-bookings-shell.tsx`
- `apps/web/e2e/specs/` — сценарий с мастера bookings
- Не раздувать shell > 300 строк: кнопка + диалог в дочернем компоненте

**M2**

- `apps/web/src/app/app/master/clients/page.tsx`
- `apps/web/src/features/master-clients/`
- `list-master-clients-in-store.ts` — COUNT completed for `sort=frequent` (контракт уже есть)
- Навигация в `master-cabinet` hub
- Не менять upsert по нику, пока нет решения identity

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

Каждый агент: ветка **от foundation**, kebab-case, `@/` импорты, braces, без `as never`, PR в `develop`.

**M1.** Extract manual booking UI from `features/master-calendar` into `features/manual-booking`. Add «Записать клиента» on `/app/master/bookings`. Reuse existing `POST /master/bookings` (phone optional already). No contract edits.

**M2.** Page `/app/master/clients` with Search and Frequent (`sort=frequent` already on the API). Compute frequent from completed bookings. Prefill the existing form. Do **not** change guest upsert/identity.

**C1.** Client cabinet: «Записаться» → `/app/client/book`. Recommendations optional.

**R1.** Nest module implementing `ClientRecommendationsResponseSchema` (`recommendations`, not `services`). No web UI.

---

## Критерии готовности волны

- Мастер создаёт бронь со страницы записей ≤ тех же полей, что в календаре.
- Мастер находит клиента по имени, телефону и @нику; вкладка частых показывает completed-count.
- Клиент из кабинета проходит услуга → мастер → слот без обязательного захода в каталог.
- Рекомендации — отдельный модуль; UI жив без них.
- Приватные поля мастера не светятся в клиентских DTO.
