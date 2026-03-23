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

  async getOverview(tenantId: string) {
    const [wallets, walletEntries, remittances, driverStatusCounts] = await Promise.all([
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
    };
  }

  async getOperationalReadiness(tenantId: string) {
    const [driversPage, vehicles, latestAssignments, approvedLicences] = await Promise.all([
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

    const driverItems = drivers.map((driver) => ({
      id: driver.id,
      fullName: `${driver.firstName} ${driver.lastName}`,
      fleetId: driver.fleetId,
      activationReadiness: driver.activationReadiness,
      activationReadinessReasons: driver.activationReadinessReasons,
      assignmentReadiness: driver.assignmentReadiness,
      approvedLicenceExpiresAt: licenceByDriverId.get(driver.id)?.toISOString() ?? null,
      lastAssignmentDate: lastAssignmentByDriverId.get(driver.id)?.toISOString() ?? null,
      riskBand: driver.riskBand ?? null,
    }));

    const vehicleItems = await Promise.all(
      vehicles.map(async (vehicle) => {
        const detail = await this.vehiclesService.findOneDetailed(tenantId, vehicle.id);
        const currentValuation = detail.valuations.find((valuation) => valuation.isCurrent) ?? null;
        return {
          id: detail.id,
          primaryLabel: detail.tenantVehicleCode || detail.systemVehicleCode,
          fleetId: detail.fleetId,
          status: detail.status,
          currentValuationMinorUnits: currentValuation?.amountMinorUnits ?? null,
          currentValuationCurrency: currentValuation?.currency ?? null,
          maintenanceSummary: detail.maintenanceSummary,
          lifecycleStage: detail.status,
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
