import { MatchingController } from './matching.controller';

describe('MatchingController', () => {
  const matchingService = {
    initializeLivenessSession: jest.fn(),
    resolveEnrollment: jest.fn(),
  };

  let controller: MatchingController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new MatchingController(matchingService as never);
  });

  it('delegates liveness session initialization to the matching service', async () => {
    matchingService.initializeLivenessSession.mockResolvedValue({
      providerName: 'youverify',
      sessionId: 'session_1',
      expiresAt: '2026-03-19T12:00:00.000Z',
      fallbackChain: ['amazon_rekognition:provider_unavailable', 'youverify:initialized'],
    });

    const dto = {
      tenantId: 'tenant_1',
      countryCode: 'NG',
    };

    await expect(controller.initializeLivenessSession(dto)).resolves.toEqual({
      providerName: 'youverify',
      sessionId: 'session_1',
      expiresAt: '2026-03-19T12:00:00.000Z',
      fallbackChain: ['amazon_rekognition:provider_unavailable', 'youverify:initialized'],
    });
    expect(matchingService.initializeLivenessSession).toHaveBeenCalledWith(dto);
  });

  it('delegates enrollment resolution to the matching service', async () => {
    matchingService.resolveEnrollment.mockResolvedValue({
      decision: 'new_person',
      personId: 'person_1',
      globalRiskScore: 0,
      riskBand: 'low',
      isWatchlisted: false,
      hasDuplicateIdentityFlag: false,
      fraudIndicatorCount: 0,
      verificationConfidence: 0,
    });

    const dto = {
      tenantId: 'tenant_1',
      countryCode: 'NG',
      identifiers: [{ type: 'NATIONAL_ID', value: '12345678901' }],
    };

    await expect(controller.resolveEnrollment(dto as never)).resolves.toEqual({
      decision: 'new_person',
      personId: 'person_1',
      globalRiskScore: 0,
      riskBand: 'low',
      isWatchlisted: false,
      hasDuplicateIdentityFlag: false,
      fraudIndicatorCount: 0,
      verificationConfidence: 0,
    });
    expect(matchingService.resolveEnrollment).toHaveBeenCalledWith(dto);
  });
});
