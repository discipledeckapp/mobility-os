import type { TenantContext } from '@mobility-os/tenancy-domain';
import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentTenant } from '../auth/decorators/tenant-context.decorator';
import { TenantAuthGuard } from '../auth/guards/tenant-auth.guard';
import { TenantLifecycleGuard } from '../auth/guards/tenant-lifecycle.guard';
// biome-ignore lint/style/useImportType: DTO classes are used by Nest decorators at runtime.
import { CreateOperatingUnitDto } from './dto/create-operating-unit.dto';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { OperatingUnitsService } from './operating-units.service';

@ApiTags('Operating Units')
@ApiBearerAuth()
@UseGuards(TenantAuthGuard, TenantLifecycleGuard)
@Controller('operating-units')
export class OperatingUnitsController {
  constructor(private readonly service: OperatingUnitsService) {}

  @Get()
  @ApiOkResponse({ description: 'All operating units for the calling tenant' })
  @ApiQuery({ name: 'businessEntityId', required: false })
  list(@CurrentTenant() ctx: TenantContext, @Query('businessEntityId') businessEntityId?: string) {
    return this.service.list(ctx.tenantId, businessEntityId);
  }

  @Get(':id')
  @ApiOkResponse({ description: 'A single operating unit' })
  findOne(@CurrentTenant() ctx: TenantContext, @Param('id') id: string) {
    return this.service.findOne(ctx.tenantId, id);
  }

  @Post()
  @ApiCreatedResponse({ description: 'Operating unit created' })
  create(@CurrentTenant() ctx: TenantContext, @Body() dto: CreateOperatingUnitDto) {
    return this.service.create(ctx.tenantId, dto);
  }

  @Delete(':id')
  @ApiOkResponse({ description: 'Operating unit deactivated' })
  deactivate(@CurrentTenant() ctx: TenantContext, @Param('id') id: string) {
    return this.service.deactivate(ctx.tenantId, id);
  }
}
