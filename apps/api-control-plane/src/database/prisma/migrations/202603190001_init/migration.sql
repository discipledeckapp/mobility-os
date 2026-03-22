-- Initial migration: creates all base tables for the control plane.
-- Tables added by subsequent migrations (002–005) are NOT included here.

CREATE TABLE "cp_platform_users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "cp_platform_users_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "cp_platform_users_email_key" ON "cp_platform_users"("email");
CREATE INDEX "cp_platform_users_email_isActive_idx" ON "cp_platform_users"("email", "isActive");

CREATE TABLE "cp_plans" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tier" TEXT NOT NULL,
    "billingInterval" TEXT NOT NULL,
    "basePriceMinorUnits" INTEGER NOT NULL,
    "currency" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "features" JSONB NOT NULL,
    "customTerms" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "cp_plans_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "cp_subscriptions" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'trialing',
    "currentPeriodStart" TIMESTAMP(3) NOT NULL,
    "currentPeriodEnd" TIMESTAMP(3) NOT NULL,
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "trialEndsAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "cp_subscriptions_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "cp_subscriptions_tenantId_key" ON "cp_subscriptions"("tenantId");
CREATE INDEX "cp_subscriptions_tenantId_idx" ON "cp_subscriptions"("tenantId");
ALTER TABLE "cp_subscriptions"
    ADD CONSTRAINT "cp_subscriptions_planId_fkey"
    FOREIGN KEY ("planId") REFERENCES "cp_plans"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "cp_invoices" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "amountDueMinorUnits" INTEGER NOT NULL,
    "amountPaidMinorUnits" INTEGER NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "dueAt" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "cp_invoices_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "cp_invoices_tenantId_idx" ON "cp_invoices"("tenantId");
CREATE INDEX "cp_invoices_subscriptionId_idx" ON "cp_invoices"("subscriptionId");
ALTER TABLE "cp_invoices"
    ADD CONSTRAINT "cp_invoices_subscriptionId_fkey"
    FOREIGN KEY ("subscriptionId") REFERENCES "cp_subscriptions"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "cp_platform_wallets" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "cp_platform_wallets_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "cp_platform_wallets_tenantId_key" ON "cp_platform_wallets"("tenantId");

CREATE TABLE "cp_wallet_entries" (
    "id" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amountMinorUnits" INTEGER NOT NULL,
    "currency" TEXT NOT NULL,
    "referenceId" TEXT,
    "referenceType" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "cp_wallet_entries_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "cp_wallet_entries_walletId_idx" ON "cp_wallet_entries"("walletId");
ALTER TABLE "cp_wallet_entries"
    ADD CONSTRAINT "cp_wallet_entries_walletId_fkey"
    FOREIGN KEY ("walletId") REFERENCES "cp_platform_wallets"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "cp_feature_flags" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "scope" TEXT NOT NULL DEFAULT 'global',
    "value" JSONB NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT false,
    "ownedBy" TEXT,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "cp_feature_flags_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "cp_feature_flags_key_key" ON "cp_feature_flags"("key");

CREATE TABLE "cp_feature_flag_overrides" (
    "id" TEXT NOT NULL,
    "flagId" TEXT NOT NULL,
    "tenantId" TEXT,
    "countryCode" TEXT,
    "planTier" TEXT,
    "value" JSONB NOT NULL,
    "isEnabled" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "cp_feature_flag_overrides_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "cp_feature_flag_overrides_flagId_idx" ON "cp_feature_flag_overrides"("flagId");
CREATE INDEX "cp_feature_flag_overrides_tenantId_idx" ON "cp_feature_flag_overrides"("tenantId");
ALTER TABLE "cp_feature_flag_overrides"
    ADD CONSTRAINT "cp_feature_flag_overrides_flagId_fkey"
    FOREIGN KEY ("flagId") REFERENCES "cp_feature_flags"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- countryCode column is intentionally absent here — added by migration 004.
CREATE TABLE "cp_usage_events" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "idempotencyKey" TEXT NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "cp_usage_events_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "cp_usage_events_idempotencyKey_key" ON "cp_usage_events"("idempotencyKey");
CREATE INDEX "cp_usage_events_tenantId_eventType_idx" ON "cp_usage_events"("tenantId", "eventType");
CREATE INDEX "cp_usage_events_occurredAt_idx" ON "cp_usage_events"("occurredAt");

CREATE TABLE "cp_tenant_lifecycle_events" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "fromStatus" TEXT,
    "toStatus" TEXT NOT NULL,
    "triggeredBy" TEXT NOT NULL,
    "actorId" TEXT,
    "reason" TEXT,
    "metadata" JSONB,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "cp_tenant_lifecycle_events_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "cp_tenant_lifecycle_events_tenantId_idx" ON "cp_tenant_lifecycle_events"("tenantId");
