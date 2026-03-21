import { BillingRunsService } from './billing-runs.service';

describe('BillingRunsService', () => {
  const prisma = {
    cpSubscription: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    cpInvoice: {
      findFirst: jest.fn(),
    },
  };

  const billingService = {
    generateInvoiceForSubscription: jest.fn(),
    getInvoice: jest.fn(),
    openInvoice: jest.fn(),
    markPaid: jest.fn(),
  };

  const platformWalletsService = {
    getBalance: jest.fn(),
    createEntry: jest.fn(),
  };

  let service: BillingRunsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new BillingRunsService(
      prisma as never,
      billingService as never,
      platformWalletsService as never,
    );
  });

  it('generates and settles a due invoice from the platform wallet', async () => {
    prisma.cpSubscription.findUnique.mockResolvedValueOnce({
      id: 'sub_1',
      tenantId: 'tenant_1',
      status: 'active',
      cancelAtPeriodEnd: false,
      currentPeriodStart: new Date('2026-03-01T00:00:00.000Z'),
      currentPeriodEnd: new Date('2026-04-01T00:00:00.000Z'),
      plan: { billingInterval: 'monthly' },
    });
    prisma.cpInvoice.findFirst.mockResolvedValue(null);
    billingService.generateInvoiceForSubscription.mockResolvedValue({
      id: 'inv_1',
      tenantId: 'tenant_1',
      status: 'open',
      amountDueMinorUnits: 5030000,
      amountPaidMinorUnits: 0,
      currency: 'NGN',
    });
    billingService.getInvoice.mockResolvedValue({
      id: 'inv_1',
      tenantId: 'tenant_1',
      status: 'open',
      amountDueMinorUnits: 5030000,
      amountPaidMinorUnits: 0,
      currency: 'NGN',
    });
    platformWalletsService.getBalance.mockResolvedValue({
      balanceMinorUnits: 5030000,
    });
    prisma.cpSubscription.update.mockResolvedValue({
      id: 'sub_1',
      tenantId: 'tenant_1',
      status: 'active',
      cancelAtPeriodEnd: false,
      currentPeriodStart: new Date('2026-04-01T00:00:00.000Z'),
      currentPeriodEnd: new Date('2026-05-01T00:00:00.000Z'),
      plan: { billingInterval: 'monthly' },
    });

    const result = await service.runForSubscription('sub_1', {
      asOf: '2026-04-05T00:00:00.000Z',
    });

    expect(result.cyclesProcessed).toBe(1);
    expect(result.invoices[0]?.settlementOutcome).toBe('settled_from_platform_wallet');
    expect(platformWalletsService.createEntry).toHaveBeenCalled();
    expect(billingService.markPaid).toHaveBeenCalledWith('inv_1');
  });

  it('leaves the invoice open when wallet balance is insufficient', async () => {
    prisma.cpSubscription.findUnique.mockResolvedValueOnce({
      id: 'sub_1',
      tenantId: 'tenant_1',
      status: 'active',
      cancelAtPeriodEnd: false,
      currentPeriodStart: new Date('2026-03-01T00:00:00.000Z'),
      currentPeriodEnd: new Date('2026-04-01T00:00:00.000Z'),
      plan: { billingInterval: 'monthly' },
    });
    prisma.cpInvoice.findFirst.mockResolvedValue(null);
    billingService.generateInvoiceForSubscription.mockResolvedValue({
      id: 'inv_1',
      tenantId: 'tenant_1',
      status: 'open',
      amountDueMinorUnits: 5030000,
      amountPaidMinorUnits: 0,
      currency: 'NGN',
    });
    billingService.getInvoice.mockResolvedValue({
      id: 'inv_1',
      tenantId: 'tenant_1',
      status: 'open',
      amountDueMinorUnits: 5030000,
      amountPaidMinorUnits: 0,
      currency: 'NGN',
    });
    platformWalletsService.getBalance.mockResolvedValue({
      balanceMinorUnits: 1000,
    });
    prisma.cpSubscription.update.mockResolvedValue({
      id: 'sub_1',
      tenantId: 'tenant_1',
      status: 'active',
      cancelAtPeriodEnd: false,
      currentPeriodStart: new Date('2026-04-01T00:00:00.000Z'),
      currentPeriodEnd: new Date('2026-05-01T00:00:00.000Z'),
      plan: { billingInterval: 'monthly' },
    });

    const result = await service.runForSubscription('sub_1', {
      asOf: '2026-04-05T00:00:00.000Z',
    });

    expect(result.invoices[0]?.settlementOutcome).toBe('insufficient_platform_wallet_balance');
    expect(platformWalletsService.createEntry).not.toHaveBeenCalled();
    expect(billingService.markPaid).not.toHaveBeenCalled();
  });

  it('cancels a subscription at period end after invoicing the final cycle', async () => {
    prisma.cpSubscription.findUnique.mockResolvedValueOnce({
      id: 'sub_1',
      tenantId: 'tenant_1',
      status: 'active',
      cancelAtPeriodEnd: true,
      currentPeriodStart: new Date('2026-03-01T00:00:00.000Z'),
      currentPeriodEnd: new Date('2026-04-01T00:00:00.000Z'),
      plan: { billingInterval: 'monthly' },
    });
    prisma.cpInvoice.findFirst.mockResolvedValue(null);
    billingService.generateInvoiceForSubscription.mockResolvedValue({
      id: 'inv_1',
      tenantId: 'tenant_1',
      status: 'open',
      amountDueMinorUnits: 5030000,
      amountPaidMinorUnits: 0,
      currency: 'NGN',
    });
    billingService.getInvoice.mockResolvedValue({
      id: 'inv_1',
      tenantId: 'tenant_1',
      status: 'open',
      amountDueMinorUnits: 5030000,
      amountPaidMinorUnits: 0,
      currency: 'NGN',
    });
    platformWalletsService.getBalance.mockResolvedValue({
      balanceMinorUnits: 0,
    });
    prisma.cpSubscription.update.mockResolvedValue({
      id: 'sub_1',
      tenantId: 'tenant_1',
      status: 'canceled',
      cancelAtPeriodEnd: true,
      currentPeriodStart: new Date('2026-03-01T00:00:00.000Z'),
      currentPeriodEnd: new Date('2026-04-01T00:00:00.000Z'),
      plan: { billingInterval: 'monthly' },
    });

    const result = await service.runForSubscription('sub_1', {
      asOf: '2026-04-05T00:00:00.000Z',
    });

    expect(result.finalStatus).toBe('canceled');
    expect(result.cyclesProcessed).toBe(1);
  });
});
