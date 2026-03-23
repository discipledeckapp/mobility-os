ALTER TABLE "users"
ADD COLUMN "driverId" TEXT;

CREATE UNIQUE INDEX "users_tenantId_driverId_key"
ON "users"("tenantId", "driverId");

CREATE INDEX "users_driverId_idx"
ON "users"("driverId");

ALTER TABLE "users"
ADD CONSTRAINT "users_driverId_fkey"
FOREIGN KEY ("driverId") REFERENCES "drivers"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
