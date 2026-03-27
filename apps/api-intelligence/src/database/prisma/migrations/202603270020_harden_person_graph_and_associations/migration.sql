ALTER TABLE "intel_persons"
  ADD COLUMN IF NOT EXISTS "globalPersonCode" TEXT,
  ADD COLUMN IF NOT EXISTS "primaryBiometricProfileId" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "intel_persons_globalPersonCode_key"
  ON "intel_persons"("globalPersonCode");

ALTER TABLE "intel_biometric_profiles"
  ADD COLUMN IF NOT EXISTS "embeddingHash" TEXT;

UPDATE "intel_biometric_profiles"
SET "embeddingHash" = COALESCE("embeddingHash", md5(encode("embeddingCiphertext", 'hex')))
WHERE "embeddingHash" IS NULL;

ALTER TABLE "intel_biometric_profiles"
  ALTER COLUMN "embeddingHash" SET NOT NULL;

CREATE INDEX IF NOT EXISTS "intel_biometric_profiles_embeddingHash_modality_isActive_idx"
  ON "intel_biometric_profiles"("embeddingHash", "modality", "isActive");

ALTER TABLE "intel_person_tenant_presences"
  ADD COLUMN IF NOT EXISTS "businessEntityId" TEXT,
  ADD COLUMN IF NOT EXISTS "operatingUnitId" TEXT,
  ADD COLUMN IF NOT EXISTS "fleetId" TEXT,
  ADD COLUMN IF NOT EXISTS "localEntityType" TEXT NOT NULL DEFAULT 'driver',
  ADD COLUMN IF NOT EXISTS "localEntityId" TEXT,
  ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS "source" TEXT NOT NULL DEFAULT 'identity_resolution',
  ADD COLUMN IF NOT EXISTS "verifiedAt" TIMESTAMP(3);

UPDATE "intel_person_tenant_presences"
SET
  "localEntityType" = COALESCE("localEntityType", "roleType"),
  "localEntityId" = COALESCE("localEntityId", "tenantId" || ':' || "roleType"),
  "verifiedAt" = COALESCE("verifiedAt", "createdAt");

DROP INDEX IF EXISTS "intel_person_tenant_presences_personId_roleType_idx";
ALTER TABLE "intel_person_tenant_presences"
  DROP CONSTRAINT IF EXISTS "intel_person_tenant_presences_personId_tenantId_roleType_key";

ALTER TABLE "intel_person_tenant_presences"
  ADD CONSTRAINT "intel_person_tenant_presences_personId_tenantId_roleType_localEntityType_localEntityId_key"
  UNIQUE ("personId", "tenantId", "roleType", "localEntityType", "localEntityId");

CREATE INDEX IF NOT EXISTS "intel_person_tenant_presences_personId_roleType_idx"
  ON "intel_person_tenant_presences"("personId", "roleType");

CREATE INDEX IF NOT EXISTS "intel_person_tenant_presences_personId_localEntityType_idx"
  ON "intel_person_tenant_presences"("personId", "localEntityType");
