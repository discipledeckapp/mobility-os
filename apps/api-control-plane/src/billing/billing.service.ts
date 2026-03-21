import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { PrismaService } from '../database/prisma.service';
import type { CpInvoice, Prisma } from '../generated/prisma';
import type { CreateInvoiceDto } from './dto/create-invoice.dto';
import type { GenerateInvoiceDto } from './dto/generate-invoice.dto';

type JsonObject = Record<string, Prisma.JsonValue>;

const INVOICE_STATUS = {
  Draft: 'draft',
  Open: 'open',
  Paid: 'paid',
  Void: 'void',
  Uncollectible: 'uncollectible',
} as const;

interface VerificationBillingPolicyCountrySetting {
  countryCode: string;
  enabled: boolean;
  meterEventType: 'identity_verification';
  defaultFeeMinorUnits: number;
  billOnStatuses: string[];
  providers: Array<{
    name: string;
    enabled: boolean;
    feeMinorUnits?: number;
  }>;
}

type InvoiceWithLineItems = Prisma.CpInvoiceGetPayload<{
  include: { lineItems: { orderBy: { createdAt: 'asc' } } };
}>;

interface DraftInvoiceLineItem {
  kind: string;
  description: string;
  quantity: number;
  unitAmountMinorUnits: number;
  amountMinorUnits: number;
  metadata?: Prisma.InputJsonValue;
}

@Injectable()
export class BillingService {
  constructor(private readonly prisma: PrismaService) {}

