import { computeNextRemittanceDueDate, toIsoDate } from '@mobility-os/domain-config';
import { Injectable } from '@nestjs/common';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { PrismaService } from '../database/prisma.service';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { DriversService } from '../drivers/drivers.service';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { VehicleRiskService } from '../vehicle-risk/services/vehicle-risk.service';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { VehiclesService } from '../vehicles/vehicles.service';
import type { InternalOperationalTenantSummaryDto } from './dto/internal-operational-oversight.dto';

@Injectable()
export class ReportsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly driversService: DriversService,
    private readonly vehiclesService: VehiclesService,
    private readonly vehicleRiskService: VehicleRiskService,
  ) {}

  getVehiclesAtRisk(tenantId: string) {
    return this.vehicleRiskService.listVehiclesAtRisk(tenantId);
  }

  getMaintenanceBacklog(tenantId: string) {
    return this.vehicleRiskService.getMaintenanceBacklogSummary(tenantId);
  }

  getInspectionCompliance(tenantId: string) {
    return this.vehicleRiskService.getInspectionComplianceRate(tenantId);
  }

  private getRemittanceRisk(input: {
    assignmentStatus: string;
    driverStatus?: string | null | undefined;
    assignmentReadiness?: string | null | undefined;
    vehicleStatus?: string | null | undefined;
  }): { status: 'on_track' | 'at_risk'; reason: string | null } {
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

    if (input.assignmentStatus === 'pending_driver_confirmation') {
      return {
        status: 'at_risk',
        reason: 'The driver must accept the assignment before remittance can begin.',
      };
    }

    if (input.assignmentStatus !== 'active') {
      return {
        status: 'at_risk',
        reason: `Assignment status is '${input.assignmentStatus}'.`,
      };
    }

    return { status: 'on_track', reason: null };
  }

  async getOverview(
    tenantId: string,
    fleetIds: string[] = [],
    vehicleIds: string[] = [],
    dateFrom?: string,
    dateTo?: string,
  ) {
    const walletEntryDateFilter =
      dateFrom || dateTo
        ? {
            createdAt: {
              ...(dateFrom ? { gte: new Date(`${dateFrom}T00:00:00.000Z`) } : {}),
              ...(dateTo ? { lte: new Date(`${dateTo}T23:59:59.999Z`) } : {}),
            },
          }
        : {};
    const remittanceDateFilter =
      dateFrom || dateTo
        ? {
            createdAt: {
              ...(dateFrom ? { gte: new Date(`${dateFrom}T00:00:00.000Z`) } : {}),
              ...(dateTo ? { lte: new Date(`${dateTo}T23:59:59.999Z`) } : {}),
            },
          }
        : {};
    const scopedDriverIds =
      vehicleIds.length > 0 ? await this.getDriverIdsFromVehicleScope(tenantId, vehicleIds) : [];
    const scopedDriverFilter =
      vehicleIds.length > 0
        ? { id: { in: scopedDriverIds.length > 0 ? scopedDriverIds : ['__none__'] } }
        : {};
    const fleetScope = fleetIds.length > 0 ? { fleetId: { in: fleetIds } } : {};
    const vehicleScope = vehicleIds.length > 0 ? { id: { in: vehicleIds } } : {};
    const assignmentVehicleScope = vehicleIds.length > 0 ? { vehicleId: { in: vehicleIds } } : {};
    const [
      wallets,
      walletEntries,
      remittances,
      driverStatusCounts,
      activeAssignments,
      driversPage,
      vehicles,
    ] = await Promise.all([
      this.prisma.operationalWallet.findMany({
        where: { tenantId },
        select: { id: true, currency: true },
      }),
      this.prisma.operationalWalletEntry.findMany({
        where: {
          wallet: {
            tenantId,
          },
          ...walletEntryDateFilter,
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
        where: {
          tenantId,
          ...(vehicleIds.length > 0 ? { vehicleId: { in: vehicleIds } } : {}),
          ...remittanceDateFilter,
        },
        select: {
          amountMinorUnits: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'asc' },
      }),
      this.prisma.driver.groupBy({
        by: ['status'],
        where: {
          tenantId,
          ...scopedDriverFilter,
          ...(fleetIds.length > 0 ? { fleetId: { in: fleetIds } } : {}),
        },
        _count: { _all: true },
      }),
      this.prisma.assignment.findMany({
        where: {
          tenantId,
          ...fleetScope,
          ...assignmentVehicleScope,
          status: { in: ['pending_driver_confirmation', 'active'] },
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
          remittanceModel: true,
        },
      }),
      this.driversService.list(tenantId, {
        limit: 200,
        ...(fleetIds.length > 0 ? { fleetIds } : {}),
      }),
      this.prisma.vehicle.findMany({
        where: {
          tenantId,
          ...vehicleScope,
          ...(fleetIds.length > 0 ? { fleetId: { in: fleetIds } } : {}),
        },
        select: { id: true, fleetId: true, status: true },
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
    const drivers =
      vehicleIds.length > 0
        ? driversPage.data.filter((driver) => scopedDriverIds.includes(driver.id))
        : driversPage.data;
    const activeVerified = drivers.filter(
      (driver) => driver.status === 'active' && driver.identityStatus === 'verified',
    ).length;
    const activeUnverified = drivers.filter(
      (driver) => driver.status === 'active' && driver.identityStatus !== 'verified',
    ).length;
    const onboardingPool = drivers.filter(
      (driver) =>
        driver.status !== 'active' ||
        driver.identityStatus !== 'verified' ||
        driver.activationReadiness !== 'ready',
    ).length;
    const driverMap = new Map(drivers.map((driver) => [driver.id, driver]));
    const vehicleMap = new Map(vehicles.map((vehicle) => [vehicle.id, vehicle]));
    let expectedTodayMinorUnits = 0;
    let expectedThisWeekMinorUnits = 0;
    let atRiskMinorUnits = 0;
    let atRiskAssignmentCount = 0;
    const hirePurchaseAssignments = activeAssignments.filter(
      (assignment) => assignment.remittanceModel === 'hire_purchase',
    );
    const hirePurchaseVehicleIds = hirePurchaseAssignments.map(
      (assignment) => assignment.vehicleId,
    );
    const hirePurchaseAssignmentIds = hirePurchaseAssignments.map((assignment) => assignment.id);
    const [currentValuations, confirmedHirePurchaseRemittances] = await Promise.all([
      hirePurchaseVehicleIds.length
        ? this.prisma.vehicleValuation.findMany({
            where: {
              tenantId,
              vehicleId: { in: hirePurchaseVehicleIds },
              isCurrent: true,
            },
            orderBy: [{ valuationDate: 'desc' }, { createdAt: 'desc' }],
          })
        : Promise.resolve([]),
      hirePurchaseAssignmentIds.length
        ? this.prisma.remittance.findMany({
            where: {
              tenantId,
              assignmentId: { in: hirePurchaseAssignmentIds },
              status: 'completed',
              ...remittanceDateFilter,
            },
            select: {
              assignmentId: true,
              amountMinorUnits: true,
            },
          })
        : Promise.resolve([]),
    ]);
    const valuationByVehicleId = new Map<string, (typeof currentValuations)[number]>();
    for (const valuation of currentValuations) {
      if (!valuationByVehicleId.has(valuation.vehicleId)) {
        valuationByVehicleId.set(valuation.vehicleId, valuation);
      }
    }
    const remittedByAssignmentId = new Map<string, number>();
    for (const remittance of confirmedHirePurchaseRemittances) {
      remittedByAssignmentId.set(
        remittance.assignmentId,
        (remittedByAssignmentId.get(remittance.assignmentId) ?? 0) + remittance.amountMinorUnits,
      );
    }
    let ownershipTargetValueMinorUnits = 0;
    let ownershipRemittedValueMinorUnits = 0;

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

      if (assignment.remittanceModel === 'hire_purchase') {
        const targetValuation = valuationByVehicleId.get(assignment.vehicleId);
        if (targetValuation) {
          ownershipTargetValueMinorUnits += targetValuation.amountMinorUnits;
          ownershipRemittedValueMinorUnits += Math.min(
            remittedByAssignmentId.get(assignment.id) ?? 0,
            targetValuation.amountMinorUnits,
          );
        }
      }
    }

    const accessibleVehicles = vehicles.map((vehicle) => vehicle.id);
    const accessibleVehicleSet = new Set(accessibleVehicles);
    const [fleets, maintenanceEvents, incidents, maintenanceSchedules, teamMembers] =
      await Promise.all([
        this.prisma.fleet.findMany({
          where: {
            tenantId,
            ...(fleetIds.length > 0 ? { id: { in: fleetIds } } : {}),
          },
          select: { id: true, name: true },
        }),
        this.prisma.vehicleMaintenanceEvent.findMany({
          where: {
            tenantId,
            ...(accessibleVehicles.length > 0 ? { vehicleId: { in: accessibleVehicles } } : {}),
          },
          select: {
            vehicleId: true,
            costMinorUnits: true,
            status: true,
          },
        }),
        this.prisma.vehicleIncident.findMany({
          where: {
            tenantId,
            ...(accessibleVehicles.length > 0 ? { vehicleId: { in: accessibleVehicles } } : {}),
          },
          select: {
            vehicleId: true,
            estimatedCostMinorUnits: true,
          },
        }),
        this.prisma.vehicleMaintenanceSchedule.findMany({
          where: {
            tenantId,
            isActive: true,
            ...(accessibleVehicles.length > 0 ? { vehicleId: { in: accessibleVehicles } } : {}),
          },
          select: {
            vehicleId: true,
            nextDueAt: true,
            nextDueOdometerKm: true,
          },
        }),
        this.prisma.user.findMany({
          where: {
            tenantId,
            isActive: true,
            driverId: null,
            role: 'FLEET_MANAGER',
          },
          select: {
            id: true,
            name: true,
            settings: true,
          },
        }),
      ]);
    const fleetNames = new Map(fleets.map((fleet) => [fleet.id, fleet.name]));
    const todayIso = toIsoDate(new Date());
    const fleetPerformanceMap = new Map<
      string,
      {
        fleetId: string;
        fleetName: string;
        vehicleCount: number;
        activeAssignmentCount: number;
        confirmedRevenueMinorUnits: number;
        trackedExpenseMinorUnits: number;
        profitMinorUnits: number;
        atRiskAssignmentCount: number;
        overdueMaintenanceCount: number;
      }
    >();

    for (const vehicle of vehicles) {
      fleetPerformanceMap.set(vehicle.fleetId, {
        fleetId: vehicle.fleetId,
        fleetName: fleetNames.get(vehicle.fleetId) ?? vehicle.fleetId,
        vehicleCount: 0,
        activeAssignmentCount: 0,
        confirmedRevenueMinorUnits: 0,
        trackedExpenseMinorUnits: 0,
        profitMinorUnits: 0,
        atRiskAssignmentCount: 0,
        overdueMaintenanceCount: 0,
      });
    }

    for (const vehicle of vehicles) {
      const fleetEntry = fleetPerformanceMap.get(vehicle.fleetId);
      if (fleetEntry) {
        fleetEntry.vehicleCount += 1;
      }
    }

    const confirmedRevenueByVehicleId = new Map<string, number>();
    const confirmedExpenseByVehicleId = new Map<string, number>();
    const overdueMaintenanceByVehicleId = new Map<string, number>();
    const activeAssignmentsByVehicleId = new Map<string, number>();
    const atRiskAssignmentsByVehicleId = new Map<string, number>();

    const confirmedRemittances = await this.prisma.remittance.findMany({
      where: {
        tenantId,
        status: 'completed',
        ...(accessibleVehicles.length > 0 ? { vehicleId: { in: accessibleVehicles } } : {}),
      },
      select: { vehicleId: true, amountMinorUnits: true },
    });

    for (const item of confirmedRemittances) {
      confirmedRevenueByVehicleId.set(
        item.vehicleId,
        (confirmedRevenueByVehicleId.get(item.vehicleId) ?? 0) + item.amountMinorUnits,
      );
    }

    for (const item of maintenanceEvents) {
      confirmedExpenseByVehicleId.set(
        item.vehicleId,
        (confirmedExpenseByVehicleId.get(item.vehicleId) ?? 0) + (item.costMinorUnits ?? 0),
      );
    }

    for (const item of incidents) {
      confirmedExpenseByVehicleId.set(
        item.vehicleId,
        (confirmedExpenseByVehicleId.get(item.vehicleId) ?? 0) +
          (item.estimatedCostMinorUnits ?? 0),
      );
    }

    for (const item of maintenanceSchedules) {
      if (item.nextDueAt && item.nextDueAt.toISOString().slice(0, 10) < todayIso) {
        overdueMaintenanceByVehicleId.set(
          item.vehicleId,
          (overdueMaintenanceByVehicleId.get(item.vehicleId) ?? 0) + 1,
        );
      }
    }

    for (const assignment of activeAssignments) {
      activeAssignmentsByVehicleId.set(
        assignment.vehicleId,
        (activeAssignmentsByVehicleId.get(assignment.vehicleId) ?? 0) + 1,
      );
      const risk = this.getRemittanceRisk({
        assignmentStatus: assignment.status,
        driverStatus: driverMap.get(assignment.driverId)?.status,
        assignmentReadiness: driverMap.get(assignment.driverId)?.assignmentReadiness ?? null,
        vehicleStatus: vehicleMap.get(assignment.vehicleId)?.status,
      });
      if (risk.status === 'at_risk') {
        atRiskAssignmentsByVehicleId.set(
          assignment.vehicleId,
          (atRiskAssignmentsByVehicleId.get(assignment.vehicleId) ?? 0) + 1,
        );
      }
    }

    for (const vehicle of vehicles) {
      const fleetEntry = fleetPerformanceMap.get(vehicle.fleetId);
      if (!fleetEntry) {
        continue;
      }
      const revenue = confirmedRevenueByVehicleId.get(vehicle.id) ?? 0;
      const expenses = confirmedExpenseByVehicleId.get(vehicle.id) ?? 0;
      fleetEntry.confirmedRevenueMinorUnits += revenue;
      fleetEntry.trackedExpenseMinorUnits += expenses;
      fleetEntry.profitMinorUnits += revenue - expenses;
      fleetEntry.activeAssignmentCount += activeAssignmentsByVehicleId.get(vehicle.id) ?? 0;
      fleetEntry.atRiskAssignmentCount += atRiskAssignmentsByVehicleId.get(vehicle.id) ?? 0;
      fleetEntry.overdueMaintenanceCount += overdueMaintenanceByVehicleId.get(vehicle.id) ?? 0;
    }

    const fleetPerformance = Array.from(fleetPerformanceMap.values()).sort(
      (left, right) => right.profitMinorUnits - left.profitMinorUnits,
    );
    const managerPerformance = teamMembers.map((member) => {
      const settings = this.readManagerScopeSettings(member.settings);
      const scopedVehicleIds =
        settings.assignedVehicleIds.length > 0
          ? settings.assignedVehicleIds.filter((vehicleId) => accessibleVehicleSet.has(vehicleId))
          : vehicles
              .filter((vehicle) =>
                settings.assignedFleetIds.length > 0
                  ? settings.assignedFleetIds.includes(vehicle.fleetId)
                  : true,
              )
              .map((vehicle) => vehicle.id);
      const scopedVehicleSet = new Set(scopedVehicleIds);
      const scopedFleetIds = new Set(
        vehicles
          .filter((vehicle) => scopedVehicleSet.has(vehicle.id))
          .map((vehicle) => vehicle.fleetId),
      );
      const revenue = scopedVehicleIds.reduce(
        (sum, vehicleId) => sum + (confirmedRevenueByVehicleId.get(vehicleId) ?? 0),
        0,
      );
      const expense = scopedVehicleIds.reduce(
        (sum, vehicleId) => sum + (confirmedExpenseByVehicleId.get(vehicleId) ?? 0),
        0,
      );
      const overdueMaintenanceCount = scopedVehicleIds.reduce(
        (sum, vehicleId) => sum + (overdueMaintenanceByVehicleId.get(vehicleId) ?? 0),
        0,
      );
      const atRiskCount = scopedVehicleIds.reduce(
        (sum, vehicleId) => sum + (atRiskAssignmentsByVehicleId.get(vehicleId) ?? 0),
        0,
      );

      return {
        userId: member.id,
        name: member.name,
        fleetCount: scopedFleetIds.size,
        vehicleCount: scopedVehicleIds.length,
        confirmedRevenueMinorUnits: revenue,
        trackedExpenseMinorUnits: expense,
        profitMinorUnits: revenue - expense,
        atRiskAssignmentCount: atRiskCount,
        overdueMaintenanceCount,
      };
    });

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
        activeVerified,
        activeUnverified,
        onboardingPool,
      },
      remittanceProjection: {
        currency: walletCurrency,
        activeAssignmentsWithPlans: activeAssignments.length,
        expectedTodayMinorUnits,
        expectedThisWeekMinorUnits,
        atRiskMinorUnits,
        atRiskAssignmentCount,
      },
      ownershipProgress: {
        currency: walletCurrency,
        activeHirePurchaseUnits: hirePurchaseAssignments.length,
        targetValueMinorUnits: ownershipTargetValueMinorUnits,
        remittedValueMinorUnits: ownershipRemittedValueMinorUnits,
        outstandingValueMinorUnits: Math.max(
          ownershipTargetValueMinorUnits - ownershipRemittedValueMinorUnits,
          0,
        ),
        completionRatio:
          ownershipTargetValueMinorUnits > 0
            ? Number((ownershipRemittedValueMinorUnits / ownershipTargetValueMinorUnits).toFixed(4))
            : 0,
      },
      fleetPerformance,
      managerPerformance,
    };
  }

  async getOperationalReadiness(
    tenantId: string,
    fleetIds: string[] = [],
    vehicleIds: string[] = [],
  ) {
    const scopedDriverIds =
      vehicleIds.length > 0 ? await this.getDriverIdsFromVehicleScope(tenantId, vehicleIds) : [];
    const scopedDriverFilter =
      vehicleIds.length > 0
        ? { driverId: { in: scopedDriverIds.length > 0 ? scopedDriverIds : ['__none__'] } }
        : {};
    const [driversPage, vehicles, latestAssignments, approvedLicences, openAssignments] =
      await Promise.all([
        this.driversService.list(tenantId, {
          limit: 200,
          ...(fleetIds.length > 0 ? { fleetIds } : {}),
        }),
        this.prisma.vehicle.findMany({
          where: {
            tenantId,
            ...(vehicleIds.length > 0 ? { id: { in: vehicleIds } } : {}),
            ...(fleetIds.length > 0 ? { fleetId: { in: fleetIds } } : {}),
          },
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.assignment.findMany({
          where: {
            tenantId,
            ...(fleetIds.length > 0 ? { fleetId: { in: fleetIds } } : {}),
            ...(vehicleIds.length > 0 ? { vehicleId: { in: vehicleIds } } : {}),
          },
          orderBy: { startedAt: 'desc' },
          select: { driverId: true, startedAt: true },
        }),
        this.prisma.driverDocument.findMany({
          where: {
            tenantId,
            ...scopedDriverFilter,
            documentType: 'drivers-license',
            status: 'approved',
          },
          orderBy: [{ expiresAt: 'asc' }, { createdAt: 'desc' }],
          select: { driverId: true, expiresAt: true },
        }),
        this.prisma.assignment.findMany({
          where: {
            tenantId,
            ...(fleetIds.length > 0 ? { fleetId: { in: fleetIds } } : {}),
            ...(vehicleIds.length > 0 ? { vehicleId: { in: vehicleIds } } : {}),
            status: { in: ['pending_driver_confirmation', 'active'] },
          },
          orderBy: { startedAt: 'desc' },
        }),
      ]);
    const drivers =
      vehicleIds.length > 0
        ? driversPage.data.filter((driver) => scopedDriverIds.includes(driver.id))
        : driversPage.data;

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

    const confirmedRemittances = await this.prisma.remittance.findMany({
      where: {
        tenantId,
        ...(fleetIds.length > 0 ? { fleetId: { in: fleetIds } } : {}),
        ...(vehicleIds.length > 0 ? { vehicleId: { in: vehicleIds } } : {}),
        status: 'completed',
      },
      select: {
        assignmentId: true,
        amountMinorUnits: true,
      },
    });
    const remittedByAssignmentId = new Map<string, number>();
    for (const remittance of confirmedRemittances) {
      remittedByAssignmentId.set(
        remittance.assignmentId,
        (remittedByAssignmentId.get(remittance.assignmentId) ?? 0) + remittance.amountMinorUnits,
      );
    }

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
        const ownershipTargetMinorUnits =
          plannedAssignment?.remittanceModel === 'hire_purchase'
            ? (currentValuation?.amountMinorUnits ?? null)
            : null;
        const ownershipRemittedMinorUnits =
          plannedAssignment?.remittanceModel === 'hire_purchase'
            ? (remittedByAssignmentId.get(plannedAssignment.id) ?? 0)
            : null;
        const ownershipOutstandingMinorUnits =
          ownershipTargetMinorUnits !== null && ownershipRemittedMinorUnits !== null
            ? Math.max(ownershipTargetMinorUnits - ownershipRemittedMinorUnits, 0)
            : null;
        const ownershipCompletionRatio =
          ownershipTargetMinorUnits && ownershipRemittedMinorUnits !== null
            ? Number((ownershipRemittedMinorUnits / ownershipTargetMinorUnits).toFixed(4))
            : null;
        return {
          id: detail.id,
          primaryLabel: detail.tenantVehicleCode || detail.systemVehicleCode,
          fleetId: detail.fleetId,
          status: detail.status,
          currentValuationMinorUnits: currentValuation?.amountMinorUnits ?? null,
          currentValuationCurrency: currentValuation?.currency ?? null,
          ownershipTargetMinorUnits,
          ownershipRemittedMinorUnits,
          ownershipOutstandingMinorUnits,
          ownershipCompletionRatio,
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

  async getLicenceExpiryReport(
    tenantId: string,
    fleetIds: string[] = [],
    vehicleIds: string[] = [],
  ) {
    const scopedDriverIds =
      vehicleIds.length > 0 ? await this.getDriverIdsFromVehicleScope(tenantId, vehicleIds) : [];
    const scopedDriverIdFilter =
      vehicleIds.length > 0
        ? { id: { in: scopedDriverIds.length > 0 ? scopedDriverIds : ['__none__'] } }
        : {};
    const scopedDocumentDriverFilter =
      vehicleIds.length > 0
        ? { driverId: { in: scopedDriverIds.length > 0 ? scopedDriverIds : ['__none__'] } }
        : {};
    const [drivers, documents] = await Promise.all([
      this.prisma.driver.findMany({
        where: {
          tenantId,
          ...scopedDriverIdFilter,
          ...(fleetIds.length > 0 ? { fleetId: { in: fleetIds } } : {}),
        },
        select: { id: true, firstName: true, lastName: true, fleetId: true },
      }),
      this.prisma.driverDocument.findMany({
        where: {
          tenantId,
          ...scopedDocumentDriverFilter,
          ...(fleetIds.length > 0
            ? {
                driver: {
                  fleetId: { in: fleetIds },
                },
              }
            : {}),
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

  async getControlPlaneOperationalSummary(
    tenantId: string,
  ): Promise<InternalOperationalTenantSummaryDto> {
    const [
      overview,
      readiness,
      licenceExpiry,
      vehiclesAtRisk,
      maintenanceBacklog,
      inspectionCompliance,
    ] = await Promise.all([
      this.getOverview(tenantId),
      this.getOperationalReadiness(tenantId),
      this.getLicenceExpiryReport(tenantId),
      this.getVehiclesAtRisk(tenantId),
      this.getMaintenanceBacklog(tenantId),
      this.getInspectionCompliance(tenantId),
    ]);

    const [pendingLicenceReviewCount, providerRetryRequiredCount] = await Promise.all([
      this.prisma.driverDocumentVerification.count({
        where: {
          tenantId,
          documentType: 'drivers-license',
          status: 'manual_review',
        },
      }),
      this.prisma.driverDocumentVerification.count({
        where: {
          tenantId,
          documentType: 'drivers-license',
          status: 'provider_unavailable',
        },
      }),
    ]);

    const expiringLicencesSoonCount = licenceExpiry.filter(
      (item) => item.daysUntilExpiry >= 0 && item.daysUntilExpiry <= 30,
    ).length;
    const expiredLicencesCount = licenceExpiry.filter((item) => item.daysUntilExpiry < 0).length;
    const driversAwaitingActivation = readiness.drivers.filter(
      (driver) => driver.activationReadiness !== 'ready',
    ).length;

    const topDriverIssues = readiness.drivers
      .filter(
        (driver) =>
          driver.activationReadiness !== 'ready' ||
          driver.assignmentReadiness !== 'ready' ||
          driver.remittanceRiskStatus === 'at_risk',
      )
      .sort((left, right) => {
        const leftScore =
          left.activationReadiness !== 'ready'
            ? 3
            : left.assignmentReadiness !== 'ready'
              ? 2
              : left.remittanceRiskStatus === 'at_risk'
                ? 1
                : 0;
        const rightScore =
          right.activationReadiness !== 'ready'
            ? 3
            : right.assignmentReadiness !== 'ready'
              ? 2
              : right.remittanceRiskStatus === 'at_risk'
                ? 1
                : 0;
        return rightScore - leftScore;
      })
      .slice(0, 5);

    const topVehicleIssues = readiness.vehicles
      .filter(
        (vehicle) =>
          vehicle.status !== 'available' ||
          vehicle.remittanceRiskStatus === 'at_risk' ||
          /overdue|critical|warning|maintenance/i.test(vehicle.maintenanceSummary),
      )
      .slice(0, 5);

    return {
      tenantId,
      generatedAt: new Date().toISOString(),
      driverActivity: overview.driverActivity,
      verificationHealth: {
        driversAwaitingActivation,
        pendingLicenceReviewCount,
        providerRetryRequiredCount,
        expiringLicencesSoonCount,
        expiredLicencesCount,
      },
      riskSummary: {
        atRiskAssignmentCount: overview.remittanceProjection.atRiskAssignmentCount,
        vehiclesAtRiskCount: vehiclesAtRisk.length,
        criticalMaintenanceCount: maintenanceBacklog.critical,
        inspectionComplianceRate: inspectionCompliance.complianceRate,
      },
      topDriverIssues: topDriverIssues.map((driver) => ({
        driverId: driver.id,
        fullName: driver.fullName,
        fleetId: driver.fleetId,
        activationReadiness: driver.activationReadiness,
        activationReadinessReasons: driver.activationReadinessReasons,
        assignmentReadiness: driver.assignmentReadiness,
        remittanceRiskStatus: driver.remittanceRiskStatus,
        remittanceRiskReason: driver.remittanceRiskReason,
        riskBand: driver.riskBand,
      })),
      topVehicleIssues: topVehicleIssues.map((vehicle) => ({
        vehicleId: vehicle.id,
        primaryLabel: vehicle.primaryLabel,
        fleetId: vehicle.fleetId,
        status: vehicle.status,
        maintenanceSummary: vehicle.maintenanceSummary,
        remittanceRiskStatus: vehicle.remittanceRiskStatus,
        remittanceRiskReason: vehicle.remittanceRiskReason,
      })),
      topLicenceExpiries: licenceExpiry.slice(0, 5),
    };
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

  private readManagerScopeSettings(rawSettings: unknown): {
    assignedFleetIds: string[];
    assignedVehicleIds: string[];
  } {
    if (!rawSettings || typeof rawSettings !== 'object' || Array.isArray(rawSettings)) {
      return { assignedFleetIds: [], assignedVehicleIds: [] };
    }
    const settings = rawSettings as Record<string, unknown>;
    return {
      assignedFleetIds: Array.isArray(settings.assignedFleetIds)
        ? settings.assignedFleetIds.filter((value): value is string => typeof value === 'string')
        : [],
      assignedVehicleIds: Array.isArray(settings.assignedVehicleIds)
        ? settings.assignedVehicleIds.filter((value): value is string => typeof value === 'string')
        : [],
    };
  }

  private async getDriverIdsFromVehicleScope(
    tenantId: string,
    vehicleIds: string[],
  ): Promise<string[]> {
    if (vehicleIds.length === 0) {
      return [];
    }

    const assignments = await this.prisma.assignment.findMany({
      where: {
        tenantId,
        vehicleId: { in: vehicleIds },
      },
      distinct: ['driverId'],
      select: { driverId: true },
    });

    return assignments.map((assignment) => assignment.driverId);
  }
}
