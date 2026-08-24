# Технический дизайн — «Lustra»

Единственный источник истины по схеме БД, бэкенду и фронтенду. PRD (`docs/PRD.md`) описывает **что** и **зачем**, этот документ — **как**.

| | |
|---|---|
| **Версия** | 0.2 |
| **Дата** | 2026-07-25 |
| **Статус** | проектирование перед реализацией; схема БД считается зафиксированной после ревью §4–§6 |
| **Изменения к 0.1** | `MasterProfile` разбит на 6 сущностей · добавлены `ClientProfile`, `MasterClient`, `TimeSlot`, `TimeBlock`, `MediaAsset`, `OutboxEvent` · роль вынесена в `User.role` · спроектирован протокол защиты от race condition (hold → confirm) · токены дизайна переведены в числовую шкалу · монетизация зафиксирована как v2 (подписка + продвижение) |

---

## 1. Принципы проектирования

1. **Intent vs Projection.** Намерение мастера («работаю по будням 10–20», «обед 13:15–13:45», «эта бронь») хранится в нормализованных таблицах-намерениях. Занятость и свободные окна — в **проекции** `TimeSlot`, которую строит генератор. Проекция всегда пересчитываема из намерений; при расхождении правым считается намерение.
2. **Инварианты живут в БД, а не в коде.** Всё, что нельзя нарушать никогда (двойная бронь, слот в двух бронях, дубль отзыва), закрыто констрейнтами Postgres. Код — вторая линия защиты, а не первая.
3. **Маленькие сущности с одной ответственностью.** Никаких «богов»-таблиц на 40 колонок: настройки, статистика, локации, контакты, верификация — отдельные таблицы 1:1 или 1:N. Читаем через явные `include`, а не тянем всё подряд.
4. **Снапшоты вместо ссылок в исторических данных.** Бронь хранит цену/длительность/название услуги на момент создания. Мастер меняет прайс — история не переписывается.
5. **Read-модели для горячих списков.** Каталог не считает агрегаты на лету: `MasterStats` (рейтинг, минимальная цена, ближайшее окно) обновляется событиями/воркером.
6. **Никаких мягких намёков на роли.** `User.role` — обязательное поле, профиль соответствующей роли создаётся вместе с пользователем; `client` и `master` не пересекаются по данным.
7. **Идемпотентность на входе и на выходе.** Все мутации, которые может ретраить сеть или очередь: `Idempotency-Key` на API, `dedupeKey` в уведомлениях, `jobId` в BullMQ.
8. **Транзакционная доставка событий.** Событие домена пишется в `OutboxEvent` в той же транзакции, что и данные; воркер выгребает и публикует. Никаких «отправим письмо, а вдруг транзакция откатится».
9. **Каждое поле — с ответом на вопрос «кто это читает».** Приватные поля (`masterNote`, `addressExact`, телефон гостя) не выходят наружу через явный маппинг DTO, а не «забыли исключить».
10. **UTC в БД, `Europe/Minsk` на границе.** Все `timestamptz`; локальные минуты суток только в правилах расписания.

## 2. Bounded contexts (границы модулей)

| Контекст | Сущности | Ответственность |
|---|---|---|
| **Identity** | `User`, `RefreshSession`, `AuthToken`, `TelegramAccount`, `NotificationSetting`, `Consent` | регистрация, вход, роли, привязка Telegram, согласия ПД |
| **ClientProfile** | `ClientProfile`, `Favorite` | данные клиента, предпочтения, избранное |
| **MasterCatalog** | `MasterProfile`, `MasterContact`, `MasterLocation`, `MasterBookingPolicy`, `MasterStats`, `MasterVerification`, `Service`, `ServiceCategory`, `PortfolioItem`, `District` | витрина, услуги, портфолио, фильтры, SEO-данные |
| **Scheduling** | `AvailabilityRule`, `AvailabilityException`, `TimeBlock`, `TimeSlot` | график, генерация и состояние окон |
| **Booking** | `Booking`, `BookingSlot`, `BookingEvent`, `MasterClient` | запись, статусы, конкурентность, клиентская книга мастера |
| **Reviews** | `Review` | отзывы, рейтинг, ответы мастера |
| **Media** | `MediaAsset` | загрузка, варианты, модерация любых изображений |
| **Notifications** | `OutboxEvent`, `NotificationLog` | Telegram/email, напоминания, дедупликация |
| **Moderation** | `ModerationTask`, `Report`, `AuditLog` | очередь модерации, жалобы, аудит админ-действий |
| **Billing (v2)** | `Plan`, `Subscription`, `Promotion`, `Payment` | подписки и платное продвижение — только заготовка схемы |

Модули бэкенда 1:1 повторяют эти контексты. Правило зависимостей: `Booking` → `Scheduling` → `MasterCatalog` → `Identity`; обратных зависимостей нет, взаимодействие «назад» — только через доменные события.

## 3. ER-карта (обзор)

```
                          ┌───────────────────────────── Identity ────────────────────────────┐
                          │  User (role: client|master|admin)                                 │
                          │   ├─1:1─ ClientProfile        ├─1:1─ MasterProfile                │
                          │   ├─1:1─ TelegramAccount       ├─1:N─ RefreshSession               │
                          │   ├─1:1─ NotificationSetting   ├─1:N─ Consent / AuthToken          │
                          └───────────────────────────────────────────────────────────────────┘
                                            │                        │
                    ┌───────────────────────┘                        └────────────────────────┐
                    ▼                                                                          ▼
        ┌── ClientProfile ──┐                                    ┌──────────── MasterProfile ────────────┐
        │ preferences       │                                    │ slug, displayName, bio, status        │
        │ stats (no-show)   │──N:M(Favorite)──▶ MasterProfile    │  ├─1:1─ MasterBookingPolicy           │
        └───────────────────┘                                    │  ├─1:1─ MasterStats (read model)      │
                                                                 │  ├─1:1─ MasterContact                 │
                                                                 │  ├─1:1─ MasterVerification            │
                                                                 │  ├─1:N─ MasterLocation ──▶ District   │
                                                                 │  ├─1:N─ Service ──▶ ServiceCategory   │
                                                                 │  ├─1:N─ PortfolioItem ──▶ MediaAsset  │
                                                                 │  ├─1:N─ MasterClient (книга клиентов) │
                                                                 │  └─1:N─ AvailabilityRule / Exception  │
                                                                 └───────────────────────────────────────┘
                                                                                   │
                     Scheduling: намерения ──▶ генератор ──▶ проекция              ▼
        AvailabilityRule ┐                                          ┌──────── TimeSlot ────────┐
        AvailabilityException ├──▶ SlotGenerator ─────────────────▶ │ status: open|held|booked │
        TimeBlock ┘                                                 │ |blocked, version       │
                                                                    └───────────┬──────────────┘
                                                                                │ N:M
                    ┌──────────── Booking ────────────┐   BookingSlot (unique slotId)
                    │ status FSM, snapshots, source   │◀──────────────┘
                    │  ├─1:N─ BookingEvent (аудит)    │
                    │  ├─N:1─ MasterClient (кто идёт) │
                    │  └─1:1─ Review                  │
                    └─────────────────────────────────┘
```

## 4. Схема БД: Identity и клиент

Соглашения: PK — `uuid` (`@default(uuid())`), у всех таблиц `createdAt`/`updatedAt` (ниже опущены для краткости), денежные поля — `Decimal(10,2)` + `currency` (в MVP всегда `BYN`), время — `timestamptz`, «минуты от начала суток» — `Int` 0…1440.

```prisma
enum UserRole      { client master admin }
enum UserStatus    { active blocked deleted }
enum AuthTokenKind { email_verify password_reset telegram_link }
enum ConsentKind   { terms privacy portfolio_publication marketing }

model User {
  id            String     @id @default(uuid())
  role          UserRole                        // задаётся при регистрации, меняется только админом
  status        UserStatus @default(active)
  email         String     @unique @db.Citext
  passwordHash  String
  emailVerified Boolean    @default(false)
  phone         String?    @unique              // E.164: +375XXXXXXXXX
  phoneVerified Boolean    @default(false)
  firstName     String
  lastName      String?
  avatarId      String?                          // MediaAsset
  locale        String     @default("ru")
  timezone      String     @default("Europe/Minsk")
  lastLoginAt   DateTime?
  deletedAt     DateTime?

  clientProfile ClientProfile?
  masterProfile MasterProfile?
  telegram      TelegramAccount?
  notifySetting NotificationSetting?
  sessions      RefreshSession[]
  authTokens    AuthToken[]
  consents      Consent[]

  @@index([role, status])
}

model RefreshSession {                            // одна строка = одно устройство
  id         String    @id @default(uuid())
  userId     String
  tokenHash  String    @unique                    // sha256 от refresh-токена
  familyId   String                               // цепочка ротации
  expiresAt  DateTime
  revokedAt  DateTime?
  replacedBy String?
  userAgent  String?
  ip         String?
  @@index([userId, revokedAt])
}

model AuthToken {                                  // одноразовые токены (письма, deep-link)
  id        String        @id @default(uuid())
  userId    String?
  kind      AuthTokenKind
  tokenHash String        @unique
  payload   Json?
  expiresAt DateTime
  usedAt    DateTime?
  @@index([userId, kind])
}

model TelegramAccount {
  id        String   @id @default(uuid())
  userId    String   @unique
  chatId    BigInt   @unique
  username  String?
  isBlocked Boolean  @default(false)              // выставляем при 403 от Telegram API
  linkedAt  DateTime @default(now())
}

model NotificationSetting {                        // одна строка на пользователя
  id                 String  @id @default(uuid())
  userId             String  @unique
  telegramEnabled    Boolean @default(true)
  emailEnabled       Boolean @default(true)
  reminder24hEnabled Boolean @default(true)
  reminder2hEnabled  Boolean @default(true)
  quietHoursEnabled  Boolean @default(true)       // 23:00–08:00, кроме reminder2h
  marketingEnabled   Boolean @default(false)
}

model Consent {                                    // журнал согласий (99-З)
  id        String      @id @default(uuid())
  userId    String
  kind      ConsentKind
  version   String                                 // версия документа, напр. "privacy-2026-07-01"
  grantedAt DateTime    @default(now())
  revokedAt DateTime?
  ip        String?
  @@index([userId, kind])
}

model ClientProfile {
  id                String   @id @default(uuid())
  userId            String   @unique
  birthDate         DateTime? @db.Date
  preferredDistricts Json?                         // [districtId] — для дефолтных фильтров
  defaultComment    String?                        // «всегда прошу короткую длину»
  // read-model статистика, обновляется событиями Booking
  bookingsTotal     Int      @default(0)
  bookingsCompleted Int      @default(0)
  cancellationsLate Int      @default(0)           // отмены позже cutoff
  noShowCount       Int      @default(0)
  lastBookingAt     DateTime?
  trustScore        Int      @default(100)         // 0..100, видит только мастер (защита от «отменяльщиков»)
  ratingAvg         Decimal  @default(0) @db.Decimal(3,2)
  ratingCount       Int      @default(0)
}

model Favorite {
  userId   String
  masterId String
  createdAt DateTime @default(now())
  @@id([userId, masterId])
  @@index([masterId])
}
```