  async listInvoices(filters?: {
    tenantId?: string;
    subscriptionId?: string;
    status?: string;
  }): Promise<InvoiceWithLineItems[]> {
    return this.prisma.cpInvoice.findMany({
      where: {
        ...(filters?.tenantId ? { tenantId: filters.tenantId } : {}),
        ...(filters?.subscriptionId ? { subscriptionId: filters.subscriptionId } : {}),
        ...(filters?.status ? { status: filters.status } : {}),
      },
      include: { lineItems: { orderBy: { createdAt: 'asc' } } },
      orderBy: [{ periodStart: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async getInvoice(id: string): Promise<InvoiceWithLineItems> {
    const invoice = await this.prisma.cpInvoice.findUnique({
      where: { id },
      include: { lineItems: { orderBy: { createdAt: 'asc' } } },
    });

    if (!invoice) {
      throw new NotFoundException(`Invoice '${id}' not found`);
    }

    return invoice;
  }

  async createInvoice(dto: CreateInvoiceDto): Promise<CpInvoice> {
    const subscription = await this.prisma.cpSubscription.findUnique({
      where: { id: dto.subscriptionId },
      include: { plan: true },
    });

    if (!subscription) {
      throw new NotFoundException(`Subscription '${dto.subscriptionId}' not found`);
    }

    if (subscription.tenantId !== dto.tenantId) {
      throw new BadRequestException(
        `Subscription '${dto.subscriptionId}' does not belong to tenant '${dto.tenantId}'`,
      );
    }

    if (subscription.plan.currency !== dto.currency) {
      throw new BadRequestException(
        `Invoice currency '${dto.currency}' must match subscription plan currency '${subscription.plan.currency}'`,
      );
    }

    const periodStart = new Date(dto.periodStart);
    const periodEnd = new Date(dto.periodEnd);
    if (periodEnd <= periodStart) {
      throw new BadRequestException('Invoice periodEnd must be later than periodStart');
    }

    return this.prisma.cpInvoice.create({
      data: {
        tenantId: dto.tenantId,
        subscriptionId: dto.subscriptionId,
        status: dto.status ?? INVOICE_STATUS.Draft,
        amountDueMinorUnits: dto.amountDueMinorUnits,
        amountPaidMinorUnits: 0,
        currency: dto.currency,
        periodStart,
        periodEnd,
        dueAt: dto.dueAt ? new Date(dto.dueAt) : null,
        paidAt: null,
      },
    });
  }

  async openInvoice(id: string): Promise<CpInvoice> {
    const invoice = await this.getInvoice(id);

    if (invoice.status !== INVOICE_STATUS.Draft) {
      throw new BadRequestException(
        `Only draft invoices can be opened (current: '${invoice.status}')`,
      );
    }

    return this.prisma.cpInvoice.update({
      where: { id },
      data: { status: INVOICE_STATUS.Open },
    });
  }

  async markPaid(id: string, paidAt?: string): Promise<CpInvoice> {
    const invoice = await this.getInvoice(id);

    if (invoice.status === INVOICE_STATUS.Void || invoice.status === INVOICE_STATUS.Uncollectible) {
      throw new BadRequestException(
        `Invoice '${id}' in status '${invoice.status}' cannot be marked paid`,
      );
    }

    if (invoice.status === INVOICE_STATUS.Paid) {
      throw new BadRequestException(`Invoice '${id}' is already paid`);
    }

    return this.prisma.cpInvoice.update({
      where: { id },
      data: {
        status: INVOICE_STATUS.Paid,
        amountPaidMinorUnits: invoice.amountDueMinorUnits,
        paidAt: paidAt ? new Date(paidAt) : new Date(),
      },
    });
  }

  async voidInvoice(id: string): Promise<CpInvoice> {
    const invoice = await this.getInvoice(id);

    if (invoice.status === INVOICE_STATUS.Paid) {
      throw new BadRequestException(`Paid invoice '${id}' cannot be voided`);
    }

    if (invoice.status === INVOICE_STATUS.Void) {
      throw new BadRequestException(`Invoice '${id}' is already void`);
    }

    return this.prisma.cpInvoice.update({
      where: { id },
      data: { status: INVOICE_STATUS.Void },
    });
  }

  async markUncollectible(id: string): Promise<CpInvoice> {
    const invoice = await this.getInvoice(id);

    if (invoice.status === INVOICE_STATUS.Paid) {
      throw new BadRequestException(`Paid invoice '${id}' cannot be marked uncollectible`);
    }

    if (invoice.status === INVOICE_STATUS.Void) {
      throw new BadRequestException(`Void invoice '${id}' cannot be marked uncollectible`);
    }

    if (invoice.status === INVOICE_STATUS.Uncollectible) {
      throw new BadRequestException(`Invoice '${id}' is already uncollectible`);
    }

    return this.prisma.cpInvoice.update({
      where: { id },
      data: { status: INVOICE_STATUS.Uncollectible },
    });
  }

  async generateInvoiceForSubscription(
    subscriptionId: string,
    dto: GenerateInvoiceDto = {},
  ): Promise<InvoiceWithLineItems> {
    const subscription = await this.prisma.cpSubscription.findUnique({
      where: { id: subscriptionId },
      include: { plan: true },
    });

    if (!subscription) {
      throw new NotFoundException(`Subscription '${subscriptionId}' not found`);
    }

    const periodStart = dto.periodStart
      ? new Date(dto.periodStart)
      : subscription.currentPeriodStart;
    const periodEnd = dto.periodEnd ? new Date(dto.periodEnd) : subscription.currentPeriodEnd;
    if (periodEnd <= periodStart) {
      throw new BadRequestException('Invoice periodEnd must be later than periodStart');
    }

    const existing = await this.prisma.cpInvoice.findFirst({
      where: {
        subscriptionId,
        periodStart,
        periodEnd,
        status: {
          not: INVOICE_STATUS.Void,
        },
      },
    });
    if (existing) {
      throw new BadRequestException(
        `A non-void invoice already exists for subscription '${subscriptionId}' and this billing period`,
      );
    }

    const lineItems: DraftInvoiceLineItem[] = [
      {
        kind: 'base_subscription_fee',
        description: `${subscription.plan.name} base subscription fee`,
        quantity: 1,
        unitAmountMinorUnits: subscription.plan.basePriceMinorUnits,
        amountMinorUnits: subscription.plan.basePriceMinorUnits,
      },
    ];

    const verificationPolicy = await this.getVerificationBillingPolicyMap();
    const usageEvents = await this.prisma.cpUsageEvent.findMany({
      where: {
        tenantId: subscription.tenantId,
        eventType: 'identity_verification',
        occurredAt: {
          gte: periodStart,
          lt: periodEnd,
        },
      },
      orderBy: { occurredAt: 'asc' },
    });

    const verificationUsageByCountry = new Map<
      string,
      { quantity: number; unitAmountMinorUnits: number }
    >();

    for (const event of usageEvents) {
      const countryCode = event.countryCode?.toUpperCase();
      if (!countryCode) {
        continue;
      }

      const policy = verificationPolicy.get(countryCode);
      if (!policy?.enabled) {
        continue;
      }

      const current = verificationUsageByCountry.get(countryCode) ?? {
        quantity: 0,
        unitAmountMinorUnits: policy.defaultFeeMinorUnits,
      };
      current.quantity += event.quantity;
      verificationUsageByCountry.set(countryCode, current);
    }

    for (const [countryCode, aggregate] of verificationUsageByCountry.entries()) {
      if (aggregate.quantity <= 0 || aggregate.unitAmountMinorUnits <= 0) {
        continue;
      }

      lineItems.push({
        kind: 'identity_verification_usage',
        description: `Identity verification usage for ${countryCode}`,
        quantity: aggregate.quantity,
        unitAmountMinorUnits: aggregate.unitAmountMinorUnits,
        amountMinorUnits: aggregate.quantity * aggregate.unitAmountMinorUnits,
        metadata: { countryCode },
      });
    }

    const amountDueMinorUnits = lineItems.reduce((sum, item) => sum + item.amountMinorUnits, 0);

    const invoice = await this.prisma.cpInvoice.create({
      data: {
        tenantId: subscription.tenantId,
        subscriptionId: subscription.id,
        status: dto.status === INVOICE_STATUS.Open ? INVOICE_STATUS.Open : INVOICE_STATUS.Draft,
        amountDueMinorUnits,
        amountPaidMinorUnits: 0,
        currency: subscription.plan.currency,
        periodStart,
        periodEnd,
        dueAt: dto.dueAt ? new Date(dto.dueAt) : null,
        paidAt: null,
        lineItems: {
          create: lineItems.map((item) => {
            const createInput: Prisma.CpInvoiceLineItemCreateWithoutInvoiceInput = {
              kind: item.kind,
              description: item.description,
              quantity: item.quantity,
              unitAmountMinorUnits: item.unitAmountMinorUnits,
              amountMinorUnits: item.amountMinorUnits,
            };
            if (item.metadata !== undefined) {
              createInput.metadata = item.metadata;
            }
            return createInput;
          }),
        },
      },
      include: { lineItems: { orderBy: { createdAt: 'asc' } } },
    });

    return invoice;
  }

  private async getVerificationBillingPolicyMap(): Promise<
    Map<string, VerificationBillingPolicyCountrySetting>
  > {
    const setting = await this.prisma.cpPlatformSetting.findUnique({
      where: { key: 'verification_billing_policy' },
    });
    if (!setting || !this.isJsonObject(setting.value)) {
      return new Map();
    }

    const settingObj = setting.value as JsonObject;
    const countries = Array.isArray(settingObj.countries) ? settingObj.countries : [];
    const entries = countries.flatMap(
      (country: Prisma.JsonValue): Array<[string, VerificationBillingPolicyCountrySetting]> => {
        if (!this.isJsonObject(country) || typeof country.countryCode !== 'string') {
          return [];
        }
        return [
          [
            country.countryCode.toUpperCase(),
            country as unknown as VerificationBillingPolicyCountrySetting,
          ],
        ];
      },
    );

    return new Map(entries);
  }

  private isJsonObject(value: Prisma.JsonValue): value is JsonObject {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }
}
