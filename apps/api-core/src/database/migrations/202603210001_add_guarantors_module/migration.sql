CREATE TABLE "guarantors" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "fleetId" TEXT NOT NULL,
  "personId" TEXT,
  "name" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "countryCode" TEXT,
  "relationship" TEXT,
  "status" TEXT NOT NULL DEFAULT 'active',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "guarantors_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "guarantor_driver_links" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "guarantorId" TEXT NOT NULL,
  "driverId" TEXT NOT NULL,
  "fleetId" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'active',
  "linkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "unlinkedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "guarantor_driver_links_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "guarantors_tenantId_phone_key" ON "guarantors"("tenantId", "phone");
CREATE INDEX "guarantors_tenantId_idx" ON "guarantors"("tenantId");
CREATE INDEX "guarantors_fleetId_idx" ON "guarantors"("fleetId");
CREATE INDEX "guarantors_personId_idx" ON "guarantors"("personId");
CREATE INDEX "guarantors_status_idx" ON "guarantors"("status");

CREATE UNIQUE INDEX "guarantor_driver_links_guarantorId_driverId_key" ON "guarantor_driver_links"("guarantorId", "driverId");
CREATE INDEX "guarantor_driver_links_tenantId_idx" ON "guarantor_driver_links"("tenantId");
CREATE INDEX "guarantor_driver_links_guarantorId_idx" ON "guarantor_driver_links"("guarantorId");
CREATE INDEX "guarantor_driver_links_driverId_idx" ON "guarantor_driver_links"("driverId");
CREATE INDEX "guarantor_driver_links_fleetId_idx" ON "guarantor_driver_links"("fleetId");
CREATE INDEX "guarantor_driver_links_status_idx" ON "guarantor_driver_links"("status");

ALTER TABLE "guarantors"
ADD CONSTRAINT "guarantors_fleetId_fkey"
FOREIGN KEY ("fleetId") REFERENCES "fleets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "guarantor_driver_links"
ADD CONSTRAINT "guarantor_driver_links_guarantorId_fkey"
FOREIGN KEY ("guarantorId") REFERENCES "guarantors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "guarantor_driver_links"
ADD CONSTRAINT "guarantor_driver_links_driverId_fkey"
FOREIGN KEY ("driverId") REFERENCES "drivers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
