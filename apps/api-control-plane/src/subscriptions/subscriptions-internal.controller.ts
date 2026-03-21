import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { InternalServiceAuthGuard } from '../auth/guards/internal-service-auth.guard';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { SubscriptionsService } from './subscriptions.service';

@ApiExcludeController()
@UseGuards(InternalServiceAuthGuard)
@Controller('internal/subscriptions')
export class SubscriptionsInternalController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get('tenant/:tenantId')
  getByTenant(@Param('tenantId') tenantId: string) {
    return this.subscriptionsService.getTenantSubscriptionSummary(tenantId);
  }
}
