import { FleetsService } from './fleets.service';

describe('FleetsService', () => {
  const prisma = {
    fleet: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    operatingUnit: {
      findUnique: jest.fn(),
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

  let service: FleetsService;

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.$transaction.mockImplementation(async (callback: (tx: typeof prisma) => unknown) =>
      callback(prisma),
    );
    service = new FleetsService(prisma as never);
  });

  it('cascades hierarchy fields for driver-linked records when a fleet moves operating units', async () => {
    prisma.fleet.findUnique.mockResolvedValueOnce({
      id: 'fleet_1',
      tenantId: 'tenant_1',
      operatingUnitId: 'ou_old',
      status: 'active',
    });
    prisma.operatingUnit.findUnique.mockResolvedValue({
      id: 'ou_new',
      tenantId: 'tenant_1',
      businessEntityId: 'be_new',
    });
    prisma.fleet.update.mockResolvedValue({
      id: 'fleet_1',
      tenantId: 'tenant_1',
      operatingUnitId: 'ou_new',
      status: 'active',
    });
    prisma.driver.findMany.mockResolvedValue([{ id: 'driver_1' }]);
    prisma.assignment.findMany.mockResolvedValue([{ id: 'assignment_1' }]);

    await service.update('tenant_1', 'fleet_1', { operatingUnitId: 'ou_new' });

    expect(prisma.driver.updateMany).toHaveBeenCalledWith({
      where: { fleetId: 'fleet_1' },
      data: { businessEntityId: 'be_new', operatingUnitId: 'ou_new' },
    });
    expect(prisma.vehicle.updateMany).toHaveBeenCalledWith({
      where: { fleetId: 'fleet_1' },
      data: { businessEntityId: 'be_new', operatingUnitId: 'ou_new' },
    });
    expect(prisma.user.updateMany).toHaveBeenCalledWith({
      where: { driverId: { in: ['driver_1'] } },
      data: { businessEntityId: 'be_new', operatingUnitId: 'ou_new' },
    });
    expect(prisma.assignment.updateMany).toHaveBeenCalledWith({
      where: {
        fleetId: 'fleet_1',
        status: { in: ['created', 'assigned', 'active'] },
      },
      data: { businessEntityId: 'be_new', operatingUnitId: 'ou_new' },
    });
    expect(prisma.remittance.updateMany).toHaveBeenCalledWith({
      where: {
        assignmentId: { in: ['assignment_1'] },
        status: 'pending',
      },
      data: { businessEntityId: 'be_new', operatingUnitId: 'ou_new' },
    });
  });
});
