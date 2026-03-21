ALTER TABLE "driver_guarantors"
ADD COLUMN "personId" TEXT,
ADD COLUMN "countryCode" TEXT;

CREATE INDEX "driver_guarantors_personId_idx" ON "driver_guarantors"("personId");
