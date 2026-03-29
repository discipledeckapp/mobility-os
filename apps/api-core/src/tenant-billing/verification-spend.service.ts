import { randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { getVerificationTierDescriptor, type VerificationTier } from '../tenants/tenant-settings';
import { PrismaService } from '../database/prisma.service';
import { ControlPlaneBillingClient } from './control-plane-billing.client';
import { PaymentTokenEncryptionService } from './payment-token-encryption.service';

const STARTER_CREDIT_MINOR_UNITS = 500_000;
const CARD_CREDIT_LIMIT_MINOR_UNITS = 1_500_000;

type BillingProfileRow = {
  id: string;
  tenantId: string;
  currency: string;
  starterCreditGrantedAt: Date | null;
  starterCreditAmountMinorUnits: number;
  cardCreditLimitMinorUnits: number;
  cardActivatedAt: Date | null;
  metadata: Prisma.JsonValue | null;
  createdAt: Date;
  updatedAt: Date;
};

type SavedCardRow = {
  id: string;
  tenantId: string;
  provider: string;
  authorizationCodeCiphertext: string;
  customerCodeCiphertext: string;
  last4: string;
  brand: string;
  status: string;
  initialReference: string | null;
  metadata: Prisma.JsonValue | null;
  createdAt: Date;
  updatedAt: Date;
};

type ChargeUsageRow = {
  fundingSource: string;
  amountMinorUnits: number | null;
};

export type TenantSavedCardSummary = {
  provider: string;
  last4: string;
  brand: string;
  status: string;
  active: boolean;
  createdAt: string;
  initialReference: string | null;
} | null;

export type VerificationSpendSummary = {
  currency: string;
  walletBalanceMinorUnits: number;
  creditLimitMinorUnits: number;
  creditUsedMinorUnits: number;
  availableSpendMinorUnits: number;
  starterCreditActive: boolean;
  starterCreditEligible: boolean;
  cardCreditActive: boolean;
  unlockedTiers: VerificationTier[];
  savedCard: TenantSavedCardSummary;
};

@Injectable()
export class VerificationSpendService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly controlPlaneBillingClient: ControlPlaneBillingClient,
    private readonly paymentTokenEncryptionService: PaymentTokenEncryptionService,
  ) {}

  async getSpendSummary(tenantId: string, currency: string): Promise<VerificationSpendSummary> {
    await this.maybeGrantStarterCredit(tenantId, currency);
    const [profile, savedCardRow, walletBalance, chargeUsage, starterEligible] = await Promise.all([
      this.getOrCreateBillingProfile(tenantId, currency),
      this.getSavedCardRow(tenantId),
      this.getPlatformWalletBalance(tenantId),
      this.getCreditUsage(tenantId),
      this.isStarterCreditEligible(tenantId),
    ]);

    const creditLimitMinorUnits =
      (profile.starterCreditGrantedAt ? profile.starterCreditAmountMinorUnits : 0) +
      (savedCardRow?.status === 'active' ? profile.cardCreditLimitMinorUnits : 0);
    const creditUsedMinorUnits = chargeUsage;
    const availableCreditMinorUnits = Math.max(0, creditLimitMinorUnits - creditUsedMinorUnits);
    const unlockedTiers: VerificationTier[] =
      savedCardRow?.status === 'active'
        ? ['BASIC_IDENTITY', 'VERIFIED_IDENTITY', 'FULL_TRUST_VERIFICATION']
        : profile.starterCreditGrantedAt
          ? ['BASIC_IDENTITY']
          : [];

    return {
      currency,
      walletBalanceMinorUnits: walletBalance,
      creditLimitMinorUnits,
      creditUsedMinorUnits,
      availableSpendMinorUnits: walletBalance + availableCreditMinorUnits,
      starterCreditActive: Boolean(profile.starterCreditGrantedAt),
      starterCreditEligible: starterEligible,
      cardCreditActive: savedCardRow?.status === 'active',
      unlockedTiers,
      savedCard: savedCardRow
        ? {
            provider: savedCardRow.provider,
            last4: savedCardRow.last4,
            brand: savedCardRow.brand,
            status: savedCardRow.status,
            active: savedCardRow.status === 'active',
            createdAt: savedCardRow.createdAt.toISOString(),
            initialReference: savedCardRow.initialReference,
          }
        : null,
    };
  }

  async saveAuthorizedCard(input: {
    tenantId: string;
    provider: string;
    authorizationCode: string;
    customerCode: string;
    last4: string;
    brand: string;
    initialReference: string;
    currency: string;
    metadata?: Record<string, unknown>;
  }): Promise<void> {
    await this.getOrCreateBillingProfile(input.tenantId, input.currency);
    await this.prisma.$executeRaw(Prisma.sql`
      INSERT INTO "tenant_saved_cards" (
        "id",
        "tenantId",
        "provider",
        "authorizationCodeCiphertext",
        "customerCodeCiphertext",
        "last4",
        "brand",
        "status",
        "initialReference",
        "metadata",
        "createdAt",
        "updatedAt"
      ) VALUES (
        ${randomUUID()},
        ${input.tenantId},
        ${input.provider},
        ${this.paymentTokenEncryptionService.encrypt(input.authorizationCode)},
        ${this.paymentTokenEncryptionService.encrypt(input.customerCode)},
        ${input.last4},
        ${input.brand},
        ${'active'},
        ${input.initialReference},
        ${JSON.stringify(input.metadata ?? {})}::jsonb,
        NOW(),
        NOW()
      )
      ON CONFLICT ("tenantId")
      DO UPDATE SET
        "provider" = EXCLUDED."provider",
        "authorizationCodeCiphertext" = EXCLUDED."authorizationCodeCiphertext",
        "customerCodeCiphertext" = EXCLUDED."customerCodeCiphertext",
        "last4" = EXCLUDED."last4",
        "brand" = EXCLUDED."brand",
        "status" = 'active',
        "initialReference" = EXCLUDED."initialReference",
        "metadata" = EXCLUDED."metadata",
        "updatedAt" = NOW()
    `);

    await this.prisma.$executeRaw(Prisma.sql`
      UPDATE "verification_billing_profiles"
      SET
        "cardActivatedAt" = COALESCE("cardActivatedAt", NOW()),
        "cardCreditLimitMinorUnits" = ${CARD_CREDIT_LIMIT_MINOR_UNITS},
        "updatedAt" = NOW()
      WHERE "tenantId" = ${input.tenantId}
    `);
  }

  async getDecryptedCard(tenantId: string): Promise<{
    provider: string;
    authorizationCode: string;
    customerCode: string;
    last4: string;
    brand: string;
  } | null> {
    const savedCard = await this.getSavedCardRow(tenantId);
    if (!savedCard || savedCard.status !== 'active') {
      return null;
    }

    return {
      provider: savedCard.provider,
      authorizationCode: this.paymentTokenEncryptionService.decrypt(
        savedCard.authorizationCodeCiphertext,
      ),
      customerCode: this.paymentTokenEncryptionService.decrypt(savedCard.customerCodeCiphertext),
      last4: savedCard.last4,
      brand: savedCard.brand,
    };
  }

  async ensureVerificationSpendApplied(input: {
    tenantId: string;
    subjectType: 'driver' | 'guarantor';
    subjectId: string;
    verificationTier: VerificationTier;
    amountMinorUnits: number;
    currency: string;
    consentedByUserId?: string | null;
    consentedAt?: Date | null;
    description?: string;
    metadata?: Record<string, unknown>;
  }): Promise<
    | { status: 'already_applied'; fundingSource: string }
    | { status: 'applied'; fundingSource: 'wallet' | 'starter_credit' | 'card_credit' }
    | { status: 'insufficient'; spendSummary: VerificationSpendSummary; reason: string }
  > {
    const existing = await this.prisma.$queryRaw<Array<{ fundingSource: string }>>(Prisma.sql`
      SELECT "fundingSource"
      FROM "verification_charge_audits"
      WHERE "tenantId" = ${input.tenantId}
        AND "subjectType" = ${input.subjectType}
        AND "subjectId" = ${input.subjectId}
        AND "verificationTier" = ${input.verificationTier}
        AND "status" = 'applied'
      ORDER BY "createdAt" DESC
      LIMIT 1
    `);

    if (existing[0]) {
      return { status: 'already_applied', fundingSource: existing[0].fundingSource };
    }

    const spendSummary = await this.getSpendSummary(input.tenantId, input.currency);
    if (spendSummary.walletBalanceMinorUnits >= input.amountMinorUnits) {
      await this.controlPlaneBillingClient.recordVerificationCharge({
        tenantId: input.tenantId,
        amountMinorUnits: input.amountMinorUnits,
        referenceId: `${input.subjectType}_${input.subjectId}_${input.verificationTier}`,
        description:
          input.description ??
          `${getVerificationTierDescriptor(input.verificationTier).label} verification charge`,
      });
      await this.recordChargeAudit({ ...input, fundingSource: 'wallet' });
      return { status: 'applied', fundingSource: 'wallet' };
    }

    const availableCreditMinorUnits = Math.max(
      0,
      spendSummary.creditLimitMinorUnits - spendSummary.creditUsedMinorUnits,
    );
    const canUseStarterCredit =
      spendSummary.starterCreditActive &&
      input.verificationTier === 'BASIC_IDENTITY' &&
      availableCreditMinorUnits >= input.amountMinorUnits;
    if (canUseStarterCredit) {
      await this.recordChargeAudit({ ...input, fundingSource: 'starter_credit' });
      return { status: 'applied', fundingSource: 'starter_credit' };
    }

    const canUseCardCredit =
      spendSummary.cardCreditActive && availableCreditMinorUnits >= input.amountMinorUnits;
    if (canUseCardCredit) {
      await this.recordChargeAudit({ ...input, fundingSource: 'card_credit' });
      return { status: 'applied', fundingSource: 'card_credit' };
    }

    return {
      status: 'insufficient',
      spendSummary,
      reason: spendSummary.savedCard
        ? 'Verification credit is exhausted. Approve a new card charge before continuing.'
        : 'No active card or credit is available for this verification tier.',
    };
  }

  private async recordChargeAudit(input: {
    tenantId: string;
    subjectType: 'driver' | 'guarantor';
    subjectId: string;
    verificationTier: VerificationTier;
    amountMinorUnits: number;
    currency: string;
    fundingSource: 'wallet' | 'starter_credit' | 'card_credit';
    consentedByUserId?: string | null;
    consentedAt?: Date | null;
    description?: string;
    metadata?: Record<string, unknown>;
  }): Promise<void> {
    await this.prisma.$executeRaw(Prisma.sql`
      INSERT INTO "verification_charge_audits" (
        "id",
        "tenantId",
        "subjectType",
        "subjectId",
        "verificationTier",
        "amountMinorUnits",
        "currency",
        "fundingSource",
        "status",
        "consentedByUserId",
        "consentedAt",
        "description",
        "metadata",
        "createdAt"
      ) VALUES (
        ${randomUUID()},
        ${input.tenantId},
        ${input.subjectType},
        ${input.subjectId},
        ${input.verificationTier},
        ${input.amountMinorUnits},
        ${input.currency},
        ${input.fundingSource},
        ${'applied'},
        ${input.consentedByUserId ?? null},
        ${input.consentedAt ?? null},
        ${input.description ?? null},
        ${JSON.stringify(input.metadata ?? {})}::jsonb,
        NOW()
      )
    `);
  }

  private async maybeGrantStarterCredit(tenantId: string, currency: string): Promise<void> {
    const eligible = await this.isStarterCreditEligible(tenantId);
    const profile = await this.getOrCreateBillingProfile(tenantId, currency);
    if (!eligible || profile.starterCreditGrantedAt) {
      return;
    }

    await this.prisma.$executeRaw(Prisma.sql`
      UPDATE "verification_billing_profiles"
      SET
        "starterCreditGrantedAt" = NOW(),
        "starterCreditAmountMinorUnits" = ${STARTER_CREDIT_MINOR_UNITS},
        "updatedAt" = NOW()
      WHERE "tenantId" = ${tenantId}
    `);
  }

  private async isStarterCreditEligible(tenantId: string): Promise<boolean> {
    const [verifiedUserCount, driverCount, vehicleCount] = await Promise.all([
      this.prisma.user.count({
        where: { tenantId, isActive: true, isEmailVerified: true },
      }),
      this.prisma.driver.count({ where: { tenantId } }),
      this.prisma.vehicle.count({ where: { tenantId } }),
    ]);

    return verifiedUserCount > 0 && driverCount > 0 && vehicleCount > 0;
  }

  private async getPlatformWalletBalance(tenantId: string): Promise<number> {
    try {
      const balance = await this.controlPlaneBillingClient.getPlatformWalletBalance(tenantId);
      return balance.balanceMinorUnits;
    } catch {
      return 0;
    }
  }

  private async getCreditUsage(tenantId: string): Promise<number> {
    const rows = await this.prisma.$queryRaw<ChargeUsageRow[]>(Prisma.sql`
      SELECT "fundingSource", SUM("amountMinorUnits")::int AS "amountMinorUnits"
      FROM "verification_charge_audits"
      WHERE "tenantId" = ${tenantId}
        AND "status" = 'applied'
        AND "fundingSource" IN ('starter_credit', 'card_credit')
      GROUP BY "fundingSource"
    `);

    return rows.reduce((sum, row) => sum + (row.amountMinorUnits ?? 0), 0);
  }

  private async getOrCreateBillingProfile(
    tenantId: string,
    currency: string,
  ): Promise<BillingProfileRow> {
    await this.prisma.$executeRaw(Prisma.sql`
      INSERT INTO "verification_billing_profiles" (
        "id",
        "tenantId",
        "currency",
        "starterCreditAmountMinorUnits",
        "cardCreditLimitMinorUnits",
        "createdAt",
        "updatedAt"
      ) VALUES (
        ${randomUUID()},
        ${tenantId},
        ${currency},
        ${0},
        ${0},
        NOW(),
        NOW()
      )
      ON CONFLICT ("tenantId") DO NOTHING
    `);

    const rows = await this.prisma.$queryRaw<BillingProfileRow[]>(Prisma.sql`
      SELECT *
      FROM "verification_billing_profiles"
      WHERE "tenantId" = ${tenantId}
      LIMIT 1
    `);

    if (!rows[0]) {
      throw new Error(`Verification billing profile could not be created for tenant '${tenantId}'.`);
    }

    return rows[0];
  }

  private async getSavedCardRow(tenantId: string): Promise<SavedCardRow | null> {
    const rows = await this.prisma.$queryRaw<SavedCardRow[]>(Prisma.sql`
      SELECT *
      FROM "tenant_saved_cards"
      WHERE "tenantId" = ${tenantId}
      ORDER BY "updatedAt" DESC
      LIMIT 1
    `);
    return rows[0] ?? null;
  }
}
