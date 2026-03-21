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
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(false);
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
    });

    await expect(guard.canActivate(createExecutionContext('POST'))).resolves.toBe(true);
    expect(prisma.tenant.update).toHaveBeenCalledWith({
      where: { id: 'tenant_1' },
      data: { status: 'active' },
    });
  });

  it('blocks writes for past_due tenants', async () => {
    prisma.tenant.findUnique.mockResolvedValue({
      id: 'tenant_1',
      status: 'past_due',
    });
    controlPlaneLifecycleClient.getTenantLifecycleState.mockRejectedValue(new Error('offline'));

    await expect(guard.canActivate(createExecutionContext('POST'))).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it('allows reads for past_due tenants', async () => {
    prisma.tenant.findUnique.mockResolvedValue({
      id: 'tenant_1',
      status: 'past_due',
    });
    controlPlaneLifecycleClient.getTenantLifecycleState.mockRejectedValue(new Error('offline'));

    await expect(guard.canActivate(createExecutionContext('GET'))).resolves.toBe(true);
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
