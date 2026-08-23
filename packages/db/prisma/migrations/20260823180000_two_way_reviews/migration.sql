-- Two-way reviews: client↔master, optional rating (comment without stars),
-- service snapshot on the review, client rating aggregates.

CREATE TYPE "ReviewAuthorRole" AS ENUM ('client', 'master');

ALTER TABLE "ClientProfile"
  ADD COLUMN "ratingAvg" DECIMAL(3, 2) NOT NULL DEFAULT 0,
  ADD COLUMN "ratingCount" INTEGER NOT NULL DEFAULT 0;

ALTER TABLE "Review"
  ADD COLUMN "authorRole" "ReviewAuthorRole" NOT NULL DEFAULT 'client',
  ADD COLUMN "serviceTitle" TEXT NOT NULL DEFAULT '';

UPDATE "Review" AS review
SET "serviceTitle" = booking."serviceTitle"
FROM "Booking" AS booking
WHERE booking.id = review."bookingId";

ALTER TABLE "Review" ALTER COLUMN "serviceTitle" DROP DEFAULT;
ALTER TABLE "Review" ALTER COLUMN "rating" DROP NOT NULL;
ALTER TABLE "Review" ALTER COLUMN "authorRole" DROP DEFAULT;

DROP INDEX IF EXISTS "Review_bookingId_key";

CREATE UNIQUE INDEX "Review_bookingId_authorRole_key"
  ON "Review" ("bookingId", "authorRole");

DROP INDEX IF EXISTS "Review_masterId_status_createdAt_idx";

CREATE INDEX "Review_masterId_authorRole_status_createdAt_idx"
  ON "Review" ("masterId", "authorRole", "status", "createdAt");

CREATE INDEX "Review_clientUserId_authorRole_status_createdAt_idx"
  ON "Review" ("clientUserId", "authorRole", "status", "createdAt");

ALTER TABLE "Review" DROP CONSTRAINT IF EXISTS review_rating_range;

ALTER TABLE "Review"
  ADD CONSTRAINT review_rating_range
  CHECK ("rating" IS NULL OR ("rating" BETWEEN 1 AND 5));

ALTER TABLE "Review"
  ADD CONSTRAINT review_has_rating_or_text
  CHECK (
    "rating" IS NOT NULL
    OR ("text" IS NOT NULL AND length(btrim("text")) > 0)
  );
