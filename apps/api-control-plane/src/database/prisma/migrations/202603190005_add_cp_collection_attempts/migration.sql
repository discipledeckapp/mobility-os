CREATE TABLE "cp_collection_attempts" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "provider" TEXT,
    "paymentReference" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cp_collection_attempts_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "cp_collection_attempts_invoiceId_kind_status_idx"
ON "cp_collection_attempts"("invoiceId", "kind", "status");

CREATE INDEX "cp_collection_attempts_tenantId_createdAt_idx"
ON "cp_collection_attempts"("tenantId", "createdAt");

CREATE INDEX "cp_collection_attempts_subscriptionId_createdAt_idx"
ON "cp_collection_attempts"("subscriptionId", "createdAt");

ALTER TABLE "cp_collection_attempts"
ADD CONSTRAINT "cp_collection_attempts_invoiceId_fkey"
FOREIGN KEY ("invoiceId") REFERENCES "cp_invoices"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
