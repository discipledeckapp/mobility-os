ALTER TABLE "driver_documents"
  ADD COLUMN "status" TEXT NOT NULL DEFAULT 'pending',
  ADD COLUMN "expiresAt" TIMESTAMP(3),
  ADD COLUMN "reviewedBy" TEXT,
  ADD COLUMN "reviewedAt" TIMESTAMP(3);

CREATE INDEX "driver_documents_status_idx" ON "driver_documents"("status");
CREATE INDEX "driver_documents_expiresAt_idx" ON "driver_documents"("expiresAt");
