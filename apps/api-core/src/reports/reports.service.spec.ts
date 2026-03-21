import { ReportsService } from './reports.service';

describe('ReportsService', () => {
  const prisma = {
    vehicle: {
      findMany: jest.fn(),
    },
    assignment: {
      findMany: jest.fn(),
    },
    driverDocument: {
      findMany: jest.fn(),
    },
    driver: {
      findMany: jest.fn(),
    },
  };

  const driversService = {
    list: jest.fn(),
  };

  const vehiclesService = {
    findOneDetailed: jest.fn(),
  };

  let service: ReportsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ReportsService(
      prisma as never,
      driversService as never,
      vehiclesService as never,
    );
  });

  it('builds operational readiness from driver, vehicle, assignment, and licence inputs', async () => {
    driversService.list.mockResolvedValue([
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
    ]);
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

    expect(driversService.list).toHaveBeenCalledWith('tenant_1');
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
});
