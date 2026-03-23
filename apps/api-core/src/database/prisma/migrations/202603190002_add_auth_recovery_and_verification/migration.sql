ALTER TABLE "users"
ADD COLUMN "isEmailVerified" BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE "auth_otps" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "codeHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "consumedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "auth_otps_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "password_reset_tokens" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "consumedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "password_reset_tokens_tokenHash_key"
ON "password_reset_tokens"("tokenHash");

CREATE INDEX "auth_otps_userId_purpose_idx"
ON "auth_otps"("userId", "purpose");

CREATE INDEX "auth_otps_identifier_purpose_idx"
ON "auth_otps"("identifier", "purpose");

CREATE INDEX "auth_otps_expiresAt_idx"
ON "auth_otps"("expiresAt");

CREATE INDEX "password_reset_tokens_userId_idx"
ON "password_reset_tokens"("userId");

CREATE INDEX "password_reset_tokens_expiresAt_idx"
ON "password_reset_tokens"("expiresAt");

ALTER TABLE "auth_otps"
ADD CONSTRAINT "auth_otps_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "users"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "password_reset_tokens"
ADD CONSTRAINT "password_reset_tokens_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "users"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
