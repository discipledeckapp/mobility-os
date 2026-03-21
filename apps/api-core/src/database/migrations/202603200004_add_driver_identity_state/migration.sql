ALTER TABLE "drivers"
  ADD COLUMN IF NOT EXISTS "identityStatus" TEXT,
  ADD COLUMN IF NOT EXISTS "identityReviewCaseId" TEXT,
  ADD COLUMN IF NOT EXISTS "identityReviewStatus" TEXT,
  ADD COLUMN IF NOT EXISTS "identityLastDecision" TEXT,
  ADD COLUMN IF NOT EXISTS "identityVerificationConfidence" DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "identityLastVerifiedAt" TIMESTAMP(3);

UPDATE "drivers"
SET "identityStatus" = CASE
  WHEN "personId" IS NOT NULL THEN 'verified'
  ELSE COALESCE("identityStatus", 'unverified')
END
WHERE "identityStatus" IS NULL;

ALTER TABLE "drivers"
  ALTER COLUMN "identityStatus" SET NOT NULL,
  ALTER COLUMN "identityStatus" SET DEFAULT 'unverified';

CREATE INDEX IF NOT EXISTS "drivers_identityStatus_idx"
  ON "drivers"("identityStatus");

CREATE INDEX IF NOT EXISTS "drivers_identityReviewCaseId_idx"
  ON "drivers"("identityReviewCaseId");
