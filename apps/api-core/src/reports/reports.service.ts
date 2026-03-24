import { computeNextRemittanceDueDate, toIsoDate } from '@mobility-os/domain-config';
import { Injectable } from '@nestjs/common';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { PrismaService } from '../database/prisma.service';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { DriversService } from '../drivers/drivers.service';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { VehiclesService } from '../vehicles/vehicles.service';

@Injectable()
export class ReportsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly driversService: DriversService,
    private readonly vehiclesService: VehiclesService,
  ) {}

  private getRemittanceRisk(
    input: {
      assignmentStatus: string;
      driverStatus?: string | null | undefined;
      assignmentReadiness?: string | null | undefined;
      vehicleStatus?: string | null | undefined;
    },
  ): { status: 'on_track' | 'at_risk'; reason: string | null } {
    if (['maintenance', 'inspection', 'inactive', 'retired'].includes(input.vehicleStatus ?? '')) {
      return {
        status: 'at_risk',
        reason: `Vehicle status is '${input.vehicleStatus}'.`,
      };
    }

    if (input.driverStatus && input.driverStatus !== 'active') {
      return {
        status: 'at_risk',
        reason: `Driver status is '${input.driverStatus}'.`,
      };
    }

    if (
      input.assignmentReadiness &&
      !['ready', 'assignment_ready'].includes(input.assignmentReadiness)
    ) {
      return {
        status: 'at_risk',
        reason: 'Driver is not assignment-ready.',
      };
    }

    if (!['assigned', 'active'].includes(input.assignmentStatus)) {
      return {
        status: 'at_risk',
        reason: `Assignment status is '${input.assignmentStatus}'.`,
      };
    }

    return { status: 'on_track', reason: null };
  }

  async getOverview(tenantId: string) {
    const [wallets, walletEntries, remittances, driverStatusCounts, activeAssignments, driversPage, vehicles] = await Promise.all([
      this.prisma.operationalWallet.findMany({
        where: { tenantId },
        select: { id: true, currency: true },
      }),
      this.prisma.operationalWalletEntry.findMany({
        where: {
          wallet: {
            tenantId,
          },
        },
        select: {
          walletId: true,
          type: true,
          amountMinorUnits: true,
          currency: true,
          createdAt: true,
        },
      }),
      this.prisma.remittance.findMany({
        where: { tenantId },
        select: {
          amountMinorUnits: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'asc' },
      }),
      this.prisma.driver.groupBy({
        by: ['status'],
        where: { tenantId },
        _count: { _all: true },
      }),
      this.prisma.assignment.findMany({
        where: {
          tenantId,
          status: { in: ['assigned', 'active'] },
          remittanceAmountMinorUnits: { not: null },
          remittanceCurrency: { not: null },
          remittanceFrequency: { not: null },
        },
        select: {
          id: true,
          status: true,
          driverId: true,
          vehicleId: true,
          remittanceAmountMinorUnits: true,
          remittanceCurrency: true,
          remittanceFrequency: true,
          remittanceStartDate: true,
          remittanceCollectionDay: true,
        },
      }),
      this.driversService.list(tenantId, { limit: 200 }),
      this.prisma.vehicle.findMany({
        where: { tenantId },
        select: { id: true, status: true },
      }),
    ]);

    const walletCurrency = wallets[0]?.currency ?? walletEntries[0]?.currency ?? 'NGN';
    let totalInflowMinorUnits = 0;
    let totalOutflowMinorUnits = 0;
    const balanceByWalletId = new Map<string, number>();

    for (const entry of walletEntries) {
      const currentBalance = balanceByWalletId.get(entry.walletId) ?? 0;
      if (entry.type === 'credit') {
        totalInflowMinorUnits += entry.amountMinorUnits;
        balanceByWalletId.set(entry.walletId, currentBalance + entry.amountMinorUnits);
      } else {
        totalOutflowMinorUnits += entry.amountMinorUnits;
        balanceByWalletId.set(entry.walletId, currentBalance - entry.amountMinorUnits);
      }
    }

    const totalBalanceMinorUnits = Array.from(balanceByWalletId.values()).reduce(
      (sum, balance) => sum + balance,
      0,
    );

    const dailyRemittanceTrend = this.buildDailyTrend(remittances, 7);
    const weeklyRemittanceTrend = this.buildWeeklyTrend(remittances, 6);
    const active = driverStatusCounts.find((item) => item.status === 'active')?._count._all ?? 0;
    const inactive = driverStatusCounts.reduce((sum, item) => {
      if (item.status === 'active') {
        return sum;
      }
      return sum + item._count._all;
    }, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekEnd = new Date(today);
    weekEnd.setDate(today.getDate() + 6);
    const drivers = driversPage.data;
    const driverMap = new Map(drivers.map((driver) => [driver.id, driver]));
    const vehicleMap = new Map(vehicles.map((vehicle) => [vehicle.id, vehicle]));
    let expectedTodayMinorUnits = 0;
    let expectedThisWeekMinorUnits = 0;
    let atRiskMinorUnits = 0;
    let atRiskAssignmentCount = 0;

    for (const assignment of activeAssignments) {
      const nextDueDate = computeNextRemittanceDueDate({
        remittanceFrequency: assignment.remittanceFrequency,
        remittanceAmountMinorUnits: assignment.remittanceAmountMinorUnits,
        remittanceCurrency: assignment.remittanceCurrency,
        remittanceStartDate: assignment.remittanceStartDate,
        remittanceCollectionDay: assignment.remittanceCollectionDay,
      });

      if (!nextDueDate || !assignment.remittanceAmountMinorUnits) {
        continue;
      }

      const nextDue = new Date(`${nextDueDate}T00:00:00.000Z`);
      const risk = this.getRemittanceRisk({
        assignmentStatus: assignment.status,
        driverStatus: driverMap.get(assignment.driverId)?.status,
        assignmentReadiness: driverMap.get(assignment.driverId)?.assignmentReadiness ?? null,
        vehicleStatus: vehicleMap.get(assignment.vehicleId)?.status,
      });

      if (nextDueDate === toIsoDate(today)) {
        expectedTodayMinorUnits += assignment.remittanceAmountMinorUnits;
      }

      if (nextDue >= today && nextDue <= weekEnd) {
        expectedThisWeekMinorUnits += assignment.remittanceAmountMinorUnits;
        if (risk.status === 'at_risk') {
          atRiskMinorUnits += assignment.remittanceAmountMinorUnits;
          atRiskAssignmentCount += 1;
        }
      }
    }

    return {
      wallet: {
        currency: walletCurrency,
        totalBalanceMinorUnits,
        totalInflowMinorUnits,
        totalOutflowMinorUnits,
      },
      dailyRemittanceTrend,
      weeklyRemittanceTrend,
      driverActivity: {
        active,
        inactive,
      },
      remittanceProjection: {
        currency: walletCurrency,
        activeAssignmentsWithPlans: activeAssignments.length,
        expectedTodayMinorUnits,
        expectedThisWeekMinorUnits,
        atRiskMinorUnits,
        atRiskAssignmentCount,
      },
    };
  }

  async getOperationalReadiness(tenantId: string) {
    const [driversPage, vehicles, latestAssignments, approvedLicences, openAssignments] = await Promise.all([
      this.driversService.list(tenantId, { limit: 200 }),
      this.prisma.vehicle.findMany({
        where: { tenantId },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.assignment.findMany({
        where: { tenantId },
        orderBy: { startedAt: 'desc' },
        select: { driverId: true, startedAt: true },
      }),
      this.prisma.driverDocument.findMany({
        where: {
          tenantId,
          documentType: 'drivers-license',
          status: 'approved',
        },
        orderBy: [{ expiresAt: 'asc' }, { createdAt: 'desc' }],
        select: { driverId: true, expiresAt: true },
      }),
      this.prisma.assignment.findMany({
        where: {
          tenantId,
          status: { in: ['assigned', 'active'] },
        },
        orderBy: { startedAt: 'desc' },
      }),
    ]);
    const drivers = driversPage.data;

    const lastAssignmentByDriverId = new Map<string, Date>();
    for (const assignment of latestAssignments) {
      if (!lastAssignmentByDriverId.has(assignment.driverId)) {
        lastAssignmentByDriverId.set(assignment.driverId, assignment.startedAt);
      }
    }

    const licenceByDriverId = new Map<string, Date | null>();
    for (const document of approvedLicences) {
      if (!licenceByDriverId.has(document.driverId)) {
        licenceByDriverId.set(document.driverId, document.expiresAt ?? null);
      }
    }

    const activeAssignmentByDriverId = new Map<string, (typeof openAssignments)[number]>();
    const activeAssignmentByVehicleId = new Map<string, (typeof openAssignments)[number]>();
    for (const assignment of openAssignments) {
      if (!activeAssignmentByDriverId.has(assignment.driverId)) {
        activeAssignmentByDriverId.set(assignment.driverId, assignment);
      }
      if (!activeAssignmentByVehicleId.has(assignment.vehicleId)) {
        activeAssignmentByVehicleId.set(assignment.vehicleId, assignment);
      }
    }

    const driverItems = drivers.map((driver) => {
      const plannedAssignment = activeAssignmentByDriverId.get(driver.id);
      const remittanceRisk = plannedAssignment
        ? this.getRemittanceRisk({
            assignmentStatus: plannedAssignment.status,
            driverStatus: driver.status,
            assignmentReadiness: driver.assignmentReadiness,
          })
        : null;

      return {
        id: driver.id,
        fullName: `${driver.firstName} ${driver.lastName}`,
        fleetId: driver.fleetId,
        activationReadiness: driver.activationReadiness,
        activationReadinessReasons: driver.activationReadinessReasons,
        assignmentReadiness: driver.assignmentReadiness,
        approvedLicenceExpiresAt: licenceByDriverId.get(driver.id)?.toISOString() ?? null,
        lastAssignmentDate: lastAssignmentByDriverId.get(driver.id)?.toISOString() ?? null,
        riskBand: driver.riskBand ?? null,
        expectedRemittanceAmountMinorUnits: plannedAssignment?.remittanceAmountMinorUnits ?? null,
        remittanceCurrency: plannedAssignment?.remittanceCurrency ?? null,
        nextRemittanceDueDate: plannedAssignment
          ? computeNextRemittanceDueDate({
              remittanceFrequency: plannedAssignment.remittanceFrequency,
              remittanceAmountMinorUnits: plannedAssignment.remittanceAmountMinorUnits,
              remittanceCurrency: plannedAssignment.remittanceCurrency,
              remittanceStartDate: plannedAssignment.remittanceStartDate,
              remittanceCollectionDay: plannedAssignment.remittanceCollectionDay,
            })
          : null,
        remittanceRiskStatus: remittanceRisk?.status ?? null,
        remittanceRiskReason: remittanceRisk?.reason ?? null,
      };
    });

    const vehicleItems = await Promise.all(
      vehicles.map(async (vehicle) => {
        const detail = await this.vehiclesService.findOneDetailed(tenantId, vehicle.id);
        const currentValuation = detail.valuations.find((valuation) => valuation.isCurrent) ?? null;
        const plannedAssignment = activeAssignmentByVehicleId.get(vehicle.id);
        const linkedDriver = plannedAssignment
          ? drivers.find((driver) => driver.id === plannedAssignment.driverId)
          : null;
        const remittanceRisk = plannedAssignment
          ? this.getRemittanceRisk({
              assignmentStatus: plannedAssignment.status,
              driverStatus: linkedDriver?.status,
              assignmentReadiness: linkedDriver?.assignmentReadiness ?? null,
              vehicleStatus: detail.status,
            })
          : null;
        return {
          id: detail.id,
          primaryLabel: detail.tenantVehicleCode || detail.systemVehicleCode,
          fleetId: detail.fleetId,
          status: detail.status,
          currentValuationMinorUnits: currentValuation?.amountMinorUnits ?? null,
          currentValuationCurrency: currentValuation?.currency ?? null,
          maintenanceSummary: detail.maintenanceSummary,
          lifecycleStage: detail.status,
          remittanceRiskStatus: remittanceRisk?.status ?? null,
          remittanceRiskReason: remittanceRisk?.reason ?? null,
        };
      }),
    );

    return {
      drivers: driverItems,
      vehicles: vehicleItems,
    };
  }

  async getLicenceExpiryReport(tenantId: string) {
    const [drivers, documents] = await Promise.all([
      this.prisma.driver.findMany({
        where: { tenantId },
        select: { id: true, firstName: true, lastName: true, fleetId: true },
      }),
      this.prisma.driverDocument.findMany({
        where: {
          tenantId,
          documentType: 'drivers-license',
          status: 'approved',
          expiresAt: { not: null },
        },
        orderBy: { expiresAt: 'asc' },
        select: { driverId: true, expiresAt: true },
      }),
    ]);

    const driversById = new Map(drivers.map((driver) => [driver.id, driver]));

    return documents
      .map((document) => {
        const driver = driversById.get(document.driverId);
        if (!driver || !document.expiresAt) {
          return null;
        }
        const daysUntilExpiry = Math.ceil(
          (document.expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
        );
        return {
          driverId: driver.id,
          fullName: `${driver.firstName} ${driver.lastName}`,
          fleetId: driver.fleetId,
          expiresAt: document.expiresAt.toISOString(),
          daysUntilExpiry,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);
  }

  private buildDailyTrend(
    remittances: Array<{ amountMinorUnits: number; createdAt: Date }>,
    days: number,
  ) {
    const buckets = new Map<string, number>();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let index = days - 1; index >= 0; index -= 1) {
      const date = new Date(today);
      date.setDate(today.getDate() - index);
      buckets.set(date.toISOString().slice(0, 10), 0);
    }

    for (const remittance of remittances) {
      const key = remittance.createdAt.toISOString().slice(0, 10);
      if (!buckets.has(key)) {
        continue;
      }
      buckets.set(key, (buckets.get(key) ?? 0) + remittance.amountMinorUnits);
    }

    return Array.from(buckets.entries()).map(([label, amountMinorUnits]) => ({
      label,
      amountMinorUnits,
    }));
  }

  private buildWeeklyTrend(
    remittances: Array<{ amountMinorUnits: number; createdAt: Date }>,
    weeks: number,
  ) {
    const now = new Date();
    const currentWeekStart = this.startOfWeek(now);
    const buckets = new Map<string, number>();

    for (let index = weeks - 1; index >= 0; index -= 1) {
      const date = new Date(currentWeekStart);
      date.setDate(currentWeekStart.getDate() - index * 7);
      buckets.set(date.toISOString().slice(0, 10), 0);
    }

    for (const remittance of remittances) {
      const weekStart = this.startOfWeek(remittance.createdAt).toISOString().slice(0, 10);
      if (!buckets.has(weekStart)) {
        continue;
      }
      buckets.set(weekStart, (buckets.get(weekStart) ?? 0) + remittance.amountMinorUnits);
    }

    return Array.from(buckets.entries()).map(([label, amountMinorUnits]) => ({
      label,
      amountMinorUnits,
    }));
  }

  private startOfWeek(value: Date) {
    const date = new Date(value);
    date.setHours(0, 0, 0, 0);
    const day = date.getDay();
    const diff = (day + 6) % 7;
    date.setDate(date.getDate() - diff);
    return date;
  }
}
