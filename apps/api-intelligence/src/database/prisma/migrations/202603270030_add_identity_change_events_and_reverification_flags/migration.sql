ALTER TABLE "intel_person_tenant_presences"
ADD COLUMN "reverificationRequired" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "reverificationReason" TEXT,
ADD COLUMN "staleFieldKeys" JSONB;

CREATE TABLE "intel_identity_change_events" (
  "id" TEXT NOT NULL,
  "personId" TEXT NOT NULL,
  "eventType" TEXT NOT NULL DEFAULT 'canonical_identity_updated',
  "source" TEXT NOT NULL,
  "verificationProvider" TEXT,
  "verificationCountryCode" TEXT,
  "tenantId" TEXT,
  "localEntityType" TEXT,
  "localEntityId" TEXT,
  "changedFields" JSONB NOT NULL,
  "previousValues" JSONB,
  "newValues" JSONB,
  "reason" TEXT,
  "verifiedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "intel_identity_change_events_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "intel_identity_change_events_personId_createdAt_idx"
ON "intel_identity_change_events"("personId", "createdAt");

ALTER TABLE "intel_identity_change_events"
ADD CONSTRAINT "intel_identity_change_events_personId_fkey"
FOREIGN KEY ("personId") REFERENCES "intel_persons"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;
