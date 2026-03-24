import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { AuditService } from '../../audit/audit.service';
import { PrismaService } from '../../database/prisma.service';
import { VehicleRiskService } from '../../vehicle-risk/services/vehicle-risk.service';
import { InspectionRepository } from '../repositories/inspection.repository';
import type { ReviewInspectionDto } from '../dto/review-inspection.dto';
import type { StartInspectionDto } from '../dto/start-inspection.dto';
import type { SubmitInspectionDto } from '../dto/submit-inspection.dto';
import { InspectionAiService } from './inspection-ai.service';

@Injectable()
export class InspectionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly repository: InspectionRepository,
    private readonly auditService: AuditService,
    private readonly aiService: InspectionAiService,
    private readonly vehicleRiskService: VehicleRiskService,
  ) {}

  private async ensureTemplate(tenantId: string, actorId: string | null | undefined, inspectionType: string, templateId?: string) {
    if (templateId) {
      const template = await this.repository.findTemplateById(tenantId, templateId);
      if (!template) {
        throw new NotFoundException(`Inspection template '${templateId}' not found.`);
      }
      return template;
    }

    const existing = await this.repository.findActiveTemplate(tenantId, inspectionType);
    if (existing) {
      return existing;
    }

    const defaultItems: Array<[string, string | null, number]> = [
      ['front exterior', 'front', 15],
      ['rear exterior', 'back', 15],
      ['left side', 'left', 10],
      ['right side', 'right', 10],
      ['interior cabin', 'interior', 10],
      ['dashboard and warning lights', 'dashboard', 15],
      ['tyres and wheels', null, 10],
      ['lights and signals', null, 10],
      ['body damage and scratches', null, 5],
    ];

    return this.repository.createTemplateWithItems({
      tenantId,
      name: `${inspectionType.replaceAll('_', ' ')} inspection`,
      inspectionType,
      ...(actorId !== undefined ? { createdByUserId: actorId } : {}),
      items: {
        create: defaultItems.map(([label, mediaKind, weight], index) => ({
          tenantId,
          label,
          description: `Check ${label}.`,
          sortOrder: index,
          weight,
          isRequired: true,
          ...(mediaKind ? { requiredMediaKinds: [mediaKind] } : {}),
        })),
      },
    });
  }

  private computeScore(
    items: Array<{ weight: number }>,
    results: Array<{ checklistItemId: string; result: string }>,
  ) {
    const resultByItemId = new Map(
      results.map((result) => [result.checklistItemId, result.result.toUpperCase()]),
    );
    const totalWeight = items.reduce((sum, item) => sum + Math.max(item.weight, 1), 0);
    let earnedWeight = 0;
    let failedItemCount = 0;
    let warningItemCount = 0;

    for (const item of items as Array<{ id: string; weight: number }>) {
      const outcome = resultByItemId.get(item.id) ?? 'FAIL';
      if (outcome === 'PASS') {
        earnedWeight += Math.max(item.weight, 1);
      } else if (outcome === 'WARNING') {
        earnedWeight += Math.max(item.weight, 1) / 2;
        warningItemCount += 1;
      } else {
        failedItemCount += 1;
      }
    }

    const score = totalWeight > 0 ? Math.round((earnedWeight / totalWeight) * 100) : 0;
    let riskLevel: 'GREEN' | 'AMBER' | 'RED' = 'GREEN';
    if (score < 60) {
      riskLevel = 'RED';
    } else if (score < 80) {
      riskLevel = 'AMBER';
    }

    return { score, riskLevel, failedItemCount, warningItemCount };
  }

  async startInspection(tenantId: string, actorId: string | null | undefined, dto: StartInspectionDto) {
    const vehicle = await this.repository.findVehicle(tenantId, dto.vehicleId);
    if (!vehicle) {
      throw new NotFoundException(`Vehicle '${dto.vehicleId}' not found.`);
    }

    const template = await this.ensureTemplate(tenantId, actorId, dto.inspectionType, dto.templateId);
    const inspection = await this.repository.createInspection({
      tenantId,
      vehicle: { connect: { id: vehicle.id } },
      template: { connect: { id: template.id } },
      inspectionType: template.inspectionType,
      status: 'draft',
      startedAt: dto.startedAt ? new Date(dto.startedAt) : new Date(),
      ...(dto.driverId !== undefined ? { driverId: dto.driverId } : {}),
      ...(dto.assignmentId !== undefined ? { assignmentId: dto.assignmentId } : {}),
      ...(actorId !== undefined ? { createdByUserId: actorId } : {}),
      ...(dto.odometerKm !== undefined ? { odometerKm: dto.odometerKm } : {}),
      ...(dto.gpsLatitude !== undefined ? { gpsLatitude: dto.gpsLatitude } : {}),
      ...(dto.gpsLongitude !== undefined ? { gpsLongitude: dto.gpsLongitude } : {}),
    });

    await this.auditService.recordTenantAction({
      tenantId,
      actorId,
      entityType: 'inspection',
      entityId: inspection.id,
      action: 'inspection.started',
      afterState: inspection as unknown as Prisma.InputJsonValue,
      metadata: { vehicleId: vehicle.id, inspectionType: template.inspectionType },
    });

    return inspection;
  }

  async submitInspection(tenantId: string, actorId: string | null | undefined, inspectionId: string, dto: SubmitInspectionDto) {
    const inspection = await this.repository.findInspection(tenantId, inspectionId);
    if (!inspection) {
      throw new NotFoundException(`Inspection '${inspectionId}' not found.`);
    }
    if (inspection.status !== 'draft') {
      throw new BadRequestException('Only draft inspections can be submitted.');
    }

    const requiredItems = inspection.template.items.filter((item) => item.isRequired);
    const submittedItemIds = new Set(dto.results.map((item) => item.checklistItemId));
    const missingRequired = requiredItems.filter((item) => !submittedItemIds.has(item.id));
    if (missingRequired.length > 0) {
      throw new BadRequestException('All required checklist items must be completed before submission.');
    }

    for (const item of requiredItems) {
        const submission = dto.results.find((result) => result.checklistItemId === item.id);
        const requiredMediaKinds = Array.isArray(item.requiredMediaKinds)
          ? item.requiredMediaKinds.map(String)
          : [];
        if (requiredMediaKinds.length > 0) {
          const submittedKinds = new Set(
            (submission?.media ?? []).map((media) => media.viewpoint).filter(Boolean),
          );
          const missingKinds = requiredMediaKinds.filter((kind: string) => !submittedKinds.has(kind));
          if (missingKinds.length > 0) {
            throw new BadRequestException(`Inspection item '${item.label}' requires media for ${missingKinds.join(', ')}.`);
          }
        }
      }

    const preparedResults = await Promise.all(
      dto.results.map(async (result) => ({
        checklistItemId: result.checklistItemId,
        result: result.result.toUpperCase(),
        notes: result.notes,
        media: await Promise.all(
          (result.media ?? []).map(async (media) => ({
            mediaType: media.mediaType,
            viewpoint: media.viewpoint,
            storageKey: media.storageKey,
            storageUrl: media.storageUrl,
            capturedAt: media.capturedAt ? new Date(media.capturedAt) : new Date(),
            aiAnalysis: (await this.aiService.analyzeInspectionMedia({
              ...(media.storageUrl ? { storageUrl: media.storageUrl } : {}),
              ...(media.viewpoint ? { viewpoint: media.viewpoint } : {}),
            })) as Prisma.InputJsonValue,
          })),
        ),
      })),
    );

    await this.repository.replaceInspectionResults(tenantId, inspection.id, preparedResults);
    const score = this.computeScore(
      inspection.template.items as Array<{ id: string; weight: number }>,
      preparedResults,
    );
    const nextStatus = inspection.template.requiresReview ? 'under_review' : 'approved';

    const beforeState = {
      status: inspection.status,
      summary: inspection.summary,
    } satisfies Prisma.JsonObject;

    await this.prisma.$transaction([
      this.prisma.inspection.update({
        where: { id: inspection.id },
        data: {
          summary: dto.summary ?? inspection.summary,
          odometerKm: dto.odometerKm ?? inspection.odometerKm,
          gpsLatitude: dto.gpsLatitude ?? inspection.gpsLatitude,
          gpsLongitude: dto.gpsLongitude ?? inspection.gpsLongitude,
          status: nextStatus,
          submittedAt: new Date(),
          completedAt: new Date(),
        },
      }),
      this.prisma.inspectionScore.create({
        data: {
          tenantId,
          inspectionId: inspection.id,
          score: score.score,
          riskLevel: score.riskLevel,
          failedItemCount: score.failedItemCount,
          warningItemCount: score.warningItemCount,
        },
      }),
      this.prisma.vehicleInspection.create({
        data: {
          tenantId,
          vehicleId: inspection.vehicleId,
          createdByUserId: actorId ?? null,
          inspectionType: inspection.inspectionType,
          status:
            score.riskLevel === 'RED' ? 'failed' : score.riskLevel === 'AMBER' ? 'warning' : 'passed',
          inspectionDate: new Date(),
          ...(dto.odometerKm !== undefined || inspection.odometerKm !== null
            ? { odometerKm: dto.odometerKm ?? inspection.odometerKm ?? null }
            : {}),
          issuesFoundCount: score.failedItemCount + score.warningItemCount,
          reportSource: 'structured_module',
          summary:
            dto.summary ??
            `Structured inspection submitted with score ${score.score} and ${score.failedItemCount} failed items.`,
        },
      }),
    ]);

    if (score.failedItemCount > 0 || score.riskLevel === 'RED') {
      await this.prisma.maintenanceTrigger.create({
        data: {
          tenantId,
          vehicleId: inspection.vehicleId,
          inspectionId: inspection.id,
          triggerType: 'inspection_failure',
          severity: score.riskLevel === 'RED' ? 'high' : 'medium',
          summary: `${score.failedItemCount} inspection item(s) failed during ${inspection.inspectionType}.`,
          metadata: {
            failedItemCount: score.failedItemCount,
            warningItemCount: score.warningItemCount,
            score: score.score,
          },
        },
      });
    }

    await this.auditService.recordTenantAction({
      tenantId,
      actorId: actorId ?? null,
      entityType: 'inspection',
      entityId: inspection.id,
      action: 'inspection.submitted',
      beforeState: beforeState as Prisma.InputJsonValue,
      afterState: {
        status: nextStatus,
        score: score.score,
        riskLevel: score.riskLevel,
      },
    });

    await this.vehicleRiskService.evaluateVehicleRisk(tenantId, inspection.vehicleId);
    return this.repository.findInspection(tenantId, inspection.id);
  }

  async reviewInspection(tenantId: string, actorId: string | null | undefined, inspectionId: string, dto: ReviewInspectionDto) {
    const inspection = await this.repository.findInspection(tenantId, inspectionId);
    if (!inspection) {
      throw new NotFoundException(`Inspection '${inspectionId}' not found.`);
    }
    if (!['under_review', 'submitted'].includes(inspection.status)) {
      throw new BadRequestException('Only submitted inspections can be reviewed.');
    }

    const normalizedDecision = dto.decision.trim().toLowerCase();
    if (!['approve', 'reject', 'escalate'].includes(normalizedDecision)) {
      throw new BadRequestException('decision must be approve, reject, or escalate.');
    }

    const nextStatus =
      normalizedDecision === 'approve'
        ? 'approved'
        : normalizedDecision === 'reject'
          ? 'rejected'
          : 'escalated';

    await this.prisma.$transaction([
      this.prisma.inspectionReview.create({
        data: {
          tenantId,
          inspectionId: inspection.id,
          reviewerUserId: actorId ?? 'system',
          decision: normalizedDecision,
          ...(dto.comments !== undefined ? { comments: dto.comments } : {}),
        },
      }),
      this.prisma.inspection.update({
        where: { id: inspection.id },
        data: {
          status: nextStatus,
          reviewDecision: normalizedDecision,
          ...(dto.comments !== undefined ? { reviewComments: dto.comments } : {}),
          reviewedAt: new Date(),
        },
      }),
    ]);

    await this.auditService.recordTenantAction({
      tenantId,
      actorId: actorId ?? null,
      entityType: 'inspection',
      entityId: inspection.id,
      action: 'inspection.reviewed',
      beforeState: {
        status: inspection.status,
        reviewDecision: inspection.reviewDecision,
      },
      afterState: {
        status: nextStatus,
        reviewDecision: normalizedDecision,
      },
    });

    await this.vehicleRiskService.evaluateVehicleRisk(tenantId, inspection.vehicleId);
    return this.repository.findInspection(tenantId, inspection.id);
  }

  async listVehicleInspections(tenantId: string, vehicleId: string) {
    return this.repository.listVehicleInspections(tenantId, vehicleId);
  }
}
