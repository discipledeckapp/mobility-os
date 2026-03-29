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
    remittance: {
      findMany: jest.fn(),
      updateMany: jest.fn(),
    },
    tenant: {
      findUnique: jest.fn(),
    },
    fleet: {
      findUnique: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const driversService = {
    findOne: jest.fn(),
  };

  const vehicleRiskService = {
    getVehicleRisk: jest.fn(),
  };
  const policyService = {
    assertAssignmentEligible: jest.fn(),
  };
  const auditService = {
    recordTenantAction: jest.fn(),
  };
  const notificationsService = {
    notifyAssignmentIssued: jest.fn(),
    notifyAssignmentAccepted: jest.fn(),
    notifyAssignmentEnded: jest.fn(),
  };

  let service: AssignmentsService;

  beforeEach(() => {
    jest.resetAllMocks();
    driversService.findOne.mockResolvedValue({
      id: 'driver_1',
      tenantId: 'tenant_1',
      fleetId: 'fleet_1',
      operatingUnitId: 'ou_1',
      businessEntityId: 'be_1',
      assignmentReadiness: 'ready',
      assignmentReadinessReasons: [],
    });
    vehicleRiskService.getVehicleRisk.mockResolvedValue({
      vehicleId: 'vehicle_1',
      score: 100,
      riskLevel: 'GREEN',
      reasons: [],
      isAssignmentLocked: false,
      evaluatedAt: new Date(),
    });
    prisma.tenant.findUnique.mockResolvedValue({ country: 'NG' });
    prisma.fleet.findUnique.mockResolvedValue({
      id: 'fleet_1',
      tenantId: 'tenant_1',
      operatingUnit: { id: 'ou_1', businessEntityId: 'be_1' },
    });
    prisma.remittance.findMany.mockResolvedValue([]);
    prisma.remittance.updateMany.mockResolvedValue({ count: 0 });
    service = new AssignmentsService(
      prisma as never,
      driversService as never,
      vehicleRiskService as never,
      policyService as never,
      auditService as never,
      notificationsService as never,
    );
  });

  it('creates an assignment in pending confirmation status and reserves the vehicle', async () => {
    prisma.vehicle.findUnique.mockResolvedValue({
      id: 'vehicle_1',
      tenantId: 'tenant_1',
      fleetId: 'fleet_1',
      operatingUnitId: 'ou_1',
      businessEntityId: 'be_1',
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
        status: 'pending_driver_confirmation',
      },
    ]);

    const result = await service.create('tenant_1', {
      driverId: 'driver_1',
      vehicleId: 'vehicle_1',
      notes: 'Morning dispatch',
      remittanceAmountMinorUnits: 250000,
    });

    expect(prisma.assignment.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        status: 'pending_driver_confirmation',
        driverId: 'driver_1',
        vehicleId: 'vehicle_1',
      }),
    });
    expect(prisma.vehicle.update).toHaveBeenCalledWith({
      where: { id: 'vehicle_1' },
      data: { status: 'assigned' },
    });
    expect(notificationsService.notifyAssignmentIssued).toHaveBeenCalledWith({
      tenantId: 'tenant_1',
      assignmentId: 'assignment_1',
      driverId: 'driver_1',
      fleetId: 'fleet_1',
      vehicleId: 'vehicle_1',
      vehicleLabel: 'vehicle_1',
      requiresAcceptance: true,
    });
    expect(result.status).toBe('pending_driver_confirmation');
  });

  it('blocks create when the driver is not assignment-ready', async () => {
    driversService.findOne.mockResolvedValue({
      id: 'driver_1',
      tenantId: 'tenant_1',
      fleetId: 'fleet_1',
      operatingUnitId: 'ou_1',
      businessEntityId: 'be_1',
      assignmentReadiness: 'not_ready',
      assignmentReadinessReasons: ['An approved driver licence is required.'],
    });
    prisma.vehicle.findUnique.mockResolvedValue({
      id: 'vehicle_1',
      tenantId: 'tenant_1',
      fleetId: 'fleet_1',
      operatingUnitId: 'ou_1',
      businessEntityId: 'be_1',
      status: 'available',
    });

    await expect(
      service.create('tenant_1', {
        driverId: 'driver_1',
        vehicleId: 'vehicle_1',
        remittanceAmountMinorUnits: 250000,
      }),
    ).rejects.toThrow('An approved driver licence is required.');
  });

  it('starts a confirmed assignment and moves it to active', async () => {
    prisma.assignment.findUnique.mockResolvedValue({
      id: 'assignment_1',
      tenantId: 'tenant_1',
      driverId: 'driver_1',
      vehicleId: 'vehicle_1',
      fleetId: 'fleet_1',
      status: 'pending_driver_confirmation',
      contractStatus: 'accepted',
      driverConfirmedAt: new Date('2026-03-27T09:00:00.000Z'),
      notes: null,
    });
    prisma.vehicle.findUnique.mockResolvedValue({
      id: 'vehicle_1',
      tenantId: 'tenant_1',
      fleetId: 'fleet_1',
      operatingUnitId: 'ou_1',
      businessEntityId: 'be_1',
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

  it('notifies operators when a driver accepts an assignment', async () => {
    prisma.assignment.findUnique.mockResolvedValue({
      id: 'assignment_1',
      tenantId: 'tenant_1',
      driverId: 'driver_1',
      vehicleId: 'vehicle_1',
      fleetId: 'fleet_1',
      status: 'pending_driver_confirmation',
      contractStatus: 'pending_acceptance',
      contractVersion: '2026-03',
      contractSnapshot: null,
    });
    prisma.vehicle.findUnique.mockResolvedValue({
      id: 'vehicle_1',
      make: 'Toyota',
      model: 'Corolla',
      plate: 'LAG-123AA',
      tenantVehicleCode: null,
      systemVehicleCode: null,
    });
    prisma.assignment.update.mockResolvedValue({
      id: 'assignment_1',
      tenantId: 'tenant_1',
      driverId: 'driver_1',
      vehicleId: 'vehicle_1',
      fleetId: 'fleet_1',
      operatingUnitId: 'ou_1',
      businessEntityId: 'be_1',
      status: 'active',
      contractStatus: 'accepted',
      driverConfirmationMethod: 'app',
    });

    await service.acceptDriverTerms('tenant_1', 'assignment_1', {
      acceptedFrom: 'driver_mobile',
      confirmationMethod: 'app',
    });

    expect(notificationsService.notifyAssignmentAccepted).toHaveBeenCalledWith({
      tenantId: 'tenant_1',
      assignmentId: 'assignment_1',
      driverId: 'driver_1',
      fleetId: 'fleet_1',
      vehicleId: 'vehicle_1',
      vehicleLabel: 'LAG-123AA',
    });
  });

  it('rejects completion unless the assignment is active', async () => {
    prisma.assignment.findUnique.mockResolvedValue({
      id: 'assignment_1',
      tenantId: 'tenant_1',
      driverId: 'driver_1',
      vehicleId: 'vehicle_1',
      fleetId: 'fleet_1',
      status: 'pending_driver_confirmation',
    });

    await expect(service.end('tenant_1', 'assignment_1', 'ended')).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('rejects create when the driver is not assignment-ready', async () => {
    driversService.findOne.mockResolvedValue({
      id: 'driver_1',
      tenantId: 'tenant_1',
      fleetId: 'fleet_1',
      operatingUnitId: 'ou_1',
      businessEntityId: 'be_1',
      assignmentReadiness: 'not_ready',
      assignmentReadinessReasons: ['Driver status must be active before assignment can start.'],
    });
    prisma.vehicle.findUnique.mockResolvedValue({
      id: 'vehicle_1',
      tenantId: 'tenant_1',
      fleetId: 'fleet_1',
      operatingUnitId: 'ou_1',
      businessEntityId: 'be_1',
      status: 'available',
    });

    await expect(
      service.create('tenant_1', {
        driverId: 'driver_1',
        vehicleId: 'vehicle_1',
        remittanceAmountMinorUnits: 250000,
      }),
    ).rejects.toThrow('Driver status must be active before assignment can start.');
  });

  it('rejects create when the driver does not exist', async () => {
    driversService.findOne.mockRejectedValue(new NotFoundException("Driver 'driver_1' not found"));
    prisma.vehicle.findUnique.mockResolvedValue({
      id: 'vehicle_1',
      tenantId: 'tenant_1',
      fleetId: 'fleet_1',
      operatingUnitId: 'ou_1',
      businessEntityId: 'be_1',
      status: 'available',
    });

    await expect(
      service.create('tenant_1', {
        driverId: 'driver_1',
        vehicleId: 'vehicle_1',
        remittanceAmountMinorUnits: 250000,
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('rejects create when selected fleet does not match driver and vehicle fleet', async () => {
    prisma.vehicle.findUnique.mockResolvedValue({
      id: 'vehicle_1',
      tenantId: 'tenant_1',
      fleetId: 'fleet_1',
      operatingUnitId: 'ou_1',
      businessEntityId: 'be_1',
      status: 'available',
    });

    await expect(
      service.create('tenant_1', {
        fleetId: 'fleet_2',
        driverId: 'driver_1',
        vehicleId: 'vehicle_1',
        remittanceAmountMinorUnits: 250000,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects create when driver and vehicle tenant hierarchy do not match', async () => {
    driversService.findOne.mockResolvedValueOnce({
      id: 'driver_1',
      tenantId: 'tenant_1',
      fleetId: 'fleet_1',
      operatingUnitId: 'ou_stale',
      businessEntityId: 'be_stale',
      assignmentReadiness: 'ready',
      assignmentReadinessReasons: [],
    });
    prisma.vehicle.findUnique.mockResolvedValue({
      id: 'vehicle_1',
      tenantId: 'tenant_1',
      fleetId: 'fleet_1',
      operatingUnitId: 'ou_1',
      businessEntityId: 'be_1',
      status: 'available',
    });

    await expect(
      service.create('tenant_1', {
        driverId: 'driver_1',
        vehicleId: 'vehicle_1',
        remittanceAmountMinorUnits: 250000,
      }),
    ).rejects.toThrow(
      'Driver and vehicle must belong to the same tenant hierarchy before assignment can be created.',
    );
  });
});
