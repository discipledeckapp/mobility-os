-- Structured platform-admin settings for non-boolean governance controls.
-- This is separate from feature flags because these records store governed
-- configuration objects such as identity-verification routing policy.

CREATE TABLE "cp_platform_settings" (
  "id" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "description" TEXT,
  "value" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "cp_platform_settings_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "cp_platform_settings_key_key"
ON "cp_platform_settings"("key");
