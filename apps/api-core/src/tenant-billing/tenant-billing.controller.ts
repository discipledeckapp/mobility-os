import { Permission } from '@mobility-os/authz-model';
import type { TenantContext } from '@mobility-os/tenancy-domain';
import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';
import { CurrentTenant } from '../auth/decorators/tenant-context.decorator';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { TenantAuthGuard } from '../auth/guards/tenant-auth.guard';
import { TenantLifecycleGuard } from '../auth/guards/tenant-lifecycle.guard';
import { InitializeCardSetupCheckoutDto } from './dto/initialize-card-setup-checkout.dto';
import { InitializeSubscriptionBillingSetupDto } from './dto/initialize-subscription-billing-setup.dto';
// biome-ignore lint/style/useImportType: DTO classes are used by Nest decorators at runtime.
import { InitializeTenantInvoicePaymentDto } from './dto/initialize-tenant-invoice-payment.dto';
// biome-ignore lint/style/useImportType: DTO classes are used by Nest decorators at runtime.
import { InitializeTenantWalletTopUpDto } from './dto/initialize-tenant-wallet-top-up.dto';
import {
  TenantBillingSummaryDto,
  TenantBillingPlanDto,
  TenantPaymentApplicationDto,
  TenantPaymentCheckoutDto,
} from './dto/tenant-billing-response.dto';
// biome-ignore lint/style/useImportType: DTO classes are used by Nest decorators at runtime.
import { VerifyTenantPaymentDto } from './dto/verify-tenant-payment.dto';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { TenantBillingService } from './tenant-billing.service';

@ApiTags('Tenant Billing')
@ApiBearerAuth()
@UseGuards(TenantAuthGuard, TenantLifecycleGuard)
@Controller('tenant-billing')
export class TenantBillingController {
  constructor(private readonly tenantBillingService: TenantBillingService) {}

  @Get('summary')
  @RequirePermissions(Permission.TenantsRead, Permission.OperationalWalletsRead)
  @UseGuards(PermissionsGuard)
  @ApiOkResponse({ type: TenantBillingSummaryDto })
  getSummary(@CurrentTenant() ctx: TenantContext): Promise<TenantBillingSummaryDto> {
    return this.tenantBillingService.getSummary(ctx.tenantId, ctx.userId);
  }

  @Get('plans')
  @RequirePermissions(Permission.TenantsRead)
  @UseGuards(PermissionsGuard)
  @ApiOkResponse({ type: [TenantBillingPlanDto] })
  listPlans(): Promise<TenantBillingPlanDto[]> {
    return this.tenantBillingService.listPlans();
  }

  @Post('subscription/change-plan/:planId')
  @RequirePermissions(Permission.TenantsWrite)
  @UseGuards(PermissionsGuard)
  @ApiOkResponse({ type: TenantBillingSummaryDto })
  async changePlan(
    @CurrentTenant() ctx: TenantContext,
    @Param('planId') planId: string,
  ): Promise<TenantBillingSummaryDto> {
    await this.tenantBillingService.changePlan(ctx.tenantId, planId);
    return this.tenantBillingService.getSummary(ctx.tenantId, ctx.userId);
  }

  @Post('wallet-top-ups/checkout')
  @RequirePermissions(Permission.OperationalWalletsWrite)
  @UseGuards(PermissionsGuard)
  @ApiCreatedResponse({ type: TenantPaymentCheckoutDto })
  initializeWalletTopUp(
    @CurrentTenant() ctx: TenantContext,
    @Body() dto: InitializeTenantWalletTopUpDto,
  ): Promise<TenantPaymentCheckoutDto> {
    return this.tenantBillingService.initializeWalletTopUp(ctx.tenantId, ctx.userId, dto);
  }

  @Post('card-setup/checkout')
  @RequirePermissions(Permission.OperationalWalletsWrite)
  @UseGuards(PermissionsGuard)
  @ApiCreatedResponse({ type: TenantPaymentCheckoutDto })
  initializeCardSetupCheckout(
    @CurrentTenant() ctx: TenantContext,
    @Body() dto: InitializeCardSetupCheckoutDto,
  ): Promise<TenantPaymentCheckoutDto> {
    return this.tenantBillingService.initializeCardSetupCheckout(ctx.tenantId, ctx.userId, dto);
  }

  @Post('invoice-checkouts')
  @RequirePermissions(Permission.OperationalWalletsWrite)
  @UseGuards(PermissionsGuard)
  @ApiCreatedResponse({ type: TenantPaymentCheckoutDto })
  initializeInvoicePayment(
    @CurrentTenant() ctx: TenantContext,
    @Body() dto: InitializeTenantInvoicePaymentDto,
  ): Promise<TenantPaymentCheckoutDto> {
    return this.tenantBillingService.initializeInvoicePayment(ctx.tenantId, ctx.userId, dto);
  }

  @Post('subscription/payment-method/checkout')
  @RequirePermissions(Permission.TenantsWrite)
  @UseGuards(PermissionsGuard)
  @ApiCreatedResponse({ type: TenantPaymentCheckoutDto })
  initializeSubscriptionBillingSetupCheckout(
    @CurrentTenant() ctx: TenantContext,
    @Body() dto: InitializeSubscriptionBillingSetupDto,
  ): Promise<TenantPaymentCheckoutDto> {
    return this.tenantBillingService.initializeSubscriptionBillingSetupCheckout(
      ctx.tenantId,
      ctx.userId,
      dto,
    );
  }

  @Post('payments/verify-and-apply')
  @RequirePermissions(Permission.OperationalWalletsWrite)
  @UseGuards(PermissionsGuard)
  @ApiOkResponse({ type: TenantPaymentApplicationDto })
  verifyAndApply(
    @CurrentTenant() ctx: TenantContext,
    @Body() dto: VerifyTenantPaymentDto,
  ): Promise<TenantPaymentApplicationDto> {
    return this.tenantBillingService.verifyAndApply(ctx.tenantId, dto);
  }
}
