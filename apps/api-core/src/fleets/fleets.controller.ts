import type { TenantContext } from '@mobility-os/tenancy-domain';
import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
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
import { CreateFleetDto } from './dto/create-fleet.dto';
import { UpdateFleetDto } from './dto/update-fleet.dto';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { FleetsService } from './fleets.service';

@ApiTags('Fleets')
@ApiBearerAuth()
@UseGuards(TenantAuthGuard, TenantLifecycleGuard)
@Controller('fleets')
export class FleetsController {
  constructor(private readonly service: FleetsService) {}

  @Get()
  @ApiOkResponse({ description: 'All fleets for the calling tenant' })
  @ApiQuery({ name: 'operatingUnitId', required: false })
  list(@CurrentTenant() ctx: TenantContext, @Query('operatingUnitId') operatingUnitId?: string) {
    return this.service.list(ctx.tenantId, operatingUnitId);
  }

  @Get(':id')
  @ApiOkResponse({ description: 'A single fleet' })
  findOne(@CurrentTenant() ctx: TenantContext, @Param('id') id: string) {
    return this.service.findOne(ctx.tenantId, id);
  }

  @Post()
  @ApiCreatedResponse({ description: 'Fleet created' })
  create(@CurrentTenant() ctx: TenantContext, @Body() dto: CreateFleetDto) {
    return this.service.create(ctx.tenantId, dto);
  }

  @Patch(':id')
  @ApiOkResponse({ description: 'Fleet updated' })
  update(
    @CurrentTenant() ctx: TenantContext,
    @Param('id') id: string,
    @Body() dto: UpdateFleetDto,
  ) {
    return this.service.update(ctx.tenantId, id, dto);
  }

  @Delete(':id')
  @ApiOkResponse({ description: 'Fleet deactivated' })
  deactivate(@CurrentTenant() ctx: TenantContext, @Param('id') id: string) {
    return this.service.deactivate(ctx.tenantId, id);
  }
}
