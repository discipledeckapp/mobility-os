ALTER TABLE "driver_documents"
  ADD COLUMN IF NOT EXISTS "storageUrl" TEXT;

CREATE INDEX IF NOT EXISTS "driver_documents_storageUrl_idx"
  ON "driver_documents"("storageUrl");
