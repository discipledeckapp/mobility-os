import { ZodError } from 'zod';
import { PlatformSettingsService } from './platform-settings.service';

describe('PlatformSettingsService', () => {
  const prisma = {
    cpPlatformSetting: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      upsert: jest.fn(),
    },
  };

  let service: PlatformSettingsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new PlatformSettingsService(prisma as never);
    prisma.cpPlatformSetting.upsert.mockImplementation(async (args) => ({
      id: 'setting_1',
      key: args.where.key,
      description: args.create.description,
      value: args.create.value,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
  });

  it('accepts a valid identity_verification_routing payload', async () => {
    const result = await service.upsertSetting({
      key: 'identity_verification_routing',
      description: 'Nigeria routing config',
      value: {
        countries: [
          {
            countryCode: 'NG',
            livenessProviders: [
              {
                name: 'amazon_rekognition',
                enabled: true,
                priority: 1,
              },
            ],
            lookupProviders: [
              {
                name: 'youverify',
                enabled: true,
                priority: 1,
                allowedIdentifierTypes: ['NATIONAL_ID', 'BANK_ID'],
              },
            ],
            fallbackOnProviderError: true,
            fallbackOnProviderUnavailable: true,
            fallbackOnNoMatch: false,
          },
        ],
      },
    });

    expect(prisma.cpPlatformSetting.upsert).toHaveBeenCalledTimes(1);
    expect(result.key).toBe('identity_verification_routing');
  });

  it('rejects an invalid identity_verification_routing payload', async () => {
    await expect(
      service.upsertSetting({
        key: 'identity_verification_routing',
        value: {
          countries: [
            {
              countryCode: 'NG',
              lookupProviders: [],
              fallbackOnProviderError: true,
              fallbackOnProviderUnavailable: true,
              fallbackOnNoMatch: false,
            },
          ],
        },
      }),
    ).rejects.toBeInstanceOf(ZodError);
    expect(prisma.cpPlatformSetting.upsert).not.toHaveBeenCalled();
  });

  it('rejects unsupported country/provider capability combinations', async () => {
    await expect(
      service.upsertSetting({
        key: 'identity_verification_routing',
        value: {
          countries: [
            {
              countryCode: 'NG',
              livenessProviders: [
                {
                  name: 'amazon_rekognition',
                  enabled: true,
                  priority: 1,
                },
              ],
              lookupProviders: [
                {
                  name: 'amazon_rekognition',
                  enabled: true,
                  priority: 1,
                  allowedIdentifierTypes: ['NATIONAL_ID'],
                },
              ],
              fallbackOnProviderError: true,
              fallbackOnProviderUnavailable: true,
              fallbackOnNoMatch: false,
            },
          ],
        },
      }),
    ).rejects.toThrow("Provider 'amazon_rekognition' does not support lookup for country 'NG'");
    expect(prisma.cpPlatformSetting.upsert).not.toHaveBeenCalled();
  });

  it('accepts a valid verification_billing_policy payload', async () => {
    const result = await service.upsertSetting({
      key: 'verification_billing_policy',
      value: {
        countries: [
          {
            countryCode: 'NG',
            enabled: true,
            meterEventType: 'identity_verification',
            defaultFeeMinorUnits: 15000,
            billOnStatuses: ['verified', 'no_match'],
            providers: [
              {
                name: 'youverify',
                enabled: true,
                feeMinorUnits: 15000,
              },
            ],
          },
        ],
      },
    });

    expect(result.key).toBe('verification_billing_policy');
  });
});
