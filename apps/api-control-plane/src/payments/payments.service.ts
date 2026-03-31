import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { ConfigService } from '@nestjs/config';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { BillingService } from '../billing/billing.service';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { PrismaService } from '../database/prisma.service';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { StaffNotificationService } from '../notifications/staff-notification.service';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { PlatformWalletsService } from '../platform-wallets/platform-wallets.service';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { ControlPlaneRecordsService } from '../records/records.service';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { TenantLifecycleService } from '../tenant-lifecycle/tenant-lifecycle.service';
import type { InitializeCardAuthorizationSetupDto } from './dto/initialize-card-authorization-setup.dto';
import type { InitializeDriverKycPaymentDto } from './dto/initialize-driver-kyc-payment.dto';
import type { InitializeIdentityVerificationPaymentDto } from './dto/initialize-identity-verification-payment.dto';
import type { InitializeInvoicePaymentDto } from './dto/initialize-invoice-payment.dto';
import type { InitializeSubscriptionBillingSetupDto } from './dto/initialize-subscription-billing-setup.dto';
import type { InitializeWalletTopUpDto } from './dto/initialize-wallet-top-up.dto';
import type { PaymentApplicationResponseDto } from './dto/payment-application-response.dto';
import type { PaymentCheckoutResponseDto } from './dto/payment-checkout-response.dto';
import type { VerifyAndApplyPaymentDto } from './dto/verify-and-apply-payment.dto';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { BillingPaymentMethodsService } from './billing-payment-methods.service';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { PaymentProvidersService } from './payment-providers.service';

type PaymentPurpose =
  | 'invoice_settlement'
  | 'platform_wallet_topup'
  | 'identity_verification'
  | 'card_authorization_setup'
  | 'subscription_billing_setup'
  | 'driver_kyc';

function getVerificationTierLabel(
  tier: 'BASIC_IDENTITY' | 'VERIFIED_IDENTITY' | 'FULL_TRUST_VERIFICATION',
): string {
  if (tier === 'FULL_TRUST_VERIFICATION') {
    return 'Full Trust Verification';
  }
  if (tier === 'VERIFIED_IDENTITY') {
    return 'Verified Identity';
  }
  return 'Basic Identity';
}

