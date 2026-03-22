-- Initial migration: creates all base tables for the intelligence plane.
-- Columns added by migrations 001 and 002 are intentionally absent here.

-- pgvector extension (required for future embedding similarity searches)
CREATE EXTENSION IF NOT EXISTS vector;

-- intel_persons: enrichment columns (fullName, dateOfBirth, etc.) are added
-- by migration 202603190001. verificationConfidence is part of the base schema.
CREATE TABLE "intel_persons" (
    "id" TEXT NOT NULL,
    "globalRiskScore" INTEGER NOT NULL DEFAULT 0,
    "isWatchlisted" BOOLEAN NOT NULL DEFAULT false,
    "hasDuplicateFlag" BOOLEAN NOT NULL DEFAULT false,
    "fraudSignalCount" INTEGER NOT NULL DEFAULT 0,
    "verificationConfidence" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "intel_persons_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "intel_person_identifiers" (
    "id" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "countryCode" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "intel_person_identifiers_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "intel_person_identifiers_type_value_key" ON "intel_person_identifiers"("type", "value");
CREATE INDEX "intel_person_identifiers_personId_idx" ON "intel_person_identifiers"("personId");
ALTER TABLE "intel_person_identifiers"
    ADD CONSTRAINT "intel_person_identifiers_personId_fkey"
    FOREIGN KEY ("personId") REFERENCES "intel_persons"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "intel_biometric_profiles" (
    "id" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    "modality" TEXT NOT NULL,
    "embeddingCiphertext" BYTEA NOT NULL,
    "qualityScore" DOUBLE PRECISION NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "enrolledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "intel_biometric_profiles_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "intel_biometric_profiles_personId_modality_isActive_idx" ON "intel_biometric_profiles"("personId", "modality", "isActive");
ALTER TABLE "intel_biometric_profiles"
    ADD CONSTRAINT "intel_biometric_profiles_personId_fkey"
    FOREIGN KEY ("personId") REFERENCES "intel_persons"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "intel_risk_signals" (
    "id" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "intel_risk_signals_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "intel_risk_signals_personId_isActive_idx" ON "intel_risk_signals"("personId", "isActive");
ALTER TABLE "intel_risk_signals"
    ADD CONSTRAINT "intel_risk_signals_personId_fkey"
    FOREIGN KEY ("personId") REFERENCES "intel_persons"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

-- roleType column is intentionally absent — added by migration 202603200002.
-- Unique constraint here is (personId, tenantId); migration 002 replaces it
-- with (personId, tenantId, roleType).
CREATE TABLE "intel_person_tenant_presences" (
    "id" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "intel_person_tenant_presences_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "intel_person_tenant_presences_personId_tenantId_key" ON "intel_person_tenant_presences"("personId", "tenantId");
CREATE INDEX "intel_person_tenant_presences_tenantId_idx" ON "intel_person_tenant_presences"("tenantId");
ALTER TABLE "intel_person_tenant_presences"
    ADD CONSTRAINT "intel_person_tenant_presences_personId_fkey"
    FOREIGN KEY ("personId") REFERENCES "intel_persons"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "intel_review_cases" (
    "id" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "resolution" TEXT,
    "confidenceScore" DOUBLE PRECISION NOT NULL,
    "evidence" JSONB NOT NULL,
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "intel_review_cases_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "intel_review_cases_status_idx" ON "intel_review_cases"("status");
ALTER TABLE "intel_review_cases"
    ADD CONSTRAINT "intel_review_cases_personId_fkey"
    FOREIGN KEY ("personId") REFERENCES "intel_persons"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "intel_watchlist_entries" (
    "id" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "addedBy" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "intel_watchlist_entries_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "intel_watchlist_entries_personId_isActive_idx" ON "intel_watchlist_entries"("personId", "isActive");

CREATE TABLE "intel_linkage_events" (
    "id" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "confidenceScore" DOUBLE PRECISION,
    "actor" TEXT NOT NULL,
    "reason" TEXT,
    "metadata" JSONB,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "intel_linkage_events_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "intel_linkage_events_personId_idx" ON "intel_linkage_events"("personId");
