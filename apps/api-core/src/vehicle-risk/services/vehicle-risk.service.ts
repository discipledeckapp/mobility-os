import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';

type VehicleRiskSnapshot = {
  vehicleId: string;
  score: number;
  riskLevel: 'GREEN' | 'AMBER' | 'RED';
  reasons: string[];
  isAssignmentLocked: boolean;
  evaluatedAt: Date;
};

@Injectable()
export class VehicleRiskService {
  constructor(private readonly prisma: PrismaService) {}

  private mapLegacyInspectionStatus(status: string, issuesFoundCount: number): 'GREEN' | 'AMBER' | 'RED' {
    if (status === 'failed') {
      return 'RED';
    }
    if (status === 'warning' || issuesFoundCount > 0) {
      return 'AMBER';
    }
    return 'GREEN';
  }

  async evaluateVehicleRisk(tenantId: string, vehicleId: string): Promise<VehicleRiskSnapshot> {
    const [vehicle, latestScore, latestLegacyInspection, openCriticalWorkOrder, openWorkOrders, schedules] =
      await Promise.all([
        this.prisma.vehicle.findFirst({
          where: { id: vehicleId, tenantId },
          select: { id: true, status: true, odometerKm: true },
        }),
        this.prisma.inspectionScore.findFirst({
          where: {
            tenantId,
            inspection: {
              vehicleId,
            },
          },
          orderBy: { calculatedAt: 'desc' },
          select: { score: true, riskLevel: true, calculatedAt: true },
        }),
        this.prisma.vehicleInspection.findFirst({
          where: { tenantId, vehicleId },
          orderBy: { inspectionDate: 'desc' },
          select: { status: true, issuesFoundCount: true },
        }),
        this.prisma.workOrder.findFirst({
          where: {
            tenantId,
            vehicleId,
            priority: 'CRITICAL',
            status: { in: ['pending', 'in_progress'] },
          },
          select: { id: true },
        }),
        this.prisma.workOrder.findMany({
          where: {
            tenantId,
            vehicleId,
            status: { in: ['pending', 'in_progress'] },
          },
          select: { priority: true, status: true },
          take: 10,
        }),
        this.prisma.maintenanceScheduleRule.findMany({
          where: {
            tenantId,
            vehicleId,
            isActive: true,
          },
          select: {
            id: true,
            nextDueAt: true,
            nextDueOdometerKm: true,
          },
        }),
      ]);

    if (!vehicle) {
      throw new Error(`Vehicle '${vehicleId}' not found for risk evaluation.`);
    }

    let score = 100;
    const reasons: string[] = [];

    if (latestScore) {
      score = Math.min(score, latestScore.score);
      if (latestScore.riskLevel === 'RED') {
        reasons.push('Latest structured inspection score is red.');
      } else if (latestScore.riskLevel === 'AMBER') {
        reasons.push('Latest structured inspection score requires attention.');
      }
    } else if (latestLegacyInspection) {
      const legacyRisk = this.mapLegacyInspectionStatus(
        latestLegacyInspection.status,
        latestLegacyInspection.issuesFoundCount,
      );
      if (legacyRisk === 'RED') {
        score = Math.min(score, 45);
        reasons.push('Latest inspection failed.');
      } else if (legacyRisk === 'AMBER') {
        score = Math.min(score, 70);
        reasons.push('Latest inspection reported unresolved issues.');
      }
    }

    const repeatedFailures = await this.prisma.inspectionScore.count({
      where: {
        tenantId,
        riskLevel: 'RED',
        inspection: { vehicleId },
      },
      take: 3,
    });

    if (repeatedFailures >= 2) {
      score = Math.min(score, 40);
      reasons.push('Repeated inspection failures detected.');
    }

    const now = new Date();
    const overdueSchedules = schedules.filter(
      (schedule) =>
        (schedule.nextDueAt && schedule.nextDueAt < now) ||
        (schedule.nextDueOdometerKm !== null &&
          schedule.nextDueOdometerKm !== undefined &&
          vehicle.odometerKm !== null &&
          vehicle.odometerKm !== undefined &&
          vehicle.odometerKm >= schedule.nextDueOdometerKm),
    );
    if (overdueSchedules.length > 0) {
      score = Math.min(score, overdueSchedules.length > 1 ? 50 : 68);
      reasons.push(
        overdueSchedules.length > 1
          ? 'Multiple preventive maintenance schedules are overdue.'
          : 'Preventive maintenance is overdue.',
      );
    }

    if (openCriticalWorkOrder) {
      score = Math.min(score, 25);
      reasons.push('A critical maintenance work order is still open.');
    } else if (openWorkOrders.length > 0) {
      score = Math.min(score, 60);
      reasons.push('Open maintenance work orders exist for this vehicle.');
    }

    let riskLevel: 'GREEN' | 'AMBER' | 'RED' = 'GREEN';
    if (score < 60) {
      riskLevel = 'RED';
    } else if (score < 80) {
      riskLevel = 'AMBER';
    }

    const isAssignmentLocked = riskLevel === 'RED' || Boolean(openCriticalWorkOrder);

    const assessment = await this.prisma.vehicleRiskAssessment.create({
      data: {
        tenantId,
        vehicleId,
        score,
        riskLevel,
        reasons: reasons as unknown as Prisma.InputJsonValue,
        isAssignmentLocked,
      },
    });

    if (openCriticalWorkOrder && vehicle.status !== 'maintenance') {
      await this.prisma.vehicle.update({
        where: { id: vehicleId },
        data: { status: 'maintenance' },
      });
    }

    return {
      vehicleId,
      score,
      riskLevel,
      reasons,
      isAssignmentLocked,
      evaluatedAt: assessment.evaluatedAt,
    };
  }

