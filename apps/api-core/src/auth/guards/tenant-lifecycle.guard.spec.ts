import { ForbiddenException, NotFoundException } from '@nestjs/common';
import type { Reflector } from '@nestjs/core';
import { TenantLifecycleGuard } from './tenant-lifecycle.guard';

describe('TenantLifecycleGuard', () => {
  const prisma = {
    tenant: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };
  const controlPlaneLifecycleClient = {
    getTenantLifecycleState: jest.fn(),
  };
  const reflector = {
    getAllAndOverride: jest.fn(),
  } as unknown as Reflector;

  let guard: TenantLifecycleGuard;

  const createExecutionContext = (method: string, tenantId = 'tenant_1') =>
    ({
      switchToHttp: () => ({
        getRequest: () => ({
          method,
          tenantContext: { tenantId },
        }),
      }),
      getHandler: () => 'handler',
      getClass: () => 'class',
    }) as never;

  beforeEach(() => {
    jest.clearAllMocks();
    guard = new TenantLifecycleGuard(
      prisma as never,
      controlPlaneLifecycleClient as never,
      reflector,
    );
    (reflector.getAllAndOverride as jest.Mock).mockImplementation((key: string) => {
      if (key === 'allowBlockedTenantAccess') {
        return false;
      }
      return undefined;
    });
  });

  it('allows write access for active tenants and syncs local status', async () => {
    prisma.tenant.findUnique.mockResolvedValue({
      id: 'tenant_1',
      status: 'onboarded',
    });
    controlPlaneLifecycleClient.getTenantLifecycleState.mockResolvedValue({
      tenantId: 'tenant_1',
      subscriptionId: 'sub_1',
      status: 'active',
      currentPeriodStart: '2026-03-01T00:00:00.000Z',
      currentPeriodEnd: '2026-04-01T00:00:00.000Z',
      cancelAtPeriodEnd: false,
      enforcement: {
        stage: 'active',
        gracePeriodDays: 5,
        graceEndsAt: null,
        graceDaysRemaining: 0,
        degradedMode: false,
        blockedFeatures: [],
      },
    });

    await expect(guard.canActivate(createExecutionContext('POST'))).resolves.toBe(true);
    expect(prisma.tenant.update).toHaveBeenCalledWith({
      where: { id: 'tenant_1' },
      data: { status: 'active' },
    });
  });

  it('blocks new driver onboarding during grace', async () => {
    prisma.tenant.findUnique.mockResolvedValue({
      id: 'tenant_1',
      status: 'past_due',
    });
    controlPlaneLifecycleClient.getTenantLifecycleState.mockResolvedValue({
      tenantId: 'tenant_1',
      subscriptionId: 'sub_1',
      status: 'past_due',
      currentPeriodStart: '2026-03-01T00:00:00.000Z',
      currentPeriodEnd: '2026-04-01T00:00:00.000Z',
      cancelAtPeriodEnd: false,
      enforcement: {
        stage: 'grace',
        gracePeriodDays: 5,
        graceEndsAt: '2026-04-06T00:00:00.000Z',
        graceDaysRemaining: 3,
        degradedMode: false,
        blockedFeatures: ['driver_onboarding', 'vehicle_onboarding'],
      },
    });
    (reflector.getAllAndOverride as jest.Mock).mockImplementation((key: string) => {
      if (key === 'allowBlockedTenantAccess') return false;
      if (key === 'tenantLifecycleFeature') return 'driver_onboarding';
      return undefined;
    });

    await expect(guard.canActivate(createExecutionContext('POST'))).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it('allows assignment operations in degraded mode', async () => {
    prisma.tenant.findUnique.mockResolvedValue({
      id: 'tenant_1',
      status: 'past_due',
    });
    controlPlaneLifecycleClient.getTenantLifecycleState.mockResolvedValue({
      tenantId: 'tenant_1',
      subscriptionId: 'sub_1',
      status: 'past_due',
      currentPeriodStart: '2026-03-01T00:00:00.000Z',
      currentPeriodEnd: '2026-04-01T00:00:00.000Z',
      cancelAtPeriodEnd: false,
      enforcement: {
        stage: 'expired',
        gracePeriodDays: 5,
        graceEndsAt: '2026-04-06T00:00:00.000Z',
        graceDaysRemaining: 0,
        degradedMode: true,
        blockedFeatures: ['driver_onboarding', 'vehicle_onboarding', 'assignment_creation'],
      },
    });
    (reflector.getAllAndOverride as jest.Mock).mockImplementation((key: string) => {
      if (key === 'allowBlockedTenantAccess') return false;
      return undefined;
    });

    await expect(guard.canActivate(createExecutionContext('POST'))).resolves.toBe(true);
  });

  it('blocks all access for suspended tenants unless bypassed', async () => {
    prisma.tenant.findUnique.mockResolvedValue({
      id: 'tenant_1',
      status: 'suspended',
    });
    controlPlaneLifecycleClient.getTenantLifecycleState.mockRejectedValue(new Error('offline'));

    await expect(guard.canActivate(createExecutionContext('GET'))).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it('allows blocked access when the route explicitly bypasses lifecycle enforcement', async () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(true);
    prisma.tenant.findUnique.mockResolvedValue({
      id: 'tenant_1',
      status: 'suspended',
    });
    controlPlaneLifecycleClient.getTenantLifecycleState.mockRejectedValue(new Error('offline'));

    await expect(guard.canActivate(createExecutionContext('GET'))).resolves.toBe(true);
  });

  it('fails when the tenant record does not exist locally', async () => {
    prisma.tenant.findUnique.mockResolvedValue(null);

    await expect(guard.canActivate(createExecutionContext('GET'))).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