**Решения и обоснования**
- `User.role` — обязательный enum. Кейс «клиент захотел стать мастером» решается не двумя ролями, а сменой роли + созданием `MasterProfile` (историю его клиентских броней сохраняем, доступ к клиентскому кабинету остаётся по факту наличия `ClientProfile`).
- Персональные поля (`firstName`, `phone`, `avatarId`) — в `User`, чтобы не дублировать их в двух профилях. В профилях только роль-специфичное.
- `ClientProfile.trustScore` — читается только мастером при просмотре брони; из публичных DTO исключён.
- `RefreshSession.familyId` даёт детекцию повторного использования украденного токена: при попытке использовать отозванный токен убиваем всю семью.

## 5. Схема БД: каталог мастера (разбитая модель)

Прежний «толстый» `MasterProfile` разбит по причинам изменения данных: витрина меняется редко, настройки записи — иногда, статистика — постоянно, локации — 1:N, верификация — отдельный жизненный цикл.

```prisma
enum MasterStatus       { draft pending_review published hidden banned }
enum LocationType       { salon home_studio client_home }
enum PriceType          { fixed from range }
enum VerificationStatus { none pending approved rejected }
enum ModerationStatus   { pending approved rejected }

model MasterProfile {
  id             String        @id @default(uuid())
  userId         String        @unique
  slug           String        @unique              // /m/anna-nails
  displayName    String
  headline       String?                            // «Мастер маникюра, 5 лет»
  bio            String?       @db.VarChar(1000)
  coverId        String?                            // MediaAsset
  experienceSince Int?                              // год начала работы
  languages      Json?                              // ["ru","en"]
  status         MasterStatus  @default(draft)
  publishedAt    DateTime?
  boostPriority  Int           @default(0)          // хук под платное продвижение (v2)

  contact        MasterContact?
  policy         MasterBookingPolicy?
  stats          MasterStats?
  verification   MasterVerification?
  locations      MasterLocation[]
  services       Service[]
  portfolio      PortfolioItem[]
  clients        MasterClient[]
  rules          AvailabilityRule[]
  exceptions     AvailabilityException[]
  blocks         TimeBlock[]
  slots          TimeSlot[]
  bookings       Booking[]
  reviews        Review[]

  @@index([status, boostPriority])
}

model MasterContact {
  id               String  @id @default(uuid())
  masterId         String  @unique
  publicPhone      String?                          // может отличаться от User.phone
  instagram        String?
  telegramUsername String?
  tiktok           String?
  website          String?
  preferredChannel String?                          // telegram|instagram|phone
}

model MasterLocation {                              // 1:N — мастер работает в 1–3 точках/районах
  id             String       @id @default(uuid())
  masterId       String
  districtId     String
  type           LocationType @default(salon)
  addressHint    String?                            // «ст.м. Каменная Горка»
  addressExact   String?                            // отдаётся только по confirmed брони
  lat            Float?
  lng            Float?
  isPrimary      Boolean      @default(false)
  travelRadiusKm Int?                               // для type = client_home
  travelFee      Decimal?     @db.Decimal(10,2)
  @@index([districtId])
  @@index([masterId, isPrimary])
}

model District {
  id        String @id @default(uuid())
  city      String @default("Minsk")
  name      String                                  // «Фрунзенский»
  slug      String @unique                          // frunzenskiy
  sort      Int    @default(0)
  locations MasterLocation[]
  @@unique([city, name])
}

model MasterBookingPolicy {                         // всё, что влияет на генерацию слотов и правила брони
  id                   String  @id @default(uuid())
  masterId             String  @unique
  granularityMin       Int     @default(30)         // шаг сетки слотов: 15|30|60
  bufferBeforeMin      Int     @default(0)
  bufferAfterMin       Int     @default(0)
  minLeadTimeMin       Int     @default(180)        // нельзя записаться «через 10 минут»
  maxHorizonDays       Int     @default(30)
  autoConfirm          Boolean @default(false)
  holdTtlSec           Int     @default(600)        // сколько живёт удержание слота при оформлении
  clientCancelCutoffMin Int    @default(720)        // 12 ч
  clientRescheduleAllowed Boolean @default(true)
  maxActiveBookingsPerClient Int @default(3)
  pendingExpiresMin    Int     @default(720)        // неподтверждённая бронь истекает
}

model MasterStats {                                  // read model: пишет только воркер/сервис статистики
  id                String   @id @default(uuid())
  masterId          String   @unique
  ratingAvg         Decimal  @default(0) @db.Decimal(3,2)   // среднее опубликованных оценок
  ratingCount       Int      @default(0)
  ratingHistogram   Json?                                   // {"5":12,"4":3,...}
  priceMin          Decimal? @db.Decimal(10,2)
  priceMax          Decimal? @db.Decimal(10,2)
  servicesCount     Int      @default(0)
  portfolioCount    Int      @default(0)
  bookingsCompleted Int      @default(0)
  noShowRate        Decimal  @default(0) @db.Decimal(5,2)
  nextAvailableAt   DateTime?                                // ключ фильтра «свободно завтра»
  profileViews30d   Int      @default(0)
  recalculatedAt    DateTime @default(now())
  @@index([ratingAvg])
  @@index([nextAvailableAt])
  @@index([priceMin])
}

model MasterVerification {
  id             String             @id @default(uuid())
  masterId       String             @unique
  status         VerificationStatus @default(none)
  method         String?                                     // document|bookings_threshold|manual
  documentId     String?                                     // MediaAsset (приватный бакет)
  reviewedBy     String?
  reviewedAt     DateTime?
  rejectionReason String?
}

model ServiceCategory {
  id       String @id @default(uuid())
  parentId String?                                   // 2 уровня: «Ногти» → «Маникюр»
  name     String
  slug     String @unique
  icon     String?
  sort     Int    @default(0)
  services Service[]
  @@index([parentId, sort])
}

model Service {
  id             String    @id @default(uuid())
  masterId       String
  categoryId     String
  title          String
  description    String?
  durationMin    Int                                  // основа расчёта окон
  bufferAfterMin Int       @default(0)                // override поверх политики мастера
  price          Decimal   @db.Decimal(10,2)
  priceMax       Decimal?  @db.Decimal(10,2)          // для priceType = range
  priceType      PriceType @default(fixed)
  currency       String    @default("BYN")
  isActive       Boolean   @default(true)
  sort           Int       @default(0)
  bookings       Booking[]
  portfolio      PortfolioItem[]
  @@index([masterId, isActive, sort])
  @@index([categoryId, price])
}

model MediaAsset {                                     // единая точка для всех изображений
  id            String           @id @default(uuid())
  ownerUserId   String?
  purpose       String                                  // avatar|cover|portfolio|review|document|chat
  storageKey    String           @unique
  variants      Json                                    // {"320":"key_320.avif","720":...,"1440":...}
  mimeType      String
  bytes         Int
  width         Int
  height        Int
  blurhash      String?
  checksum      String?                                 // sha256 — дубликаты и защита от чужих фото
  moderation    ModerationStatus @default(pending)
  deletedAt     DateTime?
  @@index([ownerUserId, purpose])
  @@index([checksum])
}

model PortfolioItem {
  id        String   @id @default(uuid())
  masterId  String
  mediaId   String
  serviceId String?
  caption   String?
  sort      Int      @default(0)
  isCover   Boolean  @default(false)
  deletedAt DateTime?
  @@index([masterId, sort])
  @@index([serviceId])
}
```

**Почему именно так**
- `MasterBookingPolicy` отдельно: генератор слотов и `BookingService` читают только её (маленькая строка, часто в кэше), не подтягивая витрину.
- `MasterStats` отдельно: пишется часто и другим владельцем (воркер), не конфликтует с редактированием профиля мастером; каталог сортирует и фильтрует по её индексам.
- `MasterLocation` 1:N: сразу решает «мастер работает в двух районах» и «выезд на дом» без переделки схемы, и даёт нормальные фильтры по району (join, а не JSON).
- `MediaAsset` единая: одна логика загрузки/вариантов/модерации для аватара, портфолио, фото отзывов, документов верификации и вложений чата (v1.1).
- `boostPriority` в профиле + `Plan/Subscription/Promotion` (§9) — заготовка под монетизацию v2 (подписка + продвижение в выдаче), сейчас всегда 0 и в сортировке участвует как последний ключ.

## 6. Схема БД: Scheduling (намерения → слоты)

Три таблицы намерений и одна проекция. Мастер работает с намерениями («будни 10–20», «3 августа не работаю», «обед 13:15–13:45»), а клиент и календарь читают `TimeSlot`.

