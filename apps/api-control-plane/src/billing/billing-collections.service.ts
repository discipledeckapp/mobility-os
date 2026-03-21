import { Inject, Injectable, NotFoundException, forwardRef } from '@nestjs/common';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { PrismaService } from '../database/prisma.service';
import type { Prisma } from '../generated/prisma';
import { PaymentsService } from '../payments/payments.service';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { PlatformWalletsService } from '../platform-wallets/platform-wallets.service';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { TenantLifecycleService } from '../tenant-lifecycle/tenant-lifecycle.service';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { BillingService } from './billing.service';
import type { CreateCollectionReminderDto } from './dto/create-collection-reminder.dto';
import type { CreateCollectionRetryCheckoutDto } from './dto/create-collection-retry-checkout.dto';
import type { RunCollectionsDto } from './dto/run-collections.dto';

type CollectionsOutcome =
  | 'settled_from_platform_wallet'
  | 'marked_past_due'
  | 'already_past_due'
  | 'already_paid'
  | 'skipped';

@Injectable()
export class BillingCollectionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly billingService: BillingService,
    private readonly platformWalletsService: PlatformWalletsService,
    @Inject(forwardRef(() => PaymentsService))
    private readonly paymentsService: PaymentsService,
    private readonly tenantLifecycleService: TenantLifecycleService,
  ) {}

  async runOverdueInvoices(dto: RunCollectionsDto = {}): Promise<{
    processedAt: string;
    invoiceCount: number;
    results: Array<{
      invoiceId: string;
      tenantId: string;
      subscriptionId: string;
      status: string;
      amountOutstandingMinorUnits: number;
      currency: string;
      collectionOutcome: CollectionsOutcome;
      subscriptionStatus: string;
    }>;
  }> {
    const asOf = dto.asOf ? new Date(dto.asOf) : new Date();
    const invoices = await this.prisma.cpInvoice.findMany({
      where: {
        status: 'open',
        dueAt: {
          not: null,
          lte: asOf,
        },
      },
      include: {
        subscription: true,
      },
      orderBy: [{ dueAt: 'asc' }, { createdAt: 'asc' }],
    });

    const results = [];
    for (const invoice of invoices) {
      results.push(
        await this.runForInvoice(invoice.id, {
          ...dto,
          asOf: asOf.toISOString(),
        }),
      );
    }

    return {
      processedAt: asOf.toISOString(),
      invoiceCount: results.length,
      results,
    };
  }

  async runForInvoice(
    invoiceId: string,
    dto: RunCollectionsDto = {},
  ): Promise<{
    invoiceId: string;
    tenantId: string;
    subscriptionId: string;
    status: string;
    amountOutstandingMinorUnits: number;
    currency: string;
    collectionOutcome: CollectionsOutcome;
    subscriptionStatus: string;
  }> {
    const invoice = await this.prisma.cpInvoice.findUnique({
      where: { id: invoiceId },
      include: {
        subscription: true,
      },
    });

    if (!invoice) {
      throw new NotFoundException(`Invoice '${invoiceId}' not found`);
    }

    const outstandingAmount = invoice.amountDueMinorUnits - invoice.amountPaidMinorUnits;
    if (invoice.status === 'paid' || outstandingAmount <= 0) {
      return {
        invoiceId: invoice.id,
        tenantId: invoice.tenantId,
        subscriptionId: invoice.subscriptionId,
        status: invoice.status,
        amountOutstandingMinorUnits: Math.max(outstandingAmount, 0),
        currency: invoice.currency,
        collectionOutcome: 'already_paid',
        subscriptionStatus: invoice.subscription.status,
      };
    }

    const autoSettleFromWallet = dto.autoSettleFromWallet ?? true;
    if (autoSettleFromWallet) {
      try {
        const balance = await this.platformWalletsService.getBalance(invoice.tenantId);
        if (balance.balanceMinorUnits >= outstandingAmount) {
          await this.platformWalletsService.createEntry(invoice.tenantId, {
            type: 'debit',
            amountMinorUnits: outstandingAmount,
            currency: invoice.currency,
            referenceId: invoice.id,
            referenceType: 'invoice',
            description: `Settlement of overdue invoice '${invoice.id}' from platform wallet`,
          });
          await this.billingService.markPaid(invoice.id);

          const subscription = invoice.subscription.cancelAtPeriodEnd
            ? invoice.subscription
            : await this.tenantLifecycleService.markPaymentRecovered({
                tenantId: invoice.tenantId,
                invoiceId: invoice.id,
                provider: 'platform_wallet',
                referenceId: invoice.id,
              });

          return {
            invoiceId: invoice.id,
            tenantId: invoice.tenantId,
            subscriptionId: invoice.subscriptionId,
            status: 'paid',
            amountOutstandingMinorUnits: 0,
            currency: invoice.currency,
            collectionOutcome: 'settled_from_platform_wallet',
            subscriptionStatus: subscription.status,
          };
        }
      } catch (error) {
        if (!(error instanceof NotFoundException)) {
          throw error;
        }
      }
    }

    const subscription =
      invoice.subscription.status === 'past_due'
        ? invoice.subscription
        : await this.tenantLifecycleService.markPaymentFailed({
            tenantId: invoice.tenantId,
            invoiceId: invoice.id,
          });

    return {
      invoiceId: invoice.id,
      tenantId: invoice.tenantId,
      subscriptionId: invoice.subscriptionId,
      status: invoice.status,
      amountOutstandingMinorUnits: outstandingAmount,
      currency: invoice.currency,
      collectionOutcome:
        invoice.subscription.status === 'past_due' ? 'already_past_due' : 'marked_past_due',
      subscriptionStatus: subscription.status,
    };
  }

  async createReminder(invoiceId: string, dto: CreateCollectionReminderDto) {
    const invoice = await this.requireCollectibleInvoice(invoiceId);
    const createInput: Prisma.CpCollectionAttemptCreateInput = {
      invoice: {
        connect: { id: invoice.id },
      },
      tenantId: invoice.tenantId,
      subscriptionId: invoice.subscriptionId,
      kind: 'reminder',
      status: 'queued',
      channel: dto.channel,
      provider: null,
      paymentReference: null,
    };

    if (dto.note) {
      createInput.metadata = { note: dto.note };
    }

    return this.prisma.cpCollectionAttempt.create({
      data: createInput,
    });
  }

  async initiateRetryCheckout(invoiceId: string, dto: CreateCollectionRetryCheckoutDto) {
    const invoice = await this.requireCollectibleInvoice(invoiceId);
    const checkout = await this.paymentsService.initializeInvoicePayment({
      provider: dto.provider,
      invoiceId: invoice.id,
      customerEmail: dto.customerEmail,
      ...(dto.customerName ? { customerName: dto.customerName } : {}),
      ...(dto.redirectUrl ? { redirectUrl: dto.redirectUrl } : {}),
    });

    const attempt = await this.prisma.cpCollectionAttempt.create({
      data: {
        invoiceId: invoice.id,
        tenantId: invoice.tenantId,
        subscriptionId: invoice.subscriptionId,
        kind: 'retry_checkout',
        status: 'checkout_initialized',
        channel: 'provider_checkout',
        provider: dto.provider,
        paymentReference: checkout.reference,
        metadata: {
          purpose: checkout.purpose,
          checkoutUrl: checkout.checkoutUrl,
          ...(checkout.accessCode ? { accessCode: checkout.accessCode } : {}),
        },
      },
    });

    return {
      ...attempt,
      checkoutUrl: checkout.checkoutUrl,
      ...(checkout.accessCode ? { accessCode: checkout.accessCode } : {}),
    };
  }

  private async requireCollectibleInvoice(invoiceId: string) {
    const invoice = await this.prisma.cpInvoice.findUnique({
      where: { id: invoiceId },
      include: {
        subscription: true,
      },
    });

    if (!invoice) {
      throw new NotFoundException(`Invoice '${invoiceId}' not found`);
    }

    const outstandingAmount = invoice.amountDueMinorUnits - invoice.amountPaidMinorUnits;
    if (invoice.status !== 'open' || outstandingAmount <= 0) {
      throw new NotFoundException(`Invoice '${invoiceId}' is not an open collectible invoice`);
    }

    if (
      invoice.subscription.status !== 'past_due' &&
      (!invoice.dueAt || invoice.dueAt > new Date())
    ) {
      throw new NotFoundException(`Invoice '${invoiceId}' is not yet due for collections`);
    }

    return invoice;
  }
}
