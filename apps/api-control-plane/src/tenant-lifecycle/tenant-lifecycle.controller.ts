import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { PlatformAuthGuard } from '../auth/guards/platform-auth.guard';
import { TenantLifecycleEventResponseDto } from './dto/tenant-lifecycle-event-response.dto';
import { TenantLifecycleStateResponseDto } from './dto/tenant-lifecycle-state-response.dto';
// biome-ignore lint/style/useImportType: DTO classes are used by Nest decorators at runtime.
import { TransitionTenantLifecycleDto } from './dto/transition-tenant-lifecycle.dto';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { TenantLifecycleService } from './tenant-lifecycle.service';

@ApiTags('Tenant Lifecycle')
@ApiBearerAuth()
@UseGuards(PlatformAuthGuard)
@Controller('tenant-lifecycle')
export class TenantLifecycleController {
  constructor(private readonly tenantLifecycleService: TenantLifecycleService) {}

  @Get('tenant/:tenantId')
  @ApiOkResponse({ type: TenantLifecycleStateResponseDto })
  async getCurrentState(
    @Param('tenantId') tenantId: string,
  ): Promise<TenantLifecycleStateResponseDto> {
    const subscription = await this.tenantLifecycleService.getCurrentState(tenantId);
    return {
      tenantId: subscription.tenantId,
      subscriptionId: subscription.id,
      status: subscription.status,
      currentPeriodStart: subscription.currentPeriodStart,
      currentPeriodEnd: subscription.currentPeriodEnd,
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
      enforcement: this.tenantLifecycleService.resolveEnforcementState(subscription),
    };
  }

  @Get('tenant/:tenantId/events')
  @ApiOkResponse({ type: [TenantLifecycleEventResponseDto] })
  listEvents(@Param('tenantId') tenantId: string): Promise<TenantLifecycleEventResponseDto[]> {
    return this.tenantLifecycleService.listEvents(tenantId);
  }

  @Post('tenant/:tenantId/transition')
  @ApiCreatedResponse({ type: TenantLifecycleStateResponseDto })
  async transitionTenant(
    @Param('tenantId') tenantId: string,
    @Body() dto: TransitionTenantLifecycleDto,
  ): Promise<TenantLifecycleStateResponseDto> {
    const subscription = await this.tenantLifecycleService.transitionTenant({
      tenantId,
      toStatus: dto.toStatus,
      triggeredBy: 'platform_admin',
      ...(dto.actorId ? { actorId: dto.actorId } : {}),
      ...(dto.reason ? { reason: dto.reason } : {}),
    });
    return {
      tenantId: subscription.tenantId,
      subscriptionId: subscription.id,
      status: subscription.status,
      currentPeriodStart: subscription.currentPeriodStart,
      currentPeriodEnd: subscription.currentPeriodEnd,
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
      enforcement: this.tenantLifecycleService.resolveEnforcementState(subscription),
    };
  }
}