```prisma
enum ExceptionType { day_off custom_hours }
enum BlockReason   { break lunch personal vacation sick travel other }
enum SlotStatus    { open held booked blocked }

model AvailabilityRule {                            // недельный шаблон, до 3 интервалов в день
  id         String    @id @default(uuid())
  masterId   String
  weekday    Int                                    // 1=Mon … 7=Sun
  startMin   Int                                    // 600 = 10:00 (локально Europe/Minsk)
  endMin     Int                                    // 1200 = 20:00
  activeFrom DateTime? @db.Date                     // смена графика «с 1 сентября»
  activeTo   DateTime? @db.Date
  @@index([masterId, weekday])
}

model AvailabilityException {                        // переопределение конкретной даты
  id       String        @id @default(uuid())
  masterId String
  date     DateTime      @db.Date
  type     ExceptionType
  startMin Int?                                      // для custom_hours
  endMin   Int?
  note     String?
  @@unique([masterId, date])
}

model TimeBlock {                                    // занятость вне записей: обед, учёба, отпуск
  id        String      @id @default(uuid())
  masterId  String
  startsAt  DateTime                                 // timestamptz, может быть вне сетки
  endsAt    DateTime
  reason    BlockReason @default(other)
  note      String?
  createdById String?
  @@index([masterId, startsAt])
}

model TimeSlot {                                     // ПРОЕКЦИЯ: атомарная гранула сетки мастера
  id           String     @id @default(uuid())
  masterId     String
  startsAt     DateTime
  endsAt       DateTime                              // startsAt + policy.granularityMin
  status       SlotStatus @default(open)
  version      Int        @default(0)                // оптимистичная блокировка для UI
  holdId       String?                               // активное удержание (см. §11)
  holdExpiresAt DateTime?
  bookingId    String?                               // денормализация для быстрого календаря
  blockId      String?                               // если status = blocked
  note         String?                               // заметка мастера к окну
  isExtra      Boolean    @default(false)            // окно добавлено вручную вне графика
  outsideSchedule Boolean @default(false)            // занято, но график изменился → предупреждение мастеру
  bookingLinks BookingSlot[]

  @@unique([masterId, startsAt])                     // одна гранула на время у мастера
  @@index([masterId, startsAt, status])
  @@index([masterId, status, startsAt])
}
```

### Почему слот всё-таки материализуем

Первая версия PRD считала окна на лету. Пересмотрено в пользу гибридной схемы (намерения + проекция), потому что:

| Требование | На лету | Материализованный `TimeSlot` |
|---|---|---|
| Фильтр каталога «свободно завтра» по 500 мастерам | считать доступность для всех → 2–5 с | один `EXISTS` по индексу → десятки мс |
| Атомарный захват окна при параллельных бронях | нужен advisory-lock по мастеру (сериализует всех) | `SELECT … FOR UPDATE` по конкретным строкам |
| Удержание слота на время оформления (hold) | негде хранить | `status = held` + TTL |
| Заметка/пометка мастера на конкретном окне | негде хранить | `note`, `blockId`, `isExtra` |
| «Помечено вручную из директа» вне сетки | отдельная сущность | синтетическая гранула `isExtra` |
| Оптимистичное обновление календаря в UI | нет идентичности объекта | стабильный `id` + `version` |

Цена: генератор и его инварианты (§10) + объём строк. Оценка: рабочий день 10 ч при шаге 30 мин = 20 гранул/день, горизонт 30 дней = 600 строк на мастера; 1000 мастеров = 600 тыс. строк, ~50 МБ с индексами. Прошлое старше 30 дней вычищается cron-задачей.

## 7. Схема БД: Booking и книга клиентов мастера

```prisma
enum BookingStatus  { hold pending confirmed completed cancelled_by_client cancelled_by_master no_show expired }
enum BookingSource  { client_web master_manual admin }
enum ContactChannel { instagram telegram phone walk_in site other }
enum ActorType      { client master admin system }

model MasterClient {                                 // «клиент, которого привёл мастер» + CRM-карточка
  id          String          @id @default(uuid())
  masterId    String
  userId      String?                                 // заполнен, если у человека есть аккаунт
  name        String
  phone       String?                                 // E.164
  note        String?                                 // приватная заметка мастера
  tags        Json?                                   // ["постоянный","аллергия"]
  source      ContactChannel?
  visitsCount Int             @default(0)
  totalSpent  Decimal         @default(0) @db.Decimal(10,2)
  lastVisitAt DateTime?
  isBlocked   Boolean         @default(false)         // мастер может забанить клиента
  bookings    Booking[]

  @@unique([masterId, userId])                        // один аккаунт = одна карточка у мастера
  @@index([masterId, phone])
  @@index([masterId, name])
}

model Booking {
  id                   String        @id @default(uuid())
  masterId             String
  masterClientId       String                          // ВСЕГДА есть: и для онлайн, и для ручной записи
  clientUserId         String?                         // денормализация для «мои записи» клиента
  serviceId            String?                         // null, если услугу удалили — остаётся снапшот
  // снапшоты на момент создания
  serviceTitle         String
  serviceDurationMin   Int
  bufferMin            Int           @default(0)
  priceAmount          Decimal       @db.Decimal(10,2)
  currency             String        @default("BYN")
  // время: endsAt = startsAt + serviceDurationMin + bufferMin (занятость),
  // клиенту показываем startsAt + serviceDurationMin
  startsAt             DateTime
  endsAt               DateTime
  status               BookingStatus @default(hold)
  source               BookingSource @default(client_web)
  channel              ContactChannel?                 // откуда пришла ручная запись
  clientComment        String?                         // видит мастер
  masterNote           String?                         // приватно, никогда не в клиентских DTO
  holdId               String?       @unique
  holdExpiresAt        DateTime?
  idempotencyKey       String?       @unique
  version              Int           @default(0)
  confirmedAt          DateTime?
  completedAt          DateTime?
  cancelledAt          DateTime?
  cancelledByType      ActorType?
  cancelReason         String?
  rescheduledFromId    String?       @unique
  createdByUserId      String?
  // заготовка под v2 (оплата/депозит)
  depositAmount        Decimal?      @db.Decimal(10,2)
  paymentStatus        String?

  slots                BookingSlot[]
  events               BookingEvent[]
  reviews              Review[]

  @@index([masterId, startsAt])
  @@index([clientUserId, startsAt])
  @@index([masterClientId, startsAt])
  @@index([status, startsAt])                          // для cron-джобов (expire, autocomplete)
}

model BookingSlot {                                    // N:M бронь ↔ гранулы
  bookingId String
  slotId    String   @unique                           // ИНВАРИАНТ: слот принадлежит максимум одной активной брони
  booking   Booking  @relation(fields: [bookingId], references: [id], onDelete: Cascade)
  slot      TimeSlot @relation(fields: [slotId], references: [id], onDelete: Cascade)
  @@id([bookingId, slotId])
}

model BookingEvent {                                   // полный аудит жизненного цикла
  id         String         @id @default(uuid())
  bookingId  String
  actorType  ActorType
  actorId    String?
  fromStatus BookingStatus?
  toStatus   BookingStatus
  payload    Json?                                     // {reason, oldStartsAt, newStartsAt, ...}
  createdAt  DateTime       @default(now())
  @@index([bookingId, createdAt])
}
```

**Ключевые решения**
- **`MasterClient` как единая «личность в книге мастера».** У любой брони есть `masterClientId`, независимо от наличия аккаунта. Онлайн-бронь клиента с аккаунтом создаёт/находит карточку по `userId`; ручная запись из директа — по телефону или создаёт новую. Это даёт: единый список клиентов мастера, заметки и историю по любому клиенту, и естественную склейку гостя с аккаунтом позже (по номеру телефона, с подтверждением).
- **`endsAt` включает буфер.** Так интервал брони = интервал занятости, и один констрейнт закрывает пересечения. Для отображения клиенту используем `serviceDurationMin`.
- **`hold` — статус брони, а не отдельная таблица.** Удержание проходит через тот же уникальный `BookingSlot.slotId`, значит защита от гонки одна и та же для удержания и подтверждения; и появляется путь к платежам v2 (hold → оплата → confirmed) без изменения модели.
- **`version` + `status`-guard в `UPDATE`** дают защиту от параллельных изменений одной брони (мастер отменяет в вебе, одновременно нажимает «Отменить» в Telegram).

## 8. Схема БД: отзывы, уведомления, модерация, биллинг (v2)

```prisma
enum ReviewStatus { pending_review published rejected hidden }
enum ReviewAuthorRole { client master }
enum OutboxStatus { pending processing done failed }
enum NotifyChannel { telegram email }
enum NotifyStatus  { queued sent failed skipped }

model Review {
  id           String           @id @default(uuid())
  bookingId    String
  authorRole   ReviewAuthorRole
  masterId     String
  clientUserId String
  rating       Int?                                   // null или 1..5; комментарий без оценки допустим для master→client
  text         String?          @db.VarChar(800)
  serviceTitle String                                 // снимок услуги на момент отзыва
  status       ReviewStatus     @default(pending_review)
  masterReply  String?          @db.VarChar(500)
  repliedAt    DateTime?
  photos       ReviewPhoto[]
  @@unique([bookingId, authorRole])                   // по одному отзыву с каждой стороны
  @@index([masterId, authorRole, status, createdAt])
  @@index([clientUserId, authorRole, status, createdAt])
}

// Публичный каталог и /m/[slug] показывают только authorRole=client + published + rating != null.
// Комментарий мастера без оценки (rating IS NULL) в среднее не входит.


model ReviewPhoto {
  reviewId String
  mediaId  String
  sort     Int    @default(0)
  @@id([reviewId, mediaId])
}

model OutboxEvent {                                   // транзакционная публикация доменных событий
  id          String       @id @default(uuid())
  type        String                                  // booking.created, booking.cancelled, review.published…
  aggregate   String                                  // booking:<id>
  payload     Json
  status      OutboxStatus @default(pending)
  attempts    Int          @default(0)
  lastError   String?
  availableAt DateTime     @default(now())
  processedAt DateTime?
  @@index([status, availableAt])
}

model NotificationLog {
  id         String        @id @default(uuid())
  userId     String
  channel    NotifyChannel
  template   String                                   // booking_created_master, reminder_24h_client…
  bookingId  String?
  dedupeKey  String        @unique                    // "reminder_24h:<bookingId>" → защита от дублей
  jobId      String?                                  // BullMQ jobId для отмены
  status     NotifyStatus  @default(queued)
  sentAt     DateTime?
  error      String?
  @@index([userId, createdAt])
  @@index([bookingId])
}

model ModerationTask {
  id         String           @id @default(uuid())
  entityType String                                   // master_profile | media | review
  entityId   String
  status     ModerationStatus @default(pending)
  assigneeId String?
  decision   String?
  comment    String?
  decidedAt  DateTime?
  @@index([status, entityType, createdAt])
  @@unique([entityType, entityId])
}

model Report {                                        // жалоба пользователя
  id           String  @id @default(uuid())
  reporterId   String?
  entityType   String
  entityId     String
  reason       String
  comment      String?
  resolvedAt   DateTime?
  @@index([entityType, entityId])
}

model AuditLog {
  id        String   @id @default(uuid())
  actorId   String?
  actorType ActorType
  action    String                                    // master.ban, review.hide, booking.force_cancel
  entity    String
  entityId  String
  payload   Json?
  ip        String?
  createdAt DateTime @default(now())
  @@index([entity, entityId])
  @@index([actorId, createdAt])
}
```

