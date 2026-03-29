import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { InternalServiceAuthGuard } from '../auth/guards/internal-service-auth.guard';
// biome-ignore lint/style/useImportType: NestJS DI requires a runtime value for constructor metadata.
import { NotificationsService } from './notifications.service';

@ApiExcludeController()
@UseGuards(InternalServiceAuthGuard)
@Controller('internal/notifications')
export class NotificationsInternalController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get('oversight')
  getOversight(@Query('tenantId') tenantId?: string) {
    return this.notificationsService.getControlPlaneOversight({
      ...(tenantId ? { tenantId } : {}),
    });
  }
}
