-- CreateEnum
CREATE TYPE "LedgerKind" AS ENUM ('income', 'expense');

-- CreateEnum
CREATE TYPE "LedgerSource" AS ENUM ('booking', 'manual');

-- CreateTable
CREATE TABLE "LedgerCategory" (
    "id" TEXT NOT NULL,
    "masterId" TEXT NOT NULL,
    "kind" "LedgerKind" NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "LedgerCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LedgerEntry" (
    "id" TEXT NOT NULL,
    "masterId" TEXT NOT NULL,
    "kind" "LedgerKind" NOT NULL,
    "source" "LedgerSource" NOT NULL,
    "categoryId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'BYN',
    "occurredOn" DATE NOT NULL,
    "occurredAt" TIMESTAMPTZ NOT NULL,
    "periodStart" DATE,
    "periodEnd" DATE,
    "bookingId" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "LedgerEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LedgerCategory_masterId_kind_slug_key" ON "LedgerCategory"("masterId", "kind", "slug");

-- CreateIndex
CREATE INDEX "LedgerCategory_masterId_kind_idx" ON "LedgerCategory"("masterId", "kind");

-- CreateIndex
CREATE UNIQUE INDEX "LedgerEntry_booking_income_bookingId_key"
ON "LedgerEntry"("bookingId")
WHERE "source" = 'booking' AND "bookingId" IS NOT NULL;

-- CreateIndex
CREATE INDEX "LedgerEntry_masterId_occurredOn_idx" ON "LedgerEntry"("masterId", "occurredOn");

-- CreateIndex
CREATE INDEX "LedgerEntry_masterId_kind_occurredOn_idx" ON "LedgerEntry"("masterId", "kind", "occurredOn");

-- CreateIndex
CREATE INDEX "LedgerEntry_masterId_categoryId_idx" ON "LedgerEntry"("masterId", "categoryId");

-- AddForeignKey
ALTER TABLE "LedgerCategory" ADD CONSTRAINT "LedgerCategory_masterId_fkey" FOREIGN KEY ("masterId") REFERENCES "MasterProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LedgerEntry" ADD CONSTRAINT "LedgerEntry_masterId_fkey" FOREIGN KEY ("masterId") REFERENCES "MasterProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LedgerEntry" ADD CONSTRAINT "LedgerEntry_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "LedgerCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LedgerEntry" ADD CONSTRAINT "LedgerEntry_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;
