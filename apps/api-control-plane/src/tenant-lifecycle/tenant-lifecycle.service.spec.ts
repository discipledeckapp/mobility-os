import { BadRequestException, NotFoundException } from '@nestjs/common';
import { TenantLifecycleService } from './tenant-lifecycle.service';

describe('TenantLifecycleService', () => {
  const prisma = {
    cpSubscription: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    cpTenantLifecycleEvent: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  let service: TenantLifecycleService;

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.$transaction.mockImplementation(
      async (callback: (client: typeof prisma) => Promise<unknown>) => callback(prisma),
    );
    service = new TenantLifecycleService(prisma as never);
  });

  it('transitions a tenant to past_due and records an event', async () => {
    prisma.cpSubscription.findUnique.mockResolvedValue({
      id: 'sub_1',
      tenantId: 'tenant_1',
      status: 'active',
    });
    prisma.cpSubscription.update.mockResolvedValue({
      id: 'sub_1',
      tenantId: 'tenant_1',
      status: 'past_due',
    });
    prisma.cpTenantLifecycleEvent.create.mockResolvedValue({
      id: 'tle_1',
    });

    const result = await service.markPaymentFailed({
      tenantId: 'tenant_1',
      invoiceId: 'inv_1',
    });

    expect(result.status).toBe('past_due');
    expect(prisma.cpTenantLifecycleEvent.create).toHaveBeenCalled();
  });

  it('recovers a past_due tenant back to active', async () => {
    prisma.cpSubscription.findUnique
      .mockResolvedValueOnce({
        id: 'sub_1',
        tenantId: 'tenant_1',
        status: 'past_due',
      })
      .mockResolvedValueOnce({
        id: 'sub_1',
        tenantId: 'tenant_1',
        status: 'past_due',
      });
    prisma.cpSubscription.update.mockResolvedValue({
      id: 'sub_1',
      tenantId: 'tenant_1',
      status: 'active',
    });
    prisma.cpTenantLifecycleEvent.create.mockResolvedValue({
      id: 'tle_2',
    });

    const result = await service.markPaymentRecovered({
      tenantId: 'tenant_1',
      invoiceId: 'inv_1',
      provider: 'paystack',
    });

    expect(result.status).toBe('active');
  });

  it('rejects invalid manual transitions', async () => {
    prisma.cpSubscription.findUnique.mockResolvedValue({
      id: 'sub_1',
      tenantId: 'tenant_1',
      status: 'archived',
    });

    await expect(
      service.transitionTenant({
        tenantId: 'tenant_1',
        toStatus: 'active',
        triggeredBy: 'platform_admin',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('fails when no subscription exists for the tenant', async () => {
    prisma.cpSubscription.findUnique.mockResolvedValue(null);

    await expect(service.getCurrentState('missing')).rejects.toBeInstanceOf(NotFoundException);
  });
});
