import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TenantBillingSubscriptionDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  planId!: string;

  @ApiProperty()
  planName!: string;

  @ApiProperty()
  planTier!: string;

  @ApiProperty()
  currency!: string;

  @ApiProperty()
  features!: Record<string, unknown>;

  @ApiProperty()
  status!: string;

  @ApiProperty()
  currentPeriodStart!: string;

  @ApiProperty()
  currentPeriodEnd!: string;

  @ApiProperty()
  cancelAtPeriodEnd!: boolean;

  @ApiPropertyOptional()
  trialEndsAt?: string | null;
}

export class TenantBillingPlanDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  tier!: string;

  @ApiProperty()
  billingInterval!: string;

  @ApiProperty()
  basePriceMinorUnits!: number;

  @ApiProperty()
  currency!: string;

  @ApiProperty()
  isActive!: boolean;

  @ApiProperty()
  features!: Record<string, unknown>;
}

export class TenantBillingInvoiceDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  subscriptionId!: string;

  @ApiProperty()
  status!: string;

  @ApiProperty()
  amountDueMinorUnits!: number;

  @ApiProperty()
  amountPaidMinorUnits!: number;

  @ApiProperty()
  currency!: string;

  @ApiProperty()
  periodStart!: string;

  @ApiProperty()
  periodEnd!: string;

  @ApiPropertyOptional()
  dueAt?: string | null;

  @ApiPropertyOptional()
  paidAt?: string | null;
}

export class TenantBillingPlatformWalletEntryDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  type!: string;

  @ApiProperty()
  amountMinorUnits!: number;

  @ApiProperty()
  currency!: string;

  @ApiPropertyOptional()
  referenceId?: string | null;

  @ApiPropertyOptional()
  referenceType?: string | null;

  @ApiPropertyOptional()
  description?: string | null;

  @ApiProperty()
  createdAt!: string;
}

export class TenantBillingPlatformWalletDto {
  @ApiProperty()
  walletId!: string;

  @ApiProperty()
  currency!: string;

  @ApiProperty()
  balanceMinorUnits!: number;

  @ApiProperty({ type: [TenantBillingPlatformWalletEntryDto] })
  entries!: TenantBillingPlatformWalletEntryDto[];
}

export class TenantBillingSummaryDto {
  @ApiProperty({ type: TenantBillingSubscriptionDto })
  subscription!: TenantBillingSubscriptionDto;

  @ApiProperty({ type: [TenantBillingInvoiceDto] })
  invoices!: TenantBillingInvoiceDto[];

  @ApiPropertyOptional({ type: TenantBillingInvoiceDto })
  outstandingInvoice?: TenantBillingInvoiceDto | null;

  @ApiProperty({ type: TenantBillingPlatformWalletDto })
  verificationWallet!: TenantBillingPlatformWalletDto;

  @ApiProperty()
  customerEmail!: string;

  @ApiProperty()
  customerName!: string;
}

export class TenantPaymentCheckoutDto {
  @ApiProperty()
  provider!: string;

  @ApiProperty()
  reference!: string;

  @ApiProperty()
  checkoutUrl!: string;

  @ApiPropertyOptional()
  accessCode?: string;

  @ApiProperty()
  purpose!: string;
}

export class TenantPaymentApplicationDto {
  @ApiProperty()
  provider!: string;

  @ApiProperty()
  reference!: string;

  @ApiProperty()
  purpose!: string;

  @ApiProperty()
  status!: string;

  @ApiProperty()
  amountMinorUnits!: number;

  @ApiProperty()
  currency!: string;

  @ApiPropertyOptional()
  invoiceId?: string;
}
