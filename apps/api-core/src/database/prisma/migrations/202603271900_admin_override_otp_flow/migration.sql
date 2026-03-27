ALTER TABLE "drivers"
ADD COLUMN "adminAssignmentOverrideRequestedAt" TIMESTAMP(3),
ADD COLUMN "adminAssignmentOverrideRequestedBy" TEXT,
ADD COLUMN "adminAssignmentOverrideReason" TEXT,
ADD COLUMN "adminAssignmentOverrideEvidence" JSONB,
ADD COLUMN "adminAssignmentOverrideOtpHash" TEXT,
ADD COLUMN "adminAssignmentOverrideOtpExpiresAt" TIMESTAMP(3),
ADD COLUMN "adminAssignmentOverrideConfirmedAt" TIMESTAMP(3),
ADD COLUMN "adminAssignmentOverrideConfirmedBy" TEXT;
