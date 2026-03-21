import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { InternalServiceAuthGuard } from '../auth/guards/internal-service-auth.guard';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { TenantLifecycleService } from './tenant-lifecycle.service';

@ApiExcludeController()
@UseGuards(InternalServiceAuthGuard)
@Controller('internal/tenant-lifecycle')
export class TenantLifecycleInternalController {
  constructor(private readonly tenantLifecycleService: TenantLifecycleService) {}

  @Get('tenant/:tenantId')
  async getCurrentState(@Param('tenantId') tenantId: string): Promise<{
    tenantId: string;
    subscriptionId: string;
    status: string;
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
    cancelAtPeriodEnd: boolean;
  }> {
    const subscription = await this.tenantLifecycleService.getCurrentState(tenantId);
    return {
      tenantId: subscription.tenantId,
      subscriptionId: subscription.id,
      status: subscription.status,
      currentPeriodStart: subscription.currentPeriodStart,
      currentPeriodEnd: subscription.currentPeriodEnd,
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
    };
  }
}
