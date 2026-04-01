import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { PrismaService } from '../database/prisma.service';
import type { CpPlatformWallet, CpWalletEntry } from '../generated/prisma';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { ApiCoreTenantsClient } from '../tenants/api-core-tenants.client';
import type { CreatePlatformWalletEntryDto } from './dto/create-platform-wallet-entry.dto';
import type { PlatformWalletBalanceDto } from './dto/platform-wallet-balance.dto';
import type {
  PaginatedPlatformWalletLedgerDto,
  PlatformWalletLedgerItemDto,
} from './dto/platform-wallet-ledger-item.dto';
import type { PlatformWalletSummaryDto } from './dto/platform-wallet-summary.dto';

@Injectable()
export class PlatformWalletsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly subscriptionsService: SubscriptionsService,
    private readonly apiCoreTenantsClient: ApiCoreTenantsClient,
  ) {}

  private resolveBootstrapCurrency(countryCode?: string | null): string | undefined {
    if (!countryCode) {
      return undefined;
    }
    return countryCode.trim().toUpperCase() === 'NG' ? 'NGN' : 'USD';
  }

  private async ensureWalletScaffoldedForTenant(params: {
    tenantId: string;
    countryCode?: string | null;
  }): Promise<void> {
    const bootstrapCurrency = this.resolveBootstrapCurrency(params.countryCode);

    await this.subscriptionsService
      .ensureBootstrapSubscription({
        tenantId: params.tenantId,
        ...(bootstrapCurrency ? { currency: bootstrapCurrency } : {}),
      })
      .catch(() => undefined);

    const currency = await this.resolveTenantBillingCurrency(params.tenantId).catch(() => null);
    if (!currency) {
      return;
    }

    await this.getOrCreateWallet(params.tenantId, currency);
  }

  async listWalletSummaries(): Promise<PlatformWalletSummaryDto[]> {
    const tenants = await this.apiCoreTenantsClient.listTenants().catch(() => []);
    await Promise.all(
      tenants.map((tenant) =>
        this.ensureWalletScaffoldedForTenant({
          tenantId: tenant.id,
          countryCode: tenant.country,
        }).catch(() => undefined),
      ),
    );

    const wallets = await this.prisma.cpPlatformWallet.findMany({
      include: {
        entries: {
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            type: true,
            amountMinorUnits: true,
            createdAt: true,
          },
        },
      },
      orderBy: [{ updatedAt: 'desc' }, { createdAt: 'desc' }],
    });

    return wallets.map((wallet) => {
      let balanceMinorUnits = 0;

      for (const entry of wallet.entries) {
        if (entry.type === 'credit') {
          balanceMinorUnits += entry.amountMinorUnits;
        } else {
          balanceMinorUnits -= entry.amountMinorUnits;
        }
      }

      return {
        walletId: wallet.id,
        tenantId: wallet.tenantId,
        currency: wallet.currency,
        balanceMinorUnits,
        entryCount: wallet.entries.length,
        lastEntryAt: wallet.entries[0]?.createdAt ?? null,
        createdAt: wallet.createdAt,
        updatedAt: wallet.updatedAt,
      };
    });
  }

  async getOrCreateWallet(tenantId: string, currency: string): Promise<CpPlatformWallet> {
    return this.prisma.cpPlatformWallet.upsert({
      where: { tenantId },
      create: {
        tenantId,
        currency,
      },
      update: {},
    });
  }

  async getWalletByTenant(tenantId: string): Promise<CpPlatformWallet> {
    let wallet = await this.prisma.cpPlatformWallet.findUnique({
      where: { tenantId },
    });

    if (!wallet) {
      const tenant = await this.apiCoreTenantsClient.getTenant(tenantId).catch(() => null);
      await this.ensureWalletScaffoldedForTenant({
        tenantId,
        ...(tenant?.country ? { countryCode: tenant.country } : {}),
      }).catch(() => undefined);

      wallet = await this.prisma.cpPlatformWallet.findUnique({
        where: { tenantId },
      });
    }

    if (!wallet) {
      throw new NotFoundException(`No platform wallet found for tenant '${tenantId}'`);
    }

    return wallet;
  }

  async listEntries(tenantId: string): Promise<CpWalletEntry[]> {
    const wallet = await this.getWalletByTenant(tenantId);

    return this.prisma.cpWalletEntry.findMany({
      where: { walletId: wallet.id },
      orderBy: { createdAt: 'desc' },
    });
  }

  async listLedger(page = 1, limit = 50): Promise<PaginatedPlatformWalletLedgerDto> {
    const [entries, total] = await Promise.all([
      this.prisma.cpWalletEntry.findMany({
        include: {
          wallet: {
            select: {
              id: true,
              tenantId: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.cpWalletEntry.count(),
    ]);

    return {
      data: entries.map<PlatformWalletLedgerItemDto>((entry) => ({
        id: entry.id,
        walletId: entry.walletId,
        tenantId: entry.wallet.tenantId,
        type: entry.type,
        amountMinorUnits: entry.amountMinorUnits,
        currency: entry.currency,
        referenceId: entry.referenceId,
        referenceType: entry.referenceType,
        description: entry.description,
        createdAt: entry.createdAt,
      })),
      total,
      page,
      limit,
    };
  }

  async getBalance(tenantId: string): Promise<PlatformWalletBalanceDto> {
    const wallet = await this.getWalletByTenant(tenantId);
    const grouped = await this.prisma.cpWalletEntry.groupBy({
      by: ['type'],
      where: { walletId: wallet.id },
      _sum: { amountMinorUnits: true },
    });

    let credits = 0;
    let debits = 0;

    for (const row of grouped) {
      const sum = row._sum.amountMinorUnits ?? 0;
      if (row.type === 'credit') {
        credits += sum;
      } else {
        debits += sum;
      }
    }

    return {
      walletId: wallet.id,
      tenantId,
      currency: wallet.currency,
      balanceMinorUnits: credits - debits,
    };
  }

  async createEntry(tenantId: string, dto: CreatePlatformWalletEntryDto): Promise<CpWalletEntry> {
    const wallet = await this.getOrCreateWallet(tenantId, dto.currency);
    this.assertWalletCurrency(wallet.currency, dto.currency);

    if (dto.type !== 'credit') {
      const balance = await this.getBalance(tenantId);
      if (dto.amountMinorUnits > balance.balanceMinorUnits) {
        throw new BadRequestException(
          `Insufficient platform wallet balance for tenant '${tenantId}'`,
        );
      }
    }

    return this.prisma.cpWalletEntry.create({
      data: {
        walletId: wallet.id,
        type: dto.type,
        amountMinorUnits: dto.amountMinorUnits,
        currency: dto.currency,
        referenceId: dto.referenceId ?? null,
        referenceType: dto.referenceType ?? null,
        description: dto.description ?? null,
      },
    });
  }

  async hasEntryForReference(
    tenantId: string,
    referenceId: string,
    referenceType: string,
  ): Promise<boolean> {
    const wallet = await this.getWalletByTenant(tenantId);
    const existing = await this.prisma.cpWalletEntry.findFirst({
      where: {
        walletId: wallet.id,
        referenceId,
        referenceType,
      },
    });

    return existing !== null;
  }

  async recordVerificationCharge(params: {
    tenantId: string;
    amountMinorUnits: number;
    referenceId: string;
    description?: string;
  }): Promise<CpWalletEntry> {
    const currency = await this.resolveTenantBillingCurrency(params.tenantId);

    return this.createEntry(params.tenantId, {
      type: 'debit',
      amountMinorUnits: params.amountMinorUnits,
      currency,
      referenceId: params.referenceId,
      referenceType: 'verification_fee',
      ...(params.description ? { description: params.description } : {}),
    });
  }

  private async resolveTenantBillingCurrency(tenantId: string): Promise<string> {
    const wallet = await this.prisma.cpPlatformWallet.findUnique({
      where: { tenantId },
    });
    if (wallet) {
      return wallet.currency;
    }

    const subscription = await this.prisma.cpSubscription.findUnique({
      where: { tenantId },
      include: {
        plan: {
          select: { currency: true },
        },
      },
    });

    if (!subscription) {
      throw new NotFoundException(`Unable to resolve billing currency for tenant '${tenantId}'`);
    }

    return subscription.plan.currency;
  }

  private assertWalletCurrency(walletCurrency: string, entryCurrency: string): void {
    if (walletCurrency !== entryCurrency) {
      throw new BadRequestException(
        `Platform wallet currency is '${walletCurrency}' but entry currency is '${entryCurrency}'`,
      );
    }
  }
}
