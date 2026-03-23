CREATE TABLE "vehicle_makers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "normalizedName" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "externalSource" TEXT,
    "externalId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehicle_makers_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "vehicle_models" (
    "id" TEXT NOT NULL,
    "makerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "normalizedName" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "vehicleCategory" TEXT,
    "sourceTypeLabel" TEXT,
    "externalSource" TEXT,
    "externalId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehicle_models_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "vehicle_makers_normalizedName_key"
ON "vehicle_makers"("normalizedName");

CREATE UNIQUE INDEX "vehicle_models_makerId_normalizedName_key"
ON "vehicle_models"("makerId", "normalizedName");

CREATE INDEX "vehicle_makers_status_idx"
ON "vehicle_makers"("status");

CREATE INDEX "vehicle_models_makerId_idx"
ON "vehicle_models"("makerId");

CREATE INDEX "vehicle_models_status_idx"
ON "vehicle_models"("status");

CREATE INDEX "vehicle_models_vehicleCategory_idx"
ON "vehicle_models"("vehicleCategory");

ALTER TABLE "vehicle_models"
ADD CONSTRAINT "vehicle_models_makerId_fkey"
FOREIGN KEY ("makerId") REFERENCES "vehicle_makers"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "vehicle_vin_decodes" (
    "id" TEXT NOT NULL,
    "vin" TEXT NOT NULL,
    "normalizedVin" TEXT NOT NULL,
    "decodeKey" TEXT NOT NULL,
    "requestedModelYear" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'decoded',
    "source" TEXT NOT NULL DEFAULT 'nhtsa-vpic',
    "sourceVersion" TEXT,
    "errorCode" TEXT,
    "errorText" TEXT,
    "rawPayload" JSONB NOT NULL,
    "decodedMake" TEXT,
    "decodedModel" TEXT,
    "decodedModelYear" INTEGER,
    "vehicleType" TEXT,
    "bodyClass" TEXT,
    "manufacturerName" TEXT,
    "makerId" TEXT,
    "modelId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehicle_vin_decodes_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "vehicle_vin_decodes_decodeKey_key"
ON "vehicle_vin_decodes"("decodeKey");

CREATE INDEX "vehicle_vin_decodes_normalizedVin_idx"
ON "vehicle_vin_decodes"("normalizedVin");

CREATE INDEX "vehicle_vin_decodes_makerId_idx"
ON "vehicle_vin_decodes"("makerId");

CREATE INDEX "vehicle_vin_decodes_modelId_idx"
ON "vehicle_vin_decodes"("modelId");

ALTER TABLE "vehicle_vin_decodes"
ADD CONSTRAINT "vehicle_vin_decodes_makerId_fkey"
FOREIGN KEY ("makerId") REFERENCES "vehicle_makers"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "vehicle_vin_decodes"
ADD CONSTRAINT "vehicle_vin_decodes_modelId_fkey"
FOREIGN KEY ("modelId") REFERENCES "vehicle_models"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
