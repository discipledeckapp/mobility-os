import { Logger } from '@nestjs/common';
import { ControlPlaneMeteringClient } from './control-plane-metering.client';

jest.mock('../auth/internal-service-jwt', () => ({
  signInternalServiceJwt: jest.fn().mockResolvedValue('metering-token'),
}));

describe('ControlPlaneMeteringClient', () => {
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

  let client: ControlPlaneMeteringClient;
  const fetchMock = jest.fn();
  const loggerWarnSpy = jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);

  beforeEach(() => {
    jest.clearAllMocks();
    client = new ControlPlaneMeteringClient(configService as never);
    global.fetch = fetchMock as unknown as typeof fetch;
  });

  afterAll(() => {
    loggerWarnSpy.mockRestore();
  });

  it('fires usage events with a signed internal token', async () => {
    fetchMock.mockResolvedValue({ ok: true, status: 202 });

    client.fireEvent('tenant_1', 'active_driver', 3);
    await new Promise(process.nextTick);
    await new Promise(process.nextTick);

    expect(fetchMock).toHaveBeenCalledWith(
      'http://control-plane.local/api/internal/metering/usage-events',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          authorization: 'Bearer metering-token',
          'content-type': 'application/json',
        }),
        body: JSON.stringify({
          tenantId: 'tenant_1',
          eventType: 'active_driver',
          quantity: 3,
        }),
      }),
    );
  });

  it('logs and swallows failed metering requests', async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 503 });

    client.fireEvent('tenant_1', 'active_vehicle');
    await new Promise(process.nextTick);
    await new Promise(process.nextTick);

    expect(loggerWarnSpy).toHaveBeenCalledWith(
      "Metering event 'active_vehicle' for tenant 'tenant_1' returned status 503",
    );
  });
});
