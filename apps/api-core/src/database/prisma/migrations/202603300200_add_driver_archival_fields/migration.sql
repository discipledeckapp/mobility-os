ALTER TABLE "drivers"
ADD COLUMN "archivedAt" TIMESTAMP(3),
ADD COLUMN "archivedBy" TEXT,
ADD COLUMN "archiveReason" TEXT;

CREATE INDEX "drivers_tenantId_archivedAt_idx" ON "drivers"("tenantId", "archivedAt");
