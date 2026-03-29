import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { InternalServiceAuthGuard } from '../auth/guards/internal-service-auth.guard';
// biome-ignore lint/style/useImportType: NestJS DI requires a runtime value for constructor metadata.
import { PrivacyService } from './privacy.service';

@ApiExcludeController()
@UseGuards(InternalServiceAuthGuard)
@Controller('internal/privacy')
export class PrivacyInternalController {
  constructor(private readonly privacyService: PrivacyService) {}

  @Get('oversight')
  getOversight(@Query('tenantId') tenantId?: string) {
    return this.privacyService.getControlPlaneOversight({
      ...(tenantId ? { tenantId } : {}),
    });
  }
}
