import { BadRequestException, NotFoundException } from '@nestjs/common';
import { FeatureFlagsService } from './feature-flags.service';

describe('FeatureFlagsService', () => {
  const prisma = {
    cpFeatureFlag: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    cpFeatureFlagOverride: {
      create: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
  };

  let service: FeatureFlagsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new FeatureFlagsService(prisma as never);
  });

  it('resolves overrides in tenant > plan > country > global order', async () => {
    prisma.cpFeatureFlag.findUnique.mockResolvedValue({
      id: 'flag_1',
      key: 'intelligence_add_on',
      isEnabled: false,
      overrides: [
        {
          id: 'override_country',
          flagId: 'flag_1',
          tenantId: null,
          countryCode: 'NG',
          planTier: null,
          value: true,
          isEnabled: true,
        },
        {
          id: 'override_plan',
          flagId: 'flag_1',
          tenantId: null,
          countryCode: null,
          planTier: 'growth',
          value: false,
          isEnabled: false,
        },
        {
          id: 'override_tenant',
          flagId: 'flag_1',
          tenantId: 'tenant_123',
          countryCode: null,
          planTier: null,
          value: true,
          isEnabled: true,
        },
      ],
    });

    await expect(
      service.isEnabled('intelligence_add_on', {
        tenantId: 'tenant_123',
        planTier: 'growth',
        countryCode: 'NG',
      }),
    ).resolves.toBe(true);
  });

  it('rejects override creation when more than one scope is provided', async () => {
    prisma.cpFeatureFlag.findUnique.mockResolvedValue({
      id: 'flag_1',
      key: 'intelligence_add_on',
      isEnabled: true,
      overrides: [],
    });

    await expect(
      service.setOverride({
        flagId: 'intelligence_add_on',
        tenantId: 'tenant_123',
        countryCode: 'NG',
        value: true,
        isEnabled: true,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('creates an override after resolving the flag by key', async () => {
    prisma.cpFeatureFlag.findUnique
      .mockResolvedValueOnce({
        id: 'flag_1',
        key: 'intelligence_add_on',
        isEnabled: true,
        overrides: [],
      })
      .mockResolvedValueOnce({
        id: 'flag_1',
        key: 'intelligence_add_on',
        isEnabled: true,
      });
    prisma.cpFeatureFlagOverride.create.mockResolvedValue({
      id: 'override_1',
      flagId: 'flag_1',
      tenantId: null,
      countryCode: 'NG',
      planTier: null,
      value: true,
      isEnabled: true,
    });

    const result = await service.setOverride({
      flagId: 'intelligence_add_on',
      countryCode: 'NG',
      value: true,
      isEnabled: true,
    });

    expect(prisma.cpFeatureFlagOverride.create).toHaveBeenCalledWith({
      data: {
        flagId: 'flag_1',
        tenantId: null,
        countryCode: 'NG',
        planTier: null,
        value: true,
        isEnabled: true,
      },
    });
    expect(result.id).toBe('override_1');
  });

  it('fails removing a missing override', async () => {
    prisma.cpFeatureFlagOverride.findUnique.mockResolvedValue(null);

    await expect(service.removeOverride('missing')).rejects.toBeInstanceOf(NotFoundException);
  });
});
