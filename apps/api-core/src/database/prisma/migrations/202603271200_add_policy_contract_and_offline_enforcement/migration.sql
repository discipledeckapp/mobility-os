CREATE TABLE "policy_rules" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "conditionType" TEXT NOT NULL,
  "threshold" INTEGER NOT NULL,
  "timeWindowDays" INTEGER NOT NULL,
  "actionType" TEXT NOT NULL,
  "appliesTo" TEXT NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "policy_rules_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "policy_rules_tenantId_isActive_idx"
ON "policy_rules"("tenantId", "isActive");

CREATE INDEX "policy_rules_tenantId_appliesTo_conditionType_idx"
ON "policy_rules"("tenantId", "appliesTo", "conditionType");

CREATE TABLE "enforcement_actions" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "policyRuleId" TEXT,
  "entityType" TEXT NOT NULL,
  "entityId" TEXT NOT NULL,
  "actionType" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'active',
  "reason" TEXT NOT NULL,
  "metadata" JSONB,
  "triggeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "resolvedAt" TIMESTAMP(3),
  "resolvedReason" TEXT,

  CONSTRAINT "enforcement_actions_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "enforcement_actions_tenantId_entityType_entityId_status_idx"
ON "enforcement_actions"("tenantId", "entityType", "entityId", "status");

CREATE INDEX "enforcement_actions_tenantId_actionType_status_idx"
ON "enforcement_actions"("tenantId", "actionType", "status");

CREATE INDEX "enforcement_actions_policyRuleId_idx"
ON "enforcement_actions"("policyRuleId");

ALTER TABLE "enforcement_actions"
ADD CONSTRAINT "enforcement_actions_policyRuleId_fkey"
FOREIGN KEY ("policyRuleId") REFERENCES "policy_rules"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "driver_guarantors"
ADD COLUMN "responsibilityAcceptedAt" TIMESTAMP(3),
ADD COLUMN "responsibilityAcceptanceEvidence" JSONB;

ALTER TABLE "assignments"
ADD COLUMN "contractVersion" TEXT,
ADD COLUMN "contractSnapshot" JSONB,
ADD COLUMN "driverAcceptedTermsAt" TIMESTAMP(3),
ADD COLUMN "driverAcceptanceEvidence" JSONB,
ADD COLUMN "contractStatus" TEXT NOT NULL DEFAULT 'pending_acceptance';

ALTER TABLE "remittances"
ADD COLUMN "clientReferenceId" TEXT,
ADD COLUMN "submissionSource" TEXT NOT NULL DEFAULT 'online',
ADD COLUMN "syncStatus" TEXT NOT NULL DEFAULT 'synced',
ADD COLUMN "originalCapturedAt" TIMESTAMP(3),
ADD COLUMN "syncedAt" TIMESTAMP(3),
ADD COLUMN "evidence" JSONB,
ADD COLUMN "shiftCode" TEXT,
ADD COLUMN "checkpointLabel" TEXT,
ADD COLUMN "shortfallAmountMinorUnits" INTEGER NOT NULL DEFAULT 0;

CREATE INDEX "remittances_tenantId_syncStatus_idx"
ON "remittances"("tenantId", "syncStatus");

CREATE UNIQUE INDEX "remittances_tenantId_clientReferenceId_key"
ON "remittances"("tenantId", "clientReferenceId");
