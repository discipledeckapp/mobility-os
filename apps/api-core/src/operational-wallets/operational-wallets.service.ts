import { asTenantId, assertTenantOwnership } from '@mobility-os/tenancy-domain';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import type { OperationalWallet, OperationalWalletEntry } from '@prisma/client';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { PrismaService } from '../database/prisma.service';
import type { CreateWalletEntryDto, WalletBalanceResponseDto } from './dto/wallet-entry.dto';

@Injectable()
export class OperationalWalletsService {
  constructor(private readonly prisma: PrismaService) {}

  private async getOrCreateWithClient(
    prisma: PrismaService | Prisma.TransactionClient,
    tenantId: string,
    businessEntityId: string,
    currency: string,
  ): Promise<OperationalWallet> {
    const entity = await prisma.businessEntity.findUnique({
      where: { id: businessEntityId },
    });

    if (!entity) {
      throw new NotFoundException(`BusinessEntity '${businessEntityId}' not found`);
    }

    assertTenantOwnership(asTenantId(entity.tenantId), asTenantId(tenantId));

    return prisma.operationalWallet.upsert({
      where: { businessEntityId },
      create: { tenantId, businessEntityId, currency },
      update: {},
    });
  }

  /**
   * Returns the operational wallet for a business entity, creating it if it
   * does not yet exist. Uses upsert to handle concurrent first-access races.
   */
  async getOrCreate(
    tenantId: string,
    businessEntityId: string,
    currency: string,
  ): Promise<OperationalWallet> {
    return this.getOrCreateWithClient(this.prisma, tenantId, businessEntityId, currency);
  }

  async findByBusinessEntity(
    tenantId: string,
    businessEntityId: string,
  ): Promise<OperationalWallet> {
    const wallet = await this.prisma.operationalWallet.findUnique({
      where: { businessEntityId },
    });

    if (!wallet) {
      throw new NotFoundException(
        `No operational wallet found for BusinessEntity '${businessEntityId}'`,
      );
    }

    assertTenantOwnership(asTenantId(wallet.tenantId), asTenantId(tenantId));

    return wallet;
  }

  async getBalance(tenantId: string, businessEntityId: string): Promise<WalletBalanceResponseDto> {
    const wallet = await this.findByBusinessEntity(tenantId, businessEntityId);

    // Balance = SUM(credit entries) - SUM(debit entries).
    // Reversal entries use type='debit' to undo a prior credit (or vice-versa),
    // so the standard formula holds without special-casing reversals.
    const result = await this.prisma.operationalWalletEntry.groupBy({
      by: ['type'],
      where: { walletId: wallet.id },
      _sum: { amountMinorUnits: true },
    });

    let credits = 0;
    let debits = 0;

    for (const row of result) {
      const sum = row._sum.amountMinorUnits ?? 0;
      if (row.type === 'credit') credits = sum;
      else debits += sum; // debit and reversal both subtract
    }

    return {
      walletId: wallet.id,
      businessEntityId,
      currency: wallet.currency,
      balanceMinorUnits: credits - debits,
      updatedAt: wallet.updatedAt,
    };
  }

  async addEntry(
    tenantId: string,
    businessEntityId: string,
    dto: CreateWalletEntryDto,
  ): Promise<OperationalWalletEntry> {
    const wallet = await this.findByBusinessEntity(tenantId, businessEntityId);

    if (wallet.currency !== dto.currency) {
      throw new BadRequestException(
        `Wallet currency is '${wallet.currency}' but entry currency is '${dto.currency}'. All entries must use the wallet currency.`,
      );
    }

    // Guard against negative balance on debit/reversal.
    if (dto.type !== 'credit') {
      const { balanceMinorUnits } = await this.getBalance(tenantId, businessEntityId);
      if (dto.amountMinorUnits > balanceMinorUnits) {
        throw new BadRequestException(
          `Insufficient balance: attempting to ${dto.type} ${dto.amountMinorUnits} but current balance is ${balanceMinorUnits}`,
        );
      }
    }

    return this.prisma.operationalWalletEntry.create({
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

  async addEntryInTransaction(
    prisma: Prisma.TransactionClient,
    tenantId: string,
    businessEntityId: string,
    dto: CreateWalletEntryDto,
  ): Promise<OperationalWalletEntry> {
    const wallet = await this.getOrCreateWithClient(
      prisma,
      tenantId,
      businessEntityId,
      dto.currency,
    );

    if (wallet.currency !== dto.currency) {
      throw new BadRequestException(
        `Wallet currency is '${wallet.currency}' but entry currency is '${dto.currency}'. All entries must use the wallet currency.`,
      );
    }

    if (dto.type !== 'credit') {
      const result = await prisma.operationalWalletEntry.groupBy({
        by: ['type'],
        where: { walletId: wallet.id },
        _sum: { amountMinorUnits: true },
      });

      let credits = 0;
      let debits = 0;

      for (const row of result) {
        const sum = row._sum.amountMinorUnits ?? 0;
        if (row.type === 'credit') credits = sum;
        else debits += sum;
      }

      const balanceMinorUnits = credits - debits;
      if (dto.amountMinorUnits > balanceMinorUnits) {
        throw new BadRequestException(
          `Insufficient balance: attempting to ${dto.type} ${dto.amountMinorUnits} but current balance is ${balanceMinorUnits}`,
        );
      }
    }

    return prisma.operationalWalletEntry.create({
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

  async listEntries(tenantId: string, businessEntityId: string): Promise<OperationalWalletEntry[]> {
    const wallet = await this.findByBusinessEntity(tenantId, businessEntityId);

    return this.prisma.operationalWalletEntry.findMany({
      where: { walletId: wallet.id },
      orderBy: { createdAt: 'desc' },
    });
  }
}
