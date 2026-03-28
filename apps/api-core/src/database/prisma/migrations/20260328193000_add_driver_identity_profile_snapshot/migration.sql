ALTER TABLE "drivers"
ADD COLUMN "identitySignatureImageUrl" TEXT,
ADD COLUMN "identityProfile" JSONB,
ADD COLUMN "identityVerificationMetadata" JSONB,
ADD COLUMN "identityProviderRawData" JSONB;