**Монетизация (решение по открытому вопросу №3): подписка + платное продвижение, релиз v2.** Модель: базовый функционал мастера бесплатен всегда (иначе не наберём каталог), платные — (1) подписка «Про» (расширенные лимиты портфолио, аналитика, приоритет в выдаче), (2) разовый boost позиции в каталоге/районе на N дней (модель Kufar), (3) позже — реклама/спецразмещение на посадочных страницах. Схема-заготовка (создаётся миграцией в v2, здесь для фиксации формы):

```prisma
model Plan         { id String @id code String @unique title String priceMonth Decimal features Json isActive Boolean }
model Subscription { id String @id masterId String planId String status String startsAt DateTime endsAt DateTime autoRenew Boolean paymentId String? }
model Promotion    { id String @id masterId String kind String placement String districtId String? startsAt DateTime endsAt DateTime priority Int paymentId String? }
model Payment      { id String @id userId String provider String externalId String? amount Decimal currency String status String payload Json? }
```
Хук в текущей схеме уже есть: `MasterProfile.boostPriority` (последний ключ сортировки каталога) — в MVP всегда 0.

## 9. SQL-инварианты, индексы, чистка

Всё это уходит в `packages/db/migrations` как ручные SQL-блоки поверх Prisma-миграций.

```sql
CREATE EXTENSION IF NOT EXISTS btree_gist;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS citext;

-- 1. Никаких пересекающихся активных броней у одного мастера (в т.ч. ручных вне сетки)
ALTER TABLE "Booking" ADD CONSTRAINT booking_no_overlap
  EXCLUDE USING gist ("masterId" WITH =, tstzrange("startsAt","endsAt",'[)') WITH &&)
  WHERE (status IN ('hold','pending','confirmed'));

-- 2. Никаких пересекающихся блокировок
ALTER TABLE "TimeBlock" ADD CONSTRAINT block_no_overlap
  EXCLUDE USING gist ("masterId" WITH =, tstzrange("startsAt","endsAt",'[)') WITH &&);

-- 3. Здравость интервалов
ALTER TABLE "Booking"   ADD CONSTRAINT booking_time_sane  CHECK ("endsAt" > "startsAt");
ALTER TABLE "TimeSlot"  ADD CONSTRAINT slot_time_sane     CHECK ("endsAt" > "startsAt");
ALTER TABLE "TimeBlock" ADD CONSTRAINT block_time_sane    CHECK ("endsAt" > "startsAt");
ALTER TABLE "AvailabilityRule" ADD CONSTRAINT rule_sane
  CHECK ("startMin" >= 0 AND "endMin" <= 1440 AND "endMin" > "startMin");

-- 4. Значения, на которые опирается генератор
ALTER TABLE "MasterBookingPolicy" ADD CONSTRAINT policy_granularity
  CHECK ("granularityMin" IN (15,30,60));
ALTER TABLE "Review" ADD CONSTRAINT review_rating_range
  CHECK ("rating" IS NULL OR ("rating" BETWEEN 1 AND 5));
ALTER TABLE "Service" ADD CONSTRAINT service_duration_step
  CHECK ("durationMin" > 0 AND "durationMin" % 15 = 0);

-- 5. Один телефон = одна карточка клиента у мастера (частичный уникальный)
CREATE UNIQUE INDEX master_client_phone_uniq
  ON "MasterClient" ("masterId", phone) WHERE phone IS NOT NULL;

-- 6. Горячий путь каталога: «есть свободное окно в диапазоне»
CREATE INDEX slot_open_lookup ON "TimeSlot" ("masterId","startsAt")
  WHERE status = 'open';
CREATE INDEX slot_hold_sweep ON "TimeSlot" ("holdExpiresAt")
  WHERE status = 'held';

-- 7. Поиск по имени мастера и названию услуги
CREATE INDEX master_name_trgm  ON "MasterProfile" USING gin (lower("displayName") gin_trgm_ops);
CREATE INDEX service_title_trgm ON "Service"      USING gin (lower(title) gin_trgm_ops);

-- 8. Cron-чистка проекции (ежедневно): прошлое не нужно, аудит живёт в Booking
DELETE FROM "TimeSlot" WHERE "startsAt" < now() - interval '30 days';
```

**Почему нужны и `TimeSlot`, и `EXCLUDE` на `Booking`.** Гранулы защищают сетевой онлайн-сценарий и дают UI-состояния; `EXCLUDE` — это последний рубеж, который работает даже для ручных броней вне сетки, для миграций и для любого будущего кода, который забудет про гранулы. Один инвариант не заменяет другой.

## 10. Генератор слотов (`SlotGeneratorService`)

**Контракт:** `ensureSlots(masterId, from, to)` идемпотентен и безопасен для повторного запуска.

```
1. policy   = MasterBookingPolicy(masterId)
2. horizon  = [max(today, from) … min(today + policy.maxHorizonDays, to)]
3. для каждой даты D в horizon (в зоне Europe/Minsk):
     exception = AvailabilityException(masterId, D)
     if exception?.type == day_off        → intervals = []
     elif exception?.type == custom_hours → intervals = [exception.start..exception.end]
     else                                 → intervals = AvailabilityRule(weekday(D), activeFrom/To ⊇ D)
     intervals = intervals − TimeBlock(D)                      // обед/учёба вырезаются
     granules  = для каждого интервала: сетка от начала интервала шагом policy.granularityMin,
                 отбросить хвост короче granularityMin
4. UPSERT ON CONFLICT (masterId, startsAt) DO NOTHING           // новые окна
5. DELETE открытые гранулы, которых больше нет в расписании     // только status='open'
6. UPDATE outsideSchedule = true для booked/held гранул вне расписания  // мастеру — предупреждение
7. UPDATE MasterStats.nextAvailableAt = MIN(startsAt) WHERE status='open' AND startsAt > now()+leadTime
```

**Триггеры запуска (job `slots.ensure` с `jobId = master:<id>` и дебаунсом 5 с):**
- cron 03:10 ежедневно — прокатка горизонта на новый день + чистка прошлого;
- изменение `AvailabilityRule` / `AvailabilityException` / `TimeBlock` / `MasterBookingPolicy`;
- публикация профиля мастера;
- отмена/истечение брони — освобождение гранул (выполняется сразу в транзакции отмены, генератор только досыпает горизонт).

**Правила выравнивания.** Сетка считается от начала рабочего интервала, а не от полуночи: мастер с интервалом 10:15–19:00 и шагом 30 получит 10:15, 10:45… Это ожидаемое поведение для бьюти-графиков и оно объяснимо в UI.

**Что генератор НЕ делает:** не удаляет и не двигает занятые гранулы, не отменяет брони, не пишет в `Booking`. Любой конфликт нового графика с существующими записями — это предупреждение мастеру («2 записи вне нового графика») и его решение.

## 11. Протокол бронирования и защита от race condition

Дизайн повторяет то, что делают Airbnb/Booking.com: **инвентарь-строки + пессимистичная блокировка на короткой транзакции + удержание с TTL + идемпотентность + транзакционный outbox**.

### 11.1 Фаза 1 — удержание (`POST /bookings/holds`)

```sql
BEGIN;
SET LOCAL lock_timeout = '3s';
SET LOCAL statement_timeout = '5s';

-- 1. настройки и услуга (read committed достаточно: они меняются редко и проверяются повторно)
SELECT * FROM "MasterBookingPolicy" WHERE "masterId" = $master;
SELECT * FROM "Service" WHERE id = $service AND "masterId" = $master AND "isActive";

-- 2. упорядоченный захват нужных гранул: ORDER BY гарантирует один порядок блокировок
--    у всех конкурентов → deadlock невозможен
SELECT id, status, "holdExpiresAt", version
  FROM "TimeSlot"
 WHERE "masterId" = $master
   AND "startsAt" >= $startsAt
   AND "startsAt" <  $endsAt          -- endsAt = startsAt + duration + buffer
 ORDER BY "startsAt"
 FOR UPDATE;

-- 3. проверки в коде: гранул ровно ceil(need/granularity), они непрерывны,
--    каждая open ИЛИ (held И holdExpiresAt < now()),
--    startsAt >= now() + minLeadTimeMin, startsAt <= now() + maxHorizonDays,
--    у клиента < maxActiveBookingsPerClient активных броней, клиент не в isBlocked

-- 4. захват
UPDATE "TimeSlot"
   SET status='held', "holdId"=$hold, "holdExpiresAt"=now() + $ttl, version = version + 1
 WHERE id = ANY($slotIds);

INSERT INTO "Booking" (..., status='hold', "holdId"=$hold, "holdExpiresAt"=now()+$ttl,
                       "idempotencyKey"=$key, "serviceTitle"=…, "priceAmount"=…);
INSERT INTO "BookingSlot" ("bookingId","slotId") SELECT $booking, unnest($slotIds);
COMMIT;
```

Ответ: `{ bookingId, holdExpiresAt, summary }`. Клиент видит таймер «место держим 10 минут».

### 11.2 Фаза 2 — подтверждение (`POST /bookings/:id/confirm`)

```
BEGIN;
  UPDATE "Booking" SET status = CASE WHEN $autoConfirm THEN 'confirmed' ELSE 'pending' END,
         "clientComment" = $comment, "holdExpiresAt" = NULL, "confirmedAt" = …, version = version + 1
   WHERE id = $id AND status = 'hold' AND "holdExpiresAt" > now();     -- 0 строк → 410 HOLD_EXPIRED
  UPDATE "TimeSlot" SET status='booked', "bookingId"=$id, "holdId"=NULL, "holdExpiresAt"=NULL,
         version = version + 1
   WHERE id IN (SELECT "slotId" FROM "BookingSlot" WHERE "bookingId" = $id);
  INSERT INTO "BookingEvent" (…);
  INSERT INTO "OutboxEvent" (type='booking.created', payload=…);       -- уведомления только после COMMIT
COMMIT;
```

