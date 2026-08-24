-- Identity keys for a master's guest book (option A + phone when present).
-- Unique phone already exists: master_client_phone_uniq.

ALTER TABLE "MasterClient"
  ADD COLUMN "instagramHandle" TEXT,
  ADD COLUMN "telegramHandle" TEXT;

UPDATE "MasterClient"
SET "telegramHandle" = lower(substring(trim(note) from '^@([A-Za-z0-9_]{5,32})'))
WHERE source = 'telegram'
  AND note IS NOT NULL
  AND trim(note) ~ '^@[A-Za-z0-9_]{5,32}([ [:space:]]|$)';

UPDATE "MasterClient"
SET "instagramHandle" = lower(substring(trim(note) from '^@([A-Za-z0-9._]{1,30})'))
WHERE "telegramHandle" IS NULL
  AND note IS NOT NULL
  AND trim(note) ~ '^@[A-Za-z0-9._]{1,30}([ [:space:]]|$)';

UPDATE "MasterClient" AS dup
SET "instagramHandle" = NULL
WHERE dup."instagramHandle" IS NOT NULL
  AND dup.id <> (
    SELECT keep.id
    FROM "MasterClient" AS keep
    WHERE keep."masterId" = dup."masterId"
      AND keep."instagramHandle" = dup."instagramHandle"
    ORDER BY keep."createdAt" ASC, keep.id ASC
    LIMIT 1
  );

UPDATE "MasterClient" AS dup
SET "telegramHandle" = NULL
WHERE dup."telegramHandle" IS NOT NULL
  AND dup.id <> (
    SELECT keep.id
    FROM "MasterClient" AS keep
    WHERE keep."masterId" = dup."masterId"
      AND keep."telegramHandle" = dup."telegramHandle"
    ORDER BY keep."createdAt" ASC, keep.id ASC
    LIMIT 1
  );

CREATE UNIQUE INDEX master_client_instagram_handle_uniq
  ON "MasterClient" ("masterId", "instagramHandle")
  WHERE "instagramHandle" IS NOT NULL;

CREATE UNIQUE INDEX master_client_telegram_handle_uniq
  ON "MasterClient" ("masterId", "telegramHandle")
  WHERE "telegramHandle" IS NOT NULL;
