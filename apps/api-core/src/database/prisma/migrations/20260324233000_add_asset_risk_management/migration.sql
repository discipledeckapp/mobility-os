CREATE TABLE "operational_audit_logs" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "actorId" TEXT,
  "entityType" TEXT NOT NULL,
  "entityId" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "beforeState" JSONB,
  "afterState" JSONB,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "operational_audit_logs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "operational_audit_logs_tenantId_entityType_entityId_createdAt_idx"
ON "operational_audit_logs"("tenantId", "entityType", "entityId", "createdAt");

CREATE INDEX "operational_audit_logs_tenantId_actorId_createdAt_idx"
ON "operational_audit_logs"("tenantId", "actorId", "createdAt");

CREATE TABLE "inspection_checklist_templates" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "inspectionType" TEXT NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "requiresReview" BOOLEAN NOT NULL DEFAULT true,
  "defaultPassingScore" INTEGER NOT NULL DEFAULT 80,
  "createdByUserId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "inspection_checklist_templates_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "inspection_checklist_templates_tenantId_inspectionType_isActive_idx"
ON "inspection_checklist_templates"("tenantId", "inspectionType", "isActive");

CREATE TABLE "inspection_checklist_items" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "templateId" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "description" TEXT,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "weight" INTEGER NOT NULL DEFAULT 1,
  "isRequired" BOOLEAN NOT NULL DEFAULT true,
  "requiredMediaKinds" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "inspection_checklist_items_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "inspection_checklist_items_tenantId_templateId_sortOrder_idx"
ON "inspection_checklist_items"("tenantId", "templateId", "sortOrder");

ALTER TABLE "inspection_checklist_items"
ADD CONSTRAINT "inspection_checklist_items_templateId_fkey"
FOREIGN KEY ("templateId") REFERENCES "inspection_checklist_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "inspections" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "vehicleId" TEXT NOT NULL,
  "templateId" TEXT NOT NULL,
  "driverId" TEXT,
  "assignmentId" TEXT,
  "inspectionType" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'draft',
  "reviewDecision" TEXT,
  "reviewComments" TEXT,
  "createdByUserId" TEXT,
  "submittedAt" TIMESTAMP(3),
  "reviewedAt" TIMESTAMP(3),
  "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "completedAt" TIMESTAMP(3),
  "odometerKm" INTEGER,
  "gpsLatitude" DOUBLE PRECISION,
  "gpsLongitude" DOUBLE PRECISION,
  "summary" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "inspections_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "inspections_tenantId_vehicleId_createdAt_idx"
ON "inspections"("tenantId", "vehicleId", "createdAt");

CREATE INDEX "inspections_tenantId_status_inspectionType_idx"
ON "inspections"("tenantId", "status", "inspectionType");

ALTER TABLE "inspections"
ADD CONSTRAINT "inspections_vehicleId_fkey"
FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "inspections"
ADD CONSTRAINT "inspections_templateId_fkey"
FOREIGN KEY ("templateId") REFERENCES "inspection_checklist_templates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "inspection_results" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "inspectionId" TEXT NOT NULL,
  "checklistItemId" TEXT NOT NULL,
  "result" TEXT NOT NULL,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "inspection_results_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "inspection_results_tenantId_inspectionId_idx"
ON "inspection_results"("tenantId", "inspectionId");

CREATE INDEX "inspection_results_tenantId_checklistItemId_idx"
ON "inspection_results"("tenantId", "checklistItemId");

ALTER TABLE "inspection_results"
ADD CONSTRAINT "inspection_results_inspectionId_fkey"
FOREIGN KEY ("inspectionId") REFERENCES "inspections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "inspection_results"
ADD CONSTRAINT "inspection_results_checklistItemId_fkey"
FOREIGN KEY ("checklistItemId") REFERENCES "inspection_checklist_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "inspection_media" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "inspectionId" TEXT NOT NULL,
  "inspectionResultId" TEXT,
  "mediaType" TEXT NOT NULL,
  "viewpoint" TEXT,
  "storageKey" TEXT,
  "storageUrl" TEXT,
  "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "aiAnalysis" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "inspection_media_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "inspection_media_tenantId_inspectionId_idx"
ON "inspection_media"("tenantId", "inspectionId");

CREATE INDEX "inspection_media_tenantId_inspectionResultId_idx"
ON "inspection_media"("tenantId", "inspectionResultId");

ALTER TABLE "inspection_media"
ADD CONSTRAINT "inspection_media_inspectionId_fkey"
FOREIGN KEY ("inspectionId") REFERENCES "inspections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "inspection_media"
ADD CONSTRAINT "inspection_media_inspectionResultId_fkey"
FOREIGN KEY ("inspectionResultId") REFERENCES "inspection_results"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "inspection_reviews" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "inspectionId" TEXT NOT NULL,
  "reviewerUserId" TEXT NOT NULL,
  "decision" TEXT NOT NULL,
  "comments" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "inspection_reviews_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "inspection_reviews_tenantId_inspectionId_createdAt_idx"
ON "inspection_reviews"("tenantId", "inspectionId", "createdAt");

ALTER TABLE "inspection_reviews"
ADD CONSTRAINT "inspection_reviews_inspectionId_fkey"
FOREIGN KEY ("inspectionId") REFERENCES "inspections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "inspection_scores" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "inspectionId" TEXT NOT NULL,
  "score" INTEGER NOT NULL,
  "riskLevel" TEXT NOT NULL,
  "failedItemCount" INTEGER NOT NULL DEFAULT 0,
  "warningItemCount" INTEGER NOT NULL DEFAULT 0,
  "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "inspection_scores_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "inspection_scores_tenantId_inspectionId_calculatedAt_idx"
