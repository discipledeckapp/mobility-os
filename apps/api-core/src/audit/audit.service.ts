import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { PrismaService } from '../database/prisma.service';

type AuditInput = {
  tenantId: string;
  actorId?: string | null | undefined;
  entityType: string;
  entityId: string;
  action: string;
  beforeState?: Prisma.InputJsonValue | null;
  afterState?: Prisma.InputJsonValue | null;
  metadata?: Prisma.InputJsonValue | null;
};

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async recordTenantAction(input: AuditInput) {
    return this.prisma.operationalAuditLog.create({
      data: {
        tenantId: input.tenantId,
        entityType: input.entityType,
        entityId: input.entityId,
        action: input.action,
        ...(input.actorId !== undefined ? { actorId: input.actorId } : {}),
        ...(input.beforeState !== undefined
          ? { beforeState: input.beforeState === null ? Prisma.JsonNull : input.beforeState }
          : {}),
        ...(input.afterState !== undefined
          ? { afterState: input.afterState === null ? Prisma.JsonNull : input.afterState }
          : {}),
        ...(input.metadata !== undefined
          ? { metadata: input.metadata === null ? Prisma.JsonNull : input.metadata }
          : {}),
      },
    });
  }

  async listTenantAuditLog(
    tenantId: string,
    query: PaginationQueryDto & {
      entityType?: string;
      entityId?: string;
      action?: string;
      actorId?: string;
      relatedDriverId?: string;
      relatedVehicleId?: string;
      relatedAssignmentId?: string;
    },
  ) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 50;
    const skip = (page - 1) * limit;
    const where: Prisma.OperationalAuditLogWhereInput = {
      tenantId,
      ...(query.entityType ? { entityType: query.entityType } : {}),
      ...(query.entityId ? { entityId: query.entityId } : {}),
      ...(query.action ? { action: query.action } : {}),
      ...(query.actorId ? { actorId: query.actorId } : {}),
    };

    const relatedScopes: Prisma.OperationalAuditLogWhereInput[] = [];

    if (query.relatedDriverId) {
      relatedScopes.push({
        OR: [
          {
            entityType: 'driver',
            entityId: query.relatedDriverId,
          },
          {
            metadata: {
              path: ['driverId'],
              equals: query.relatedDriverId,
            },
          },
        ],
      });
    }

    if (query.relatedVehicleId) {
      relatedScopes.push({
        OR: [
          {
            entityType: 'vehicle',
            entityId: query.relatedVehicleId,
          },
          {
            metadata: {
              path: ['vehicleId'],
              equals: query.relatedVehicleId,
            },
          },
        ],
      });
    }

    if (query.relatedAssignmentId) {
      relatedScopes.push({
        OR: [
          {
            entityType: 'assignment',
            entityId: query.relatedAssignmentId,
          },
          {
            metadata: {
              path: ['assignmentId'],
              equals: query.relatedAssignmentId,
            },
          },
        ],
      });
    }

    if (relatedScopes.length > 0) {
      const existingAnd =
        where.AND === undefined
          ? []
          : Array.isArray(where.AND)
            ? where.AND
            : [where.AND];
      where.AND = [...existingAnd, ...relatedScopes];
    }

    const [data, total] = await Promise.all([
      this.prisma.operationalAuditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.operationalAuditLog.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
    };
  }
}