### 11.3 Истечение удержания

Два независимых механизма (второй — backstop, если очередь потеряла задачу):
1. BullMQ delayed job `hold:expire:<bookingId>` на `holdExpiresAt`.
2. Cron каждую минуту: `UPDATE "TimeSlot" SET status='open', holdId=NULL … WHERE status='held' AND holdExpiresAt < now()` + `Booking.status='expired'` (по индексу `slot_hold_sweep`).

### 11.4 Ручная запись мастером (может быть вне сетки)

```
BEGIN;
  SELECT id, status FROM "TimeSlot"
    WHERE "masterId"=$m AND "startsAt" < $end AND "endsAt" > $start ORDER BY "startsAt" FOR UPDATE;
  -- запрет: есть гранула booked ИЛИ held с активным TTL (чужое оформление) → 409
  masterClient = upsert(MasterClient by (masterId, userId|phone|name))
  INSERT INTO "Booking" (status = 'confirmed', source='master_manual', channel=$channel, …);
      -- EXCLUDE-констрейнт ловит пересечение с любой активной бронью, даже вне гранул
  для каждой перекрытой гранулы → status='booked', bookingId=…
  если гранул нет (вне графика) → INSERT синтетические гранулы isExtra=true, status='booked'
  INSERT BookingEvent + OutboxEvent('booking.created_manual')
COMMIT;
```

### 11.5 Отмена и перенос

- **Отмена:** `UPDATE Booking SET status=$cancelStatus … WHERE id=$id AND status IN ('hold','pending','confirmed')` (0 строк → 409 `INVALID_STATE`); гранулы будущего → `open` (или `DELETE` синтетических `isExtra`); `DELETE FROM "BookingSlot"`; отмена джобов напоминаний по `jobId` из `NotificationLog`; `OutboxEvent('booking.cancelled')`.
- **Перенос:** одна транзакция = отмена старой (`cancelled_by_master`, `rescheduledTo`) + создание новой сразу в `confirmed` со ссылкой `rescheduledFromId`. Гранулы старого времени освобождаются, нового — захватываются тем же протоколом §11.1.

### 11.6 Матрица гонок

| Сценарий | Что защищает | Ответ API |
|---|---|---|
| Два клиента жмут «Забронировать» на одно окно | `FOR UPDATE` на гранулах + `UNIQUE BookingSlot.slotId` | 409 `SLOT_TAKEN` + свежий список окон |
| Клиент бронирует, мастер в это же время ставит блок | `FOR UPDATE` (кто первый) | проигравший получает 409, мастер видит «окно только что забронировали» |
| Клиент дважды тапнул кнопку (ретрай сети) | `Idempotency-Key` + `Booking.idempotencyKey UNIQUE` | 200 с той же бронью |
| Ручная бронь мастера пересекает онлайн-бронь вне сетки | `EXCLUDE` на `Booking` | 409 `TIME_OVERLAP` |
| Мастер отменяет из веба и из Telegram одновременно | `status`-guard в `UPDATE` + `version` | второй получает 409 `INVALID_STATE` |
| Генератор пересчитывает слоты во время брони | генератор не трогает не-`open` гранулы; захват идёт под `FOR UPDATE` | нет конфликта |
| Удержание брошено (клиент закрыл вкладку) | TTL + delayed job + cron-sweeper | окно возвращается в `open` |
| Дубль напоминания при рестарте воркера | `NotificationLog.dedupeKey UNIQUE` + `jobId` | второй отправки нет |
| Событие «бронь создана» при откате транзакции | `OutboxEvent` в той же транзакции | события просто нет |

**Тестовый минимум (в CI обязателен):** 20 параллельных `POST /bookings/holds` на одно окно → ровно один 201, девятнадцать 409, ноль расхождений между `TimeSlot.status` и `BookingSlot`; k6-сценарий на 50 RPS `availability` без «фантомных» окон.

---

# BACKEND

## 12. Слои и структура `apps/api`

Четыре слоя внутри каждого модуля. Правило: наружу смотрит только `api/`, БД знает только `infra/`, бизнес-правила не знают ни про HTTP, ни про Prisma.

```
apps/api/src/
├─ main.ts                     # Fastify adapter, helmet, CORS, cookie, graceful shutdown
├─ app.module.ts
├─ common/
│  ├─ prisma/                  # PrismaService + TransactionManager (AsyncLocalStorage)
│  ├─ errors/                  # DomainError + коды + ExceptionFilter → HTTP
│  ├─ auth/                    # JwtGuard, RolesGuard, @CurrentUser(), @Roles()
│  ├─ pipes/                   # ZodValidationPipe (схемы из @lustra/contracts)
│  ├─ idempotency/             # IdempotencyInterceptor (Redis + БД)
│  ├─ time/                    # ClockService (инъекция «сейчас» → тестируемость), tz-хелперы
│  ├─ cache/                   # RedisCache + инвалидация по тегам
│  └─ observability/           # Pino, requestId, Sentry, метрики
├─ modules/
│  ├─ auth/          api/ app/ domain/ infra/
│  ├─ users/
│  ├─ clients/
│  ├─ masters/       (profile, contact, locations, policy, verification)
│  ├─ services/
│  ├─ media/
│  ├─ catalog/       (публичное чтение: поиск, карточки, availability)
│  ├─ scheduling/    (rules, exceptions, blocks, SlotGenerator, AvailabilityQuery)
│  ├─ bookings/      (hold, confirm, manual, cancel, reschedule, FSM)
│  ├─ reviews/
│  ├─ notifications/ (Outbox → Telegram/Email, шаблоны)
│  ├─ telegram/      (Telegraf webhook, deep-link, инлайн-кнопки)
│  ├─ moderation/
│  └─ admin/
├─ jobs/                       # BullMQ processors: slots, notifications, outbox, maintenance
└─ health/
```

Пример границ на модуле `bookings`:

```
bookings/
├─ api/
│  ├─ client-bookings.controller.ts     # POST /bookings/holds, /:id/confirm, /:id/cancel
│  ├─ master-bookings.controller.ts     # ручная запись, confirm/complete/no-show/reschedule
│  └─ dto/                              # ре-экспорт zod-схем из contracts + swagger-декораторы
├─ app/
│  ├─ hold-slot.usecase.ts              # транзакция §11.1
│  ├─ confirm-booking.usecase.ts
│  ├─ create-manual-booking.usecase.ts
│  ├─ cancel-booking.usecase.ts
│  ├─ reschedule-booking.usecase.ts
│  └─ complete-booking.usecase.ts
├─ domain/
│  ├─ booking-status.machine.ts          # чистая функция: (from, action, ctx) → to | DomainError
│  ├─ booking-policy.rules.ts            # lead time, cutoff, лимиты — чистые функции
│  └─ booking.events.ts                  # типы доменных событий
└─ infra/
   ├─ booking.repository.ts              # Prisma + raw SQL для FOR UPDATE
   ├─ slot.repository.ts
   └─ master-client.repository.ts
```

**Почему use-case-классы, а не «толстые сервисы».** Каждая операция брони — это своя транзакция со своим набором инвариантов. Класс на операцию даёт: один публичный метод `execute(input)`, явные зависимости в конструкторе, юнит-тест без HTTP и без Postgres (репозитории мокаются), и понятную точку, где открывается транзакция. Именно здесь обычно рождается спагетти, поэтому границы жёсткие.

## 13. Каталог use-cases (что именно кодим)

| Модуль | Use-cases |
|---|---|
| `auth` | Register · Login · RefreshTokens · Logout · VerifyEmail · RequestPasswordReset · ResetPassword |
| `users` | UpdateProfile · UpdateNotificationSettings · DeleteAccount (soft + анонимизация) · ExportMyData |
| `masters` | CreateMasterProfile · UpdateProfile · UpsertContact · UpsertLocations · UpdateBookingPolicy · SubmitForReview · Publish/Unpublish · RequestVerification |
| `services` | CreateService · UpdateService · ToggleActive · ReorderServices · ListServiceTemplates |
| `media` | IssueUploadUrl · RegisterAsset · AttachPortfolioItem · ReorderPortfolio · DeleteAsset |
| `scheduling` | ReplaceWeeklyRules · UpsertException · CreateBlock · DeleteBlock · AddExtraSlot · UpdateSlotNote · EnsureSlots (job) · GetAvailability |
| `bookings` | HoldSlot · ConfirmBooking · CreateManualBooking · CancelBooking (client/master) · RescheduleBooking · CompleteBooking · MarkNoShow · ExpireHolds (job) · AutoComplete (job) · ExpirePending (job) |
| `catalog` | SearchMasters · GetMasterPublicPage · GetFilterFacets · GetSitemapEntries · TrackProfileView |
| `reviews` | CreateReview · CreateMasterClientReview · ListClientReviews · ReplyToReview · ModerateReview · RecalculateMasterRating · RecalculateClientRating |
| `notifications` | PublishOutbox (job) · SendTelegram · SendEmail · ScheduleReminders · CancelReminders |
| `telegram` | HandleUpdate · LinkAccount · HandleInlineAction (confirm/cancel) · UnlinkAccount |
| `moderation` | ListQueue · DecideModeration · BanMaster · HideReview · ResolveReport |

## 14. Транзакции, события, очереди

**Транзакции.** `TransactionManager.run(async (tx) => …)` кладёт `tx` в `AsyncLocalStorage`; репозитории берут клиент из контекста, поэтому use-case не протаскивает `tx` через 5 слоёв. Правила: транзакция короткая (никаких HTTP-вызовов, отправок в Telegram, загрузок файлов внутри), `lock_timeout = 3s`, изоляция `READ COMMITTED` (сериализуемость нам не нужна, инварианты закрыты блокировками и констрейнтами), блокировки берутся **всегда в одном порядке** (`ORDER BY startsAt`).

**Доменные события через Outbox.**
```
use-case → (в той же транзакции) INSERT OutboxEvent → COMMIT
OutboxWorker (каждую секунду):
  SELECT * FROM "OutboxEvent" WHERE status='pending' AND availableAt <= now()
    ORDER BY "createdAt" FOR UPDATE SKIP LOCKED LIMIT 50;
  → публикация в BullMQ (notifications, stats, cache-invalidation)
  → status='done' | attempts+1, availableAt = now() + backoff(attempts), при attempts>8 → 'failed' + алерт
```