@Injectable()
export class PaymentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly billingService: BillingService,
    private readonly platformWalletsService: PlatformWalletsService,
    private readonly recordsService: ControlPlaneRecordsService,
    private readonly paymentProvidersService: PaymentProvidersService,
    private readonly configService: ConfigService,
    private readonly tenantLifecycleService: TenantLifecycleService,
    private readonly staffNotificationService: StaffNotificationService,
    private readonly billingPaymentMethodsService: BillingPaymentMethodsService,
  ) {}

  async initializeInvoicePayment(
    dto: InitializeInvoicePaymentDto,
  ): Promise<PaymentCheckoutResponseDto> {
    const invoice = await this.billingService.getInvoice(dto.invoiceId);
    if (invoice.status === 'paid' || invoice.status === 'void') {
      throw new BadRequestException(
        `Invoice '${dto.invoiceId}' in status '${invoice.status}' cannot start a new payment`,
      );
    }

    const reference = this.buildReference('invoice_settlement', dto.invoiceId, dto.provider);
    const redirectUrl = this.resolveRedirectUrl(dto.redirectUrl);
    const initialized = await this.paymentProvidersService.initializePayment({
      provider: dto.provider,
      reference,
      amountMinorUnits: invoice.amountDueMinorUnits - invoice.amountPaidMinorUnits,
      currency: invoice.currency,
      redirectUrl,
      customerEmail: dto.customerEmail,
      ...(dto.customerName ? { customerName: dto.customerName } : {}),
      description: `Mobility OS invoice payment for ${dto.invoiceId}`,
      metadata: {
        purpose: 'invoice_settlement',
        invoiceId: dto.invoiceId,
        tenantId: invoice.tenantId,
      },
    });

    await this.prisma.cpPaymentAttempt.create({
      data: {
        provider: dto.provider,
        reference,
        purpose: 'invoice_settlement',
        tenantId: invoice.tenantId,
        invoiceId: dto.invoiceId,
        status: 'checkout_initialized',
        amountMinorUnits: invoice.amountDueMinorUnits - invoice.amountPaidMinorUnits,
        currency: invoice.currency,
        customerEmail: dto.customerEmail,
        customerName: dto.customerName ?? null,
        checkoutUrl: initialized.checkoutUrl,
        accessCode: initialized.accessCode ?? null,
      },
    });

    return {
      provider: initialized.provider,
      reference,
      checkoutUrl: initialized.checkoutUrl,
      ...(initialized.accessCode ? { accessCode: initialized.accessCode } : {}),
      purpose: 'invoice_settlement',
    };
  }

  async initializeWalletTopUp(dto: InitializeWalletTopUpDto): Promise<PaymentCheckoutResponseDto> {
    const reference = this.buildReference('platform_wallet_topup', dto.tenantId, dto.provider);
    const redirectUrl = this.resolveRedirectUrl(dto.redirectUrl);
    const initialized = await this.paymentProvidersService.initializePayment({
      provider: dto.provider,
      reference,
      amountMinorUnits: dto.amountMinorUnits,
      currency: dto.currency,
      redirectUrl,
      customerEmail: dto.customerEmail,
      ...(dto.customerName ? { customerName: dto.customerName } : {}),
      description: `Mobility OS platform wallet top-up for tenant ${dto.tenantId}`,
      metadata: {
        purpose: 'platform_wallet_topup',
        tenantId: dto.tenantId,
      },
    });

    await this.prisma.cpPaymentAttempt.create({
      data: {
        provider: dto.provider,
        reference,
        purpose: 'platform_wallet_topup',
        tenantId: dto.tenantId,
        status: 'checkout_initialized',
        amountMinorUnits: dto.amountMinorUnits,
        currency: dto.currency,
        customerEmail: dto.customerEmail,
        customerName: dto.customerName ?? null,
        checkoutUrl: initialized.checkoutUrl,
        accessCode: initialized.accessCode ?? null,
      },
    });

    return {
      provider: initialized.provider,
      reference,
      checkoutUrl: initialized.checkoutUrl,
      ...(initialized.accessCode ? { accessCode: initialized.accessCode } : {}),
      purpose: 'platform_wallet_topup',
    };
  }

  async initializeCardAuthorizationSetup(
    dto: InitializeCardAuthorizationSetupDto,
  ): Promise<PaymentCheckoutResponseDto> {
    const reference = this.buildReference('card_authorization_setup', dto.tenantId, dto.provider);
    const redirectUrl = this.resolveRedirectUrl(dto.redirectUrl);
    const initialized = await this.paymentProvidersService.initializePayment({
      provider: dto.provider,
      reference,
      amountMinorUnits: dto.amountMinorUnits,
      currency: dto.currency,
      redirectUrl,
      customerEmail: dto.customerEmail,
      ...(dto.customerName ? { customerName: dto.customerName } : {}),
      description: `Mobiris card authorization setup for tenant ${dto.tenantId}`,
      metadata: {
        purpose: 'card_authorization_setup',
        tenantId: dto.tenantId,
      },
    });

    await this.prisma.cpPaymentAttempt.create({
      data: {
        provider: dto.provider,
        reference,
        purpose: 'card_authorization_setup',
        tenantId: dto.tenantId,
        status: 'checkout_initialized',
        amountMinorUnits: dto.amountMinorUnits,
        currency: dto.currency,
        customerEmail: dto.customerEmail,
        customerName: dto.customerName ?? null,
        checkoutUrl: initialized.checkoutUrl,
        accessCode: initialized.accessCode ?? null,
      },
    });

    return {
      provider: initialized.provider,
      reference,
      checkoutUrl: initialized.checkoutUrl,
      ...(initialized.accessCode ? { accessCode: initialized.accessCode } : {}),
      purpose: 'card_authorization_setup',
    };
  }

  async initializeSubscriptionBillingSetup(
    dto: InitializeSubscriptionBillingSetupDto,
  ): Promise<PaymentCheckoutResponseDto> {
    const reference = this.buildReference('subscription_billing_setup', dto.tenantId, dto.provider);
    const redirectUrl = this.resolveRedirectUrl(dto.redirectUrl);
    const initialized = await this.paymentProvidersService.initializePayment({
      provider: dto.provider,
      reference,
      amountMinorUnits: dto.amountMinorUnits,
      currency: dto.currency,
      redirectUrl,
      customerEmail: dto.customerEmail,
      ...(dto.customerName ? { customerName: dto.customerName } : {}),
      description: `Mobiris subscription billing payment method setup for tenant ${dto.tenantId}`,
      metadata: {
        purpose: 'subscription_billing_setup',
        tenantId: dto.tenantId,
      },
    });

    await this.prisma.cpPaymentAttempt.create({
      data: {
        provider: dto.provider,
        reference,
        purpose: 'subscription_billing_setup',
        tenantId: dto.tenantId,
        status: 'checkout_initialized',
        amountMinorUnits: dto.amountMinorUnits,
        currency: dto.currency,
        customerEmail: dto.customerEmail,
        customerName: dto.customerName ?? null,
        checkoutUrl: initialized.checkoutUrl,
        accessCode: initialized.accessCode ?? null,
      },
    });

    return {
      provider: initialized.provider,
      reference,
      checkoutUrl: initialized.checkoutUrl,
      ...(initialized.accessCode ? { accessCode: initialized.accessCode } : {}),
      purpose: 'subscription_billing_setup',
    };
  }

  private normalizePurpose(purpose: string): PaymentPurpose {
    if (purpose === 'driver_kyc') {
      return 'identity_verification';
    }

    return purpose as PaymentPurpose;
  }

  async initializeDriverKycPayment(
    dto: InitializeDriverKycPaymentDto,
  ): Promise<PaymentCheckoutResponseDto> {
    return this.initializeIdentityVerificationPayment({
      provider: dto.provider,
      tenantId: dto.tenantId,
      subjectType: 'driver',
      subjectId: dto.driverId,
      relatedDriverId: dto.driverId,
      currency: dto.currency,
      verificationTier: dto.verificationTier,
      amountMinorUnits: dto.amountMinorUnits,
      customerEmail: dto.customerEmail,
      ...(dto.customerName ? { customerName: dto.customerName } : {}),
      ...(dto.redirectUrl ? { redirectUrl: dto.redirectUrl } : {}),
    });
  }

  async initializeIdentityVerificationPayment(
    dto: InitializeIdentityVerificationPaymentDto,
  ): Promise<PaymentCheckoutResponseDto> {
    const currency = dto.currency.toUpperCase();
    const amountMinorUnits = dto.amountMinorUnits;
    const subjectReferenceKey = `${dto.subjectType}_${dto.subjectId}`;
    const reusableAttempt = await this.prisma.cpPaymentAttempt.findFirst({
      where: {
        provider: dto.provider,
        purpose: 'identity_verification',
        tenantId: dto.tenantId,
        customerEmail: dto.customerEmail,
        status: { in: ['checkout_initialized', 'provider_pending', 'webhook_received'] },
        reference: {
          startsWith: `mos_${dto.provider}_identity_verification_${subjectReferenceKey}_`,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (reusableAttempt?.checkoutUrl) {
      return {
        provider: dto.provider,
        reference: reusableAttempt.reference,
        checkoutUrl: reusableAttempt.checkoutUrl,
        ...(reusableAttempt.accessCode ? { accessCode: reusableAttempt.accessCode } : {}),
        purpose: 'identity_verification',
      };
    }

    const reference = this.buildReference(
      'identity_verification',
      subjectReferenceKey,
      dto.provider,
    );
    const redirectUrl = this.resolveRedirectUrl(dto.redirectUrl);
    const initialized = await this.paymentProvidersService.initializePayment({
      provider: dto.provider,
      reference,
      amountMinorUnits,
      currency,
      redirectUrl,
      customerEmail: dto.customerEmail,
      ...(dto.customerName ? { customerName: dto.customerName } : {}),
      description: `Mobiris ${getVerificationTierLabel(dto.verificationTier)} verification fee`,
      metadata: {
        purpose: 'identity_verification',
        tenantId: dto.tenantId,
        subjectType: dto.subjectType,
        subjectId: dto.subjectId,
        driverId: dto.relatedDriverId ?? (dto.subjectType === 'driver' ? dto.subjectId : null),
        verificationTier: dto.verificationTier,
      },
    });

    await this.prisma.cpPaymentAttempt.create({
      data: {
        provider: dto.provider,
        reference,
        purpose: 'identity_verification',
        tenantId: dto.tenantId,
        status: 'checkout_initialized',
        amountMinorUnits,
        currency,
        customerEmail: dto.customerEmail,
        customerName: dto.customerName ?? null,
        checkoutUrl: initialized.checkoutUrl,
        accessCode: initialized.accessCode ?? null,
      },
    });

    return {
      provider: initialized.provider,
      reference,
      checkoutUrl: initialized.checkoutUrl,
      ...(initialized.accessCode ? { accessCode: initialized.accessCode } : {}),
      purpose: 'identity_verification',
    };
  }

  async verifyAndApplyPayment(
    dto: VerifyAndApplyPaymentDto,
  ): Promise<PaymentApplicationResponseDto> {
    const attempt = await this.prisma.cpPaymentAttempt.findUnique({
      where: { reference: dto.reference },
    });
    const normalizedAttemptPurpose = attempt?.purpose
      ? this.normalizePurpose(attempt.purpose)
      : null;
    const normalizedDtoPurpose = this.normalizePurpose(dto.purpose);

    if (attempt?.status === 'applied') {
      const recoveredPaymentMethod =
        attempt.purpose === 'card_authorization_setup' ||
        attempt.purpose === 'subscription_billing_setup'
          ? this.extractPaymentMethodFromPayload(attempt.providerPayload)
          : undefined;
      return {
        provider: dto.provider,
        reference: dto.reference,
        purpose: normalizedAttemptPurpose ?? normalizedDtoPurpose,
        status: 'already_applied',
        amountMinorUnits: attempt.amountMinorUnits,
        currency: attempt.currency,
        ...(attempt.invoiceId ? { invoiceId: attempt.invoiceId } : {}),
        ...(attempt.tenantId ? { tenantId: attempt.tenantId } : {}),
        ...(dto.driverId ? { driverId: dto.driverId } : {}),
        ...(recoveredPaymentMethod ? { paymentMethod: recoveredPaymentMethod } : {}),
      };
    }
    const verified = await this.paymentProvidersService.verifyPayment(dto.provider, dto.reference);

    await this.prisma.cpPaymentAttempt.updateMany({
      where: { reference: dto.reference },
      data: {
        status:
          verified.status === 'successful'
            ? 'provider_verified'
            : verified.status === 'pending'
              ? 'provider_pending'
              : 'provider_failed',
        providerPayload: verified.providerPayload as never,
        failureReason:
          verified.status === 'failed' ? 'provider verification returned failed' : null,
        paidAt: verified.paidAt ? new Date(verified.paidAt) : null,
      },
    });

    if (verified.status !== 'successful') {
      throw new BadRequestException(
        `Payment reference '${dto.reference}' is '${verified.status}', not successful`,
      );
    }

    const purpose = normalizedAttemptPurpose ?? normalizedDtoPurpose;
    const invoiceId = attempt?.invoiceId ?? dto.invoiceId;
    const tenantId = attempt?.tenantId ?? dto.tenantId;

    if (purpose === 'invoice_settlement') {
      if (!invoiceId) {
        throw new BadRequestException(
          'invoiceId is required for invoice_settlement payment application',
        );
      }

      const invoice = await this.billingService.getInvoice(invoiceId);
      if (invoice.currency !== verified.currency) {
        throw new BadRequestException(
          `Verified payment currency '${verified.currency}' does not match invoice currency '${invoice.currency}'`,
        );
      }

      await this.billingService.markPaid(invoiceId, verified.paidAt);
      await this.tenantLifecycleService.markPaymentRecovered({
        tenantId: invoice.tenantId,
        invoiceId,
        provider: dto.provider,
        referenceId: dto.reference,
      });
      await this.prisma.cpPaymentAttempt.updateMany({
        where: { reference: dto.reference },
        data: {
          status: 'applied',
          appliedAt: new Date(),
        },
      });
      const receiptDocument = await this.recordsService.issueDocument({
        tenantId: invoice.tenantId,
        documentType: 'subscription_payment_receipt',
        issuerType: 'platform',
        issuerId: 'api-control-plane',
        recipientType: 'tenant',
        recipientId: invoice.tenantId,
        relatedEntityType: 'payment_attempt',
        relatedEntityId: dto.reference,
        title: `Subscription Payment Receipt ${dto.reference}`,
        subjectLines: [
          `Invoice: ${invoice.id}`,
          `Amount paid: ${verified.amountMinorUnits} ${verified.currency}`,
          `Provider: ${dto.provider}`,
          `Paid at: ${verified.paidAt ?? new Date().toISOString()}`,
          'Purpose: invoice settlement',
        ],
        canonicalPayload: {
          reference: dto.reference,
          invoiceId: invoice.id,
          amountMinorUnits: verified.amountMinorUnits,
          currency: verified.currency,
          provider: dto.provider,
          paidAt: verified.paidAt ?? null,
        },
      });
      const receiptPaidAt = verified.paidAt ?? new Date().toISOString();
      if (attempt?.customerEmail) {
        await this.staffNotificationService.sendSubscriptionPaymentReceipt({
          email: attempt.customerEmail,
          name: attempt.customerName ?? 'Customer',
          reference: dto.reference,
          amountMinorUnits: verified.amountMinorUnits,
          currency: verified.currency,
          provider: dto.provider,
          paidAt: receiptPaidAt,
          invoiceId: invoice.id,
          documentUrl: receiptDocument.fileUrl,
        });
      }

      return {
        provider: dto.provider,
        reference: dto.reference,
        purpose,
        status: 'applied',
        amountMinorUnits: verified.amountMinorUnits,
        currency: verified.currency,
        invoiceId,
      };
    }

    if (purpose === 'identity_verification') {
      await this.prisma.cpPaymentAttempt.updateMany({
        where: { reference: dto.reference },
        data: { status: 'applied', appliedAt: new Date() },
      });
      const receiptDocument = await this.recordsService.issueDocument({
        ...(tenantId ? { tenantId } : {}),
        documentType: 'verification_fee_receipt',
        issuerType: 'platform',
        issuerId: 'api-control-plane',
        recipientType: 'payer',
        recipientId: dto.driverId ?? tenantId ?? dto.reference,
        relatedEntityType: 'payment_attempt',
        relatedEntityId: dto.reference,
        title: `Verification Fee Receipt ${dto.reference}`,
        subjectLines: [
          `Reference: ${dto.reference}`,
          `Amount paid: ${verified.amountMinorUnits} ${verified.currency}`,
          `Provider: ${dto.provider}`,
          `Paid at: ${verified.paidAt ?? new Date().toISOString()}`,
          'Purpose: identity verification',
        ],
        canonicalPayload: {
          reference: dto.reference,
          tenantId: tenantId ?? null,
          driverId: dto.driverId ?? null,
          amountMinorUnits: verified.amountMinorUnits,
          currency: verified.currency,
          provider: dto.provider,
          paidAt: verified.paidAt ?? null,
        },
      });
      const receiptPaidAt = verified.paidAt ?? new Date().toISOString();
      if (attempt?.customerEmail) {
        await this.staffNotificationService.sendVerificationPaymentReceipt({
          email: attempt.customerEmail,
          name: attempt.customerName ?? 'Driver',
          reference: dto.reference,
          amountMinorUnits: verified.amountMinorUnits,
          currency: verified.currency,
          provider: dto.provider,
          paidAt: receiptPaidAt,
          documentUrl: receiptDocument.fileUrl,
        });
      }
      await this.staffNotificationService.notifyVerificationPaymentReceived({
        tenantId: tenantId ?? null,
        driverId: dto.driverId ?? null,
        payerEmail: attempt?.customerEmail ?? null,
        reference: dto.reference,
        amountMinorUnits: verified.amountMinorUnits,
        currency: verified.currency,
        provider: dto.provider,
        paidAt: receiptPaidAt,
        documentUrl: receiptDocument.fileUrl,
      });
      return {
        provider: dto.provider,
        reference: dto.reference,
        purpose,
        status: 'applied',
        amountMinorUnits: verified.amountMinorUnits,
        currency: verified.currency,
        tenantId: tenantId ?? '',
        ...(dto.driverId ? { driverId: dto.driverId } : {}),
        ...(verified.paymentMethod ? { paymentMethod: verified.paymentMethod } : {}),
      };
    }

    if (purpose === 'card_authorization_setup') {
      if (!tenantId) {
        throw new BadRequestException(
          'tenantId is required for card_authorization_setup payment application',
        );
      }

      const alreadyApplied = await this.platformWalletsService.hasEntryForReference(
        tenantId,
        dto.reference,
        'payment',
      );
      if (!alreadyApplied) {
        await this.platformWalletsService.createEntry(tenantId, {
          type: 'credit',
          amountMinorUnits: verified.amountMinorUnits,
          currency: verified.currency,
          referenceId: dto.reference,
          referenceType: 'payment',
          description: `${dto.provider} card authorization setup credit`,
        });
      }

      await this.prisma.cpPaymentAttempt.updateMany({
        where: { reference: dto.reference },
        data: {
          status: 'applied',
          appliedAt: new Date(),
        },
      });

      return {
        provider: dto.provider,
        reference: dto.reference,
        purpose,
        status: alreadyApplied ? 'already_applied' : 'applied',
        amountMinorUnits: verified.amountMinorUnits,
        currency: verified.currency,
        tenantId,
        ...(verified.paymentMethod ? { paymentMethod: verified.paymentMethod } : {}),
      };
    }

    if (purpose === 'subscription_billing_setup') {
      if (!tenantId) {
        throw new BadRequestException(
          'tenantId is required for subscription_billing_setup payment application',
        );
      }
      if (
        !verified.paymentMethod?.authorizationCode ||
        !verified.paymentMethod.customerCode ||
        !verified.paymentMethod.last4 ||
        !verified.paymentMethod.brand
      ) {
        throw new BadRequestException(
          'The payment provider did not return a reusable billing payment method.',
        );
      }

      await this.billingPaymentMethodsService.saveAuthorizedPaymentMethod({
        tenantId,
        provider: dto.provider,
        authorizationCode: verified.paymentMethod.authorizationCode,
        customerCode: verified.paymentMethod.customerCode,
        last4: verified.paymentMethod.last4,
        brand: verified.paymentMethod.brand,
        initialReference: dto.reference,
        metadata: {
          setupPurpose: 'subscription_billing_setup',
        },
      });

      await this.prisma.cpPaymentAttempt.updateMany({
        where: { reference: dto.reference },
        data: {
          status: 'applied',
          appliedAt: new Date(),
        },
      });

      return {
        provider: dto.provider,
        reference: dto.reference,
        purpose,
        status: 'applied',
        amountMinorUnits: verified.amountMinorUnits,
        currency: verified.currency,
        tenantId,
        ...(verified.paymentMethod ? { paymentMethod: verified.paymentMethod } : {}),
      };
    }

    if (!tenantId) {
      throw new BadRequestException(
        'tenantId is required for platform_wallet_topup payment application',
      );
    }

    const alreadyApplied = await this.platformWalletsService.hasEntryForReference(
      tenantId,
      dto.reference,
      'payment',
    );
    if (!alreadyApplied) {
      await this.platformWalletsService.createEntry(tenantId, {
        type: 'credit',
        amountMinorUnits: verified.amountMinorUnits,
        currency: verified.currency,
        referenceId: dto.reference,
        referenceType: 'payment',
        description: `${dto.provider} platform wallet top-up`,
      });
    }

    await this.prisma.cpPaymentAttempt.updateMany({
      where: { reference: dto.reference },
      data: {
        status: alreadyApplied ? 'applied' : 'applied',
        appliedAt: new Date(),
      },
    });
    const receiptDocument = await this.recordsService.issueDocument({
      tenantId,
      documentType: 'wallet_funding_receipt',
      issuerType: 'platform',
      issuerId: 'api-control-plane',
      recipientType: 'tenant',
      recipientId: tenantId,
      relatedEntityType: 'payment_attempt',
      relatedEntityId: dto.reference,
      title: `Wallet Funding Receipt ${dto.reference}`,
      subjectLines: [
        `Reference: ${dto.reference}`,
        `Amount paid: ${verified.amountMinorUnits} ${verified.currency}`,
        `Provider: ${dto.provider}`,
        `Paid at: ${verified.paidAt ?? new Date().toISOString()}`,
        'Purpose: platform wallet top-up',
      ],
      canonicalPayload: {
        reference: dto.reference,
        tenantId,
        amountMinorUnits: verified.amountMinorUnits,
        currency: verified.currency,
        provider: dto.provider,
        paidAt: verified.paidAt ?? null,
      },
    });
    const receiptPaidAt = verified.paidAt ?? new Date().toISOString();
    if (attempt?.customerEmail) {
      await this.staffNotificationService.sendWalletFundingReceipt({
        email: attempt.customerEmail,
        name: attempt.customerName ?? 'Customer',
        reference: dto.reference,
        amountMinorUnits: verified.amountMinorUnits,
        currency: verified.currency,
        provider: dto.provider,
        paidAt: receiptPaidAt,
        documentUrl: receiptDocument.fileUrl,
      });
    }

    return {
      provider: dto.provider,
      reference: dto.reference,
      purpose,
      status: alreadyApplied ? 'already_applied' : 'applied',
      amountMinorUnits: verified.amountMinorUnits,
      currency: verified.currency,
      tenantId,
    };
  }

  async handleWebhook(
    provider: 'flutterwave' | 'paystack',
    headers: Record<string, string | string[] | undefined>,
    payload: unknown,
  ): Promise<PaymentApplicationResponseDto> {
    this.paymentProvidersService.assertWebhookAuthentic(provider, headers, payload);
    const reference = this.paymentProvidersService.extractWebhookReference(provider, payload);
    const attempt = await this.prisma.cpPaymentAttempt.findUnique({
      where: { reference },
    });

    if (!attempt) {
      throw new NotFoundException(`Payment attempt for reference '${reference}' was not found`);
    }

    await this.prisma.cpPaymentAttempt.update({
      where: { reference },
      data: {
        status: 'webhook_received',
        providerPayload: payload as never,
      },
    });

    return this.verifyAndApplyPayment({
      provider,
      reference,
      purpose: this.normalizePurpose(attempt.purpose) as
        | 'invoice_settlement'
        | 'platform_wallet_topup'
        | 'identity_verification'
        | 'card_authorization_setup'
        | 'subscription_billing_setup',
      ...(attempt.invoiceId ? { invoiceId: attempt.invoiceId } : {}),
      ...(attempt.tenantId ? { tenantId: attempt.tenantId } : {}),
    });
  }

  async getBillingPaymentMethodSummary(tenantId: string) {
    const paymentMethod = await this.billingPaymentMethodsService.getSummary(tenantId);
    if (!paymentMethod) {
      throw new NotFoundException(`Billing payment method for tenant '${tenantId}' was not found`);
    }

    return paymentMethod;
  }

  async settleInvoiceFromPlatformWallet(invoiceId: string): Promise<PaymentApplicationResponseDto> {
    const invoice = await this.billingService.getInvoice(invoiceId);
    const settled = await this.platformWalletsService.createEntry(invoice.tenantId, {
      type: 'debit',
      amountMinorUnits: invoice.amountDueMinorUnits - invoice.amountPaidMinorUnits,
      currency: invoice.currency,
      referenceId: invoice.id,
      referenceType: 'invoice',
      description: `Settlement of invoice '${invoice.id}' from platform wallet`,
    });

    await this.billingService.markPaid(invoiceId);
    await this.tenantLifecycleService.markPaymentRecovered({
      tenantId: invoice.tenantId,
      invoiceId,
      provider: 'platform_wallet',
      referenceId: settled.referenceId ?? invoice.id,
    });

    return {
      provider: 'platform_wallet',
      reference: settled.referenceId ?? invoice.id,
      purpose: 'invoice_settlement',
      status: 'applied',
      amountMinorUnits: settled.amountMinorUnits,
      currency: settled.currency,
      invoiceId,
      tenantId: invoice.tenantId,
    };
  }

  private buildReference(
    purpose:
      | 'invoice_settlement'
      | 'platform_wallet_topup'
      | 'identity_verification'
      | 'card_authorization_setup'
      | 'subscription_billing_setup',
    targetId: string,
    provider: string,
  ): string {
    return `mos_${provider}_${purpose}_${targetId}_${Date.now()}`;
  }

  private resolveRedirectUrl(override?: string): string {
    const redirectUrl = override ?? this.configService.get<string>('BILLING_PAYMENT_RETURN_URL');
    if (!redirectUrl) {
      throw new BadRequestException(
        'redirectUrl is required when BILLING_PAYMENT_RETURN_URL is not configured',
      );
    }
    return redirectUrl;
  }

  private extractPaymentMethodFromPayload(payload: unknown): {
    authorizationCode?: string | null;
    customerCode?: string | null;
    last4?: string | null;
    brand?: string | null;
  } | undefined {
    if (!payload || typeof payload !== 'object') {
      return undefined;
    }

    const record = payload as Record<string, unknown>;
    const data =
      typeof record.data === 'object' && record.data !== null
        ? (record.data as Record<string, unknown>)
        : null;
    if (!data) {
      return undefined;
    }

    const authorization =
      typeof data.authorization === 'object' && data.authorization !== null
        ? (data.authorization as Record<string, unknown>)
        : null;
    const customer =
      typeof data.customer === 'object' && data.customer !== null
        ? (data.customer as Record<string, unknown>)
        : null;
    const card =
      typeof data.card === 'object' && data.card !== null
        ? (data.card as Record<string, unknown>)
        : null;

    const authorizationCode =
      typeof authorization?.authorization_code === 'string'
        ? authorization.authorization_code
        : typeof card?.token === 'string'
          ? card.token
          : null;
    const customerCode =
      typeof customer?.customer_code === 'string'
        ? customer.customer_code
        : typeof customer?.id === 'string'
          ? customer.id
          : typeof customer?.id === 'number'
            ? String(customer.id)
            : null;
    const last4 =
      typeof authorization?.last4 === 'string'
        ? authorization.last4
        : typeof card?.last_4digits === 'string'
          ? card.last_4digits
          : null;
    const brand =
      typeof authorization?.brand === 'string'
        ? authorization.brand
        : typeof card?.type === 'string'
          ? card.type
          : null;

    if (!authorizationCode && !customerCode && !last4 && !brand) {
      return undefined;
    }

    return {
      authorizationCode,
      customerCode,
      last4,
      brand,
    };
  }
}
