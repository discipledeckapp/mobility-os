CREATE TABLE "driver_documents" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "driverId" TEXT NOT NULL,
  "documentType" TEXT NOT NULL,
  "fileName" TEXT NOT NULL,
  "contentType" TEXT NOT NULL,
  "fileDataUrl" TEXT NOT NULL,
  "uploadedBy" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "driver_documents_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "driver_documents_tenantId_idx" ON "driver_documents"("tenantId");
CREATE INDEX "driver_documents_driverId_idx" ON "driver_documents"("driverId");

ALTER TABLE "driver_documents"
ADD CONSTRAINT "driver_documents_driverId_fkey"
FOREIGN KEY ("driverId") REFERENCES "drivers"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
