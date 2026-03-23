import type { TenantContext } from '@mobility-os/tenancy-domain';
import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentTenant } from '../auth/decorators/tenant-context.decorator';
import { TenantAuthGuard } from '../auth/guards/tenant-auth.guard';
import { TenantLifecycleGuard } from '../auth/guards/tenant-lifecycle.guard';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { BusinessEntitiesService } from './business-entities.service';
// biome-ignore lint/style/useImportType: DTO classes are used by Nest decorators at runtime.
import { CreateBusinessEntityDto } from './dto/create-business-entity.dto';
import { UpdateBusinessEntityDto } from './dto/update-business-entity.dto';

@ApiTags('Business Entities')
@ApiBearerAuth()
@UseGuards(TenantAuthGuard, TenantLifecycleGuard)
@Controller('business-entities')
export class BusinessEntitiesController {
  constructor(private readonly service: BusinessEntitiesService) {}

  @Get()
  @ApiOkResponse({ description: 'All business entities for the calling tenant' })
  list(@CurrentTenant() ctx: TenantContext) {
    return this.service.list(ctx.tenantId);
  }

  @Get(':id')
  @ApiOkResponse({ description: 'A single business entity' })
  findOne(@CurrentTenant() ctx: TenantContext, @Param('id') id: string) {
    return this.service.findOne(ctx.tenantId, id);
  }

  @Post()
  @ApiCreatedResponse({ description: 'Business entity created' })
  create(@CurrentTenant() ctx: TenantContext, @Body() dto: CreateBusinessEntityDto) {
    return this.service.create(ctx.tenantId, dto);
  }

  @Patch(':id')
  @ApiOkResponse({ description: 'Business entity updated' })
  update(
    @CurrentTenant() ctx: TenantContext,
    @Param('id') id: string,
    @Body() dto: UpdateBusinessEntityDto,
  ) {
    return this.service.update(ctx.tenantId, id, dto);
  }

  @Delete(':id')
  @ApiNoContentResponse({ description: 'Business entity deactivated' })
  deactivate(@CurrentTenant() ctx: TenantContext, @Param('id') id: string) {
    return this.service.deactivate(ctx.tenantId, id);
  }
}
