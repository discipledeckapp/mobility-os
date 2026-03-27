ALTER TABLE "assignments"
ALTER COLUMN "status" SET DEFAULT 'pending_driver_confirmation';

ALTER TABLE "assignments"
ADD COLUMN "driverConfirmedAt" TIMESTAMP(3),
ADD COLUMN "driverConfirmationMethod" TEXT,
ADD COLUMN "driverConfirmationEvidence" JSONB,
ADD COLUMN "acceptanceSnapshotHash" TEXT,
ADD COLUMN "returnedAt" TIMESTAMP(3),
ADD COLUMN "returnedBy" TEXT,
ADD COLUMN "returnEvidence" JSONB;
