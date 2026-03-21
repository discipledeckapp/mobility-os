ALTER TABLE "vehicles"
  ADD COLUMN IF NOT EXISTS "systemVehicleCode" TEXT,
  ADD COLUMN IF NOT EXISTS "tenantVehicleCode" TEXT;

UPDATE "vehicles"
SET "systemVehicleCode" = COALESCE(
  "systemVehicleCode",
  CONCAT('VEH-', UPPER(SUBSTRING("id" FROM 1 FOR 8)))
)
WHERE "systemVehicleCode" IS NULL;

UPDATE "vehicles"
SET "tenantVehicleCode" = COALESCE(
  "tenantVehicleCode",
  COALESCE("plate", CONCAT('ASSET-', UPPER(SUBSTRING("id" FROM 1 FOR 6))))
)
WHERE "tenantVehicleCode" IS NULL;

ALTER TABLE "vehicles"
  ALTER COLUMN "systemVehicleCode" SET NOT NULL,
  ALTER COLUMN "tenantVehicleCode" SET NOT NULL,
  ALTER COLUMN "plate" DROP NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "vehicles_systemVehicleCode_key"
  ON "vehicles"("systemVehicleCode");

CREATE UNIQUE INDEX IF NOT EXISTS "vehicles_tenantId_tenantVehicleCode_key"
  ON "vehicles"("tenantId", "tenantVehicleCode");

CREATE UNIQUE INDEX IF NOT EXISTS "vehicles_tenantId_plate_key"
  ON "vehicles"("tenantId", "plate");

CREATE UNIQUE INDEX IF NOT EXISTS "vehicles_tenantId_vin_key"
  ON "vehicles"("tenantId", "vin");

CREATE TABLE IF NOT EXISTS "vehicle_valuations" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "vehicleId" TEXT NOT NULL,
  "valuationKind" TEXT NOT NULL,
  "amountMinorUnits" INTEGER NOT NULL,
  "currency" TEXT,
  "valuationDate" TEXT NOT NULL,
  "source" TEXT,
  "notes" TEXT,
  "isCurrent" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "vehicle_valuations_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "vehicle_valuations_tenantId_idx"
  ON "vehicle_valuations"("tenantId");

CREATE INDEX IF NOT EXISTS "vehicle_valuations_vehicleId_idx"
  ON "vehicle_valuations"("vehicleId");

CREATE INDEX IF NOT EXISTS "vehicle_valuations_vehicleId_valuationKind_isCurrent_idx"
  ON "vehicle_valuations"("vehicleId", "valuationKind", "isCurrent");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'vehicle_valuations_vehicleId_fkey'
  ) THEN
    ALTER TABLE "vehicle_valuations"
      ADD CONSTRAINT "vehicle_valuations_vehicleId_fkey"
      FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
