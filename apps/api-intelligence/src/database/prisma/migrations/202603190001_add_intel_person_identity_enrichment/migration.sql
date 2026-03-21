-- Add canonical identity enrichment fields to the intelligence person record.
-- These fields store normalized provider-enriched identity attributes only.
-- Tenant-facing derived query endpoints must not expose these columns directly.

ALTER TABLE "intel_persons"
ADD COLUMN "fullName" TEXT,
ADD COLUMN "dateOfBirth" TEXT,
ADD COLUMN "address" TEXT,
ADD COLUMN "gender" TEXT,
ADD COLUMN "photoUrl" TEXT,
ADD COLUMN "verificationStatus" TEXT,
ADD COLUMN "verificationProvider" TEXT,
ADD COLUMN "verificationCountryCode" TEXT;
