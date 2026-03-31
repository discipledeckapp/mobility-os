import { BadRequestException } from '@nestjs/common';
import { TenantsService } from './tenants.service';

describe('TenantsService', () => {
  const prisma = {
    tenant: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    driver: {
      findMany: jest.fn(),
      update: jest.fn(),
    },
    selfServiceOtp: {
      findMany: jest.fn(),
    },
    user: {
      findMany: jest.fn(),
    },
  };

  let service: TenantsService;

  beforeEach(() => {
    jest.resetAllMocks();
    service = new TenantsService(prisma as never);
    prisma.tenant.findUnique.mockResolvedValue({
      id: 'tenant_1',
      country: 'NG',
      metadata: { operations: { verificationTier: 'BASIC_IDENTITY' } },
    });
    prisma.tenant.update.mockResolvedValue({
      id: 'tenant_1',
      country: 'NG',
      metadata: { operations: { verificationTier: 'FULL_TRUST_VERIFICATION' } },
    });
    prisma.driver.findMany.mockResolvedValue([]);
    prisma.selfServiceOtp.findMany.mockResolvedValue([]);
  });

  it('requires rollout scope when increasing the organisation verification tier', async () => {
    await expect(
      service.updateSettings('tenant_1', {
        verificationTier: 'FULL_TRUST_VERIFICATION',
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('grandfathers already-invited or verified drivers when stronger tier applies to new journeys only', async () => {
    prisma.driver.findMany
      .mockResolvedValueOnce([
        {
          id: 'driver_verified',
          verificationTierOverride: null,
          identityStatus: 'verified',
        },
      ])
      .mockResolvedValueOnce([
        {
          id: 'driver_verified',
          verificationTierOverride: null,
          identityStatus: 'verified',
        },
      ]);

    await service.updateSettings('tenant_1', {
      verificationTier: 'FULL_TRUST_VERIFICATION',
      verificationTierRolloutScope: 'new_only',
    });

    expect(prisma.driver.update).toHaveBeenCalledWith({
      where: { id: 'driver_verified' },
      data: { verificationTierOverride: 'BASIC_IDENTITY' },
    });
  });

  it('pushes existing lower-tier drivers into reverification when stronger tier applies to everyone', async () => {
    prisma.driver.findMany
      .mockResolvedValueOnce([
        {
          id: 'driver_verified',
          verificationTierOverride: null,
          identityStatus: 'verified',
        },
      ])
      .mockResolvedValueOnce([
        {
          id: 'driver_verified',
          verificationTierOverride: null,
          identityStatus: 'verified',
        },
      ]);

    await service.updateSettings('tenant_1', {
      verificationTier: 'FULL_TRUST_VERIFICATION',
      verificationTierRolloutScope: 'existing_and_new',
    });

    expect(prisma.driver.update).toHaveBeenCalledWith({
      where: { id: 'driver_verified' },
      data: expect.objectContaining({
        verificationTierOverride: null,
        identityStatus: 'unverified',
        identityLastVerifiedAt: null,
        kycPaymentReference: null,
        kycPaymentVerifiedAt: null,
      }),
    });
  });
});
