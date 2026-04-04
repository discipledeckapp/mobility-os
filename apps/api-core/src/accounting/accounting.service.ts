import { getCountryConfig, isCountrySupported } from '@mobility-os/domain-config';
import { asTenantId, assertTenantOwnership } from '@mobility-os/tenancy-domain';
import { Injectable, NotFoundException } from '@nestjs/common';
import type { PaginatedResponse } from '../common/dto/paginated-response.dto';
import { PrismaService } from '../database/prisma.service';
import type {
  AccountingBalanceSummaryResponseDto,
  AccountingLedgerEntryResponseDto,
  AccountingProfitAndLossResponseDto,
} from './dto/accounting-response.dto';
import type {
  GetAccountingProfitAndLossDto,
  ListAccountingLedgerDto,
} from './dto/accounting-query.dto';

@Injectable()
export class AccountingService {
  constructor(private readonly prisma: PrismaService) {}

  private async getBusinessEntity(tenantId: string, businessEntityId: string) {
    const entity = await this.prisma.businessEntity.findUnique({
      where: { id: businessEntityId },
      select: {
        id: true,
        tenantId: true,
        country: true,
      },
    });

    if (!entity) {
      throw new NotFoundException(`BusinessEntity '${businessEntityId}' not found`);
    }

    assertTenantOwnership(asTenantId(entity.tenantId), asTenantId(tenantId));
    return entity;
  }

  private resolveCurrency(country: string, walletCurrency?: string | null): string {
    if (walletCurrency) {
      return walletCurrency;
    }

    if (isCountrySupported(country)) {
      return getCountryConfig(country).currency;
    }

    return 'NGN';
  }

  private getEntryCategory(referenceType?: string | null, description?: string | null): string {
    const normalizedReferenceType = referenceType?.trim().toLowerCase() ?? '';
    const normalizedDescription = description?.trim().toLowerCase() ?? '';

    if (normalizedReferenceType === 'remittance') {
      return 'remittance_collection';
    }
    if (normalizedReferenceType === 'payout') {
      return 'payout';
    }
    if (normalizedReferenceType === 'reversal') {
      return 'reversal';
    }
    if (
      normalizedReferenceType.includes('billing') ||
      normalizedReferenceType.includes('verification') ||
      normalizedDescription.includes('billing') ||
      normalizedDescription.includes('verification')
    ) {
      return 'platform_billing';
    }
    if (normalizedReferenceType === 'adjustment') {
      return 'adjustment';
    }
    return normalizedReferenceType || 'other';
  }

  private toDateRange(filters: { dateFrom?: string; dateTo?: string }) {
    if (!filters.dateFrom && !filters.dateTo) {
      return undefined;
    }

    return {
      ...(filters.dateFrom ? { gte: new Date(`${filters.dateFrom}T00:00:00.000Z`) } : {}),
      ...(filters.dateTo ? { lte: new Date(`${filters.dateTo}T23:59:59.999Z`) } : {}),
    };
  }

  async listLedger(
    tenantId: string,
    businessEntityId: string,
    filters: ListAccountingLedgerDto = {},
  ): Promise<PaginatedResponse<AccountingLedgerEntryResponseDto>> {
    const entity = await this.getBusinessEntity(tenantId, businessEntityId);
    const wallet = await this.prisma.operationalWallet.findUnique({
      where: { businessEntityId },
      select: { id: true, currency: true },
    });

    const page = filters.page ?? 1;
    const limit = filters.limit ?? 50;

    if (!wallet) {
      return {
        data: [],
        total: 0,
        page,
        limit,
      };
    }

    const createdAt = this.toDateRange(filters);
    const where = {
      walletId: wallet.id,
      ...(filters.type ? { type: filters.type } : {}),
      ...(createdAt ? { createdAt } : {}),
    };

    const [entries, total] = await Promise.all([
      this.prisma.operationalWalletEntry.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.operationalWalletEntry.count({ where }),
    ]);

    const remittanceIds = entries
      .filter((entry) => entry.referenceType === 'remittance' && entry.referenceId)
      .map((entry) => entry.referenceId as string);
    const remittances =
      remittanceIds.length > 0
        ? await this.prisma.remittance.findMany({
            where: {
              tenantId,
              businessEntityId,
              id: { in: remittanceIds },
            },
            select: {
              id: true,
              driverId: true,
              assignmentId: true,
              status: true,
              dueDate: true,
            },
          })
        : [];
    const remittanceById = new Map(remittances.map((remittance) => [remittance.id, remittance]));

    return {
      data: entries.map((entry) => {
        const signedAmountMinorUnits = entry.type === 'credit' ? entry.amountMinorUnits : -entry.amountMinorUnits;
        const remittance =
          entry.referenceType === 'remittance' && entry.referenceId
            ? remittanceById.get(entry.referenceId) ?? null
            : null;

        return {
          id: entry.id,
          walletId: entry.walletId,
          type: entry.type,
          direction: entry.type === 'credit' ? 'inflow' : 'outflow',
          category: this.getEntryCategory(entry.referenceType, entry.description),
          amountMinorUnits: entry.amountMinorUnits,
          signedAmountMinorUnits,
          currency: entry.currency,
          referenceId: entry.referenceId ?? null,
          referenceType: entry.referenceType ?? null,
          description: entry.description ?? null,
          createdAt: entry.createdAt,
          remittance:
            remittance === null
              ? null
              : {
                  remittanceId: remittance.id,
                  driverId: remittance.driverId,
                  assignmentId: remittance.assignmentId,
                  status: remittance.status,
                  dueDate: remittance.dueDate,
                },
        };
      }),
      total,
      page,
      limit,
    };
  }