**Очереди BullMQ.**

| Очередь | Задачи | `jobId` | Ретраи |
|---|---|---|---|
| `slots` | `ensure` (генерация горизонта), `cleanup` | `slots:ensure:<masterId>` (дебаунс 5 с) | 3, экспон. |
| `bookings` | `hold.expire`, `pending.expire`, `autocomplete`, `review.request` | `hold:expire:<bookingId>` | 5 |
| `notifications` | `telegram.send`, `email.send`, `reminder.24h`, `reminder.2h` | `notify:<template>:<bookingId>:<userId>` | 5, backoff 30 с→10 мин |
| `stats` | `master.recalc`, `client.recalc`, `catalog.next_available` | `stats:master:<id>` | 3 |
| `outbox` | `publish` (repeatable, 1 с) | — | — |
| `maintenance` | `slots.prune`, `media.purge`, `sessions.prune` (cron 03:00–03:30) | — | — |

Все процессоры идемпотентны: перед отправкой уведомления вставляется `NotificationLog` с `dedupeKey` (`UNIQUE`) — конфликт означает «уже отправлено», задача завершается успешно.

## 15. Модель ошибок

```ts
class DomainError extends Error {
  constructor(
    readonly code: string,        // машинный код для фронта и логов
    readonly httpStatus: number,
    message: string,
    readonly details?: unknown,
  ) { super(message) }
}
```
`DomainExceptionFilter` превращает её в `{ error: { code, message, details, requestId } }`.

| Код | HTTP | Когда | Что делает фронт |
|---|---|---|---|
| `VALIDATION_FAILED` | 400 | zod-ошибка | подсветить поля |
| `UNAUTHENTICATED` | 401 | нет/истёк access | refresh → повтор запроса |
| `FORBIDDEN` | 403 | не своя сущность/роль | экран «нет доступа» |
| `NOT_FOUND` | 404 | сущность отсутствует/скрыта | 404-страница |
| `SLOT_TAKEN` | 409 | гранула занята | перезагрузить окна + тост «время только что заняли» |
| `TIME_OVERLAP` | 409 | пересечение с активной бронью | показать конфликтующую запись |
| `INVALID_STATE` | 409 | недопустимый переход FSM | обновить бронь и показать актуальный статус |
| `HOLD_EXPIRED` | 410 | удержание истекло | вернуть на шаг выбора времени |
| `LEAD_TIME_VIOLATION` | 422 | слишком поздно записываться | дизейблить окна раньше порога |
| `CANCEL_CUTOFF_PASSED` | 422 | отмена позже cutoff | предложить «запросить отмену у мастера» |
| `LIMIT_EXCEEDED` | 422 | лимит активных броней/фото | объяснить лимит |
| `RATE_LIMITED` | 429 | throttler | таймер повтора |

## 16. Аутентификация и авторизация

**Уточнение к PRD §15 (важно для SSR):** оба токена — в `httpOnly` cookie на родительском домене (`access` 15 мин, `refresh` 30 дней, `Secure`, `SameSite=Lax`, `Path=/`). Причина: серверные компоненты Next.js и SEO-страницы должны уметь дёргать API от имени пользователя, а хранить access-токен в памяти клиента при SSR неудобно и приводит к «двойному» рендеру. Для мутаций добавляется CSRF-защита double-submit (`X-CSRF-Token` + не-httpOnly cookie `csrf`), для будущего мобильного клиента остаётся поддержка `Authorization: Bearer`.

Матрица доступа (проверяется `RolesGuard` + владение ресурсом в use-case):

| Ресурс / действие | anon | client | master | admin |
|---|---|---|---|---|
| Каталог, страница мастера, availability | ✓ | ✓ | ✓ | ✓ |
| Создать hold/бронь | — | ✓ | ✓ (как клиент — нет: у master роль другая) | ✓ |
| Своя бронь: смотреть/отменить | — | ✓ (своя) | — | ✓ |
| Ручная запись, календарь, слоты, блоки | — | — | ✓ (свои) | ✓ |
| Услуги, портфолио, профиль мастера | — | — | ✓ (свои) | ✓ |
| `masterNote`, `MasterClient.note`, `trustScore` | — | — | ✓ (свои) | ✓ |
| `addressExact` мастера | — | ✓ (только по своей `confirmed` брони) | ✓ (свой) | ✓ |
| Отзыв: создать | — | ✓ (по своей `completed` брони) | — | ✓ |
| Ответ на отзыв | — | — | ✓ (на свой) | ✓ |
| Модерация, баны, метрики | — | — | — | ✓ |

Три правила, которые проверяются тестами: (1) любой `master*`-эндпоинт извлекает `masterId` из токена, **никогда** из тела запроса; (2) приватные поля вырезаются на уровне маппера DTO, а не «фильтром в контроллере»; (3) 404 вместо 403 для чужих скрытых сущностей (не раскрываем существование).

## 17. Кэш и производительность чтения

| Ключ | Данные | TTL | Инвалидация |
|---|---|---|---|
| `catalog:search:<hash(filters)>` | страница выдачи | 60 с | по событию `master.published`, `stats.updated` (по тегу) |
| `master:page:<slug>` | публичная страница | 300 с | `master.updated`, `portfolio.changed`, `review.published` |
| `avail:<masterId>:<serviceId>:<date>` | окна на день | 30 с | `booking.*`, `slots.changed` для мастера |
| `facets:catalog` | районы/категории/цены | 600 с | cron |
| `idem:<key>` | результат мутации | 24 ч | — |

Запросы каталога: один SQL c `JOIN MasterStats`, `EXISTS (TimeSlot open …)` для фильтра по дате, курсорная пагинация `(boostPriority DESC, ratingAvg DESC, id)`; `EXPLAIN ANALYZE` в CI на сид-данных 1000 мастеров — план обязан быть index-only по `slot_open_lookup`.

## 18. API (обновление §12 PRD)

Изменения относительно PRD: появились ручки удержания, слотов и книги клиентов; `availability` теперь читает проекцию.

```
# Публично
GET  /api/v1/catalog/masters                 ?category=&service=&district[]=&priceMin=&priceMax=
                                             &availableFrom=&availableTo=&ratingMin=&sort=&cursor=
GET  /api/v1/catalog/masters/:slug
GET  /api/v1/catalog/masters/:id/availability ?serviceId=&from=&to=   → дни + окна из TimeSlot
GET  /api/v1/catalog/facets
GET  /api/v1/catalog/sitemap

# Клиент
POST /api/v1/bookings/holds                  { masterId, serviceId, startsAt }  [Idempotency-Key]
POST /api/v1/bookings/:id/confirm            { comment? }
POST /api/v1/bookings/:id/cancel             { reason? }
GET  /api/v1/bookings                        ?scope=upcoming|past&cursor=
GET  /api/v1/bookings/:id
POST /api/v1/reviews                         { bookingId, rating, text?, mediaIds? }
GET  /api/v1/client/reviews
POST /api/v1/master/client-reviews           { bookingId, rating?, text? }  // оценка и/или комментарий, только после complete

# Мастер
GET  /api/v1/master/calendar                 ?from=&to=   → слоты + брони + блоки одним ответом
PUT  /api/v1/master/schedule/rules           [{ weekday, startMin, endMin }]
PUT  /api/v1/master/schedule/exceptions/:date { type, startMin?, endMin?, note? }
POST /api/v1/master/schedule/blocks          { startsAt, endsAt, reason, note? }
DEL  /api/v1/master/schedule/blocks/:id
POST /api/v1/master/schedule/slots/extra     { startsAt, durationMin }        // открыть окно вне графика
PATCH /api/v1/master/schedule/slots/:id      { note?, status? }               // пометить/освободить окно
POST /api/v1/master/bookings                 { serviceId, startsAt, client:{ id? | name, phone? }, channel, note? }
PATCH /api/v1/master/bookings/:id            { note?, priceAmount? }
POST /api/v1/master/bookings/:id/(confirm|complete|no-show|cancel|reschedule)
GET  /api/v1/master/clients                  ?query=   → книга клиентов (автокомплит ручной записи)
PATCH /api/v1/master/clients/:id             { name?, phone?, note?, tags?, isBlocked? }
GET  /api/v1/master/ledger                   ?from=&to=&kind=&categoryId=  → касса (только master)
POST /api/v1/master/ledger/entries           { kind, categoryId, amount, occurredOn?, periodStart?, periodEnd?, note?, bookingId? }
POST /api/v1/master/ledger/categories        { kind, name }  // своя метка, например «Азер»
DEL  /api/v1/master/ledger/entries/:id       // только source=manual
```

`complete` в production только после `startsAt`; окно отзыва — 14 дней после `completedAt`. При `NODE_ENV=development` оба ограничения снимаются, чтобы вручную прогонять complete → отзыв без ожидания слота.

Касса: `LedgerCategory` / `LedgerEntry`. Завершение брони в той же транзакции пишет `source=booking` на категорию `service`. Чаевые — отдельные `manual` строки. Уникальность `bookingId` только для `source=booking`, чтобы чаевые можно было привязать к визиту.

Пример ответа `availability` (форма зафиксирована — фронт строит на ней `SlotPicker`):

```json
{
  "serviceId": "svc_1", "durationMin": 90, "granularityMin": 30, "timezone": "Europe/Minsk",
  "days": [
    { "date": "2026-07-27", "hasOpen": true,
      "slots": [
        { "startsAt": "2026-07-27T07:00:00Z", "endsAt": "2026-07-27T08:30:00Z", "slotIds": ["s1","s2","s3"] },
        { "startsAt": "2026-07-27T07:30:00Z", "endsAt": "2026-07-27T09:00:00Z", "slotIds": ["s2","s3","s4"] }
      ] },
    { "date": "2026-07-28", "hasOpen": false, "slots": [] }
  ]
}
```
Клиент отправляет только `startsAt` (сервер сам пересчитывает гранулы) — `slotIds` нужны фронту для оптимистичной подсветки и понимания, какие окна исчезнут.

## 19. Пакет `@lustra/contracts`

Единственное место, где описана форма данных между всеми тремя приложениями.

