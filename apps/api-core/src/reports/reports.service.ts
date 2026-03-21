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
}
