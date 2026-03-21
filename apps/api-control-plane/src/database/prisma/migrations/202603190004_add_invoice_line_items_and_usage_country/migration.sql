ALTER TABLE "cp_usage_events"
ADD COLUMN "countryCode" TEXT;

CREATE TABLE "cp_invoice_line_items" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitAmountMinorUnits" INTEGER NOT NULL,
    "amountMinorUnits" INTEGER NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cp_invoice_line_items_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "cp_invoice_line_items_invoiceId_idx" ON "cp_invoice_line_items"("invoiceId");

ALTER TABLE "cp_invoice_line_items"
ADD CONSTRAINT "cp_invoice_line_items_invoiceId_fkey"
FOREIGN KEY ("invoiceId") REFERENCES "cp_invoices"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