```ts
// contracts/src/booking.ts
export const HoldSlotInput = z.object({
  masterId: z.string().uuid(),
  serviceId: z.string().uuid(),
  startsAt: z.string().datetime(),          // ISO UTC
})
export type HoldSlotInput = z.infer<typeof HoldSlotInput>

export const BookingClientView = z.object({ /* ... без masterNote, без trustScore */ })
export const BookingMasterView = z.object({ /* ... + masterNote, client.phone, client.note */ })
```
Из этих схем: `ZodValidationPipe` в Nest, `react-hook-form` резолверы на фронте, типизированный клиент (`packages/contracts/src/client.ts`, тонкая обёртка над `fetch` с cookie/CSRF и типами ответов), генерация OpenAPI для документации. **Правило: нет схемы в contracts → нет эндпоинта.**

---

# FRONTEND

## 20. Роуты и стратегия рендеринга

| Роут | Приложение | Рендеринг | Данные | Доступ |
|---|---|---|---|---|
| `/`, `/for-masters`, `/privacy`, `/terms`, `/contacts`, `/blog/*` | `landing` (Astro) | статика на билде | content collections + 12 фото портфолио на билде | anon |
| `/catalog` | `web` (Next) | SSR + streaming (`searchParams`) | server fetch `catalog/masters`, `cache: 60s` | anon |
| `/catalog/[category]`, `/catalog/[category]/[district]` | `web` | ISR 3600 + `generateStaticParams` | тот же эндпоинт с фиксированными фильтрами | anon |
| `/m/[slug]` | `web` | ISR 300 + `revalidateTag('master:<id>')` | `catalog/masters/:slug` | anon |
| `/m/[slug]/book` | `web` | client (внутри sheet/route) | `availability`, `holds` | client |
| `/app/(auth)/login`, `register`, `forgot`, `reset` | `web` | SSR-shell + client forms | — | anon |
| `/app/onboarding` | `web` | client wizard, серверный guard | master-профиль | master |
| `/app/master/calendar` | `web` | client (TanStack Query) | `master/calendar` + poll 30 с | master |
| `/app/master/{services,portfolio,schedule,clients,bookings,ledger,profile}` | `web` | client + prefetch на сервере | соответствующие ручки | master |
| `/app/client/{bookings,favorites,profile}` | `web` | RSC для списков + client для действий | `bookings`, `favorites` | client |
| `/admin/*` | `web` | client, `noindex`, IP-allowlist | `admin/*` | admin |

Правило: **всё, что индексируется, рендерится на сервере; всё, что за логином, — клиентское с серверным prefetch.** Календарь мастера принципиально клиентский (частые оптимистичные мутации, поллинг).

## 21. Структура `apps/web`

Feature-sliced, но без религии: слой сущностей, слой фич, слой шаредов.

```
apps/web/src/
├─ app/                                  # Next App Router
│  ├─ (public)/catalog/…, m/[slug]/…
│  ├─ app/(dashboard)/master/…, client/…
│  ├─ app/(auth)/login|register|…
│  ├─ admin/…
│  ├─ api/                               # только BFF-хелперы: /api/revalidate, /api/csrf
│  └─ layout.tsx, error.tsx, not-found.tsx
├─ entities/                             # представление доменных объектов
│  ├─ master/  (MasterCard, MasterHero, RatingStars, mappers)
│  ├─ service/ (ServiceRow, PriceLabel)
│  ├─ booking/ (BookingCard, StatusBadge, statusLabels)
│  └─ slot/    (SlotChip, DayStrip)
├─ features/                             # сценарии с состоянием
│  ├─ booking-flow/    (BookingSheet, useHold, HoldTimer, ConflictDialog)
│  ├─ master-calendar/ (DayTimeline, WeekGrid, useCalendarData, BlockDialog, ManualBookingSheet)
│  ├─ schedule-editor/ (WeeklyRulesForm, ExceptionDialog, presets)
│  ├─ portfolio-upload/(Dropzone, useUploadQueue, resizeToWebp)
│  ├─ catalog-filters/ (FilterBar, useFilterParams — URL как источник истины)
│  ├─ auth/            (LoginForm, RegisterForm, useSession)
│  └─ reviews/         (ReviewForm, ReviewList)
├─ shared/
│  ├─ api/    (typed client из @lustra/contracts, queryKeys, errorToMessage)
│  ├─ ui/     (re-export @lustra/ui + локальные примитивы)
│  ├─ hooks/  (useMediaQuery, useVisibilityRefetch, useCountdown)
│  └─ lib/    (date, money, phone, tz)
└─ styles/ (tokens.css из @lustra/ui, globals.css)
```

## 22. Слои состояния

| Тип состояния | Где живёт | Пример |
|---|---|---|
| Публичные данные для SEO | RSC + `fetch` с тегами | карточка мастера, каталог |
| Приватные изменяемые данные | TanStack Query (`staleTime` 30 с) | календарь, брони, услуги |
| Состояние фильтров и шагов | URL (`searchParams`) | `?service=&district=&date=` |
| Черновик брони до логина | `sessionStorage` + восстановление после редиректа | выбранный слот и комментарий |
| Формы | react-hook-form + zod-резолвер из contracts | все формы |
| Локальный UI | `useState`/`useReducer` | открытые sheets, лайтбокс |
| Глобальный клиентский стор | **не используем** (Zustand только если появится офлайн-режим) | — |

**Ключи запросов** (единый файл `shared/api/queryKeys.ts`): `['calendar', masterId, from, to]`, `['availability', masterId, serviceId, date]`, `['bookings', scope]`, `['clients', query]`. Инвалидация после мутаций точечная: подтверждение брони инвалидирует `calendar` + `availability` для затронутых дат, а не весь кэш.

## 23. Дизайн-токены (числовая шкала, без `sm`/`md`)

`packages/ui/tokens.css` — единственный источник; Tailwind v4 подключает их через `@theme`, поэтому утилиты сразу читаются как `rounded-8`, `text-16`, `shadow-1`, `gap-12`.

```css
@theme {
  /* цвет — семантические имена */
  --color-bg:         #FAF7F4;
  --color-surface:    #FFFFFF;
  --color-surface-2:  #F1E8E1;
  --color-border:     #E4D8CF;
  --color-text:       #221A17;
  --color-text-2:     #6E5F58;
  --color-text-3:     #9C8C84;
  --color-accent:     #C25E52;
  --color-accent-700: #A94A40;
  --color-gold:       #C6A15B;
  --color-sage:       #8A9A7B;
  --color-clay:       #6B4E42;
  --color-success:    #4C8B6A;
  --color-warning:    #D08A3A;
  --color-danger:     #9E2B3F;

  /* отступы: только эти значения, шаг 4 */
  --spacing-2: 2px;  --spacing-4: 4px;   --spacing-8: 8px;   --spacing-12: 12px;
  --spacing-16: 16px; --spacing-20: 20px; --spacing-24: 24px; --spacing-32: 32px;
  --spacing-40: 40px; --spacing-56: 56px; --spacing-64: 64px; --spacing-80: 80px; --spacing-96: 96px;

  /* радиусы */
  --radius-4: 4px; --radius-8: 8px; --radius-14: 14px; --radius-22: 22px; --radius-999: 999px;

  /* типографика: размер/интерлиньяж парой */
  --text-13: 13px; --text-13--line-height: 18px;
  --text-15: 15px; --text-15--line-height: 22px;
  --text-16: 16px; --text-16--line-height: 24px;
  --text-20: 20px; --text-20--line-height: 28px;
  --text-26: 26px; --text-26--line-height: 32px;
  --text-32: 32px; --text-32--line-height: 38px;
  --text-40: 40px; --text-40--line-height: 46px;
  --text-56: 56px; --text-56--line-height: 60px;
  --font-weight-400: 400; --font-weight-500: 500; --font-weight-600: 600; --font-weight-700: 700;
  --font-display: "Playfair Display", Georgia, serif;
  --font-text:    "Inter", system-ui, sans-serif;

  /* тени, длительности, слои */
  --shadow-1: 0 2px 8px rgba(34,26,23,.06);
  --shadow-2: 0 8px 24px rgba(34,26,23,.10);
  --shadow-3: 0 24px 48px rgba(34,26,23,.14);
  --duration-150: 150ms; --duration-250: 250ms; --duration-400: 400ms; --duration-700: 700ms;
  --ease-out-quart: cubic-bezier(.22,1,.36,1);
  --z-10: 10; --z-20: 20; --z-30: 30; --z-40: 40; --z-50: 50;
}
```
Правило: в компонентах используются **только** значения из шкал (никаких `padding: 13px`, `border-radius: 10px`). Палитра — черновик; финализируем после первых живых экранов, имена токенов при этом не меняются (меняются только значения) — поэтому смена палитры не потребует правок в компонентах.

## 24. Ключевые компоненты (проектирование до кода)

**`SlotPicker`** (клиент). Вход: `masterId`, `serviceId`, `days` из `availability`. Устройство: горизонтальный `DayStrip` (14 дней, точка-индикатор `hasOpen`) + сетка `SlotChip` для выбранного дня, сгруппированная по «утро / день / вечер». Состояния чипа: `available`, `selected`, `disabled` (lead time), `justTaken` (пришёл 409 — чип красным на 2 с и исчезает). Данные перезапрашиваются при `visibilitychange`, при фокусе окна и каждые 60 с, пока шит открыт.

**`BookingSheet`** (bottom-sheet на мобильном / модалка на десктопе), 4 шага в одном компоненте с машиной состояний:
```
service → time → (auth, если гость) → confirm → success
                 ↑ hold создаётся при переходе time→confirm
```
На шаге `confirm` показывается `HoldTimer` (обратный отсчёт от `holdExpiresAt`, при 60 с — предупреждение, при 0 — возврат на `time` с тостом `HOLD_EXPIRED`). Черновик (`masterId`, `serviceId`, `startsAt`, `comment`) пишется в `sessionStorage`, чтобы регистрация не потеряла выбор.

**`MasterCalendar`** (клиент). Два режима: `day` (вертикальный таймлайн, строка = гранула, высота из `granularityMin`) и `week` (7 колонок, сжатые блоки). Данные — один запрос `master/calendar?from&to` (слоты + брони + блоки). Взаимодействия: тап по свободному окну → меню «Записать вручную / Заблокировать / Заметка»; long-press + drag (mobile) или drag (desktop) → выделение диапазона → блок; тап по брони → карточка с действиями. Мутации оптимистичные с откатом по ошибке; конфликт (`409`) → инвалидация `['calendar']` + тост «расписание изменилось».

