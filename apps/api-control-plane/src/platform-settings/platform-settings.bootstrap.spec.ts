import { PlatformSettingsBootstrap } from './platform-settings.bootstrap';

describe('PlatformSettingsBootstrap', () => {
  const configService = {
    get: jest.fn(),
  };

  const platformSettingsService = {
    upsertSetting: jest.fn(),
  };

  let bootstrap: PlatformSettingsBootstrap;

  beforeEach(() => {
    jest.clearAllMocks();
    bootstrap = new PlatformSettingsBootstrap(
      configService as never,
      platformSettingsService as never,
    );
  });

  it('does not seed defaults when bootstrap flag is disabled', async () => {
    configService.get.mockReturnValue(false);

    await bootstrap.onApplicationBootstrap();

    expect(platformSettingsService.upsertSetting).not.toHaveBeenCalled();
  });

  it('seeds the default identity verification routing setting when bootstrap flag is enabled', async () => {
    configService.get.mockReturnValue(true);
    platformSettingsService.upsertSetting.mockResolvedValue(undefined);

    await bootstrap.onApplicationBootstrap();

    expect(platformSettingsService.upsertSetting).toHaveBeenCalledWith(
      expect.objectContaining({
        key: 'identity_verification_routing',
        value: {
          countries: [
            expect.objectContaining({
              countryCode: 'NG',
              livenessProviders: expect.arrayContaining([
                expect.objectContaining({
                  name: 'amazon_rekognition',
                  priority: 1,
                }),
                expect.objectContaining({
                  name: 'youverify',
                  priority: 2,
                }),
                expect.objectContaining({
                  name: 'smile_identity',
                  priority: 3,
                }),
              ]),
              lookupProviders: expect.arrayContaining([
                expect.objectContaining({
                  name: 'youverify',
                  priority: 1,
                }),
                expect.objectContaining({
                  name: 'smile_identity',
                  priority: 2,
                }),
              ]),
              fallbackOnProviderError: true,
              fallbackOnProviderUnavailable: true,
              fallbackOnNoMatch: false,
            }),
          ],
        },
      }),
    );

    expect(platformSettingsService.upsertSetting).toHaveBeenCalledWith(
      expect.objectContaining({
        key: 'verification_billing_policy',
        value: {
          countries: [
            expect.objectContaining({
              countryCode: 'NG',
              enabled: true,
              meterEventType: 'identity_verification',
              defaultFeeMinorUnits: 15000,
            }),
          ],
        },
      }),
    );
  });
});
