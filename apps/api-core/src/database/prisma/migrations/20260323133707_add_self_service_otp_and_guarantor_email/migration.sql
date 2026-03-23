-- DropIndex
DROP INDEX "drivers_identityReviewCaseId_idx";

-- DropIndex
DROP INDEX "drivers_identityStatus_idx";

-- AlterTable
ALTER TABLE "driver_documents" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "driver_guarantors" ADD COLUMN     "email" TEXT;

-- AlterTable
ALTER TABLE "guarantors" ADD COLUMN     "email" TEXT;

-- CreateTable
CREATE TABLE "self_service_otps" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "subjectType" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "otpCode" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "self_service_otps_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "self_service_otps_otpCode_key" ON "self_service_otps"("otpCode");

-- CreateIndex
CREATE INDEX "self_service_otps_otpCode_idx" ON "self_service_otps"("otpCode");

-- CreateIndex
CREATE INDEX "self_service_otps_tenantId_subjectId_idx" ON "self_service_otps"("tenantId", "subjectId");
