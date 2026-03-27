import { Body, Controller, Get, Param, Post, Query, Res, StreamableFile, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Permission } from '@mobility-os/authz-model';
import type { TenantContext } from '@mobility-os/tenancy-domain';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';
import { CurrentTenant } from '../auth/decorators/tenant-context.decorator';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { TenantAuthGuard } from '../auth/guards/tenant-auth.guard';
import { TenantLifecycleGuard } from '../auth/guards/tenant-lifecycle.guard';
import { RecordsService } from './records.service';

type HeaderWritableResponse = {
  setHeader(name: string, value: string): void;
};

@ApiTags('Records')
@ApiBearerAuth()
@UseGuards(TenantAuthGuard, TenantLifecycleGuard)
@Controller('records')
export class RecordsController {
  constructor(private readonly recordsService: RecordsService) {}

  @Get('documents')
  @RequirePermissions(Permission.RemittanceRead)
  @UseGuards(PermissionsGuard)
  listDocuments(
    @CurrentTenant() ctx: TenantContext,
    @Query('relatedEntityType') relatedEntityType?: string,
    @Query('relatedEntityId') relatedEntityId?: string,
    @Query('documentType') documentType?: string,
  ) {
    return this.recordsService.listDocuments(ctx.tenantId, {
      ...(relatedEntityType ? { relatedEntityType } : {}),
      ...(relatedEntityId ? { relatedEntityId } : {}),
      ...(documentType ? { documentType } : {}),
    });
  }

  @Get('documents/:id/content')
  @RequirePermissions(Permission.RemittanceRead)
  @UseGuards(PermissionsGuard)
  async downloadDocument(
    @CurrentTenant() ctx: TenantContext,
    @Param('id') id: string,
    @Res({ passthrough: true }) res: HeaderWritableResponse,
  ) {
    const document = await this.recordsService.getDocument(ctx.tenantId, id);
    const content = await this.recordsService.readDocumentContent(ctx.tenantId, id);
    res.setHeader('content-type', document.contentType);
    res.setHeader('content-disposition', `attachment; filename="${document.fileName}"`);
    return new StreamableFile(content);
  }

  @Get('disputes')
  @RequirePermissions(Permission.RemittanceRead)
  @UseGuards(PermissionsGuard)
  listDisputes(
    @CurrentTenant() ctx: TenantContext,
    @Query('status') status?: string,
    @Query('relatedEntityType') relatedEntityType?: string,
    @Query('relatedEntityId') relatedEntityId?: string,
  ) {
    return this.recordsService.listDisputes(ctx.tenantId, {
      ...(status ? { status } : {}),
      ...(relatedEntityType ? { relatedEntityType } : {}),
      ...(relatedEntityId ? { relatedEntityId } : {}),
    });
  }

  @Get('disputes/:id')
  @RequirePermissions(Permission.RemittanceRead)
  @UseGuards(PermissionsGuard)
  getDispute(@CurrentTenant() ctx: TenantContext, @Param('id') id: string) {
    return this.recordsService.getDispute(ctx.tenantId, id);
  }

  @Post('disputes')
  @RequirePermissions(Permission.RemittanceWrite)
  @UseGuards(PermissionsGuard)
  createDispute(
    @CurrentTenant() ctx: TenantContext,
    @Body() body: Record<string, unknown>,
  ) {
    return this.recordsService.createDispute({
      tenantId: ctx.tenantId,
      ...(typeof body.driverId === 'string' ? { driverId: body.driverId } : {}),
      disputeType: String(body.disputeType ?? 'remittance'),
      relatedEntityType: String(body.relatedEntityType ?? 'remittance'),
      relatedEntityId: String(body.relatedEntityId ?? ''),
      claimantType: String(body.claimantType ?? 'tenant'),
      claimantId: ctx.userId,
      respondentType: String(body.respondentType ?? 'driver'),
      ...(typeof body.respondentId === 'string' ? { respondentId: body.respondentId } : {}),
      title: String(body.title ?? 'Dispute'),
      reasonCode: String(body.reasonCode ?? 'general'),
      narrative: String(body.narrative ?? ''),
      ...(typeof body.priority === 'string' ? { priority: body.priority } : {}),
    });
  }

  @Post('disputes/:id/comments')
  @RequirePermissions(Permission.RemittanceWrite)
  @UseGuards(PermissionsGuard)
  addComment(
    @CurrentTenant() ctx: TenantContext,
    @Param('id') id: string,
    @Body('message') message: string,
  ) {
    return this.recordsService.addTimelineEntry({
      tenantId: ctx.tenantId,
      disputeId: id,
      actorType: 'tenant_user',
      actorId: ctx.userId,
      actionType: 'comment_added',
      message,
    });
  }

  @Post('disputes/:id/evidence')
  @RequirePermissions(Permission.RemittanceWrite)
  @UseGuards(PermissionsGuard)
  addEvidence(
    @CurrentTenant() ctx: TenantContext,
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
  ) {
    return this.recordsService.uploadDisputeEvidence({
      tenantId: ctx.tenantId,
      disputeId: id,
      uploadedByType: 'tenant_user',
      uploadedById: ctx.userId,
      evidenceType: String(body.evidenceType ?? 'supporting_document'),
      fileName: String(body.fileName ?? 'evidence.bin'),
      contentType: String(body.contentType ?? 'application/octet-stream'),
      fileBase64: String(body.fileBase64 ?? ''),
      ...(typeof body.description === 'string' ? { description: body.description } : {}),
    });
  }

  @Post('disputes/:id/resolve')
  @RequirePermissions(Permission.RemittanceApprove)
  @UseGuards(PermissionsGuard)
  resolveDispute(
    @CurrentTenant() ctx: TenantContext,
    @Param('id') id: string,
    @Body('resolutionSummary') resolutionSummary: Record<string, unknown>,
    @Body('finalAmountMinorUnits') finalAmountMinorUnits?: number,
    @Body('currency') currency?: string,
  ) {
    return this.recordsService.resolveDispute({
      tenantId: ctx.tenantId,
      disputeId: id,
      actorType: 'tenant_user',
      actorId: ctx.userId,
      resolutionSummary: resolutionSummary as never,
      ...(typeof finalAmountMinorUnits === 'number' ? { finalAmountMinorUnits } : {}),
      ...(currency ? { currency } : {}),
    });
  }
}
