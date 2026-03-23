-- ── Tenants ────────────────────────────────────────────────────────────────────
CREATE TABLE "tenants" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'prospect',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "tenants_slug_key" ON "tenants"("slug");

-- ── Business Entities ──────────────────────────────────────────────────────────
CREATE TABLE "business_entities" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "businessModel" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "business_entities_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "business_entities_tenantId_idx" ON "business_entities"("tenantId");

ALTER TABLE "business_entities"
    ADD CONSTRAINT "business_entities_tenantId_fkey"
    FOREIGN KEY ("tenantId") REFERENCES "tenants"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

-- ── Operating Units ────────────────────────────────────────────────────────────
CREATE TABLE "operating_units" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "businessEntityId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "operating_units_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "operating_units_tenantId_idx" ON "operating_units"("tenantId");
CREATE INDEX "operating_units_businessEntityId_idx" ON "operating_units"("businessEntityId");

ALTER TABLE "operating_units"
    ADD CONSTRAINT "operating_units_businessEntityId_fkey"
    FOREIGN KEY ("businessEntityId") REFERENCES "business_entities"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

-- ── Fleets ─────────────────────────────────────────────────────────────────────
CREATE TABLE "fleets" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "operatingUnitId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "businessModel" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "fleets_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "fleets_tenantId_idx" ON "fleets"("tenantId");
CREATE INDEX "fleets_operatingUnitId_idx" ON "fleets"("operatingUnitId");

ALTER TABLE "fleets"
    ADD CONSTRAINT "fleets_operatingUnitId_fkey"
    FOREIGN KEY ("operatingUnitId") REFERENCES "operating_units"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

-- ── Drivers ────────────────────────────────────────────────────────────────────
-- identity/liveness columns are added by migrations 004 and 005
CREATE TABLE "drivers" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "fleetId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'inactive',
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "dateOfBirth" TEXT,
    "nationality" TEXT,
    "personId" TEXT,
    "businessEntityId" TEXT NOT NULL,
    "operatingUnitId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "drivers_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "drivers_tenantId_idx" ON "drivers"("tenantId");
CREATE INDEX "drivers_fleetId_idx" ON "drivers"("fleetId");
CREATE INDEX "drivers_personId_idx" ON "drivers"("personId");
CREATE UNIQUE INDEX "drivers_tenantId_phone_key" ON "drivers"("tenantId", "phone");

ALTER TABLE "drivers"
    ADD CONSTRAINT "drivers_fleetId_fkey"
    FOREIGN KEY ("fleetId") REFERENCES "fleets"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

-- ── Vehicles ───────────────────────────────────────────────────────────────────
-- trim added by 002; systemVehicleCode/tenantVehicleCode added by 003
CREATE TABLE "vehicles" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "fleetId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'available',
    "vehicleType" TEXT NOT NULL,
    "make" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "plate" TEXT,
    "color" TEXT,
    "vin" TEXT,
    "operatingUnitId" TEXT NOT NULL,
    "businessEntityId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "vehicles_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "vehicles_tenantId_idx" ON "vehicles"("tenantId");
CREATE INDEX "vehicles_fleetId_idx" ON "vehicles"("fleetId");

ALTER TABLE "vehicles"
    ADD CONSTRAINT "vehicles_fleetId_fkey"
    FOREIGN KEY ("fleetId") REFERENCES "fleets"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

-- ── Assignments ────────────────────────────────────────────────────────────────
CREATE TABLE "assignments" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "fleetId" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'assigned',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "notes" TEXT,
    "operatingUnitId" TEXT NOT NULL,
    "businessEntityId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "assignments_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "assignments_tenantId_idx" ON "assignments"("tenantId");
CREATE INDEX "assignments_driverId_idx" ON "assignments"("driverId");
CREATE INDEX "assignments_vehicleId_idx" ON "assignments"("vehicleId");
CREATE INDEX "assignments_fleetId_status_idx" ON "assignments"("fleetId", "status");

-- ── Remittances ────────────────────────────────────────────────────────────────
CREATE TABLE "remittances" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "assignmentId" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "amountMinorUnits" INTEGER NOT NULL,
    "currency" TEXT NOT NULL,
    "dueDate" TEXT NOT NULL,
    "paidDate" TEXT,
    "notes" TEXT,
    "fleetId" TEXT NOT NULL,
    "operatingUnitId" TEXT NOT NULL,
    "businessEntityId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "remittances_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "remittances_tenantId_idx" ON "remittances"("tenantId");
CREATE INDEX "remittances_assignmentId_idx" ON "remittances"("assignmentId");
CREATE INDEX "remittances_driverId_idx" ON "remittances"("driverId");
CREATE INDEX "remittances_tenantId_status_idx" ON "remittances"("tenantId", "status");

-- ── Operational Wallets ────────────────────────────────────────────────────────
CREATE TABLE "ow_wallets" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "businessEntityId" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ow_wallets_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ow_wallets_businessEntityId_key" ON "ow_wallets"("businessEntityId");
CREATE INDEX "ow_wallets_tenantId_idx" ON "ow_wallets"("tenantId");

-- ── Operational Wallet Entries ─────────────────────────────────────────────────
CREATE TABLE "ow_wallet_entries" (
    "id" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amountMinorUnits" INTEGER NOT NULL,
    "currency" TEXT NOT NULL,
    "referenceId" TEXT,
    "referenceType" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ow_wallet_entries_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ow_wallet_entries_walletId_idx" ON "ow_wallet_entries"("walletId");

ALTER TABLE "ow_wallet_entries"
    ADD CONSTRAINT "ow_wallet_entries_walletId_fkey"
    FOREIGN KEY ("walletId") REFERENCES "ow_wallets"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

-- ── Users ──────────────────────────────────────────────────────────────────────
-- phone added by 001; isEmailVerified/auth_otps/password_reset_tokens added by 002
-- driverId added by 011; mobileAccessRevoked added by 012
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "businessEntityId" TEXT,
    "operatingUnitId" TEXT,
    "passwordHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "users_tenantId_email_key" ON "users"("tenantId", "email");
CREATE INDEX "users_tenantId_idx" ON "users"("tenantId");

ALTER TABLE "users"
    ADD CONSTRAINT "users_tenantId_fkey"
    FOREIGN KEY ("tenantId") REFERENCES "tenants"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;
