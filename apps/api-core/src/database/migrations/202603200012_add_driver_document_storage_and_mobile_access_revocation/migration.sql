ALTER TABLE "driver_documents"
  ADD COLUMN IF NOT EXISTS "storageKey" TEXT;

ALTER TABLE "driver_documents"
  ALTER COLUMN "fileDataUrl" DROP NOT NULL;

CREATE INDEX IF NOT EXISTS "driver_documents_storageKey_idx"
  ON "driver_documents"("storageKey");

ALTER TABLE "users"
  ADD COLUMN IF NOT EXISTS "mobileAccessRevoked" BOOLEAN NOT NULL DEFAULT false;
