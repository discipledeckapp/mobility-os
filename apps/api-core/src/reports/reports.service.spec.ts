import { ReportsService } from './reports.service';

describe('ReportsService', () => {
  const prisma = {
    operationalWallet: {
      findMany: jest.fn(),
    },
    operationalWalletEntry: {
      findMany: jest.fn(),
    },
    remittance: {
      findMany: jest.fn(),
    },
    vehicle: {
      findMany: jest.fn(),
    },
    fleet: {
      findMany: jest.fn(),
    },
    assignment: {
      findMany: jest.fn(),
    },
    vehicleMaintenanceEvent: {
      findMany: jest.fn(),
    },
    vehicleIncident: {
      findMany: jest.fn(),
    },
    vehicleMaintenanceSchedule: {
      findMany: jest.fn(),
    },
    user: {
      findMany: jest.fn(),
    },
    driverDocument: {
      findMany: jest.fn(),
    },
    driver: {
      findMany: jest.fn(),
      groupBy: jest.fn(),
    },
  };

  const driversService = {
    list: jest.fn(),
  };

  const vehiclesService = {
    findOneDetailed: jest.fn(),
  };

  const vehicleRiskService = {
    listVehiclesAtRisk: jest.fn(),
    getMaintenanceBacklogSummary: jest.fn(),
    getInspectionComplianceRate: jest.fn(),
  };

  let service: ReportsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ReportsService(
      prisma as never,
      driversService as never,
      vehiclesService as never,
      vehicleRiskService as never,
    );
  });

  it('builds operational readiness from driver, vehicle, assignment, and licence inputs', async () => {
    driversService.list.mockResolvedValue({
      data: [
        {
          id: 'driver_1',
          firstName: 'Ada',
          lastName: 'Okafor',
          fleetId: 'fleet_1',
          activationReadiness: 'ready',
          activationReadinessReasons: [],
          assignmentReadiness: 'ready',
          riskBand: 'low',
        },
        {
          id: 'driver_2',
          firstName: 'Kojo',
          lastName: 'Mensah',
          fleetId: 'fleet_2',
          activationReadiness: 'not_ready',
          activationReadinessReasons: ['Approved driver licence is missing.'],
          assignmentReadiness: 'not_ready',
          riskBand: 'medium',
        },
      ],
      total: 2,
      page: 1,
      limit: 200,
    });
    prisma.vehicle.findMany.mockResolvedValue([
      { id: 'vehicle_1', tenantId: 'tenant_1', createdAt: new Date('2026-03-01T00:00:00.000Z') },
    ]);
    prisma.assignment.findMany.mockResolvedValue([
      { driverId: 'driver_1', startedAt: new Date('2026-03-18T09:00:00.000Z') },
      { driverId: 'driver_1', startedAt: new Date('2026-03-10T09:00:00.000Z') },
    ]);
    prisma.driverDocument.findMany.mockResolvedValue([
      { driverId: 'driver_1', expiresAt: new Date('2026-04-30T00:00:00.000Z') },
    ]);
    prisma.remittance.findMany.mockResolvedValue([]);
    vehiclesService.findOneDetailed.mockResolvedValue({
      id: 'vehicle_1',
      fleetId: 'fleet_1',
      tenantVehicleCode: 'ORG-CAR-001',
      systemVehicleCode: 'SYS-001',
      status: 'available',
      maintenanceSummary: 'No maintenance due',
      valuations: [
        {
          isCurrent: true,
          amountMinorUnits: 550000000,
          currency: 'NGN',
        },
      ],
    });

    const result = await service.getOperationalReadiness('tenant_1');

    expect(driversService.list).toHaveBeenCalledWith('tenant_1', { limit: 200 });
    expect(result.drivers).toEqual([
      expect.objectContaining({
        id: 'driver_1',
        fullName: 'Ada Okafor',
        activationReadiness: 'ready',
        assignmentReadiness: 'ready',
        approvedLicenceExpiresAt: '2026-04-30T00:00:00.000Z',
        lastAssignmentDate: '2026-03-18T09:00:00.000Z',
        riskBand: 'low',
      }),
      expect.objectContaining({
        id: 'driver_2',
        fullName: 'Kojo Mensah',
        activationReadiness: 'not_ready',
        activationReadinessReasons: ['Approved driver licence is missing.'],
        approvedLicenceExpiresAt: null,
        lastAssignmentDate: null,
        riskBand: 'medium',
      }),
    ]);
    expect(result.vehicles).toEqual([
      expect.objectContaining({
        id: 'vehicle_1',
        primaryLabel: 'ORG-CAR-001',
        status: 'available',
        currentValuationMinorUnits: 550000000,
        currentValuationCurrency: 'NGN',
        maintenanceSummary: 'No maintenance due',
      }),
    ]);
  });

  it('returns licence expiry items ordered by the earliest expiry', async () => {
    prisma.driver.findMany.mockResolvedValue([
      {
        id: 'driver_1',
        firstName: 'Amina',
        lastName: 'Diallo',
        fleetId: 'fleet_1',
      },
      {
        id: 'driver_2',
        firstName: 'Kwame',
        lastName: 'Boateng',
        fleetId: 'fleet_2',
      },
    ]);
    prisma.driverDocument.findMany.mockResolvedValue([
      {
        driverId: 'driver_2',
        expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      },
      {
        driverId: 'driver_1',
        expiresAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      },
    ]);

    const result = await service.getLicenceExpiryReport('tenant_1');

    expect(result).toHaveLength(2);
    const [first, second] = result;
    expect(result[0]).toEqual(
      expect.objectContaining({
        driverId: 'driver_2',
        fullName: 'Kwame Boateng',
        fleetId: 'fleet_2',
      }),
    );
    expect(first).toBeDefined();
    expect(second).toBeDefined();
    expect(first?.daysUntilExpiry).toBeLessThanOrEqual(second?.daysUntilExpiry as number);
  });

  it('builds overview metrics for wallet, remittance, and driver activity', async () => {
    driversService.list.mockResolvedValue({
      data: [
        {
          id: 'driver_1',
          status: 'active',
          identityStatus: 'verified',
          activationReadiness: 'ready',
        },
        {
          id: 'driver_2',
          status: 'active',
          identityStatus: 'review_needed',
          activationReadiness: 'partially_ready',
        },
        {
          id: 'driver_3',
          status: 'inactive',
          identityStatus: 'unverified',
          activationReadiness: 'not_ready',
        },
      ],
      total: 3,
      page: 1,
      limit: 200,
    });
    prisma.operationalWallet.findMany.mockResolvedValue([{ id: 'wallet_1', currency: 'NGN' }]);
    prisma.operationalWalletEntry.findMany.mockResolvedValue([
      {
        walletId: 'wallet_1',
        type: 'credit',
        amountMinorUnits: 300000,
        currency: 'NGN',
        createdAt: new Date('2026-03-20T10:00:00.000Z'),
      },
      {
        walletId: 'wallet_1',
        type: 'debit',
        amountMinorUnits: 50000,
        currency: 'NGN',
        createdAt: new Date('2026-03-21T10:00:00.000Z'),
      },
    ]);
    prisma.remittance.findMany.mockResolvedValue([
      {
        amountMinorUnits: 100000,
        createdAt: new Date(),
      },
    ]);
    prisma.fleet.findMany.mockResolvedValue([]);
    prisma.vehicleMaintenanceEvent.findMany.mockResolvedValue([]);
    prisma.vehicleIncident.findMany.mockResolvedValue([]);
    prisma.vehicleMaintenanceSchedule.findMany.mockResolvedValue([]);
    prisma.user.findMany.mockResolvedValue([]);
    prisma.assignment.findMany.mockResolvedValue([]);
    prisma.vehicle.findMany.mockResolvedValue([]);
    prisma.driver.groupBy.mockResolvedValue([
      { status: 'active', _count: { _all: 4 } },
      { status: 'inactive', _count: { _all: 2 } },
      { status: 'suspended', _count: { _all: 1 } },
    ]);

    const result = await service.getOverview('tenant_1');

    expect(result.wallet).toEqual({
      currency: 'NGN',
      totalBalanceMinorUnits: 250000,
      totalInflowMinorUnits: 300000,
      totalOutflowMinorUnits: 50000,
    });
    expect(result.dailyRemittanceTrend).toHaveLength(7);
    expect(result.weeklyRemittanceTrend).toHaveLength(6);
    expect(result.driverActivity).toEqual({
      active: 4,
      inactive: 3,
      activeVerified: 1,
      activeUnverified: 1,
      onboardingPool: 2,
    });
  });
});
