ALTER TABLE "intel_persons"
  ADD COLUMN IF NOT EXISTS "selfieImageUrl" TEXT,
  ADD COLUMN IF NOT EXISTS "providerImageUrl" TEXT;
