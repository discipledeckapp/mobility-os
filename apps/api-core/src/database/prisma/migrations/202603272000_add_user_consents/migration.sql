-- Migration: add_user_consents
-- Creates the user_consents table for GDPR-compliant consent tracking.
-- The UserConsent model was added to schema.prisma but the corresponding
-- migration was never generated, causing runtime crashes on consent creation.

CREATE TABLE "user_consents" (
    "id"             TEXT NOT NULL,
    "tenantId"       TEXT NOT NULL,
    "userId"         TEXT NOT NULL,
    "subjectType"    TEXT NOT NULL,
    "subjectId"      TEXT,
    "policyDocument" TEXT NOT NULL,
    "policyVersion"  TEXT NOT NULL,
    "consentScope"   TEXT NOT NULL,
    "granted"        BOOLEAN NOT NULL DEFAULT true,
    "grantedAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata"       JSONB,

    CONSTRAINT "user_consents_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "user_consents_tenantId_userId_policyDocument_policyVersion_idx"
    ON "user_consents"("tenantId", "userId", "policyDocument", "policyVersion");

CREATE INDEX "user_consents_subjectType_subjectId_idx"
    ON "user_consents"("subjectType", "subjectId");

ALTER TABLE "user_consents"
    ADD CONSTRAINT "user_consents_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
