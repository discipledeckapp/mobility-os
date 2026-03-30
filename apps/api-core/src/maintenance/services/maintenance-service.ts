import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { AuditService } from '../../audit/audit.service';
import type { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { PrismaService } from '../../database/prisma.service';
import { VehicleRiskService } from '../../vehicle-risk/services/vehicle-risk.service';
import type { CreateWorkOrderDto } from '../dto/create-work-order.dto';
import type { UpdateWorkOrderDto } from '../dto/update-work-order.dto';
import { MaintenanceRepository } from '../repositories/maintenance.repository';

@Injectable()
export class MaintenanceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly repository: MaintenanceRepository,
    private readonly auditService: AuditService,
    private readonly vehicleRiskService: VehicleRiskService,
  ) {}

  async createWorkOrder(tenantId: string, actorId: string | null | undefined, dto: CreateWorkOrderDto) {
    const vehicle = await this.repository.findVehicle(tenantId, dto.vehicleId);
    if (!vehicle) {
      throw new NotFoundException(`Vehicle '${dto.vehicleId}' not found.`);
    }

    let vendorId = dto.vendorId;
    if (!vendorId && dto.vendorName?.trim()) {
      const vendor = await this.prisma.maintenanceVendor.create({
        data: {
          tenantId,
          name: dto.vendorName.trim(),
        },
      });
      vendorId = vendor.id;
    }

    const trigger =
      dto.triggerType || dto.inspectionId
        ? await this.prisma.maintenanceTrigger.create({
            data: {
              tenantId,
              vehicleId: dto.vehicleId,
              triggerType: dto.triggerType ?? (dto.inspectionId ? 'inspection_failure' : 'manual_report'),
              severity: dto.severity ?? 'medium',
              summary: dto.issueDescription,
              ...(dto.inspectionId !== undefined ? { inspectionId: dto.inspectionId } : {}),
            },
          })
        : null;

    const record =
      dto.maintenanceRecordId
        ? await this.prisma.maintenanceRecord.findFirst({
            where: { id: dto.maintenanceRecordId, tenantId },
          })
        : await this.prisma.maintenanceRecord.create({
          data: {
            tenantId,
            vehicleId: dto.vehicleId,
            recordType: dto.recordType ?? 'corrective',
            status: 'open',
            createdByUserId: actorId ?? null,
            ...(dto.inspectionId !== undefined ? { inspectionId: dto.inspectionId } : {}),
            ...(trigger?.id ? { triggerId: trigger.id } : {}),
          },
        });

    if (!record) {
      throw new NotFoundException(`Maintenance record '${dto.maintenanceRecordId}' not found.`);
    }

    const costsCreate =
      dto.partsCostMinorUnits !== undefined ||
      dto.labourCostMinorUnits !== undefined ||
      dto.currency
        ? {
            create: {
              tenantId,
              partsCostMinorUnits: dto.partsCostMinorUnits ?? 0,
              labourCostMinorUnits: dto.labourCostMinorUnits ?? 0,
              totalCostMinorUnits:
                (dto.partsCostMinorUnits ?? 0) + (dto.labourCostMinorUnits ?? 0),
              currency: dto.currency ?? 'NGN',
              ...(dto.notes !== undefined ? { notes: dto.notes } : {}),
            },
          }
        : undefined;

    const workOrder = await this.prisma.workOrder.create({
      data: {
        tenantId,
        vehicleId: dto.vehicleId,
        maintenanceRecordId: record.id,
        issueDescription: dto.issueDescription,
        priority: dto.priority.toUpperCase(),
        status: 'pending',
        createdByUserId: actorId ?? null,
        ...(vendorId ? { assignedAt: new Date() } : {}),
        ...(vendorId ? { vendorId } : {}),
        ...(costsCreate ? { costs: costsCreate } : {}),
      },
      include: { costs: true },
    });

    await this.prisma.vehicleMaintenanceEvent.create({
      data: {
        tenantId,
        vehicleId: dto.vehicleId,
        createdByUserId: actorId ?? null,
        category: 'work_order',
        title: dto.issueDescription.slice(0, 120),
        description: dto.notes ?? null,
        status: 'scheduled',
        vendor: dto.vendorName ?? null,
        costMinorUnits: (dto.partsCostMinorUnits ?? 0) + (dto.labourCostMinorUnits ?? 0),
        currency: dto.currency ?? 'NGN',
      },
    });

    await this.auditService.recordTenantAction({
      tenantId,
      actorId: actorId ?? null,
      entityType: 'work_order',
      entityId: workOrder.id,
      action: 'maintenance.work_order_created',
      afterState: workOrder as unknown as Prisma.InputJsonValue,
      metadata: { vehicleId: dto.vehicleId, maintenanceRecordId: record.id },
    });

    await this.vehicleRiskService.evaluateVehicleRisk(tenantId, dto.vehicleId);
    return workOrder;
  }

  async listVehicleMaintenance(tenantId: string, vehicleId: string) {
    return this.repository.listVehicleWorkOrders(tenantId, vehicleId);
  }

  async listTenantMaintenance(tenantId: string, query: PaginationQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 50;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.repository.listTenantWorkOrders(tenantId, skip, limit),
      this.repository.countTenantWorkOrders(tenantId),
    ]);

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async updateWorkOrder(tenantId: string, actorId: string | null | undefined, workOrderId: string, dto: UpdateWorkOrderDto) {
    const existing = await this.repository.findWorkOrder(tenantId, workOrderId);
    if (!existing) {
      throw new NotFoundException(`Work order '${workOrderId}' not found.`);
    }

    const nextStatus = dto.status?.toLowerCase();
    if (nextStatus && !['pending', 'in_progress', 'completed', 'rejected'].includes(nextStatus)) {
      throw new BadRequestException('status must be pending, in_progress, completed, or rejected.');
    }

    const updated = await this.prisma.workOrder.update({
      where: { id: workOrderId },
      data: {
        issueDescription: dto.issueDescription ?? existing.issueDescription,
        priority: dto.priority?.toUpperCase() ?? existing.priority,
        status: nextStatus ?? existing.status,
        startedAt: nextStatus === 'in_progress' && !existing.startedAt ? new Date() : existing.startedAt,
        completedAt: nextStatus === 'completed' ? new Date() : existing.completedAt,
        rejectedAt: nextStatus === 'rejected' ? new Date() : existing.rejectedAt,
      },
      include: { costs: true },
    });

    if (dto.partsCostMinorUnits !== undefined || dto.labourCostMinorUnits !== undefined || dto.currency) {
      const total = (dto.partsCostMinorUnits ?? 0) + (dto.labourCostMinorUnits ?? 0);
      if (existing.costs[0]) {
        await this.prisma.maintenanceCost.update({
          where: { id: existing.costs[0].id },
          data: {
            partsCostMinorUnits: dto.partsCostMinorUnits ?? existing.costs[0].partsCostMinorUnits,
            labourCostMinorUnits: dto.labourCostMinorUnits ?? existing.costs[0].labourCostMinorUnits,
            totalCostMinorUnits:
              total > 0 ? total : existing.costs[0].totalCostMinorUnits,
            currency: dto.currency ?? existing.costs[0].currency,
            notes: dto.notes ?? existing.costs[0].notes,
          },
        });
      } else {
        await this.prisma.maintenanceCost.create({
          data: {
            tenantId,
            workOrderId,
            partsCostMinorUnits: dto.partsCostMinorUnits ?? 0,
            labourCostMinorUnits: dto.labourCostMinorUnits ?? 0,
            totalCostMinorUnits: total,
            currency: dto.currency ?? 'NGN',
            ...(dto.notes !== undefined ? { notes: dto.notes } : {}),
          },
        });
      }
    }

    await this.auditService.recordTenantAction({
      tenantId,
      actorId: actorId ?? null,
      entityType: 'work_order',
      entityId: workOrderId,
      action: 'maintenance.work_order_updated',
      beforeState: existing as unknown as Prisma.InputJsonValue,
      afterState: updated as unknown as Prisma.InputJsonValue,
    });

    if (updated.status === 'completed') {
      await this.prisma.maintenanceRecord.updateMany({
        where: { id: updated.maintenanceRecordId, tenantId },
        data: { status: 'closed', closedAt: new Date() },
      });
    }

    await this.vehicleRiskService.evaluateVehicleRisk(tenantId, updated.vehicleId);
    return this.repository.findWorkOrder(tenantId, workOrderId);
  }
}
