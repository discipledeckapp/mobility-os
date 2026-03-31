import { VehiclesService } from './vehicles.service';

describe('VehiclesService', () => {
  const prisma = {
    fleet: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    vehicle: {
      create: jest.fn(),
      count: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    vehicleValuation: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    vehicleMaintenanceSchedule: {
      findMany: jest.fn(),
    },
    assignment: {
      findMany: jest.fn(),
    },
    vehicleInspection: {
      findMany: jest.fn(),
    },
    vehicleMaintenanceEvent: {
      findMany: jest.fn(),
    },
    vehicleIncident: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    vinDecodeRecord: {
      findFirst: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const subscriptionEntitlementsService = {
    enforceVehicleCapacity: jest.fn(),
    getCapInfo: jest.fn(),
  };

  const meteringClient = {
    fireEvent: jest.fn(),
  };
  const auditService = {
    recordTenantAction: jest.fn(),
  };

  let service: VehiclesService;

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.fleet.findMany.mockResolvedValue([
      {
        id: 'fleet_1',
        name: 'Lagos Core Fleet',
      },
    ]);
    service = new VehiclesService(
      prisma as never,
      subscriptionEntitlementsService as never,
      meteringClient as never,
      auditService as never,
    );
  });

  it('imports vehicles from the published template column shape', async () => {
    const createSpy = jest.spyOn(service, 'create').mockResolvedValue({
      id: 'vehicle_1',
      tenantId: 'tenant_1',
      fleetId: 'fleet_1',
      businessEntityId: 'be_1',
      operatingUnitId: 'ou_1',
      vehicleType: 'motorcycle',
      make: 'Honda',
      model: 'CB150R',
      trim: null,
      year: 2024,
      plate: 'LAG123XY',
      color: 'Red',
      vin: '1HGCM82633A004352',
      status: 'active',
      tenantVehicleCode: 'AJAH-0001',
      systemVehicleCode: 'VH-0001',
      createdAt: new Date(),
      updatedAt: new Date(),
    } as never);

    const result = await service.importVehiclesFromCsv(
      'tenant_1',
      [
        'fleetName,tenantVehicleCode,vehicleType,make,model,trim,year,plate,color,vin,odometerKm,acquisitionCostMinorUnits,acquisitionDate,currentEstimatedValueMinorUnits,valuationSource',
        'Lagos Core Fleet,AJAH-0001,motorcycle,Honda,CB150R,,2024,LAG123XY,Red,1HGCM82633A004352,1250,245000000,2025-01-12,220000000,operator-estimate',
      ].join('\n'),
    );

    expect(result.createdCount).toBe(1);
    expect(result.failedCount).toBe(0);
    expect(createSpy).toHaveBeenCalledWith(
      'tenant_1',
      expect.objectContaining({
        fleetId: 'fleet_1',
        tenantVehicleCode: 'AJAH-0001',
        vehicleType: 'motorcycle',
        make: 'Honda',
        model: 'CB150R',
        year: 2024,
        plate: 'LAG123XY',
        color: 'Red',
        vin: '1HGCM82633A004352',
        odometerKm: 1250,
        acquisitionCostMinorUnits: 245000000,
        acquisitionDate: '2025-01-12',
        currentEstimatedValueMinorUnits: 220000000,
        valuationSource: 'operator-estimate',
      }),
    );
  });

  it('records an audit entry when a driver reports a vehicle incident', async () => {
    prisma.vehicle.findUnique.mockResolvedValue({
      id: 'vehicle_1',
      tenantId: 'tenant_1',
    });
    prisma.vehicleIncident.create.mockResolvedValue({
      id: 'incident_1',
      tenantId: 'tenant_1',
      vehicleId: 'vehicle_1',
      driverId: 'driver_1',
      category: 'damage',
      severity: 'high',
      title: 'Front bumper damage',
      status: 'open',
      occurredAt: new Date('2026-03-30T10:00:00.000Z'),
      createdAt: new Date('2026-03-30T10:10:00.000Z'),
    });

    await service.createIncident('tenant_1', 'vehicle_1', 'user_1', {
      driverId: 'driver_1',
      occurredAt: '2026-03-30T10:00:00.000Z',
      category: 'damage',
      severity: 'high',
      title: 'Front bumper damage',
    });

    expect(auditService.recordTenantAction).toHaveBeenCalledWith(
      expect.objectContaining({
        actorId: 'user_1',
        entityType: 'vehicle_incident',
        action: 'vehicle.incident_reported',
        metadata: expect.objectContaining({
          vehicleId: 'vehicle_1',
          driverId: 'driver_1',
          title: 'Front bumper damage',
        }),
      }),
    );
  });
});
