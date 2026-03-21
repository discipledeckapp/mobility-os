import { Injectable } from '@nestjs/common';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { PrismaService } from '../database/prisma.service';
import type { CpPlan, CpSubscription } from '../generated/prisma';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { PlatformWalletsService } from '../platform-wallets/platform-wallets.service';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { BillingService } from './billing.service';
import type { RunBillingCycleDto } from './dto/run-billing-cycle.dto';

type BillingRunSubscription = CpSubscription & {
  plan: Pick<CpPlan, 'billingInterval'>;
};

type BillingRunInvoiceResult = {
  invoiceId: string;
  status: string;
  amountDueMinorUnits: number;
  currency: string;
  settlementOutcome:
    | 'settled_from_platform_wallet'
    | 'insufficient_platform_wallet_balance'
    | 'already_paid'
    | 'skipped';
};

type BillingRunSubscriptionResult = {
  subscriptionId: string;
  tenantId: string;
  cyclesProcessed: number;
  finalStatus: string;
  invoices: BillingRunInvoiceResult[];
};

@Injectable()
export class BillingRunsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly billingService: BillingService,
    private readonly platformWalletsService: PlatformWalletsService,
  ) {}

  async runDueSubscriptions(dto: RunBillingCycleDto = {}): Promise<{
    processedAt: string;
    subscriptionCount: number;
    results: BillingRunSubscriptionResult[];
  }> {
    const asOf = dto.asOf ? new Date(dto.asOf) : new Date();
    const subscriptions = await this.prisma.cpSubscription.findMany({
      where: {
        status: { in: ['active', 'trialing', 'past_due'] },
        currentPeriodEnd: { lte: asOf },
      },
      include: {
        plan: {
          select: { billingInterval: true },
        },
      },
      orderBy: { currentPeriodEnd: 'asc' },
    });

    const results: BillingRunSubscriptionResult[] = [];
    for (const subscription of subscriptions) {
      results.push(
        await this.runForSubscription(subscription.id, {
          ...dto,
          asOf: asOf.toISOString(),
        }),
      );
    }

    return {
      processedAt: asOf.toISOString(),
      subscriptionCount: results.length,
      results,
    };
  }

  async runForSubscription(
    subscriptionId: string,
    dto: RunBillingCycleDto = {},
  ): Promise<BillingRunSubscriptionResult> {
    const asOf = dto.asOf ? new Date(dto.asOf) : new Date();
    let subscription = await this.getSubscription(subscriptionId);
    const invoices: BillingRunInvoiceResult[] = [];
    let cyclesProcessed = 0;
    const autoSettleFromWallet = dto.autoSettleFromWallet ?? true;

    while (
      subscription.currentPeriodEnd <= asOf &&
      ['active', 'trialing', 'past_due'].includes(subscription.status) &&
      cyclesProcessed < 24
    ) {
      const invoice = await this.ensureOpenInvoiceForCurrentPeriod(subscription.id, {
        periodStart: subscription.currentPeriodStart.toISOString(),
        periodEnd: subscription.currentPeriodEnd.toISOString(),
        dueAt: subscription.currentPeriodEnd.toISOString(),
        status: 'open',
      });

      const settlementOutcome = autoSettleFromWallet
        ? await this.trySettleInvoiceFromPlatformWallet(invoice.id)
        : 'skipped';

      invoices.push({
        invoiceId: invoice.id,
        status: settlementOutcome === 'settled_from_platform_wallet' ? 'paid' : invoice.status,
        amountDueMinorUnits: invoice.amountDueMinorUnits,
        currency: invoice.currency,
        settlementOutcome,
      });

      cyclesProcessed += 1;

      if (subscription.cancelAtPeriodEnd) {
        subscription = await this.prisma.cpSubscription.update({
          where: { id: subscription.id },
          data: { status: 'canceled' },
          include: {
            plan: {
              select: { billingInterval: true },
            },
          },
        });
        break;
      }

      const nextPeriodStart = subscription.currentPeriodEnd;
      const nextPeriodEnd = this.addBillingInterval(
        nextPeriodStart,
        subscription.plan.billingInterval,
      );

      subscription = await this.prisma.cpSubscription.update({
        where: { id: subscription.id },
        data: {
          currentPeriodStart: nextPeriodStart,
          currentPeriodEnd: nextPeriodEnd,
          status: 'active',
        },
        include: {
          plan: {
            select: { billingInterval: true },
          },
        },
      });
    }

    return {
      subscriptionId: subscription.id,
      tenantId: subscription.tenantId,
      cyclesProcessed,
      finalStatus: subscription.status,
      invoices,
    };
  }

  private async ensureOpenInvoiceForCurrentPeriod(
    subscriptionId: string,
    dto: {
      periodStart: string;
      periodEnd: string;
      dueAt: string;
      status: 'open' | 'draft';
    },
  ) {
    const existing = await this.prisma.cpInvoice.findFirst({
      where: {
        subscriptionId,
        periodStart: new Date(dto.periodStart),
        periodEnd: new Date(dto.periodEnd),
        status: { not: 'void' },
      },
      include: { lineItems: { orderBy: { createdAt: 'asc' } } },
    });

    if (!existing) {
      return this.billingService.generateInvoiceForSubscription(subscriptionId, dto);
    }

    if (existing.status === 'draft' && dto.status === 'open') {
      return this.billingService.openInvoice(existing.id);
    }

    return existing;
  }

  private async trySettleInvoiceFromPlatformWallet(
    invoiceId: string,
  ): Promise<BillingRunInvoiceResult['settlementOutcome']> {
    const invoice = await this.billingService.getInvoice(invoiceId);
    if (invoice.status === 'paid') {
      return 'already_paid';
    }

    const balance = await this.platformWalletsService.getBalance(invoice.tenantId);
    const outstandingAmount = invoice.amountDueMinorUnits - invoice.amountPaidMinorUnits;
    if (balance.balanceMinorUnits < outstandingAmount) {
      return 'insufficient_platform_wallet_balance';
    }

    await this.platformWalletsService.createEntry(invoice.tenantId, {
      type: 'debit',
      amountMinorUnits: outstandingAmount,
      currency: invoice.currency,
      referenceId: invoice.id,
      referenceType: 'invoice',
      description: `Settlement of invoice '${invoice.id}' from platform wallet`,
    });
    await this.billingService.markPaid(invoice.id);

    return 'settled_from_platform_wallet';
  }

  private async getSubscription(subscriptionId: string): Promise<BillingRunSubscription> {
    const subscription = await this.prisma.cpSubscription.findUnique({
      where: { id: subscriptionId },
      include: {
        plan: {
          select: { billingInterval: true },
        },
      },
    });

    if (!subscription) {
      throw new Error(`Subscription '${subscriptionId}' not found`);
    }

    return subscription;
  }

  private addBillingInterval(date: Date, billingInterval: string): Date {
    const nextDate = new Date(date);
    if (billingInterval === 'annual') {
      nextDate.setUTCFullYear(nextDate.getUTCFullYear() + 1);
      return nextDate;
    }

    nextDate.setUTCMonth(nextDate.getUTCMonth() + 1);
    return nextDate;
  }
}