ON "inspection_scores"("tenantId", "inspectionId", "calculatedAt");

ALTER TABLE "inspection_scores"
ADD CONSTRAINT "inspection_scores_inspectionId_fkey"
FOREIGN KEY ("inspectionId") REFERENCES "inspections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "maintenance_vendors" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "contactName" TEXT,
  "phone" TEXT,
  "email" TEXT,
  "status" TEXT NOT NULL DEFAULT 'approved',
  "rating" DOUBLE PRECISION,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "maintenance_vendors_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "maintenance_vendors_tenantId_status_idx"
ON "maintenance_vendors"("tenantId", "status");

CREATE TABLE "maintenance_schedule_rules" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "vehicleId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "scheduleType" TEXT NOT NULL,
  "intervalDays" INTEGER,
  "intervalKm" INTEGER,
  "nextDueAt" TIMESTAMP(3),
  "nextDueOdometerKm" INTEGER,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "source" TEXT NOT NULL DEFAULT 'default',
  "createdByUserId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "maintenance_schedule_rules_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "maintenance_schedule_rules_tenantId_vehicleId_isActive_idx"
ON "maintenance_schedule_rules"("tenantId", "vehicleId", "isActive");

ALTER TABLE "maintenance_schedule_rules"
ADD CONSTRAINT "maintenance_schedule_rules_vehicleId_fkey"
FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "maintenance_triggers" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "vehicleId" TEXT NOT NULL,
  "inspectionId" TEXT,
  "triggerType" TEXT NOT NULL,
  "severity" TEXT NOT NULL,
  "summary" TEXT NOT NULL,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "maintenance_triggers_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "maintenance_triggers_tenantId_vehicleId_createdAt_idx"
ON "maintenance_triggers"("tenantId", "vehicleId", "createdAt");

ALTER TABLE "maintenance_triggers"
ADD CONSTRAINT "maintenance_triggers_inspectionId_fkey"
FOREIGN KEY ("inspectionId") REFERENCES "inspections"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "maintenance_records" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "vehicleId" TEXT NOT NULL,
  "inspectionId" TEXT,
  "triggerId" TEXT,
  "recordType" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'open',
  "openedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "closedAt" TIMESTAMP(3),
  "createdByUserId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "maintenance_records_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "maintenance_records_tenantId_vehicleId_status_idx"
ON "maintenance_records"("tenantId", "vehicleId", "status");

ALTER TABLE "maintenance_records"
ADD CONSTRAINT "maintenance_records_vehicleId_fkey"
FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "maintenance_records"
ADD CONSTRAINT "maintenance_records_inspectionId_fkey"
FOREIGN KEY ("inspectionId") REFERENCES "inspections"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "maintenance_records"
ADD CONSTRAINT "maintenance_records_triggerId_fkey"
FOREIGN KEY ("triggerId") REFERENCES "maintenance_triggers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "work_orders" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "vehicleId" TEXT NOT NULL,
  "maintenanceRecordId" TEXT NOT NULL,
  "vendorId" TEXT,
  "issueDescription" TEXT NOT NULL,
  "priority" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "assignedAt" TIMESTAMP(3),
  "startedAt" TIMESTAMP(3),
  "completedAt" TIMESTAMP(3),
  "rejectedAt" TIMESTAMP(3),
  "createdByUserId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "work_orders_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "work_orders_tenantId_vehicleId_status_idx"
ON "work_orders"("tenantId", "vehicleId", "status");

CREATE INDEX "work_orders_tenantId_vendorId_createdAt_idx"
ON "work_orders"("tenantId", "vendorId", "createdAt");

ALTER TABLE "work_orders"
ADD CONSTRAINT "work_orders_vehicleId_fkey"
FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "work_orders"
ADD CONSTRAINT "work_orders_maintenanceRecordId_fkey"
FOREIGN KEY ("maintenanceRecordId") REFERENCES "maintenance_records"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "work_orders"
ADD CONSTRAINT "work_orders_vendorId_fkey"
FOREIGN KEY ("vendorId") REFERENCES "maintenance_vendors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "maintenance_costs" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "workOrderId" TEXT NOT NULL,
  "partsCostMinorUnits" INTEGER NOT NULL DEFAULT 0,
  "labourCostMinorUnits" INTEGER NOT NULL DEFAULT 0,
  "totalCostMinorUnits" INTEGER NOT NULL,
  "currency" TEXT NOT NULL,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "maintenance_costs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "maintenance_costs_tenantId_workOrderId_idx"
ON "maintenance_costs"("tenantId", "workOrderId");

ALTER TABLE "maintenance_costs"
ADD CONSTRAINT "maintenance_costs_workOrderId_fkey"
FOREIGN KEY ("workOrderId") REFERENCES "work_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "vehicle_risk_assessments" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "vehicleId" TEXT NOT NULL,
  "score" INTEGER NOT NULL,
  "riskLevel" TEXT NOT NULL,
  "reasons" JSONB NOT NULL,
  "isAssignmentLocked" BOOLEAN NOT NULL DEFAULT false,
  "evaluatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "vehicle_risk_assessments_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "vehicle_risk_assessments_tenantId_vehicleId_evaluatedAt_idx"
ON "vehicle_risk_assessments"("tenantId", "vehicleId", "evaluatedAt");

ALTER TABLE "vehicle_risk_assessments"
ADD CONSTRAINT "vehicle_risk_assessments_vehicleId_fkey"
FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
