import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import { InternalServiceAuthGuard } from '../auth/guards/internal-service-auth.guard';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { SubscriptionsService } from './subscriptions.service';

class BootstrapSubscriptionDto {
  @IsString()
  tenantId!: string;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  trialDays?: number;
}

@ApiExcludeController()
@UseGuards(InternalServiceAuthGuard)
@Controller('internal/subscriptions')
export class SubscriptionsInternalController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get('tenant/:tenantId')
  getByTenant(@Param('tenantId') tenantId: string) {
    return this.subscriptionsService.getTenantSubscriptionSummary(tenantId);
  }

  @Get('plans')
  listPlans() {
    return this.subscriptionsService.listActivePlans();
  }

  @Post('bootstrap')
  bootstrap(@Body() dto: BootstrapSubscriptionDto) {
    return this.subscriptionsService.ensureBootstrapSubscription(dto);
  }

  @Post('tenant/:tenantId/change-plan/:planId')
  changePlan(@Param('tenantId') tenantId: string, @Param('planId') planId: string) {
    return this.subscriptionsService.changePlan(tenantId, planId);
  }
}
