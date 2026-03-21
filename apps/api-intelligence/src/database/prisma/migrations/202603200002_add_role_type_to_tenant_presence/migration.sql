-- Add roleType to intel_person_tenant_presences.
--
-- Design:
--   A canonical person can participate in multiple operational roles across
--   the platform (driver, guarantor). This column records which role triggered
--   each presence entry so the intelligence plane can detect cross-role
--   conflicts (same person as driver AND guarantor at the same tenant) and
--   aggregate risk signals that span roles.
--
-- Backward compatibility:
--   Existing rows represent driver enrollments. The DEFAULT 'driver' fills
--   them without any data loss.

ALTER TABLE "intel_person_tenant_presences"
  ADD COLUMN "roleType" TEXT NOT NULL DEFAULT 'driver';

-- The old unique constraint was (personId, tenantId). A person can now appear
-- twice at the same tenant if they hold both roles — drop and recreate.
ALTER TABLE "intel_person_tenant_presences"
  DROP CONSTRAINT IF EXISTS "intel_person_tenant_presences_personId_tenantId_key";

ALTER TABLE "intel_person_tenant_presences"
  ADD CONSTRAINT "intel_person_tenant_presences_personId_tenantId_roleType_key"
  UNIQUE ("personId", "tenantId", "roleType");

CREATE INDEX IF NOT EXISTS "intel_person_tenant_presences_personId_roleType_idx"
  ON "intel_person_tenant_presences"("personId", "roleType");
