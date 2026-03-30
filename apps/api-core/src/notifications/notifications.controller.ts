import type { TenantContext } from '@mobility-os/tenancy-domain';
import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Permission } from '@mobility-os/authz-model';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';
import { CurrentTenant } from '../auth/decorators/tenant-context.decorator';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { TenantAuthGuard } from '../auth/guards/tenant-auth.guard';
import { TenantLifecycleGuard } from '../auth/guards/tenant-lifecycle.guard';
import { RegisterPushDeviceDto } from './dto/register-push-device.dto';
import { PushDeviceActionResponseDto } from './dto/push-device-action-response.dto';
import { PushDeviceResponseDto } from './dto/push-device-response.dto';
import { NotificationPreferencesDto } from './dto/notification-preferences.dto';
import { UpdateNotificationPreferencesDto } from './dto/update-notification-preferences.dto';
import { UserNotificationResponseDto } from './dto/user-notification-response.dto';
import { NotificationsService } from './notifications.service';
import type { UserNotification } from '@prisma/client';

function mapNotification(notification: UserNotification): UserNotificationResponseDto {
  return {
    id: notification.id,
    topic: notification.topic,
    title: notification.title,
    body: notification.body,
    actionUrl: notification.actionUrl ?? null,
    metadata:
      notification.metadata && typeof notification.metadata === 'object' && !Array.isArray(notification.metadata)
        ? (notification.metadata as Record<string, unknown>)
        : null,
    readAt: notification.readAt?.toISOString() ?? null,
    createdAt: notification.createdAt.toISOString(),
  };
}

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(TenantAuthGuard, TenantLifecycleGuard, PermissionsGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOkResponse({ type: [UserNotificationResponseDto] })
  async list(@CurrentTenant() ctx: TenantContext): Promise<UserNotificationResponseDto[]> {
    const notifications = await this.notificationsService.listForUser(ctx.tenantId, ctx.userId);
    return notifications.map(mapNotification);
  }

  @Patch(':notificationId/read')
  @ApiOkResponse({ type: UserNotificationResponseDto })
  async markRead(
    @CurrentTenant() ctx: TenantContext,
    @Param('notificationId') notificationId: string,
  ): Promise<UserNotificationResponseDto> {
    return mapNotification(
      await this.notificationsService.markRead(ctx.tenantId, ctx.userId, notificationId),
    );
  }

  @Get('preferences')
  @ApiOkResponse({ type: NotificationPreferencesDto })
  getPreferences(@CurrentTenant() ctx: TenantContext): Promise<NotificationPreferencesDto> {
    return this.notificationsService.getPreferences(ctx.tenantId, ctx.userId);
  }

  @Patch('preferences')
  @ApiOkResponse({ type: NotificationPreferencesDto })
  updatePreferences(
    @CurrentTenant() ctx: TenantContext,
    @Body() dto: UpdateNotificationPreferencesDto,
  ): Promise<NotificationPreferencesDto> {
    return this.notificationsService.updatePreferences(ctx.tenantId, ctx.userId, dto);
  }

  @Post('push-devices')
  @ApiOkResponse({ type: PushDeviceActionResponseDto })
  registerPushDevice(
    @CurrentTenant() ctx: TenantContext,
    @Body() dto: RegisterPushDeviceDto,
  ): Promise<{ message: string }> {
    return this.notificationsService.registerPushDevice(ctx.tenantId, ctx.userId, dto);
  }

  @Get('push-devices')
  @ApiOkResponse({ type: [PushDeviceResponseDto] })
  listPushDevices(@CurrentTenant() ctx: TenantContext): Promise<PushDeviceResponseDto[]> {
    return this.notificationsService.listPushDevices(ctx.tenantId, ctx.userId);
  }

  @Delete('push-devices/:deviceId')
  @ApiOkResponse({ type: PushDeviceActionResponseDto })
  disablePushDevice(
    @CurrentTenant() ctx: TenantContext,
    @Param('deviceId') deviceId: string,
  ): Promise<{ message: string }> {
    return this.notificationsService.disablePushDevice(ctx.tenantId, ctx.userId, deviceId);
  }

  @Post('remittance-reminders/sync')
  @RequirePermissions(Permission.RemittanceApprove)
  @ApiOkResponse()
  syncRemittanceReminders(
    @CurrentTenant() ctx: TenantContext,
  ): Promise<{ created: number }> {
    return this.notificationsService.syncTenantRemittanceReminders(ctx.tenantId);
  }

  @Post('maintenance-reminders/sync')
  @RequirePermissions(Permission.MaintenanceWrite)
  @ApiOkResponse()
  syncMaintenanceReminders(
    @CurrentTenant() ctx: TenantContext,
  ): Promise<{ created: number }> {
    return this.notificationsService.syncTenantMaintenanceReminders(ctx.tenantId);
  }
}
