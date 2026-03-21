import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { PlatformAuthGuard } from '../auth/guards/platform-auth.guard';
// biome-ignore lint/style/useImportType: DTO classes are used by Nest decorators at runtime.
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { SubscriptionListItemDto } from './dto/subscription-list-item.dto';
import { SubscriptionResponseDto } from './dto/subscription-response.dto';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { SubscriptionsService } from './subscriptions.service';

@ApiTags('Subscriptions')
@ApiBearerAuth()
@UseGuards(PlatformAuthGuard)
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get()
  @ApiOkResponse({ type: [SubscriptionListItemDto] })
  listSubscriptions(): Promise<SubscriptionListItemDto[]> {
    return this.subscriptionsService.listSubscriptions();
  }

  @Get('tenant/:tenantId')
  @ApiOkResponse({ type: SubscriptionResponseDto })
  getByTenant(@Param('tenantId') tenantId: string): Promise<SubscriptionResponseDto> {
    return this.subscriptionsService.getByTenant(tenantId);
  }

  @Post()
  @ApiCreatedResponse({ type: SubscriptionResponseDto })
  createSubscription(@Body() dto: CreateSubscriptionDto): Promise<SubscriptionResponseDto> {
    return this.subscriptionsService.createSubscription(dto);
  }

  @Patch('tenant/:tenantId/cancel')
  @ApiOkResponse({
    type: SubscriptionResponseDto,
    description: 'Subscription set to cancel at period end',
  })
  cancelAtPeriodEnd(@Param('tenantId') tenantId: string): Promise<SubscriptionResponseDto> {
    return this.subscriptionsService.cancelAtPeriodEnd(tenantId);
  }

  @Patch('tenant/:tenantId/plan')
  @ApiOkResponse({ type: SubscriptionResponseDto, description: 'Plan changed' })
  changePlan(
    @Param('tenantId') tenantId: string,
    @Body('planId') planId: string,
  ): Promise<SubscriptionResponseDto> {
    return this.subscriptionsService.changePlan(tenantId, planId);
  }
}
