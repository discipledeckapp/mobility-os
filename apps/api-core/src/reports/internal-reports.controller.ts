import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiHeader, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { InternalServiceAuthGuard } from '../auth/guards/internal-service-auth.guard';
import { InternalOperationalTenantSummaryDto } from './dto/internal-operational-oversight.dto';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { ReportsService } from './reports.service';

@ApiTags('Internal Reports')
@ApiHeader({
  name: 'Authorization',
  required: true,
  description: 'Bearer token for signed internal service authentication',
})
@UseGuards(InternalServiceAuthGuard)
@Controller('internal/reports')
export class InternalReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('tenants/:tenantId/operational-summary')
  @ApiOkResponse({ type: InternalOperationalTenantSummaryDto })
  getTenantOperationalSummary(
    @Param('tenantId') tenantId: string,
  ): Promise<InternalOperationalTenantSummaryDto> {
    return this.reportsService.getControlPlaneOperationalSummary(tenantId);
  }
}
