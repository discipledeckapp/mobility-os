import { MeteringService } from './metering.service';

describe('MeteringService', () => {
  const prisma = {
    cpUsageEvent: {
      upsert: jest.fn(),
    },
  };

  let service: MeteringService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new MeteringService(prisma as never);
  });

  it('records a usage event idempotently by idempotency key', async () => {
    prisma.cpUsageEvent.upsert.mockImplementation(async ({ create }) => ({
      id: 'usage_1',
      recordedAt: new Date(),
      ...create,
    }));

    const result = await service.recordUsageEvent({
      tenantId: 'tenant_1',
      eventType: 'identity_verification',
      quantity: 1,
      countryCode: 'NG',
      idempotencyKey: 'tenant_1:verify_1',
      occurredAt: '2026-03-19T10:00:00.000Z',
    });

    expect(result.idempotencyKey).toBe('tenant_1:verify_1');
    expect(result.countryCode).toBe('NG');
    expect(prisma.cpUsageEvent.upsert).toHaveBeenCalledTimes(1);
  });
});
