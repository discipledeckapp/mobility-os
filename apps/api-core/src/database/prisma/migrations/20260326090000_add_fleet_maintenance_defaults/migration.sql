-- Fleet-level maintenance schedule defaults.
-- These are inherited by all vehicles in the fleet unless overridden at the vehicle level.

ALTER TABLE "fleets"
  ADD COLUMN "maintenanceScheduleType" TEXT,
  ADD COLUMN "maintenanceIntervalDays" INTEGER,
  ADD COLUMN "maintenanceIntervalKm"   INTEGER;