  async getVehicleRisk(tenantId: string, vehicleId: string) {
    const latest = await this.prisma.vehicleRiskAssessment.findFirst({
      where: { tenantId, vehicleId },
      orderBy: { evaluatedAt: 'desc' },
    });

    if (latest) {
      return {
        vehicleId,
        score: latest.score,
        riskLevel: latest.riskLevel,
        reasons: Array.isArray(latest.reasons) ? latest.reasons.map(String) : [],
        isAssignmentLocked: latest.isAssignmentLocked,
        evaluatedAt: latest.evaluatedAt,
      };
    }

    return this.evaluateVehicleRisk(tenantId, vehicleId);
  }

  async listVehiclesAtRisk(tenantId: string) {
    return this.prisma.vehicleRiskAssessment.findMany({
      where: { tenantId, riskLevel: { in: ['AMBER', 'RED'] } },
      orderBy: [{ evaluatedAt: 'desc' }],
      distinct: ['vehicleId'],
    });
  }

  async getMaintenanceBacklogSummary(tenantId: string) {
    const [pending, inProgress, critical] = await Promise.all([
      this.prisma.workOrder.count({ where: { tenantId, status: 'pending' } }),
      this.prisma.workOrder.count({ where: { tenantId, status: 'in_progress' } }),
      this.prisma.workOrder.count({
        where: {
          tenantId,
          priority: 'CRITICAL',
          status: { in: ['pending', 'in_progress'] },
        },
      }),
    ]);
    return { pending, inProgress, critical };
  }

  async getInspectionComplianceRate(tenantId: string) {
    const [vehicles, inspectedInspectionRows] = await Promise.all([
      this.prisma.vehicle.count({ where: { tenantId, status: { not: 'retired' } } }),
      this.prisma.inspection.findMany({
        where: {
          tenantId,
          createdAt: {
            gte: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
          },
          status: { in: ['approved', 'under_review', 'submitted'] },
        },
        distinct: ['vehicleId'],
        select: { vehicleId: true },
      }),
    ]);
    const inspectedVehicles = inspectedInspectionRows.length;

    return {
      totalVehicles: vehicles,
      inspectedVehicles,
      complianceRate: vehicles > 0 ? Number(((inspectedVehicles / vehicles) * 100).toFixed(2)) : 0,
    };
  }
}
