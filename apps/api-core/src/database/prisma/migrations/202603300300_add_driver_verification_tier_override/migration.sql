ALTER TABLE "drivers"
ADD COLUMN "verificationTierOverride" TEXT;

CREATE INDEX "drivers_tenantId_verificationTierOverride_idx"
ON "drivers"("tenantId", "verificationTierOverride");
