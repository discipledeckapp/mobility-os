CREATE TABLE "driver_guarantors" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "driverId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "relationship" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "driver_guarantors_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "driver_guarantors_driverId_key" ON "driver_guarantors"("driverId");
CREATE INDEX "driver_guarantors_tenantId_idx" ON "driver_guarantors"("tenantId");
CREATE INDEX "driver_guarantors_driverId_idx" ON "driver_guarantors"("driverId");

ALTER TABLE "driver_guarantors"
ADD CONSTRAINT "driver_guarantors_driverId_fkey"
FOREIGN KEY ("driverId") REFERENCES "drivers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
