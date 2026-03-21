import { BadRequestException, NotFoundException } from '@nestjs/common';
import { AssignmentsService } from './assignments.service';

describe('AssignmentsService', () => {
  const prisma = {
    assignment: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    driver: {
      findUnique: jest.fn(),
    },
    vehicle: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const driversService = {
    hasApprovedLicence: jest.fn(),
  };

  let service: AssignmentsService;

  beforeEach(() => {
    jest.clearAllMocks();
    driversService.hasApprovedLicence.mockResolvedValue(true);
    service = new AssignmentsService(prisma as never, driversService as never);
  });

  it('creates an assignment in assigned status and reserves the vehicle', async () => {
    prisma.driver.findUnique.mockResolvedValue({
      id: 'driver_1',
      tenantId: 'tenant_1',
      fleetId: 'fleet_1',
      operatingUnitId: 'ou_1',
      businessEntityId: 'be_1',
      status: 'active',
    });
    prisma.vehicle.findUnique.mockResolvedValue({
      id: 'vehicle_1',
      tenantId: 'tenant_1',
      fleetId: 'fleet_1',
      status: 'available',
    });
    prisma.assignment.findFirst.mockResolvedValue(null);
    prisma.assignment.create.mockReturnValue({ op: 'create-assignment' });
    prisma.vehicle.update.mockReturnValue({ op: 'reserve-vehicle' });
    prisma.$transaction.mockResolvedValue([
      {
        id: 'assignment_1',
        tenantId: 'tenant_1',
        driverId: 'driver_1',
        vehicleId: 'vehicle_1',
        fleetId: 'fleet_1',
        operatingUnitId: 'ou_1',
        businessEntityId: 'be_1',
        status: 'assigned',
      },
    ]);

    const result = await service.create('tenant_1', {
      driverId: 'driver_1',
      vehicleId: 'vehicle_1',
      notes: 'Morning dispatch',
    });

    expect(prisma.assignment.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        status: 'assigned',
        driverId: 'driver_1',
        vehicleId: 'vehicle_1',
      }),
    });
    expect(prisma.vehicle.update).toHaveBeenCalledWith({
      where: { id: 'vehicle_1' },
      data: { status: 'assigned' },
    });
    expect(result.status).toBe('assigned');
  });

  it('blocks create when the driver has no approved licence on file', async () => {
    prisma.driver.findUnique.mockResolvedValue({
      id: 'driver_1',
      tenantId: 'tenant_1',
      fleetId: 'fleet_1',
      operatingUnitId: 'ou_1',
      businessEntityId: 'be_1',
      status: 'active',
    });
    prisma.vehicle.findUnique.mockResolvedValue({
      id: 'vehicle_1',
      tenantId: 'tenant_1',
      fleetId: 'fleet_1',
      status: 'available',
    });
    driversService.hasApprovedLicence.mockResolvedValue(false);

    await expect(
      service.create('tenant_1', {
        driverId: 'driver_1',
        vehicleId: 'vehicle_1',
      }),
    ).rejects.toThrow(
      'This driver cannot be assigned yet because no approved driver licence is on file.',
    );
  });

  it('starts an assigned assignment and moves it to active', async () => {
    prisma.assignment.findUnique.mockResolvedValue({
      id: 'assignment_1',
      tenantId: 'tenant_1',
      driverId: 'driver_1',
      vehicleId: 'vehicle_1',
      fleetId: 'fleet_1',
      status: 'assigned',
      notes: null,
    });
    prisma.driver.findUnique.mockResolvedValue({
      id: 'driver_1',
      tenantId: 'tenant_1',
      fleetId: 'fleet_1',
      operatingUnitId: 'ou_1',
      businessEntityId: 'be_1',
      status: 'active',
    });
    prisma.vehicle.findUnique.mockResolvedValue({
      id: 'vehicle_1',
      tenantId: 'tenant_1',
      fleetId: 'fleet_1',
      status: 'assigned',
    });
    prisma.assignment.findFirst.mockResolvedValue(null);
    prisma.assignment.update.mockReturnValue({ op: 'activate-assignment' });
    prisma.$transaction.mockResolvedValue([
      {
        id: 'assignment_1',
        tenantId: 'tenant_1',
        driverId: 'driver_1',
        vehicleId: 'vehicle_1',
        fleetId: 'fleet_1',
        status: 'active',
      },
    ]);

    const result = await service.start('tenant_1', 'assignment_1');

    expect(prisma.assignment.update).toHaveBeenCalledWith({
      where: { id: 'assignment_1' },
      data: expect.objectContaining({ status: 'active' }),
    });
    expect(result.status).toBe('active');
  });

  it('rejects completion unless the assignment is active', async () => {
    prisma.assignment.findUnique.mockResolvedValue({
      id: 'assignment_1',
      tenantId: 'tenant_1',
      driverId: 'driver_1',
      vehicleId: 'vehicle_1',
      fleetId: 'fleet_1',
      status: 'assigned',
    });

    await expect(service.end('tenant_1', 'assignment_1', 'completed')).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('rejects create when the driver is not active', async () => {
    prisma.driver.findUnique.mockResolvedValue({
      id: 'driver_1',
      tenantId: 'tenant_1',
      fleetId: 'fleet_1',
      status: 'inactive',
    });
    prisma.vehicle.findUnique.mockResolvedValue({
      id: 'vehicle_1',
      tenantId: 'tenant_1',
      fleetId: 'fleet_1',
      status: 'available',
    });

    await expect(
      service.create('tenant_1', {
        driverId: 'driver_1',
        vehicleId: 'vehicle_1',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects create when the driver does not exist', async () => {
    prisma.driver.findUnique.mockResolvedValue(null);
    prisma.vehicle.findUnique.mockResolvedValue({
      id: 'vehicle_1',
      tenantId: 'tenant_1',
      fleetId: 'fleet_1',
      status: 'available',
    });

    await expect(
      service.create('tenant_1', {
        driverId: 'driver_1',
        vehicleId: 'vehicle_1',
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('rejects create when selected fleet does not match driver and vehicle fleet', async () => {
    prisma.driver.findUnique.mockResolvedValue({
      id: 'driver_1',
      tenantId: 'tenant_1',
      fleetId: 'fleet_1',
      operatingUnitId: 'ou_1',
      businessEntityId: 'be_1',
      status: 'active',
    });
    prisma.vehicle.findUnique.mockResolvedValue({
      id: 'vehicle_1',
      tenantId: 'tenant_1',
      fleetId: 'fleet_1',
      status: 'available',
    });

    await expect(
      service.create('tenant_1', {
        fleetId: 'fleet_2',
        driverId: 'driver_1',
        vehicleId: 'vehicle_1',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
