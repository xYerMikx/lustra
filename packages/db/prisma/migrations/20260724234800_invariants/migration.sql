-- Инварианты, которые Prisma schema не выражает напрямую (TECH-DESIGN §9).
-- Расширения btree_gist/pg_trgm/citext уже созданы в 00000000000000_extensions.

-- 1. Никаких пересекающихся активных броней у одного мастера (в т.ч. ручных вне сетки).
--    Это последний рубеж защиты от double-booking, независимый от блокировок TimeSlot.
ALTER TABLE "Booking" ADD CONSTRAINT booking_no_overlap
  EXCLUDE USING gist (
    "masterId" WITH =,
    tstzrange("startsAt", "endsAt", '[)') WITH &&
  ) WHERE (status IN ('hold', 'pending', 'confirmed'));

-- 2. Никаких пересекающихся блокировок (обед/отпуск и т.п.) у одного мастера.
ALTER TABLE "TimeBlock" ADD CONSTRAINT block_no_overlap
  EXCLUDE USING gist (
    "masterId" WITH =,
    tstzrange("startsAt", "endsAt", '[)') WITH &&
  );

-- 3. Здравость интервалов.
ALTER TABLE "Booking" ADD CONSTRAINT booking_time_sane CHECK ("endsAt" > "startsAt");
ALTER TABLE "TimeSlot" ADD CONSTRAINT slot_time_sane CHECK ("endsAt" > "startsAt");
ALTER TABLE "TimeBlock" ADD CONSTRAINT block_time_sane CHECK ("endsAt" > "startsAt");
ALTER TABLE "AvailabilityRule" ADD CONSTRAINT rule_sane
  CHECK ("startMin" >= 0 AND "endMin" <= 1440 AND "endMin" > "startMin");

-- 4. Значения, на которые опирается генератор слотов и остальная бизнес-логика.
ALTER TABLE "MasterBookingPolicy" ADD CONSTRAINT policy_granularity
  CHECK ("granularityMin" IN (15, 30, 60));
ALTER TABLE "Review" ADD CONSTRAINT review_rating_range CHECK (rating BETWEEN 1 AND 5);
ALTER TABLE "Service" ADD CONSTRAINT service_duration_step
  CHECK ("durationMin" > 0 AND "durationMin" % 15 = 0);

-- 5. Один телефон = одна карточка клиента у мастера (NULL не участвует в уникальности —
--    гости без телефона не конфликтуют между собой).
CREATE UNIQUE INDEX master_client_phone_uniq
  ON "MasterClient" ("masterId", phone) WHERE phone IS NOT NULL;

-- 6. Горячие пути каталога и cron-sweeper истёкших удержаний.
CREATE INDEX slot_open_lookup ON "TimeSlot" ("masterId", "startsAt")
  WHERE status = 'open';
CREATE INDEX slot_hold_sweep ON "TimeSlot" ("holdExpiresAt")
  WHERE status = 'held';

-- 7. Полнотекстовый поиск по имени мастера и названию услуги.
CREATE INDEX master_name_trgm ON "MasterProfile" USING gin (lower("displayName") gin_trgm_ops);
CREATE INDEX service_title_trgm ON "Service" USING gin (lower(title) gin_trgm_ops);
