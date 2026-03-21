import { LivenessService } from './liveness.service';

describe('LivenessService', () => {
  const configService = {
    get: jest.fn(),
  };

  const controlPlaneSettingsClient = {
    getIdentityVerificationRoutingForCountry: jest.fn(),
  };

  let service: LivenessService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new LivenessService(configService as never, controlPlaneSettingsClient as never);
    controlPlaneSettingsClient.getIdentityVerificationRoutingForCountry.mockResolvedValue({
      countryCode: 'NG',
      livenessProviders: [
        { name: 'amazon_rekognition', enabled: true, priority: 1 },
        { name: 'youverify', enabled: true, priority: 2 },
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
    });
  });

  it('initializes a YouVerify session when Amazon is unavailable and YouVerify is configured', async () => {
    configService.get.mockImplementation((key: string) => {
      switch (key) {
        case 'AWS_REGION':
        case 'AWS_ACCESS_KEY_ID':
        case 'AWS_SECRET_ACCESS_KEY':
          return undefined;
        case 'YOUVERIFY_API_KEY':
          return 'test-token';
        case 'YOUVERIFY_BASE_URL':
          return 'https://example.yv.test';
        case 'YOUVERIFY_LIVENESS_MOCK_RESPONSE':
          return '{"passed":true}';
        default:
          return undefined;
      }
    });

    const result = await service.initializeSession({
      countryCode: 'NG',
      tenantId: 'tenant_1',
    });

    expect(result).toEqual({
      providerName: 'youverify',
      sessionId: 'youverify-mock-session',
      expiresAt: expect.any(String),
      fallbackChain: ['amazon_rekognition:provider_unavailable', 'youverify:initialized'],
    });
  });

  it('skips unsupported liveness providers from a routing override', async () => {
    controlPlaneSettingsClient.getIdentityVerificationRoutingForCountry.mockResolvedValue({
      countryCode: 'NG',
      livenessProviders: [
        { name: 'amazon_rekognition', enabled: true, priority: 1 },
        { name: 'internal_free_service', enabled: true, priority: 2 },
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
    });

    configService.get.mockImplementation((key: string) => {
      switch (key) {
        case 'AWS_REGION':
        case 'AWS_ACCESS_KEY_ID':
        case 'AWS_SECRET_ACCESS_KEY':
          return undefined;
        default:
          return undefined;
      }
    });

    const result = await service.initializeSession({
      countryCode: 'NG',
      tenantId: 'tenant_1',
    });

    expect(result).toEqual({
      providerName: 'internal_free_service',
      sessionId: expect.stringMatching(/^internal-free-tenant_1-/),
      fallbackChain: [
        'amazon_rekognition:provider_unavailable',
        'internal_free_service:initialized',
      ],
    });
  });

  it('fails cleanly when all configured liveness providers are unavailable', async () => {
    controlPlaneSettingsClient.getIdentityVerificationRoutingForCountry.mockResolvedValue({
      countryCode: 'NG',
      livenessProviders: [
        { name: 'amazon_rekognition', enabled: true, priority: 1 },
        { name: 'youverify', enabled: true, priority: 2 },
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
    });

    configService.get.mockReturnValue(undefined);

    await expect(
      service.initializeSession({
        countryCode: 'NG',
        tenantId: 'tenant_1',
      }),
    ).rejects.toThrow("Unable to initialize liveness session for country 'NG'");
  });
});