  async getBalanceSummary(
    tenantId: string,
    businessEntityId: string,
  ): Promise<AccountingBalanceSummaryResponseDto> {
    const entity = await this.getBusinessEntity(tenantId, businessEntityId);
    const wallet = await this.prisma.operationalWallet.findUnique({
      where: { businessEntityId },
      select: { id: true, currency: true },
    });

    const [groupedEntries, completedRemittances, pendingRemittances, overdueRemittances, disputedCount, entryCount] =
      await Promise.all([
        wallet
          ? this.prisma.operationalWalletEntry.groupBy({
              by: ['type'],
              where: { walletId: wallet.id },
              _sum: { amountMinorUnits: true },
            })
          : Promise.resolve([]),
        this.prisma.remittance.aggregate({
          where: {
            tenantId,
            businessEntityId,
            status: { in: ['completed', 'partially_settled'] },
          },
          _sum: { amountMinorUnits: true },
        }),
        this.prisma.remittance.aggregate({
          where: {
            tenantId,
            businessEntityId,
            status: { in: ['pending', 'disputed'] },
          },
          _sum: { amountMinorUnits: true },
        }),
        this.prisma.remittance.count({
          where: {
            tenantId,
            businessEntityId,
            status: { in: ['pending', 'disputed'] },
            dueDate: { lt: new Date().toISOString().slice(0, 10) },
          },
        }),
        this.prisma.remittance.count({
          where: {
            tenantId,
            businessEntityId,
            status: 'disputed',
          },
        }),
        wallet ? this.prisma.operationalWalletEntry.count({ where: { walletId: wallet.id } }) : Promise.resolve(0),
      ]);

    let totalCreditsMinorUnits = 0;
    let totalDebitsMinorUnits = 0;
    for (const row of groupedEntries) {
      const sum = row._sum.amountMinorUnits ?? 0;
      if (row.type === 'credit') {
        totalCreditsMinorUnits = sum;
      } else {
        totalDebitsMinorUnits += sum;
      }
    }

    const currency = this.resolveCurrency(entity.country, wallet?.currency ?? null);

    return {
      businessEntityId,
      currency,
      currentBalanceMinorUnits: totalCreditsMinorUnits - totalDebitsMinorUnits,
      totalCreditsMinorUnits,
      totalDebitsMinorUnits,
      remittanceCollectedMinorUnits: completedRemittances._sum.amountMinorUnits ?? 0,
      pendingRemittanceMinorUnits: pendingRemittances._sum.amountMinorUnits ?? 0,
      overdueRemittanceCount: overdueRemittances,
      disputedRemittanceCount: disputedCount,
      ledgerEntryCount: entryCount,
    };
  }

  async getProfitAndLoss(
    tenantId: string,
    businessEntityId: string,
    filters: GetAccountingProfitAndLossDto = {},
  ): Promise<AccountingProfitAndLossResponseDto> {
    const entity = await this.getBusinessEntity(tenantId, businessEntityId);
    const wallet = await this.prisma.operationalWallet.findUnique({
      where: { businessEntityId },
      select: { id: true, currency: true },
    });
    const createdAt = this.toDateRange(filters);

    const [revenueAggregate, expenseEntries] = await Promise.all([
      this.prisma.remittance.aggregate({
        where: {
          tenantId,
          businessEntityId,
          status: { in: ['completed', 'partially_settled'] },
          ...(createdAt ? { createdAt } : {}),
        },
        _sum: { amountMinorUnits: true },
      }),
      wallet
        ? this.prisma.operationalWalletEntry.findMany({
            where: {
              walletId: wallet.id,
              type: { in: ['debit', 'reversal'] },
              ...(createdAt ? { createdAt } : {}),
            },
            select: {
              type: true,
              referenceType: true,
              description: true,
              amountMinorUnits: true,
            },
          })
        : Promise.resolve([]),
    ]);

    const revenueMinorUnits = revenueAggregate._sum.amountMinorUnits ?? 0;
    const expenseBreakdownMap = new Map<string, number>();
    let expenseMinorUnits = 0;
    for (const entry of expenseEntries) {
      expenseMinorUnits += entry.amountMinorUnits;
      const category = this.getEntryCategory(entry.referenceType, entry.description);
      expenseBreakdownMap.set(category, (expenseBreakdownMap.get(category) ?? 0) + entry.amountMinorUnits);
    }

    return {
      businessEntityId,
      currency: this.resolveCurrency(entity.country, wallet?.currency ?? null),
      dateFrom: filters.dateFrom ?? null,
      dateTo: filters.dateTo ?? null,
      revenueMinorUnits,
      expenseMinorUnits,
      netProfitMinorUnits: revenueMinorUnits - expenseMinorUnits,
      revenueBreakdown: [{ category: 'remittance_collection', amountMinorUnits: revenueMinorUnits }],
      expenseBreakdown: Array.from(expenseBreakdownMap.entries())
        .map(([category, amountMinorUnits]) => ({ category, amountMinorUnits }))
        .sort((left, right) => right.amountMinorUnits - left.amountMinorUnits),
    };
  }
}
