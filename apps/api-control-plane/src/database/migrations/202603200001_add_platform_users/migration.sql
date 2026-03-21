CREATE TABLE "cp_platform_users" (
  "id" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "role" TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "cp_platform_users_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "cp_platform_users_email_key" ON "cp_platform_users"("email");
CREATE INDEX "cp_platform_users_email_isActive_idx" ON "cp_platform_users"("email", "isActive");
