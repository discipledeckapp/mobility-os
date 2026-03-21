import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PlatformWalletsService } from './platform-wallets.service';

describe('PlatformWalletsService', () => {
  const prisma = {
    cpPlatformWallet: {
      upsert: jest.fn(),
      findUnique: jest.fn(),
    },
    cpSubscription: {
      findUnique: jest.fn(),
    },
    cpWalletEntry: {
      findMany: jest.fn(),
      groupBy: jest.fn(),
      create: jest.fn(),
      findFirst: jest.fn(),
    },
  };

  let service: PlatformWalletsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new PlatformWalletsService(prisma as never);
  });

  it('returns a derived platform wallet balance', async () => {
    prisma.cpPlatformWallet.findUnique.mockResolvedValue({
      id: 'wallet_1',
      tenantId: 'tenant_1',
      currency: 'NGN',
    });
    prisma.cpWalletEntry.groupBy.mockResolvedValue([
      { type: 'credit', _sum: { amountMinorUnits: 5000000 } },
      { type: 'debit', _sum: { amountMinorUnits: 15000 } },
    ]);

    await expect(service.getBalance('tenant_1')).resolves.toEqual({
      walletId: 'wallet_1',
      tenantId: 'tenant_1',
      currency: 'NGN',
      balanceMinorUnits: 4985000,
    });
  });

  it('rejects debits when the platform wallet balance is insufficient', async () => {
    prisma.cpPlatformWallet.upsert.mockResolvedValue({
      id: 'wallet_1',
      tenantId: 'tenant_1',
      currency: 'NGN',
    });
    prisma.cpPlatformWallet.findUnique.mockResolvedValue({
      id: 'wallet_1',
      tenantId: 'tenant_1',
      currency: 'NGN',
    });
    prisma.cpWalletEntry.groupBy.mockResolvedValue([
      { type: 'credit', _sum: { amountMinorUnits: 1000 } },
    ]);

    await expect(
      service.createEntry('tenant_1', {
        type: 'debit',
        amountMinorUnits: 15000,
        currency: 'NGN',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('records a verification charge as a debit entry', async () => {
    prisma.cpPlatformWallet.upsert.mockResolvedValue({
      id: 'wallet_1',
      tenantId: 'tenant_1',
      currency: 'NGN',
    });
    prisma.cpPlatformWallet.findUnique.mockResolvedValue({
      id: 'wallet_1',
      tenantId: 'tenant_1',
      currency: 'NGN',
    });
    prisma.cpWalletEntry.groupBy.mockResolvedValue([
      { type: 'credit', _sum: { amountMinorUnits: 50000 } },
    ]);
    prisma.cpWalletEntry.create.mockImplementation(async ({ data }) => ({
      id: 'entry_1',
      createdAt: new Date(),
      ...data,
    }));

    const result = await service.recordVerificationCharge({
      tenantId: 'tenant_1',
      amountMinorUnits: 15000,
      referenceId: 'verify_123',
    });

    expect(result.type).toBe('debit');
    expect(result.referenceType).toBe('verification_fee');
  });

  it('throws when no platform wallet exists for the tenant', async () => {
    prisma.cpPlatformWallet.findUnique.mockResolvedValue(null);
    prisma.cpSubscription.findUnique.mockResolvedValue(null);

    await expect(service.getWalletByTenant('tenant_missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('falls back to subscription plan currency for verification charges when no wallet exists yet', async () => {
    prisma.cpPlatformWallet.findUnique.mockResolvedValueOnce(null).mockResolvedValueOnce({
      id: 'wallet_1',
      tenantId: 'tenant_1',
      currency: 'NGN',
    });
    prisma.cpSubscription.findUnique.mockResolvedValue({
      id: 'sub_1',
      tenantId: 'tenant_1',
      plan: { currency: 'NGN' },
    });
    prisma.cpPlatformWallet.upsert.mockResolvedValue({
      id: 'wallet_1',
      tenantId: 'tenant_1',
      currency: 'NGN',
    });
    prisma.cpWalletEntry.groupBy.mockResolvedValue([
      { type: 'credit', _sum: { amountMinorUnits: 50000 } },
    ]);
    prisma.cpWalletEntry.create.mockImplementation(async ({ data }) => ({
      id: 'entry_1',
      createdAt: new Date(),
      ...data,
    }));

    const result = await service.recordVerificationCharge({
      tenantId: 'tenant_1',
      amountMinorUnits: 15000,
      referenceId: 'verify_456',
    });

    expect(result.currency).toBe('NGN');
  });
});
