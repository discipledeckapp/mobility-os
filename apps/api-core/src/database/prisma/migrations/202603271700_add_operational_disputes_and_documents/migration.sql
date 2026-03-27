CREATE TABLE "ops_disputes" (
    "id" TEXT NOT NULL,
    "disputeCode" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "driverId" TEXT,
    "disputeType" TEXT NOT NULL,
    "relatedEntityType" TEXT NOT NULL,
    "relatedEntityId" TEXT NOT NULL,
    "claimantType" TEXT NOT NULL,
    "claimantId" TEXT NOT NULL,
    "respondentType" TEXT NOT NULL,
    "respondentId" TEXT,
    "title" TEXT NOT NULL,
    "reasonCode" TEXT NOT NULL,
    "narrative" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "priority" TEXT NOT NULL DEFAULT 'normal',
    "assignedTo" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "resolvedByType" TEXT,
    "resolvedById" TEXT,
    "resolutionSummary" JSONB,
    "finalAmountMinorUnits" INTEGER,
    "currency" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ops_disputes_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ops_dispute_evidence" (
    "id" TEXT NOT NULL,
    "disputeId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "uploadedByType" TEXT NOT NULL,
    "uploadedById" TEXT,
    "evidenceType" TEXT NOT NULL,
    "description" TEXT,
    "fileName" TEXT,
    "contentType" TEXT,
    "storageKey" TEXT,
    "fileUrl" TEXT NOT NULL,
    "fileHash" TEXT NOT NULL,
    "integrityHash" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ops_dispute_evidence_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ops_dispute_timeline" (
    "id" TEXT NOT NULL,
    "disputeId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "actorType" TEXT NOT NULL,
    "actorId" TEXT,
    "actionType" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ops_dispute_timeline_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ops_evidence_records" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "actorType" TEXT NOT NULL,
    "actorId" TEXT,
    "evidenceType" TEXT NOT NULL,
    "relatedEntityType" TEXT NOT NULL,
    "relatedEntityId" TEXT NOT NULL,
    "sourceEntityType" TEXT,
    "sourceEntityId" TEXT,
    "amountMinorUnits" INTEGER,
    "currency" TEXT,
    "fileName" TEXT,
    "contentType" TEXT,
    "storageKey" TEXT,
    "fileUrl" TEXT,
    "fileHash" TEXT,
    "integrityHash" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ops_evidence_records_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ops_issued_documents" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "documentNumber" TEXT NOT NULL,
    "documentType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "issuerType" TEXT NOT NULL,
    "issuerId" TEXT,
    "recipientType" TEXT,
    "recipientId" TEXT,
    "relatedEntityType" TEXT NOT NULL,
    "relatedEntityId" TEXT NOT NULL,
    "supersededById" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "fingerprint" TEXT NOT NULL,
    "signatureVersion" TEXT NOT NULL,
    "signedAt" TIMESTAMP(3) NOT NULL,
    "signedBySystem" TEXT NOT NULL,
    "verificationReference" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileHash" TEXT NOT NULL,
    "canonicalPayload" JSONB NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ops_issued_documents_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ops_disputes_disputeCode_key" ON "ops_disputes"("disputeCode");
CREATE UNIQUE INDEX "ops_issued_documents_documentNumber_key" ON "ops_issued_documents"("documentNumber");

CREATE INDEX "ops_disputes_tenantId_status_idx" ON "ops_disputes"("tenantId", "status");
CREATE INDEX "ops_disputes_relatedEntityType_relatedEntityId_idx" ON "ops_disputes"("relatedEntityType", "relatedEntityId");
CREATE INDEX "ops_disputes_driverId_idx" ON "ops_disputes"("driverId");
CREATE INDEX "ops_dispute_evidence_disputeId_idx" ON "ops_dispute_evidence"("disputeId");
CREATE INDEX "ops_dispute_evidence_tenantId_createdAt_idx" ON "ops_dispute_evidence"("tenantId", "createdAt");
CREATE INDEX "ops_dispute_timeline_disputeId_createdAt_idx" ON "ops_dispute_timeline"("disputeId", "createdAt");
CREATE INDEX "ops_dispute_timeline_tenantId_createdAt_idx" ON "ops_dispute_timeline"("tenantId", "createdAt");
CREATE INDEX "ops_evidence_records_tenantId_relatedEntityType_relatedEntityId_idx" ON "ops_evidence_records"("tenantId", "relatedEntityType", "relatedEntityId");
CREATE INDEX "ops_evidence_records_tenantId_createdAt_idx" ON "ops_evidence_records"("tenantId", "createdAt");
CREATE INDEX "ops_issued_documents_tenantId_relatedEntityType_relatedEntityId_idx" ON "ops_issued_documents"("tenantId", "relatedEntityType", "relatedEntityId");
CREATE INDEX "ops_issued_documents_tenantId_documentType_idx" ON "ops_issued_documents"("tenantId", "documentType");

ALTER TABLE "ops_dispute_evidence"
ADD CONSTRAINT "ops_dispute_evidence_disputeId_fkey"
FOREIGN KEY ("disputeId") REFERENCES "ops_disputes"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ops_dispute_timeline"
ADD CONSTRAINT "ops_dispute_timeline_disputeId_fkey"
FOREIGN KEY ("disputeId") REFERENCES "ops_disputes"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