**`ManualBookingSheet`** — 3 шага: услуга (чипы + автоподстановка длительности) → клиент (автокомплит по `master/clients`, иначе имя + телефон) → канал/заметка. Цель: ≤3 тапов на повторного клиента.

**`FilterBar`** — URL-first: любое изменение пишет `searchParams` через `router.replace` (без скролла), серверный компонент перерисовывает выдачу. Мобильный вид — bottom-sheet «Фильтры» с счётчиком выбранных и кнопкой «Показать N мастеров».

**`PortfolioUpload`** — очередь загрузок: ресайз в WebP на клиенте (`OffscreenCanvas`) → `POST media/upload-url` → PUT в хранилище → `POST media` (регистрация) → добавление в сетку. Каждый файл — своя карточка с прогрессом и повтором при ошибке; лимит параллелизма 3.

**`PortfolioGrid` + `Lightbox`** — masonry на CSS `columns`, `aspect-ratio` из БД, blurhash-плейсхолдер, свайп и прелоад соседних изображений, `Lightbox` подгружается динамическим импортом.

## 25. Обработка конфликтов и состояний в UI

| Ситуация | Поведение |
|---|---|
| `SLOT_TAKEN` при hold | чип помечается `justTaken`, список окон перезапрашивается, тост «Это время только что заняли — вот ближайшие» + автоскролл к ближайшему |
| `HOLD_EXPIRED` при confirm | возврат на шаг `time`, окна перезапрошены, объяснение «мы держали место 10 минут» |
| `INVALID_STATE` (бронь уже отменена) | обновление карточки и показ актуального статуса без ошибки-модалки |
| `LEAD_TIME_VIOLATION` | окна раньше порога изначально `disabled` с подсказкой «мастер принимает записи минимум за 3 ч» |
| `CANCEL_CUTOFF_PASSED` | кнопка «Отменить» заменяется на «Написать мастеру» + объяснение |
| `401` | одна попытка `refresh` в интерцепторе клиента, затем редирект на логин с `?next=` |
| offline / сеть упала | баннер «нет соединения», мутации не отправляются, TanStack Query ретраит при возврате |

Конвенция состояний для каждого экрана — 4 обязательных: `loading` (скелетон с реальной геометрией, не спиннер), `empty` (иллюстрация + одно действие), `error` (текст + «Повторить»), `success`. Скелетоны совпадают по размерам с контентом, чтобы CLS = 0.

## 26. Лендинг (Astro): структура

```
apps/landing/src/
├─ content/ (sections/*.md|json, faq/*.md, blog/*.md)   # правки текстов без кода
├─ components/
│  ├─ Hero.astro (clip-path reveal, LCP-картинка с fetchpriority=high)
│  ├─ HowItWorks.astro (2 таба: клиенту / мастеру — CSS-таб без JS)
│  ├─ WorksMarquee.astro (CSS-анимация, фото портфолио с билда)
│  ├─ ComparisonTable.astro (директ vs Lustra)
│  ├─ CategoriesGrid.astro / DistrictsGrid.astro (внутренние ссылки → SEO)
│  ├─ MastersStrip.astro (3–6 реальных карточек)
│  ├─ Faq.astro (островок: <details> + FAQPage JSON-LD)
│  └─ CtaBand.astro, Footer.astro, Header.astro (островок: мобильное меню)
└─ pages/ index, for-masters, privacy, terms, contacts, blog/[slug]
```
JS на лендинге — только два острова (меню, аккордеон) в `client:idle`. Ссылки CTA: «Найти мастера» → `/catalog`, «Я мастер» → `/app/register?role=master&utm_source=landing`.

## 27. Перф-бюджеты по роутам (в CI)

| Роут | JS (gzip) | LCP (4G) | Примечание |
|---|---|---|---|
| `/` (лендинг) | ≤40 КБ | ≤1.8 с | 2 острова, изображения с билда |
| `/catalog` | ≤120 КБ | ≤2.2 с | фильтры — серверные, карточки без JS |
| `/m/[slug]` | ≤140 КБ | ≤2.5 с | `BookingSheet` и `Lightbox` — `dynamic()` |
| `/app/master/calendar` | ≤200 КБ | ≤2.8 с | самый тяжёлый экран, `@dnd-kit` только на десктопе |

Приёмы: `next/dynamic` для календаря/лайтбокса/загрузчика фото, `React.lazy` для админки, `next/font` не используем (шрифты self-host из `@lustra/ui` с `preload` двух файлов), иконки — только импорт нужных из Lucide.

## 28. Порядок реализации (вертикальные срезы)

Каждый срез — от миграции до экрана, с тестами; сливается в main и деплоится на staging.

| № | Срез | Готово, когда |
|---|---|---|
| 1 | Каркас: монорепо, Prisma-схема §4–§9, Docker Compose, CI, health | миграции применяются с нуля, `EXCLUDE`-констрейнт есть, seed районов/категорий |
| 2 | Auth + роли: register/login/refresh, cookie, guards | Playwright: регистрация мастера и клиента, доступы разграничены |
| 3 | Профиль мастера (5 таблиц) + онбординг-визард | профиль публикуется, `/m/[slug]` отдаёт SSR-страницу |
| 4 | Услуги + медиа + портфолио | 10 фото с телефона, сетка без CLS |
| 5 | **Scheduling: правила → генератор → `TimeSlot`** + календарь мастера | юнит-тесты генератора зелёные, календарь показывает окна и блоки |
| 6 | **Booking: hold → confirm + ручная запись + отмена/перенос** | параллельный тест: 1×201 / 19×409; e2e клиента и мастера |
| 7 | Каталог + фильтры + `availableFrom` по слотам + SEO-страницы | p95 выдачи <500 мс на 1000 сид-мастеров, LCP `/m` <2.5 с |
| 8 | Outbox → Telegram: привязка, уведомления, напоминания 24/2 ч | напоминание не приходит по отменённой брони, дублей нет |
| 9 | Отзывы + рейтинг + модерация + админка-lite | рейтинг в каталоге и JSON-LD обновляется после отзыва |
| 10 | Лендинг + юр. страницы + аналитика + запуск | Lighthouse ≥95×4, бюджеты соблюдены |

Срезы 5 и 6 — критический путь: они делаются с тестами **до** UI-полировки и до лендинга.

Запись из кабинетов (мастер: CTA + книга клиентов; клиент: запись из «Моих записей» + сервис рекомендаций v1) — отдельная волна, нарезка веток: `docs/plans/booking-cabinets-modernization.md`.

## 29. Smoke test data (маркеры и cleanup)

Ручные прогоны (Postman MCP, curl-скрипты, будущий Playwright) пишут **реальные строки** в Postgres. Без маркеров безопасная чистка невозможна.

**Маркеры (обязательны для всех smoke/e2e):**

| Сущность | Шаблон | Пример |
|---|---|---|
| Email пользователя | `{role}.smoke.{runId}@example.com` | `client.smoke.1723299840@example.com` |
| `runId` | Unix timestamp или id CI-рана | `date +%s`, `$GITHUB_RUN_ID` |
| `Idempotency-Key` брони | `smoke:{runId}:…` | `smoke:1723299840:hold-1` |
| Slug мастера (e2e, позже) | `smoke-{runId}-…` | при онбординг-e2e |

- `role`: `client` \| `master` \| `admin`
- Домен только **`@example.com`**
- Эталон: `apps/api/postman/run-auth-smoke.sh` (auth-срез)

**Cleanup (отдельный PR, не блокирует feature):**

- Скрипт: `packages/db/src/cleanup-smoke.ts`, команда `pnpm db:cleanup:smoke`
- Флаги: `--dry-run` (default), `--execute`, опционально `--run-id=<id>`
- Порядок удаления (FK): брони/hold → refresh tokens → users (профили каскадом)
- Защита: `--execute` запрещён при prod-like `DATABASE_URL`; удаляются только строки по маркерам; лог количества до delete

До появления скрипта локально: `docker compose down -v` или ручной `DELETE` по паттерну email.

Postman-коллекции — в workspace (MCP), не в git (`.cursor/rules/lustra-postman.mdc`).

## 30. Открытые технические вопросы

1. **Шаг сетки по умолчанию:** 30 мин для всех категорий или 15 мин для брендов/ресниц (там записи часто «на 40 минут»)? Влияет на объём `TimeSlot` и на UX выбора времени.
2. **TTL удержания:** 10 минут — не слишком долго для популярного мастера? Вариант: 5 минут для гостя (ещё не логинился) и 10 для авторизованного.
3. **Бронирование без регистрации** (только имя + телефон + Telegram): сильно повышает конверсию, но открывает спам и усложняет отмену. Делаем в MVP или требуем аккаунт?
4. **Подтверждение телефона** (SMS/звонок): без него ручная склейка гостя с аккаунтом по номеру — потенциальная утечка истории. В MVP склейку делаем только с подтверждением от клиента в интерфейсе?
5. ~~**Одна БД или две**~~ — **решено:** staging бесплатный, вторым `docker compose -p staging` стеком на том же VPS (своя БД `lustra_staging`, свой Redis, поддомен `staging.<домен>`, лимиты `cpus 0.5 / mem 512m`) → полный паритет с продом за 0 €. Для CI — **Neon free** с веткой БД на каждый PR (миграции и e2e не трогают staging). Выбор прод-Postgres (self-hosted в контейнере vs managed) отложен до среза 7–8: код от него не зависит.
6. ~~**Хостинг API**~~ — **решено:** Hetzner CX22 + Docker + Caddy (auto-TLS), деплой из GitHub Actions по SSH образами из GHCR; лендинг — Cloudflare Pages (free, коммерция разрешена), Next.js — контейнером на том же VPS. Пайплайн: PR → тесты на Neon-ветке; `develop` → staging-стек; тег `v*` → прод с manual approval и авто-rollback на предыдущий `sha`.
7. **Реалтайм в календаре:** поллинг 30 с в MVP или сразу SSE-канал `master:<id>` (Nest уже умеет)? Поллинг проще, SSE лучше для мастера с плотным днём.
