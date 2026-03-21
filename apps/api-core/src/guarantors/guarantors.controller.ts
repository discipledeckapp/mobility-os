import { Permission } from '@mobility-os/authz-model';
import type { TenantContext } from '@mobility-os/tenancy-domain';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';
import { CurrentTenant } from '../auth/decorators/tenant-context.decorator';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { TenantAuthGuard } from '../auth/guards/tenant-auth.guard';
import { TenantLifecycleGuard } from '../auth/guards/tenant-lifecycle.guard';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
// biome-ignore lint/style/useImportType: DTO classes are used by Nest decorators at runtime.
import { CreateGuarantorDto } from './dto/create-guarantor.dto';
// biome-ignore lint/style/useImportType: DTO classes are used by Nest decorators at runtime.
import { UpdateGuarantorDto } from './dto/update-guarantor.dto';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { GuarantorsService } from './guarantors.service';

class LinkDriverDto {
  @IsString()
  @IsNotEmpty()
  driverId!: string;
}

class ListGuarantorsDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  fleetId?: string;
}

@ApiTags('Guarantors')
@ApiBearerAuth()
@UseGuards(TenantAuthGuard, TenantLifecycleGuard)
@Controller('guarantors')
export class GuarantorsController {
  constructor(private readonly service: GuarantorsService) {}

  @Post()
  @RequirePermissions(Permission.GuarantorsWrite)
  @UseGuards(PermissionsGuard)
  @ApiCreatedResponse({ description: 'Guarantor created' })
  create(@CurrentTenant() ctx: TenantContext, @Body() dto: CreateGuarantorDto) {
    return this.service.create(ctx.tenantId, dto);
  }

  @Get()
  @RequirePermissions(Permission.GuarantorsRead)
  @UseGuards(PermissionsGuard)
  @ApiOkResponse({ description: 'Guarantors for the calling tenant' })
  @ApiQuery({ name: 'fleetId', required: false })
  list(@CurrentTenant() ctx: TenantContext, @Query() query: ListGuarantorsDto) {
    return this.service.list(ctx.tenantId, query);
  }

  @Get(':id')
  @RequirePermissions(Permission.GuarantorsRead)
  @UseGuards(PermissionsGuard)
  @ApiOkResponse({ description: 'Single guarantor detail' })
  findOne(@CurrentTenant() ctx: TenantContext, @Param('id') id: string) {
    return this.service.findOne(ctx.tenantId, id);
  }

  @Patch(':id')
  @RequirePermissions(Permission.GuarantorsWrite)
  @UseGuards(PermissionsGuard)
  @ApiOkResponse({ description: 'Guarantor updated' })
  update(
    @CurrentTenant() ctx: TenantContext,
    @Param('id') id: string,
    @Body() dto: UpdateGuarantorDto,
  ) {
    return this.service.update(ctx.tenantId, id, dto);
  }

  @Delete(':id')
  @RequirePermissions(Permission.GuarantorsWrite)
  @UseGuards(PermissionsGuard)
  @ApiOkResponse({ description: 'Guarantor deactivated' })
  remove(@CurrentTenant() ctx: TenantContext, @Param('id') id: string) {
    return this.service.remove(ctx.tenantId, id);
  }

  @Post(':id/link-driver')
  @RequirePermissions(Permission.GuarantorsWrite)
  @UseGuards(PermissionsGuard)
  @ApiOkResponse({ description: 'Guarantor linked to driver' })
  linkDriver(
    @CurrentTenant() ctx: TenantContext,
    @Param('id') id: string,
    @Body() dto: LinkDriverDto,
  ) {
    return this.service.linkDriver(ctx.tenantId, id, dto.driverId);
  }
}
