import { OperatingUnitsService } from './operating-units.service';

describe('OperatingUnitsService', () => {
  const prisma = {
    operatingUnit: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    businessEntity: {
      findUnique: jest.fn(),
    },
    fleet: {
      findMany: jest.fn(),
    },
    driver: {
      findMany: jest.fn(),
      updateMany: jest.fn(),
    },
    vehicle: {
      updateMany: jest.fn(),
    },
    user: {
      updateMany: jest.fn(),
    },
    assignment: {
      findMany: jest.fn(),
      updateMany: jest.fn(),
    },
    remittance: {
      updateMany: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  let service: OperatingUnitsService;

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.$transaction.mockImplementation(async (callback: (tx: typeof prisma) => unknown) =>
      callback(prisma),
    );
    service = new OperatingUnitsService(prisma as never);
  });

  it('cascades hierarchy fields when an operating unit moves business entities', async () => {
    prisma.operatingUnit.findUnique.mockResolvedValueOnce({
      id: 'ou_1',
      tenantId: 'tenant_1',
      businessEntityId: 'be_old',
      status: 'active',
    });
    prisma.businessEntity.findUnique.mockResolvedValue({
      id: 'be_new',
      tenantId: 'tenant_1',
    });
    prisma.operatingUnit.update.mockResolvedValue({
      id: 'ou_1',
      tenantId: 'tenant_1',
      businessEntityId: 'be_new',
      status: 'active',
    });
    prisma.fleet.findMany.mockResolvedValue([{ id: 'fleet_1' }]);
    prisma.driver.findMany.mockResolvedValue([{ id: 'driver_1' }]);
    prisma.assignment.findMany.mockResolvedValue([{ id: 'assignment_1' }]);

    await service.update('tenant_1', 'ou_1', { businessEntityId: 'be_new' });

    expect(prisma.driver.updateMany).toHaveBeenCalledWith({
      where: { fleetId: { in: ['fleet_1'] } },
      data: { operatingUnitId: 'ou_1', businessEntityId: 'be_new' },
    });
    expect(prisma.vehicle.updateMany).toHaveBeenCalledWith({
      where: { fleetId: { in: ['fleet_1'] } },
      data: { operatingUnitId: 'ou_1', businessEntityId: 'be_new' },
    });
    expect(prisma.user.updateMany).toHaveBeenCalledWith({
      where: { driverId: { in: ['driver_1'] } },
      data: { operatingUnitId: 'ou_1', businessEntityId: 'be_new' },
    });
    expect(prisma.assignment.updateMany).toHaveBeenCalledWith({
      where: {
        fleetId: { in: ['fleet_1'] },
        status: { in: ['created', 'assigned', 'active'] },
      },
      data: { operatingUnitId: 'ou_1', businessEntityId: 'be_new' },
    });
    expect(prisma.remittance.updateMany).toHaveBeenCalledWith({
      where: {
        assignmentId: { in: ['assignment_1'] },
        status: 'pending',
      },
      data: { operatingUnitId: 'ou_1', businessEntityId: 'be_new' },
    });
  });
});
