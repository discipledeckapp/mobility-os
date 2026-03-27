-- Migration: add_driver_document_verifications
-- Creates the driver_document_verifications table for zero-trust document
-- verification using ID number + external provider API.  This replaces the
-- file-upload-first approach as the primary verification mechanism.

CREATE TABLE "driver_document_verifications" (
    "id"                   TEXT NOT NULL,
    "tenantId"             TEXT NOT NULL,
    "driverId"             TEXT NOT NULL,
    "documentType"         TEXT NOT NULL,
    "idNumber"             TEXT NOT NULL,
    "countryCode"          TEXT NOT NULL,
    "provider"             TEXT,
    "status"               TEXT NOT NULL DEFAULT 'pending',
    "providerMatch"        BOOLEAN,
    "providerConfidence"   INTEGER,
    "providerFirstName"    TEXT,
    "providerLastName"     TEXT,
    "providerDateOfBirth"  TEXT,
    "providerExpiryDate"   TEXT,
    "failureReason"        TEXT,
    "providerResult"       JSONB,
    "verifiedAt"           TIMESTAMP(3),
    "reviewedBy"           TEXT,
    "reviewedAt"           TIMESTAMP(3),
    "reviewNotes"          TEXT,
    "createdAt"            TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"            TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "driver_document_verifications_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "driver_document_verifications_tenantId_driverId_documentType_idx"
    ON "driver_document_verifications"("tenantId", "driverId", "documentType");

CREATE INDEX "driver_document_verifications_tenantId_status_idx"
    ON "driver_document_verifications"("tenantId", "status");

ALTER TABLE "driver_document_verifications"
    ADD CONSTRAINT "driver_document_verifications_driverId_fkey"
    FOREIGN KEY ("driverId") REFERENCES "drivers"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
