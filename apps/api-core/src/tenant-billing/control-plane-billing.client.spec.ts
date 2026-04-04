import { ServiceUnavailableException } from '@nestjs/common';
import { ControlPlaneBillingClient } from './control-plane-billing.client';

jest.mock('../auth/internal-service-jwt', () => ({
  signInternalServiceJwt: jest.fn().mockResolvedValue('signed-internal-token'),
}));

describe('ControlPlaneBillingClient', () => {
  const configService = {
    get: jest.fn((key: string, defaultValue?: string) => {
      const values: Record<string, string> = {
        CONTROL_PLANE_API_URL: 'http://control-plane.local',
        INTERNAL_SERVICE_JWT_SECRET: 'secret',
        INTERNAL_SERVICE_CALLER_ID: 'api-core',
        INTERNAL_SERVICE_JWT_EXPIRES_IN: '2m',
      };
      return values[key] ?? defaultValue;
    }),
  };

  let client: ControlPlaneBillingClient;
  const fetchMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    client = new ControlPlaneBillingClient(configService as never);
    global.fetch = fetchMock as unknown as typeof fetch;
  });

  it('sends a signed internal bearer token when initializing driver KYC checkout', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        provider: 'paystack',
        reference: 'ref_1',
        checkoutUrl: 'https://pay.example/checkout',
        purpose: 'driver_kyc',
      }),
    });

    const result = await client.initializeDriverKycCheckout({
      tenantId: 'tenant_1',
      driverId: 'driver_1',
      provider: 'paystack',
      currency: 'NGN',
      verificationTier: 'FULL_TRUST_VERIFICATION',
      amountMinorUnits: 1_500_000,
      customerEmail: 'driver@example.com',
      redirectUrl: 'http://tenant-web.local/payment-return',
    });

    expect(fetchMock).toHaveBeenCalledWith(
      'http://control-plane.local/api/internal/payments/driver-kyc-checkouts',
      expect.objectContaining({
        method: 'POST',
        headers: expect.any(Headers),
      }),
    );

    const headers = fetchMock.mock.calls[0][1].headers as Headers;
    expect(headers.get('authorization')).toBe('Bearer signed-internal-token');
    expect(headers.get('content-type')).toBe('application/json');
    expect(result.checkoutUrl).toBe('https://pay.example/checkout');
  });

  it('translates non-2xx control-plane responses into a service-unavailable exception', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 401,
      text: async () => '{"message":"Invalid internal service bearer token"}',
    });

    await expect(
      client.initializeDriverKycCheckout({
        tenantId: 'tenant_1',
        driverId: 'driver_1',
        provider: 'paystack',
        currency: 'NGN',
        verificationTier: 'FULL_TRUST_VERIFICATION',
        amountMinorUnits: 1_500_000,
        customerEmail: 'driver@example.com',
        redirectUrl: 'http://tenant-web.local/payment-return',
      }),
    ).rejects.toThrow(
      new ServiceUnavailableException(
        'Control-plane billing returned status 401: {"message":"Invalid internal service bearer token"}',
      ),
    );
  });
});
