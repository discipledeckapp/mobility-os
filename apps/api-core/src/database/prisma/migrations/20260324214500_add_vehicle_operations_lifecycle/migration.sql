ALTER TABLE "vehicles"
ADD COLUMN "odometerKm" INTEGER;

CREATE TABLE "vehicle_inspections" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "vehicleId" TEXT NOT NULL,
  "createdByUserId" TEXT,
  "inspectionType" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'passed',
  "inspectionDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "odometerKm" INTEGER,
  "issuesFoundCount" INTEGER NOT NULL DEFAULT 0,
  "reportSource" TEXT NOT NULL DEFAULT 'in_app',
  "summary" TEXT NOT NULL,
  "reportUrl" TEXT,
  "nextInspectionDueAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "vehicle_inspections_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "vehicle_inspections_tenantId_vehicleId_inspectionDate_idx"
ON "vehicle_inspections"("tenantId", "vehicleId", "inspectionDate");

ALTER TABLE "vehicle_inspections"
ADD CONSTRAINT "vehicle_inspections_vehicleId_fkey"
FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "vehicle_maintenance_schedules" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "vehicleId" TEXT NOT NULL,
  "createdByUserId" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "scheduleType" TEXT NOT NULL,
  "intervalDays" INTEGER,
  "intervalKm" INTEGER,
  "nextDueAt" TIMESTAMP(3),
  "nextDueOdometerKm" INTEGER,
  "source" TEXT NOT NULL DEFAULT 'default',
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "vehicle_maintenance_schedules_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "vehicle_maintenance_schedules_tenantId_vehicleId_isActive_idx"
ON "vehicle_maintenance_schedules"("tenantId", "vehicleId", "isActive");

ALTER TABLE "vehicle_maintenance_schedules"
ADD CONSTRAINT "vehicle_maintenance_schedules_vehicleId_fkey"
FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "vehicle_maintenance_events" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "vehicleId" TEXT NOT NULL,
  "createdByUserId" TEXT,
  "category" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "status" TEXT NOT NULL DEFAULT 'scheduled',
  "scheduledFor" TIMESTAMP(3),
  "completedAt" TIMESTAMP(3),
  "odometerKm" INTEGER,
  "costMinorUnits" INTEGER,
  "currency" TEXT,
  "vendor" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "vehicle_maintenance_events_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "vehicle_maintenance_events_tenantId_vehicleId_status_idx"
ON "vehicle_maintenance_events"("tenantId", "vehicleId", "status");

CREATE INDEX "vehicle_maintenance_events_tenantId_vehicleId_scheduledFor_idx"
ON "vehicle_maintenance_events"("tenantId", "vehicleId", "scheduledFor");

ALTER TABLE "vehicle_maintenance_events"
ADD CONSTRAINT "vehicle_maintenance_events_vehicleId_fkey"
FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "vehicle_incidents" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "vehicleId" TEXT NOT NULL,
  "driverId" TEXT,
  "reportedByUserId" TEXT,
  "occurredAt" TIMESTAMP(3) NOT NULL,
  "category" TEXT NOT NULL,
  "severity" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "status" TEXT NOT NULL DEFAULT 'reported',
  "estimatedCostMinorUnits" INTEGER,
  "currency" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "vehicle_incidents_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "vehicle_incidents_tenantId_vehicleId_occurredAt_idx"
ON "vehicle_incidents"("tenantId", "vehicleId", "occurredAt");

CREATE INDEX "vehicle_incidents_tenantId_vehicleId_status_idx"
ON "vehicle_incidents"("tenantId", "vehicleId", "status");

ALTER TABLE "vehicle_incidents"
ADD CONSTRAINT "vehicle_incidents_vehicleId_fkey"
FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
