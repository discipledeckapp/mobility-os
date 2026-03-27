import { Body, Controller, Get, Param, Post, Query, Res, StreamableFile, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Prisma } from '../generated/prisma';
import { PlatformAuthGuard } from '../auth/guards/platform-auth.guard';
import { ControlPlaneRecordsService } from './records.service';

type HeaderWritableResponse = {
  setHeader(name: string, value: string): void;
};

@ApiTags('Records')
@ApiBearerAuth()
@UseGuards(PlatformAuthGuard)
@Controller('records')
export class ControlPlaneRecordsController {
  constructor(private readonly recordsService: ControlPlaneRecordsService) {}

  @Get('documents')
  listDocuments(
    @Query('tenantId') tenantId?: string,
    @Query('relatedEntityType') relatedEntityType?: string,
    @Query('relatedEntityId') relatedEntityId?: string,
    @Query('documentType') documentType?: string,
  ) {
    return this.recordsService.listDocuments({
      ...(tenantId ? { tenantId } : {}),
      ...(relatedEntityType ? { relatedEntityType } : {}),
      ...(relatedEntityId ? { relatedEntityId } : {}),
      ...(documentType ? { documentType } : {}),
    });
  }

  @Get('documents/:id/content')
  async downloadDocument(
    @Param('id') id: string,
    @Res({ passthrough: true }) res: HeaderWritableResponse,
  ) {
    const document = await this.recordsService.getDocument(id);
    const content = await this.recordsService.readDocumentContent(id);
    res.setHeader('content-type', document.contentType);
    res.setHeader('content-disposition', `attachment; filename="${document.fileName}"`);
    return new StreamableFile(content);
  }

  @Get('disputes')
  listDisputes(
    @Query('tenantId') tenantId?: string,
    @Query('status') status?: string,
    @Query('relatedEntityType') relatedEntityType?: string,
    @Query('relatedEntityId') relatedEntityId?: string,
  ) {
    return this.recordsService.listDisputes({
      ...(tenantId ? { tenantId } : {}),
      ...(status ? { status } : {}),
      ...(relatedEntityType ? { relatedEntityType } : {}),
      ...(relatedEntityId ? { relatedEntityId } : {}),
    });
  }

  @Get('disputes/:id')
  getDispute(@Param('id') id: string) {
    return this.recordsService.getDispute(id);
  }

  @Post('disputes')
  createDispute(@Body() body: Record<string, unknown>) {
    return this.recordsService.createDispute({
      ...(typeof body.tenantId === 'string' ? { tenantId: body.tenantId } : {}),
      disputeType: String(body.disputeType ?? 'billing'),
      relatedEntityType: String(body.relatedEntityType ?? 'invoice'),
      relatedEntityId: String(body.relatedEntityId ?? ''),
      claimantType: String(body.claimantType ?? 'platform'),
      claimantId: String(body.claimantId ?? 'platform'),
      respondentType: String(body.respondentType ?? 'tenant'),
      ...(typeof body.respondentId === 'string' ? { respondentId: body.respondentId } : {}),
      title: String(body.title ?? 'Dispute'),
      reasonCode: String(body.reasonCode ?? 'general'),
      narrative: String(body.narrative ?? ''),
      ...(typeof body.priority === 'string' ? { priority: body.priority } : {}),
    });
  }

  @Post('disputes/:id/comments')
  addComment(
    @Param('id') id: string,
    @Body('message') message: string,
    @Body('tenantId') tenantId?: string,
    @Body('actorType') actorType?: string,
    @Body('actorId') actorId?: string,
  ) {
    return this.recordsService.addTimelineEntry({
      disputeId: id,
      ...(tenantId ? { tenantId } : {}),
      actorType: actorType ?? 'platform_staff',
      ...(actorId ? { actorId } : {}),
      actionType: 'comment_added',
      message,
    });
  }

  @Post('disputes/:id/evidence')
  addEvidence(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    return this.recordsService.uploadDisputeEvidence({
      disputeId: id,
      ...(typeof body.tenantId === 'string' ? { tenantId: body.tenantId } : {}),
      uploadedByType: String(body.uploadedByType ?? 'platform_staff'),
      ...(typeof body.uploadedById === 'string' ? { uploadedById: body.uploadedById } : {}),
      evidenceType: String(body.evidenceType ?? 'supporting_document'),
      fileName: String(body.fileName ?? 'evidence.bin'),
      contentType: String(body.contentType ?? 'application/octet-stream'),
      fileBase64: String(body.fileBase64 ?? ''),
      ...(typeof body.description === 'string' ? { description: body.description } : {}),
    });
  }

  @Post('disputes/:id/resolve')
  resolveDispute(
    @Param('id') id: string,
    @Body('resolutionSummary') resolutionSummary: Record<string, unknown>,
    @Body('tenantId') tenantId?: string,
    @Body('actorType') actorType?: string,
    @Body('actorId') actorId?: string,
    @Body('finalAmountMinorUnits') finalAmountMinorUnits?: number,
    @Body('currency') currency?: string,
  ) {
    return this.recordsService.resolveDispute({
      disputeId: id,
      ...(tenantId ? { tenantId } : {}),
      actorType: actorType ?? 'platform_staff',
      actorId: actorId ?? 'platform',
      resolutionSummary: resolutionSummary as Prisma.InputJsonValue,
      ...(typeof finalAmountMinorUnits === 'number' ? { finalAmountMinorUnits } : {}),
      ...(currency ? { currency } : {}),
    });
  }
}
