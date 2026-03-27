CREATE TABLE "data_subject_requests" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "subjectType" TEXT NOT NULL,
    "subjectId" TEXT,
    "requestType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "contactEmail" TEXT,
    "details" TEXT,
    "resolutionNotes" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "data_subject_requests_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "data_subject_requests_tenantId_userId_createdAt_idx" ON "data_subject_requests"("tenantId", "userId", "createdAt");
CREATE INDEX "data_subject_requests_tenantId_subjectType_subjectId_idx" ON "data_subject_requests"("tenantId", "subjectType", "subjectId");
CREATE INDEX "data_subject_requests_tenantId_status_requestType_idx" ON "data_subject_requests"("tenantId", "status", "requestType");

ALTER TABLE "data_subject_requests"
ADD CONSTRAINT "data_subject_requests_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
