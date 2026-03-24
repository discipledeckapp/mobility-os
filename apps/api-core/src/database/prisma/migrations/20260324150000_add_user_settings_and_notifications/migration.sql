ALTER TABLE "users"
ADD COLUMN "settings" JSONB;

CREATE TABLE "user_notifications" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "topic" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "actionUrl" TEXT,
  "metadata" JSONB,
  "readAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "user_notifications_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "user_push_devices" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "deviceToken" TEXT NOT NULL,
  "platform" TEXT NOT NULL,
  "disabledAt" TIMESTAMP(3),
  "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "user_push_devices_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "user_notifications_tenantId_userId_createdAt_idx"
ON "user_notifications"("tenantId", "userId", "createdAt");

CREATE INDEX "user_notifications_tenantId_userId_readAt_idx"
ON "user_notifications"("tenantId", "userId", "readAt");

CREATE INDEX "user_notifications_topic_idx"
ON "user_notifications"("topic");

CREATE INDEX "user_push_devices_tenantId_userId_idx"
ON "user_push_devices"("tenantId", "userId");

CREATE INDEX "user_push_devices_deviceToken_idx"
ON "user_push_devices"("deviceToken");

CREATE UNIQUE INDEX "user_push_devices_userId_deviceToken_key"
ON "user_push_devices"("userId", "deviceToken");

ALTER TABLE "user_notifications"
ADD CONSTRAINT "user_notifications_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "users"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "user_push_devices"
ADD CONSTRAINT "user_push_devices_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "users"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
