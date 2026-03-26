-- Add KYC payment tracking to drivers
ALTER TABLE "drivers"
  ADD COLUMN "kycPaymentReference" TEXT,
  ADD COLUMN "kycPaymentVerifiedAt" TIMESTAMP(3);
