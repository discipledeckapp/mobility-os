CREATE TABLE "verification_billing_profiles" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "currency" TEXT NOT NULL,
  "starterCreditGrantedAt" TIMESTAMP(3),
  "starterCreditAmountMinorUnits" INTEGER NOT NULL DEFAULT 0,
  "cardCreditLimitMinorUnits" INTEGER NOT NULL DEFAULT 0,
  "cardActivatedAt" TIMESTAMP(3),
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "verification_billing_profiles_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "verification_billing_profiles_tenantId_key"
ON "verification_billing_profiles"("tenantId");

CREATE INDEX "verification_billing_profiles_tenantId_idx"
ON "verification_billing_profiles"("tenantId");

CREATE TABLE "tenant_saved_cards" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "authorizationCodeCiphertext" TEXT NOT NULL,
  "customerCodeCiphertext" TEXT NOT NULL,
  "last4" TEXT NOT NULL,
  "brand" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'active',
  "initialReference" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "tenant_saved_cards_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "tenant_saved_cards_tenantId_key"
ON "tenant_saved_cards"("tenantId");

CREATE INDEX "tenant_saved_cards_tenantId_status_idx"
ON "tenant_saved_cards"("tenantId", "status");

CREATE TABLE "verification_charge_audits" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "subjectType" TEXT NOT NULL,
  "subjectId" TEXT NOT NULL,
  "verificationTier" TEXT NOT NULL,
  "amountMinorUnits" INTEGER NOT NULL,
  "currency" TEXT NOT NULL,
  "fundingSource" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'applied',
  "paymentReference" TEXT,
  "consentedByUserId" TEXT,
  "consentedAt" TIMESTAMP(3),
  "description" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "verification_charge_audits_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "verification_charge_audits_tenant_subject_tier_status_idx"
ON "verification_charge_audits"("tenantId", "subjectType", "subjectId", "verificationTier", "status");

CREATE INDEX "verification_charge_audits_tenantId_createdAt_idx"
ON "verification_charge_audits"("tenantId", "createdAt");
