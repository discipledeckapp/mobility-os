-- Per-driver override for the driverPaysKyc org-level setting.
-- NULL = inherit from org; TRUE = driver pays; FALSE = org pays regardless of org setting.
ALTER TABLE "drivers"
  ADD COLUMN "driverPaysKycOverride" BOOLEAN;
