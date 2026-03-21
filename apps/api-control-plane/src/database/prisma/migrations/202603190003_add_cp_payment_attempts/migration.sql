CREATE TABLE "cp_payment_attempts" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "tenantId" TEXT,
    "invoiceId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'initialized',
    "amountMinorUnits" INTEGER NOT NULL,
    "currency" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "customerName" TEXT,
    "checkoutUrl" TEXT,
    "accessCode" TEXT,
    "providerPayload" JSONB,
    "failureReason" TEXT,
    "paidAt" TIMESTAMP(3),
    "appliedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cp_payment_attempts_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "cp_payment_attempts_reference_key" ON "cp_payment_attempts"("reference");
CREATE INDEX "cp_payment_attempts_provider_status_idx" ON "cp_payment_attempts"("provider", "status");
CREATE INDEX "cp_payment_attempts_tenantId_idx" ON "cp_payment_attempts"("tenantId");
CREATE INDEX "cp_payment_attempts_invoiceId_idx" ON "cp_payment_attempts"("invoiceId");
