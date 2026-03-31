import { TenantRole } from '@mobility-os/authz-model';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { RemittanceService } from './remittance.service';

describe('RemittanceService', () => {
  const prisma = {
    $transaction: jest.fn(),
    remittance: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    tenant: {
      findUnique: jest.fn(),
    },
    assignment: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    vehicle: {
      findUnique: jest.fn(),
    },
  };
  const operationalWalletsService = {
    addEntryInTransaction: jest.fn(),
  };
  const policyService = {
    evaluateDriverPolicies: jest.fn(),
  };
  const recordsService = {
    issueRemittanceReceipt: jest.fn(),
    createDispute: jest.fn(),
  };
  const notificationsService = {
    notifyRemittanceRecorded: jest.fn(),
  };
  const auditService = {
    recordTenantAction: jest.fn(),
  };

  let service: RemittanceService;

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.$transaction.mockImplementation(async (callback: (tx: typeof prisma) => unknown) =>
      callback(prisma as never),
    );
    prisma.remittance.findFirst.mockResolvedValue(null);
    prisma.remittance.findMany.mockResolvedValue([]);
    prisma.assignment.findMany.mockResolvedValue([]);
    prisma.vehicle.findUnique.mockResolvedValue({
      id: 'vehicle_1',
      plate: 'ABC-123',
      tenantVehicleCode: 'VH-001',
      systemVehicleCode: 'SYS-001',
      make: 'Toyota',
      model: 'Corolla',
    });
    policyService.evaluateDriverPolicies.mockResolvedValue([]);
    notificationsService.notifyRemittanceRecorded.mockResolvedValue({
      delivered: 1,
      directEmailSent: false,
    });
    service = new RemittanceService(
      prisma as never,
      operationalWalletsService as never,
      policyService as never,
      recordsService as never,
      notificationsService as never,
      auditService as never,
    );
  });

  it('records remittance only against active assignments', async () => {
    prisma.tenant.findUnique.mockResolvedValue({
      id: 'tenant_1',
      country: 'NG',
    });
    prisma.assignment.findUnique.mockResolvedValue({
      id: 'assignment_1',
      tenantId: 'tenant_1',
      status: 'active',
      driverConfirmedAt: new Date('2026-03-20T07:00:00.000Z'),
      driverId: 'driver_1',
      vehicleId: 'vehicle_1',
      fleetId: 'fleet_1',
      operatingUnitId: 'ou_1',
      businessEntityId: 'be_1',
    });
    prisma.remittance.create.mockResolvedValue({
      id: 'rem_1',
      tenantId: 'tenant_1',
      assignmentId: 'assignment_1',
      status: 'pending',
    });

    const result = await service.record('tenant_1', {
      assignmentId: 'assignment_1',
      amountMinorUnits: 150000,
      currency: 'NGN',
      dueDate: '2026-03-20',
      notes: 'EOD',
    });

    expect(prisma.remittance.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        assignmentId: 'assignment_1',
        status: 'pending',
      }),
    });
    expect(auditService.recordTenantAction).toHaveBeenCalledWith(
      expect.objectContaining({
        entityType: 'remittance',
        action: 'remittance.recorded',
        metadata: expect.objectContaining({
          assignmentId: 'assignment_1',
          driverId: 'driver_1',
          vehicleId: 'vehicle_1',
        }),
      }),
    );
    expect(result.status).toBe('pending');
  });

  it('rejects remittance recording for non-active assignments', async () => {
    prisma.tenant.findUnique.mockResolvedValue({
      id: 'tenant_1',
      country: 'NG',
    });
    prisma.assignment.findUnique.mockResolvedValue({
      id: 'assignment_1',
      tenantId: 'tenant_1',
      status: 'assigned',
      driverConfirmedAt: null,
      driverId: 'driver_1',
      vehicleId: 'vehicle_1',
      fleetId: 'fleet_1',
      operatingUnitId: 'ou_1',
      businessEntityId: 'be_1',
    });

    await expect(
      service.record('tenant_1', {
        assignmentId: 'assignment_1',
        amountMinorUnits: 150000,
        currency: 'NGN',
        dueDate: '2026-03-20',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('only confirms pending remittance', async () => {
    prisma.remittance.findUnique.mockResolvedValue({
      id: 'rem_1',
      tenantId: 'tenant_1',
      assignmentId: 'assignment_1',
      businessEntityId: 'be_1',
      amountMinorUnits: 150000,
      currency: 'NGN',
      status: 'pending',
    });
    prisma.tenant.findUnique.mockResolvedValue({
      id: 'tenant_1',
      country: 'NG',
    });
    prisma.remittance.update.mockResolvedValue({
      id: 'rem_1',
      tenantId: 'tenant_1',
      assignmentId: 'assignment_1',
      businessEntityId: 'be_1',
      amountMinorUnits: 150000,
      currency: 'NGN',
      status: 'completed',
      paidDate: '2026-03-21',
    });
    operationalWalletsService.addEntryInTransaction.mockResolvedValue({
      id: 'wallet_entry_1',
      walletId: 'wallet_1',
      type: 'credit',
      amountMinorUnits: 150000,
      currency: 'NGN',
      referenceId: 'rem_1',
      referenceType: 'remittance',
      description: 'Remittance completed for assignment assignment_1',
      createdAt: new Date('2026-03-21T00:00:00.000Z'),
    });

    const result = await service.confirm('tenant_1', 'rem_1', '2026-03-21');

    expect(prisma.$transaction).toHaveBeenCalled();
    expect(prisma.remittance.update).toHaveBeenCalledWith({
      where: { id: 'rem_1' },
      data: { status: 'completed', paidDate: '2026-03-21' },
    });
    expect(operationalWalletsService.addEntryInTransaction).toHaveBeenCalledWith(
      prisma,
      'tenant_1',
      'be_1',
      {
        type: 'credit',
        amountMinorUnits: 150000,
        currency: 'NGN',
        referenceId: 'rem_1',
        referenceType: 'remittance',
        description: 'Remittance completed for assignment assignment_1',
      },
    );
    expect(recordsService.issueRemittanceReceipt).toHaveBeenCalledWith('tenant_1', 'rem_1');
    expect(result.status).toBe('completed');
    expect(result.walletEntry?.id).toBe('wallet_entry_1');
  });

  it('marks an underpaid remittance as partially settled and preserves the outstanding balance', async () => {
    prisma.remittance.findUnique.mockResolvedValue({
      id: 'rem_1',
      tenantId: 'tenant_1',
      assignmentId: 'assignment_1',
      businessEntityId: 'be_1',
      driverId: 'driver_1',
      amountMinorUnits: 400000,
      currency: 'NGN',
      dueDate: '2026-03-21',
      status: 'pending',
    });
    prisma.tenant.findUnique.mockResolvedValue({
      id: 'tenant_1',
      country: 'NG',
    });
    prisma.assignment.findMany.mockResolvedValue([
      {
        id: 'assignment_1',
        status: 'active',
        contractSnapshot: {
          contractType: 'regular_hire',
          currency: 'NGN',
          regularHire: {
            expectedPerPeriodAmountMinorUnits: 500000,
          },
        },
        remittanceModel: 'fixed',
        remittanceFrequency: 'daily',
        remittanceAmountMinorUnits: 500000,
        remittanceCurrency: 'NGN',
        remittanceStartDate: '2026-03-20',
        remittanceCollectionDay: null,
      },
    ]);
    prisma.remittance.findMany.mockResolvedValue([
      {
        assignmentId: 'assignment_1',
        dueDate: '2026-03-21',
        amountMinorUnits: 400000,
        status: 'pending',
      },
    ]);
    prisma.remittance.update.mockResolvedValue({
      id: 'rem_1',
      tenantId: 'tenant_1',
      assignmentId: 'assignment_1',
      businessEntityId: 'be_1',
      amountMinorUnits: 400000,
      currency: 'NGN',
      status: 'partially_settled',
      paidDate: '2026-03-21',
    });
    operationalWalletsService.addEntryInTransaction.mockResolvedValue({
      id: 'wallet_entry_1',
      walletId: 'wallet_1',
      type: 'credit',
      amountMinorUnits: 400000,
      currency: 'NGN',
      referenceId: 'rem_1',
      referenceType: 'remittance',
      description: 'Remittance partially settled for assignment assignment_1',
      createdAt: new Date('2026-03-21T00:00:00.000Z'),
    });

    const result = await service.confirm('tenant_1', 'rem_1', '2026-03-21');

    expect(prisma.remittance.update).toHaveBeenCalledWith({
      where: { id: 'rem_1' },
      data: { status: 'partially_settled', paidDate: '2026-03-21' },
    });
    expect(result.status).toBe('partially_settled');
  });

  it('rejects confirm from non-pending status', async () => {
    prisma.remittance.findUnique.mockResolvedValue({
      id: 'rem_1',
      tenantId: 'tenant_1',
      status: 'completed',
    });

    await expect(service.confirm('tenant_1', 'rem_1', '2026-03-21')).rejects.toBeInstanceOf(
      ConflictException,
    );
  });

  it('requires notes to dispute or waive remittance', async () => {
    prisma.remittance.findUnique.mockResolvedValue({
      id: 'rem_1',
      tenantId: 'tenant_1',
      status: 'pending',
    });

    await expect(service.dispute('tenant_1', 'rem_1', '   ')).rejects.toBeInstanceOf(
      BadRequestException,
    );
    await expect(
      service.waive('tenant_1', 'rem_1', '', TenantRole.TenantOwner),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('requires the tenant owner role to waive remittance', async () => {
    await expect(
      service.waive(
        'tenant_1',
        'rem_1',
        'Approved write-off after reconciliation',
        TenantRole.FleetManager,
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('fails when assignment does not exist for remittance recording', async () => {
    prisma.tenant.findUnique.mockResolvedValue({
      id: 'tenant_1',
      country: 'NG',
    });
    prisma.assignment.findUnique.mockResolvedValue(null);

    await expect(
      service.record('tenant_1', {
        assignmentId: 'assignment_1',
        amountMinorUnits: 150000,
        currency: 'NGN',
        dueDate: '2026-03-20',
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('rejects remittance recording when selected fleet does not match assignment fleet', async () => {
    prisma.tenant.findUnique.mockResolvedValue({
      id: 'tenant_1',
      country: 'NG',
    });
    prisma.assignment.findUnique.mockResolvedValue({
      id: 'assignment_1',
      tenantId: 'tenant_1',
      status: 'active',
      driverConfirmedAt: new Date('2026-03-20T07:00:00.000Z'),
      driverId: 'driver_1',
      vehicleId: 'vehicle_1',
      fleetId: 'fleet_1',
      operatingUnitId: 'ou_1',
      businessEntityId: 'be_1',
    });

    await expect(
      service.record('tenant_1', {
        fleetId: 'fleet_2',
        assignmentId: 'assignment_1',
        amountMinorUnits: 150000,
        currency: 'NGN',
        dueDate: '2026-03-20',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
