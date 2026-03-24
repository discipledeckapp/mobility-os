import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class InspectionRepository {
  constructor(private readonly prisma: PrismaService) {}

  findVehicle(tenantId: string, vehicleId: string) {
    return this.prisma.vehicle.findFirst({
      where: { id: vehicleId, tenantId },
      select: { id: true, fleetId: true, status: true, odometerKm: true },
    });
  }

  findTemplateById(tenantId: string, templateId: string) {
    return this.prisma.inspectionChecklistTemplate.findFirst({
      where: { id: templateId, tenantId },
      include: {
        items: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });
  }

  findActiveTemplate(tenantId: string, inspectionType: string) {
    return this.prisma.inspectionChecklistTemplate.findFirst({
      where: { tenantId, inspectionType, isActive: true },
      include: {
        items: {
          orderBy: { sortOrder: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  createTemplateWithItems(data: Prisma.InspectionChecklistTemplateCreateInput) {
    return this.prisma.inspectionChecklistTemplate.create({
      data,
      include: {
        items: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });
  }

  createInspection(data: Prisma.InspectionCreateInput) {
    return this.prisma.inspection.create({
      data,
      include: {
        template: { include: { items: { orderBy: { sortOrder: 'asc' } } } },
        results: true,
        scorecards: { orderBy: { calculatedAt: 'desc' }, take: 1 },
      },
    });
  }

  findInspection(tenantId: string, inspectionId: string) {
    return this.prisma.inspection.findFirst({
      where: { id: inspectionId, tenantId },
      include: {
        template: { include: { items: { orderBy: { sortOrder: 'asc' } } } },
        results: {
          include: { media: true },
        },
        media: true,
        scorecards: { orderBy: { calculatedAt: 'desc' } },
        reviews: { orderBy: { createdAt: 'desc' } },
      },
    });
  }

  listVehicleInspections(tenantId: string, vehicleId: string) {
    return this.prisma.inspection.findMany({
      where: { tenantId, vehicleId },
      include: {
        results: true,
        scorecards: { orderBy: { calculatedAt: 'desc' }, take: 1 },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async replaceInspectionResults(
    tenantId: string,
    inspectionId: string,
      results: Array<{
        checklistItemId: string;
        result: string;
        notes?: string | undefined;
        media?: Array<{
          mediaType: string;
          viewpoint?: string | undefined;
          storageKey?: string | undefined;
          storageUrl?: string | undefined;
          capturedAt?: Date | undefined;
          aiAnalysis?: Prisma.InputJsonValue | null;
        }>;
      }>,
  ) {
    await this.prisma.$transaction([
      this.prisma.inspectionMedia.deleteMany({ where: { tenantId, inspectionId } }),
      this.prisma.inspectionResult.deleteMany({ where: { tenantId, inspectionId } }),
    ]);

    for (const item of results) {
      const created = await this.prisma.inspectionResult.create({
        data: {
          tenantId,
          inspectionId,
          checklistItemId: item.checklistItemId,
          result: item.result,
          ...(item.notes !== undefined ? { notes: item.notes } : {}),
        },
      });

      if (item.media?.length) {
        for (const media of item.media) {
          await this.prisma.inspectionMedia.create({
            data: {
              tenantId,
              inspectionId,
              inspectionResultId: created.id,
              mediaType: media.mediaType,
              capturedAt: media.capturedAt ?? new Date(),
              ...(media.viewpoint !== undefined ? { viewpoint: media.viewpoint } : {}),
              ...(media.storageKey !== undefined ? { storageKey: media.storageKey } : {}),
              ...(media.storageUrl !== undefined ? { storageUrl: media.storageUrl } : {}),
              ...(media.aiAnalysis !== undefined
                ? {
                    aiAnalysis:
                      media.aiAnalysis === null ? Prisma.JsonNull : media.aiAnalysis,
                  }
                : {}),
            },
          });
        }
      }
    }
  }
}
