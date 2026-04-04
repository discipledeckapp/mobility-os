import { AccountingService } from './accounting.service';

describe('AccountingService', () => {
  const prisma = {
    businessEntity: {
      findUnique: jest.fn(),
    },
    operationalWallet: {
      findUnique: jest.fn(),
    },
    operationalWalletEntry: {
      findMany: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
    },
    remittance: {
      findMany: jest.fn(),
      count: jest.fn(),
      aggregate: jest.fn(),
    },
  };

  let service: AccountingService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AccountingService(prisma as never);
    prisma.businessEntity.findUnique.mockResolvedValue({
      id: 'be_1',
      tenantId: 'tenant_1',
      country: 'NG',
    });
    prisma.operationalWallet.findUnique.mockResolvedValue({
      id: 'wallet_1',
      currency: 'NGN',
    });
    prisma.operationalWalletEntry.findMany.mockResolvedValue([]);
    prisma.operationalWalletEntry.count.mockResolvedValue(0);
    prisma.operationalWalletEntry.groupBy.mockResolvedValue([]);
    prisma.remittance.findMany.mockResolvedValue([]);
    prisma.remittance.count.mockResolvedValue(0);
    prisma.remittance.aggregate.mockResolvedValue({
      _sum: { amountMinorUnits: 0 },
    });
  });

  it('lists ledger entries with signed amounts and remittance linkage details', async () => {
    prisma.operationalWalletEntry.findMany.mockResolvedValue([
      {
        id: 'entry_1',
        walletId: 'wallet_1',
        type: 'credit',
        amountMinorUnits: 150000,
        currency: 'NGN',
        referenceId: 'rem_1',
        referenceType: 'remittance',
        description: 'Remittance completed for assignment assignment_1',
        createdAt: new Date('2026-04-01T08:00:00.000Z'),
      },
    ]);
    prisma.operationalWalletEntry.count.mockResolvedValue(1);
    prisma.remittance.findMany.mockResolvedValue([
      {
        id: 'rem_1',
        driverId: 'driver_1',
        assignmentId: 'assignment_1',
        status: 'completed',
        dueDate: '2026-04-01',
      },
    ]);

    const result = await service.listLedger('tenant_1', 'be_1', { page: 1, limit: 20 });

    expect(result.total).toBe(1);
    expect(result.data[0]).toEqual(
      expect.objectContaining({
        id: 'entry_1',
        direction: 'inflow',
        category: 'remittance_collection',
        signedAmountMinorUnits: 150000,
        remittance: expect.objectContaining({
          remittanceId: 'rem_1',
          driverId: 'driver_1',
        }),
      }),
    );
  });

  it('builds a balance summary from wallet and remittance totals', async () => {
    prisma.operationalWalletEntry.groupBy.mockResolvedValue([
      { type: 'credit', _sum: { amountMinorUnits: 500000 } },
      { type: 'debit', _sum: { amountMinorUnits: 175000 } },
    ]);
    prisma.remittance.aggregate
      .mockResolvedValueOnce({ _sum: { amountMinorUnits: 420000 } })
      .mockResolvedValueOnce({ _sum: { amountMinorUnits: 90000 } });
    prisma.remittance.count
      .mockResolvedValueOnce(2)
      .mockResolvedValueOnce(1);
    prisma.operationalWalletEntry.count.mockResolvedValue(6);

    const result = await service.getBalanceSummary('tenant_1', 'be_1');

    expect(result).toEqual(
      expect.objectContaining({
        currentBalanceMinorUnits: 325000,
        totalCreditsMinorUnits: 500000,
        totalDebitsMinorUnits: 175000,
        remittanceCollectedMinorUnits: 420000,
        pendingRemittanceMinorUnits: 90000,
        overdueRemittanceCount: 2,
        disputedRemittanceCount: 1,
        ledgerEntryCount: 6,
      }),
    );
  });

  it('builds a basic profit and loss summary from remittance revenue and wallet expenses', async () => {
    prisma.remittance.aggregate.mockResolvedValue({
      _sum: { amountMinorUnits: 600000 },
    });
    prisma.operationalWalletEntry.findMany.mockResolvedValue([
      {
        type: 'debit',
        referenceType: 'payout',
        description: 'Driver payout',
        amountMinorUnits: 200000,
      },
      {
        type: 'debit',
        referenceType: 'adjustment',
        description: 'Cash variance write-off',
        amountMinorUnits: 50000,
      },
    ]);

    const result = await service.getProfitAndLoss('tenant_1', 'be_1', {
      dateFrom: '2026-04-01',
      dateTo: '2026-04-30',
    });

    expect(result).toEqual(
      expect.objectContaining({
        revenueMinorUnits: 600000,
        expenseMinorUnits: 250000,
        netProfitMinorUnits: 350000,
      }),
    );
    expect(result.expenseBreakdown).toEqual([
      { category: 'payout', amountMinorUnits: 200000 },
      { category: 'adjustment', amountMinorUnits: 50000 },
    ]);
  });
});
