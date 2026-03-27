import type { TenantContext } from '@mobility-os/tenancy-domain';
import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CurrentTenant } from '../auth/decorators/tenant-context.decorator';
import { TenantAuthGuard } from '../auth/guards/tenant-auth.guard';
import { TenantLifecycleGuard } from '../auth/guards/tenant-lifecycle.guard';
import { CreateDataSubjectRequestDto } from './dto/create-data-subject-request.dto';
import { DataSubjectRequestResponseDto } from './dto/data-subject-request-response.dto';
import { PrivacySupportResponseDto } from './dto/privacy-support-response.dto';
import { PrivacyService } from './privacy.service';

@ApiTags('Privacy')
@UseGuards(TenantAuthGuard, TenantLifecycleGuard)
@Controller('privacy')
export class PrivacyController {
  constructor(private readonly privacyService: PrivacyService) {}

  @Get('support')
  @ApiOkResponse({ type: PrivacySupportResponseDto })
  getSupportContact(): PrivacySupportResponseDto {
    return this.privacyService.getSupportContact();
  }

  @Get('data-requests')
  @ApiOkResponse({ type: DataSubjectRequestResponseDto, isArray: true })
  async listDataRequests(
    @CurrentTenant() ctx: TenantContext,
  ): Promise<DataSubjectRequestResponseDto[]> {
    const requests = await this.privacyService.listDataRequests(ctx.userId, ctx.tenantId);
    return requests.map((request) => ({
      ...request,
      createdAt: request.createdAt.toISOString(),
      updatedAt: request.updatedAt.toISOString(),
    }));
  }

  @Post('data-requests')
  @ApiCreatedResponse({ type: DataSubjectRequestResponseDto })
  async createDataRequest(
    @CurrentTenant() ctx: TenantContext,
    @Body() dto: CreateDataSubjectRequestDto,
  ): Promise<DataSubjectRequestResponseDto> {
    const request = await this.privacyService.createDataRequest(ctx.userId, ctx.tenantId, dto);
    return {
      ...request,
      createdAt: request.createdAt.toISOString(),
      updatedAt: request.updatedAt.toISOString(),
    };
  }
}
