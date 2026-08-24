-- Extra-pay windows, closed granules (without TimeBlock), per-day grid overrides.

ALTER TYPE "SlotStatus" ADD VALUE IF NOT EXISTS 'closed';

ALTER TABLE "AvailabilityException"
  ADD COLUMN "granularityMin" INTEGER,
  ADD COLUMN "intervals" JSONB;

ALTER TABLE "TimeSlot"
  ADD COLUMN "extraPayAmount" DECIMAL(10, 2);
