ALTER TABLE "users"
ADD COLUMN "phone" TEXT;

CREATE UNIQUE INDEX "users_tenantId_phone_key"
ON "users"("tenantId", "phone");
