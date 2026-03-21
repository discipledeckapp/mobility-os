import { IdentityVerificationService } from './identity-verification.service';

describe('IdentityVerificationService', () => {
  const configService = {
    get: jest.fn(),
  };
  const controlPlaneBillingClient = {
    recordVerificationCharge: jest.fn(),
  };
  const controlPlaneMeteringClient = {
    recordUsageEvent: jest.fn(),
  };
  const controlPlaneSettingsClient = {
    getIdentityVerificationRoutingForCountry: jest.fn(),
    getVerificationBillingPolicyForCountry: jest.fn(),
  };
  const livenessService = {
    evaluate: jest.fn(),
  };

  const youVerifyNigeriaProvider = {
    name: 'youverify',
    canVerify: jest.fn(),
    verify: jest.fn(),
  };

  const smileIdentityNigeriaProvider = {
    name: 'smile_identity',
    canVerify: jest.fn(),
    verify: jest.fn(),
  };

  let service: IdentityVerificationService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new IdentityVerificationService(
      configService as never,
      controlPlaneBillingClient as never,
      controlPlaneMeteringClient as never,
      controlPlaneSettingsClient as never,
      livenessService as never,
      youVerifyNigeriaProvider as never,
      smileIdentityNigeriaProvider as never,
    );

    controlPlaneSettingsClient.getIdentityVerificationRoutingForCountry.mockResolvedValue(null);
    controlPlaneSettingsClient.getVerificationBillingPolicyForCountry.mockResolvedValue(null);
    configService.get.mockImplementation(
      (_key: string, defaultValue?: number) => defaultValue ?? undefined,
    );
    controlPlaneBillingClient.recordVerificationCharge.mockResolvedValue(true);
    controlPlaneMeteringClient.recordUsageEvent.mockResolvedValue(true);
    livenessService.evaluate.mockResolvedValue({
      attempted: true,
      passed: true,
      fallbackChain: ['preverified:true'],
    });
    youVerifyNigeriaProvider.canVerify.mockReturnValue(true);
    smileIdentityNigeriaProvider.canVerify.mockReturnValue(true);
    youVerifyNigeriaProvider.verify.mockResolvedValue({
      status: 'provider_unavailable',
      providerName: 'youverify',
      reason: 'primary unavailable',
    });
    smileIdentityNigeriaProvider.verify.mockResolvedValue({
      status: 'verified',
      providerName: 'smile_identity',
      verificationStatus: 'verified',
      enrichment: { fullName: 'Ada Okafor' },
    });
  });

  it('falls back using static country config when no control-plane override is available', async () => {
    const result = await service.verifyForEnrollment({
      tenantId: 'tenant_1',
      countryCode: 'NG',
      livenessPassed: true,
      identifiers: [{ type: 'NATIONAL_ID', value: '12345678901' }],
      providerVerification: { subjectConsent: true },
    });

    expect(
      controlPlaneSettingsClient.getIdentityVerificationRoutingForCountry,
    ).toHaveBeenCalledWith('NG');
    expect(youVerifyNigeriaProvider.verify).toHaveBeenCalledTimes(1);
    expect(smileIdentityNigeriaProvider.verify).toHaveBeenCalledTimes(1);
    expect(controlPlaneBillingClient.recordVerificationCharge).not.toHaveBeenCalled();
    expect(controlPlaneMeteringClient.recordUsageEvent).not.toHaveBeenCalled();
    expect(result).toEqual({
      attempted: true,
      verification: expect.objectContaining({
        status: 'verified',
        providerName: 'smile_identity',
      }),
      fallbackChain: ['youverify:provider_unavailable', 'smile_identity:verified'],
    });
  });

  it('honors control-plane routing override that disables fallback on provider unavailable', async () => {
    controlPlaneSettingsClient.getIdentityVerificationRoutingForCountry.mockResolvedValue({
      countryCode: 'NG',
      livenessProviders: [
        { name: 'amazon_rekognition', enabled: true, priority: 1 },
        { name: 'youverify', enabled: true, priority: 2 },
        { name: 'smile_identity', enabled: true, priority: 3 },
      ],
      lookupProviders: [
        {
          name: 'youverify',
          enabled: true,
          priority: 1,
          allowedIdentifierTypes: ['NATIONAL_ID', 'BANK_ID'],
        },
        {
          name: 'smile_identity',
          enabled: true,
          priority: 2,
          allowedIdentifierTypes: ['NATIONAL_ID', 'BANK_ID'],
        },
      ],
      fallbackOnProviderError: true,
      fallbackOnProviderUnavailable: false,
      fallbackOnNoMatch: false,
    });

    const result = await service.verifyForEnrollment({
      tenantId: 'tenant_1',
      countryCode: 'NG',
      livenessPassed: true,
      identifiers: [{ type: 'NATIONAL_ID', value: '12345678901' }],
      providerVerification: { subjectConsent: true },
    });

    expect(youVerifyNigeriaProvider.verify).toHaveBeenCalledTimes(1);
    expect(smileIdentityNigeriaProvider.verify).not.toHaveBeenCalled();
    expect(controlPlaneBillingClient.recordVerificationCharge).not.toHaveBeenCalled();
    expect(controlPlaneMeteringClient.recordUsageEvent).not.toHaveBeenCalled();
    expect(result).toEqual({
      attempted: true,
      verification: expect.objectContaining({
        status: 'provider_unavailable',
        providerName: 'youverify',
      }),
      fallbackChain: ['youverify:provider_unavailable'],
    });
  });

  it('blocks provider lookup when liveness evaluation does not pass', async () => {
    livenessService.evaluate.mockResolvedValue({
      attempted: true,
      passed: false,
      fallbackChain: ['amazon_rekognition:failed'],
      reason: 'failed',
    });

    const result = await service.verifyForEnrollment({
      tenantId: 'tenant_1',
      countryCode: 'NG',
      identifiers: [{ type: 'NATIONAL_ID', value: '12345678901' }],
      providerVerification: {
        subjectConsent: true,
        livenessCheck: { sessionId: 'session-1' },
      },
    });

    expect(result).toEqual({
      attempted: false,
      fallbackChain: ['amazon_rekognition:failed'],
      reason: 'failed',
    });
    expect(youVerifyNigeriaProvider.verify).not.toHaveBeenCalled();
    expect(smileIdentityNigeriaProvider.verify).not.toHaveBeenCalled();
  });

  it('records a verification charge after a billable provider attempt', async () => {
    controlPlaneSettingsClient.getVerificationBillingPolicyForCountry.mockResolvedValue({
      countryCode: 'NG',
      enabled: true,
      meterEventType: 'identity_verification',
      defaultFeeMinorUnits: 15000,
      billOnStatuses: ['verified', 'no_match', 'provider_error'],
      providers: [
        { name: 'youverify', enabled: true, feeMinorUnits: 15000 },
        { name: 'smile_identity', enabled: true, feeMinorUnits: 15000 },
      ],
    });

    await service.verifyForEnrollment({
      tenantId: 'tenant_1',
      countryCode: 'NG',
      livenessPassed: true,
      identifiers: [{ type: 'NATIONAL_ID', value: '12345678901' }],
      providerVerification: { subjectConsent: true },
    });

    expect(controlPlaneMeteringClient.recordUsageEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        tenantId: 'tenant_1',
        eventType: 'identity_verification',
        quantity: 1,
      }),
    );
    expect(controlPlaneBillingClient.recordVerificationCharge).toHaveBeenCalledWith(
      expect.objectContaining({
        tenantId: 'tenant_1',
        amountMinorUnits: 15000,
      }),
    );
  });
});
