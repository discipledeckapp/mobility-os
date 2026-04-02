ALTER TABLE "driver_guarantors"
ADD COLUMN "inviteStatus" TEXT NOT NULL DEFAULT 'not_sent',
ADD COLUMN "lastInviteSentAt" TIMESTAMP(3),
ADD COLUMN "inviteExpiresAt" TIMESTAMP(3),
ADD COLUMN "guarantorReminderCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "lastGuarantorReminderSentAt" TIMESTAMP(3),
ADD COLUMN "guarantorReminderSuppressed" BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX "driver_guarantors_inviteStatus_idx"
ON "driver_guarantors"("inviteStatus");

CREATE INDEX "driver_guarantors_guarantorReminderSuppressed_idx"
ON "driver_guarantors"("guarantorReminderSuppressed");
