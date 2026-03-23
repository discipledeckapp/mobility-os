ALTER TABLE "driver_guarantors"
ADD COLUMN "status" TEXT NOT NULL DEFAULT 'active',
ADD COLUMN "disconnectedAt" TIMESTAMP(3),
ADD COLUMN "disconnectedReason" TEXT;
