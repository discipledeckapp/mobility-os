import { BadRequestException, NotFoundException } from '@nestjs/common';
import { BillingService } from './billing.service';

const INVOICE_STATUS = {
  Draft: 'draft',
  Open: 'open',
  Paid: 'paid',
} as const;

describe('BillingService', () => {
  const prisma = {
    cpInvoice: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    cpPlatformSetting: {
      findUnique: jest.fn(),
    },
    cpSubscription: {
      findUnique: jest.fn(),
    },
    cpUsageEvent: {
      findMany: jest.fn(),
    },
  };

  let service: BillingService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new BillingService(prisma as never);
  });

  it('creates an invoice when the subscription and currency align', async () => {
    prisma.cpSubscription.findUnique.mockResolvedValue({
      id: 'sub_1',
      tenantId: 'tenant_1',
      plan: { currency: 'NGN' },
    });
    prisma.cpInvoice.create.mockImplementation(async ({ data }) => ({
      id: 'inv_1',
      createdAt: new Date(),
      updatedAt: new Date(),
      paidAt: null,
      ...data,
    }));

    const result = await service.createInvoice({
      tenantId: 'tenant_1',
      subscriptionId: 'sub_1',
      amountDueMinorUnits: 5000000,
      currency: 'NGN',
      periodStart: '2026-03-01T00:00:00.000Z',
      periodEnd: '2026-04-01T00:00:00.000Z',
      status: 'draft',
    });

    expect(result.status).toBe(INVOICE_STATUS.Draft);
    expect(prisma.cpInvoice.create).toHaveBeenCalled();
  });

  it('rejects invoice creation when subscription tenant and invoice tenant differ', async () => {
    prisma.cpSubscription.findUnique.mockResolvedValue({
      id: 'sub_1',
      tenantId: 'tenant_2',
      plan: { currency: 'NGN' },
    });

    await expect(
      service.createInvoice({
        tenantId: 'tenant_1',
        subscriptionId: 'sub_1',
        amountDueMinorUnits: 5000000,
        currency: 'NGN',
        periodStart: '2026-03-01T00:00:00.000Z',
        periodEnd: '2026-04-01T00:00:00.000Z',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('opens a draft invoice', async () => {
    prisma.cpInvoice.findUnique.mockResolvedValue({
      id: 'inv_1',
      status: INVOICE_STATUS.Draft,
    });
    prisma.cpInvoice.update.mockResolvedValue({
      id: 'inv_1',
      status: INVOICE_STATUS.Open,
    });

    await expect(service.openInvoice('inv_1')).resolves.toEqual({
      id: 'inv_1',
      status: INVOICE_STATUS.Open,
    });
  });

  it('marks an open invoice paid and sets full paid amount', async () => {
    prisma.cpInvoice.findUnique.mockResolvedValue({
      id: 'inv_1',
      status: INVOICE_STATUS.Open,
      amountDueMinorUnits: 5000000,
    });
    prisma.cpInvoice.update.mockImplementation(async ({ data }) => ({
      id: 'inv_1',
      ...data,
    }));

    const result = await service.markPaid('inv_1', '2026-04-15T00:00:00.000Z');

    expect(result.status).toBe(INVOICE_STATUS.Paid);
    expect(result.amountPaidMinorUnits).toBe(5000000);
  });

  it('fails when an invoice cannot be found', async () => {
    prisma.cpInvoice.findUnique.mockResolvedValue(null);

    await expect(service.getInvoice('missing')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('generates an invoice with base fee and metered verification usage', async () => {
    prisma.cpSubscription.findUnique.mockResolvedValue({
      id: 'sub_1',
      tenantId: 'tenant_1',
      currentPeriodStart: new Date('2026-03-01T00:00:00.000Z'),
      currentPeriodEnd: new Date('2026-04-01T00:00:00.000Z'),
      plan: {
        name: 'Growth Monthly',
        currency: 'NGN',
        basePriceMinorUnits: 5000000,
      },
    });
    prisma.cpInvoice.findFirst.mockResolvedValue(null);
    prisma.cpPlatformSetting.findUnique.mockResolvedValue({
      key: 'verification_billing_policy',
      value: {
        countries: [
          {
            countryCode: 'NG',
            enabled: true,
            meterEventType: 'identity_verification',
            defaultFeeMinorUnits: 15000,
            billOnStatuses: ['verified', 'no_match', 'provider_error'],
            providers: [],
          },
        ],
      },
    });
    prisma.cpUsageEvent.findMany.mockResolvedValue([
      {
        countryCode: 'NG',
        quantity: 2,
      },
    ]);
    prisma.cpInvoice.create.mockImplementation(async ({ data }) => ({
      id: 'inv_generated_1',
      createdAt: new Date(),
      updatedAt: new Date(),
      ...data,
      lineItems: data.lineItems.create.map(
        (item: { description: string; amountMinorUnits: number }, index: number) => ({
          id: `line_${index + 1}`,
          createdAt: new Date(),
          ...item,
        }),
      ),
    }));

    const result = await service.generateInvoiceForSubscription('sub_1', {});

    expect(result.amountDueMinorUnits).toBe(5030000);
    expect(result.lineItems).toHaveLength(2);
    expect(result.lineItems[1]?.kind).toBe('identity_verification_usage');
  });
});
