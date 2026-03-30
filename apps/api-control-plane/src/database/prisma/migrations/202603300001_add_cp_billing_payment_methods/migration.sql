CREATE TABLE "cp_billing_payment_methods" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "authorizationCodeCiphertext" TEXT NOT NULL,
    "customerCodeCiphertext" TEXT NOT NULL,
    "last4" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "autopayEnabled" BOOLEAN NOT NULL DEFAULT false,
    "initialReference" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cp_billing_payment_methods_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "cp_billing_payment_methods_tenantId_key" ON "cp_billing_payment_methods"("tenantId");
CREATE INDEX "cp_billing_payment_methods_tenantId_active_idx" ON "cp_billing_payment_methods"("tenantId", "active");
