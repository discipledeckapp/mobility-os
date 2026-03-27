CREATE TABLE "verification_entitlements" (
  "id" TEXT NOT NULL,
  "entitlementCode" TEXT NOT NULL,
  "subjectType" TEXT NOT NULL,
  "subjectId" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "payerType" TEXT NOT NULL,
  "paymentReference" TEXT,
  "paymentProvider" TEXT,
  "amountMinorUnits" INTEGER NOT NULL,
  "currency" TEXT NOT NULL,
  "purpose" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "paidAt" TIMESTAMP(3),
  "reservedAt" TIMESTAMP(3),
  "consumedAt" TIMESTAMP(3),
  "expiresAt" TIMESTAMP(3),
  "consumedByAttemptId" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "verification_entitlements_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "verification_entitlements_entitlementCode_key"
  ON "verification_entitlements"("entitlementCode");

CREATE INDEX "verification_entitlements_tenant_subject_status_idx"
  ON "verification_entitlements"("tenantId", "subjectType", "subjectId", "status");

CREATE INDEX "verification_entitlements_paymentReference_idx"
  ON "verification_entitlements"("paymentReference");

CREATE TABLE "verification_attempts" (
  "id" TEXT NOT NULL,
  "attemptCode" TEXT NOT NULL,
  "subjectType" TEXT NOT NULL,
  "subjectId" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "entitlementId" TEXT,
  "attemptType" TEXT NOT NULL,
  "requestFingerprint" TEXT,
  "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "completedAt" TIMESTAMP(3),
  "status" TEXT NOT NULL DEFAULT 'initiated',
  "failureReason" TEXT,
  "providerCostIncurred" BOOLEAN NOT NULL DEFAULT false,
  "billableStageReached" BOOLEAN NOT NULL DEFAULT false,
  "providerCallCount" INTEGER NOT NULL DEFAULT 0,
  "livenessCallCount" INTEGER NOT NULL DEFAULT 0,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "verification_attempts_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "verification_attempts_attemptCode_key"
  ON "verification_attempts"("attemptCode");

CREATE INDEX "verification_attempts_tenant_subject_status_idx"
  ON "verification_attempts"("tenantId", "subjectType", "subjectId", "status");

CREATE INDEX "verification_attempts_entitlementId_idx"
  ON "verification_attempts"("entitlementId");

CREATE INDEX "verification_attempts_requestFingerprint_idx"
  ON "verification_attempts"("requestFingerprint");
