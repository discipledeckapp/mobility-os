ALTER TABLE "drivers"
ADD COLUMN "identityLivenessPassed" BOOLEAN,
ADD COLUMN "identityLivenessProvider" TEXT,
ADD COLUMN "identityLivenessConfidence" DOUBLE PRECISION,
ADD COLUMN "identityLivenessReason" TEXT;
