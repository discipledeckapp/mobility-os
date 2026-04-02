import { Permission } from '@mobility-os/authz-model';
import type { TenantContext } from '@mobility-os/tenancy-domain';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Res,
  StreamableFile,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import type { Driver, Prisma, UserNotification } from '@prisma/client';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';
import { RequireTenantLifecycleFeature } from '../auth/decorators/tenant-lifecycle-access.decorator';
import { CurrentTenant } from '../auth/decorators/tenant-context.decorator';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { TenantAuthGuard } from '../auth/guards/tenant-auth.guard';
import { TenantLifecycleGuard } from '../auth/guards/tenant-lifecycle.guard';
import {
  applyFleetScope,
  assertFleetAccess,
  assertLinkedDriverAccess,
  getAssignedFleetIds,
  getLinkedDriverId,
} from '../auth/tenant-access';
import type { PaginatedResponse } from '../common/dto/paginated-response.dto';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { DriversService } from './drivers.service';
// biome-ignore lint/style/useImportType: DTO classes are used by Nest decorators at runtime.
import { CreateDriverDocumentDto } from './dto/create-driver-document.dto';
// biome-ignore lint/style/useImportType: DTO classes are used by Nest decorators at runtime.
import { CreateDriverDto } from './dto/create-driver.dto';
// biome-ignore lint/style/useImportType: DTO classes are used by Nest decorators at runtime.
import { CreateOrUpdateDriverGuarantorDto } from './dto/create-or-update-driver-guarantor.dto';
import { DriverDocumentResponseDto } from './dto/driver-document-response.dto';
import { DriverGuarantorResponseDto } from './dto/driver-guarantor-response.dto';
import { DriverIdentitySummaryDto } from './dto/driver-identity-summary.dto';
import {
  DriverMobileAccessPushDeviceDto,
  DriverMobileAccessResponseDto,
  DriverMobileAccessUserDto,
} from './dto/driver-mobile-access-response.dto';
import { DriverResponseDto } from './dto/driver-response.dto';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { NotificationsService } from '../notifications/notifications.service';
import { UserNotificationResponseDto } from '../notifications/dto/user-notification-response.dto';
import { AssignmentsService } from '../assignments/assignments.service';
import { RemittanceService } from '../remittance/remittance.service';
// biome-ignore lint/style/useImportType: DTO classes are used by Nest decorators at runtime.
import { LinkDriverUserDto } from './dto/link-driver-user.dto';
// biome-ignore lint/style/useImportType: DTO classes are used by Nest decorators at runtime.
import { ListDriversDto } from './dto/list-drivers.dto';
// biome-ignore lint/style/useImportType: DTO classes are used by Nest decorators at runtime.
import { ResolveDriverIdentityDto } from './dto/resolve-driver-identity.dto';
// biome-ignore lint/style/useImportType: DTO classes are used by Nest decorators at runtime.
import { UpdateDriverDocumentReviewDto } from './dto/update-driver-document-review.dto';

type HeaderWritableResponse = {
  setHeader(name: string, value: string): void;
};

function mapUserNotification(notification: UserNotification): UserNotificationResponseDto {
  return {
    id: notification.id,
    topic: notification.topic,
    title: notification.title,
    body: notification.body,
    actionUrl: notification.actionUrl ?? null,
    metadata:
      notification.metadata && typeof notification.metadata === 'object' && !Array.isArray(notification.metadata)
        ? (notification.metadata as Record<string, unknown>)
        : null,
    readAt: notification.readAt?.toISOString() ?? null,
    createdAt: notification.createdAt.toISOString(),
  };
}

type DriverWithIdentityState = Driver & {
  identityStatus: string;
  identityReviewCaseId?: string | null;
  identityReviewStatus?: string | null;
  identityLastDecision?: string | null;
  identityVerificationConfidence?: number | null;
  identityLastVerifiedAt?: Date | null;
  identityLivenessPassed?: boolean | null;
  identityLivenessProvider?: string | null;
  identityLivenessConfidence?: number | null;
  identityLivenessReason?: string | null;
  identitySignatureImageUrl?: string | null;
  identityProfile?: Prisma.JsonValue | null;
  identityVerificationMetadata?: Prisma.JsonValue | null;
  identityProviderRawData?: Prisma.JsonValue | null;
};

type DriverIntelligenceSummary = {
  globalRiskScore?: number | undefined;
  riskBand?: string | undefined;
  isWatchlisted?: boolean | undefined;
  duplicateIdentityFlag?: boolean | undefined;
  reverificationRequired?: boolean | undefined;
  reverificationReason?: string | null | undefined;
  verificationConfidence?: number | undefined;
  verificationStatus?: string | undefined;
  verificationProvider?: string | undefined;
  verificationCountryCode?: string | undefined;
};

type DriverGuarantorSummary = {
  hasGuarantor: boolean;
  guarantorStatus?: string | null;
  guarantorDisconnectedAt?: Date | null;
  guarantorPersonId?: string | null;
  guarantorRiskBand?: string | null;
  guarantorIsWatchlisted?: boolean | null;
  guarantorReverificationRequired?: boolean | null;
  guarantorReverificationReason?: string | null;
  guarantorIsAlsoDriver?: boolean;
};

type DriverDocumentSummary = {
  hasApprovedLicence: boolean;
  pendingDocumentCount: number;
  rejectedDocumentCount: number;
  expiredDocumentCount: number;
  driverLicenceVerification?: {
    id: string;
    status: string;
    licenceNumber: string;
    maskedLicenceNumber: string;
    validity: 'valid' | 'invalid' | 'unknown' | null;
    issueDate: string | null;
    expiryDate: string | null;
    expiresSoon: boolean;
    isExpired: boolean;
    providerName: string | null;
    providerReference: string | null;
    holderFirstName: string | null;
    holderMiddleName: string | null;
    holderLastName: string | null;
    holderFullName: string | null;
    holderDateOfBirth: string | null;
    holderGender: string | null;
    stateOfIssuance: string | null;
    licenceClass: string | null;
    portraitUrl: string | null;
    linkageStatus: 'matched' | 'mismatch' | 'pending' | 'insufficient_data';
    demographicMatchScore: number | null;
    biometricMatchScore: number | null;
    linkageConfidence: number | null;
    overallLinkageScore: number | null;
    linkageDecision: 'auto_pass' | 'pending_human_review' | 'fail';
    linkageReasons: string[];
    discrepancyFlags: string[];
    identityComparison: {
      firstNameMatch: boolean | null;
      middleNameMatch: boolean | null;
      lastNameMatch: boolean | null;
      dateOfBirthMatch: boolean | null;
      genderMatch: boolean | null;
      biometricMatch: boolean | null;
      biometricConfidence: number | null;
      matchedFieldCount: number;
      comparedFieldCount: number;
    };
    reviewCaseId: string | null;
    manualReviewRequired: boolean;
    reviewDecision: 'approved' | 'rejected' | 'request_reverification' | null;
    reviewedBy: string | null;
    reviewedAt: string | null;
    reviewNotes: string | null;
    riskImpact: 'low' | 'medium' | 'high' | 'critical';
    riskSummary: string;
    failureReason: string | null;
    verifiedAt: string | null;
  } | null;
};

type DriverMobileAccessSummary = {
  hasMobileAccess: boolean;
  mobileAccessStatus?: string | null;
};

type DriverReadinessSummary = {
  authenticationAccess: string;
  authenticationAccessReasons: string[];
  activationReadiness: string;
  activationReadinessReasons: string[];
  assignmentReadiness: string;
  assignmentReadinessReasons: string[];
  remittanceReadiness: string;
  remittanceReadinessReasons: string[];
};

type DriverInviteSummary = {
  selfServiceInviteStatus?: 'sent' | 'skipped' | 'failed' | null;
  selfServiceInviteReason?: string | null;
};

@ApiTags('Drivers')
@ApiBearerAuth()
@UseGuards(TenantAuthGuard, TenantLifecycleGuard)
@Controller('drivers')
export class DriversController {
  constructor(private readonly service: DriversService) {}

  @Get()
  @RequirePermissions(Permission.DriversRead)
  @UseGuards(PermissionsGuard)
  @ApiOkResponse({ type: [DriverResponseDto] })
  @ApiQuery({ name: 'fleetId', required: false })
  @ApiQuery({ name: 'q', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'identityStatus', required: false })
  list(
    @CurrentTenant() ctx: TenantContext,
    @Query() query: ListDriversDto,
  ): Promise<PaginatedResponse<DriverResponseDto>> {
    const linkedDriverId = getLinkedDriverId(ctx);
    if (linkedDriverId) {
      return this.service.findOne(ctx.tenantId, linkedDriverId).then((driver) => {
        const q = query.q?.trim().toLowerCase();
        const matchesQuery =
          !q ||
          [
            driver.firstName ?? '',
            driver.lastName ?? '',
            driver.phone ?? '',
            driver.email ?? '',
          ].some((value) => value.toLowerCase().includes(q));
        const matchesFleet = !query.fleetId || driver.fleetId === query.fleetId;
        const matchesStatus = !query.status || driver.status === query.status;
        const matchesIdentityStatus =
          !query.identityStatus || driver.identityStatus === query.identityStatus;
        const data =
          matchesQuery && matchesFleet && matchesStatus && matchesIdentityStatus
            ? [this.toResponse(driver)]
            : [];

        return {
          data,
          total: data.length,
          page: query.page ?? 1,
          limit: query.limit ?? 50,
        };
      });
    }

    return this.service.list(ctx.tenantId, applyFleetScope(query, ctx)).then((result) => ({
      ...result,
      data: result.data.map((driver) => this.toResponse(driver)),
    }));
  }

  @Get('documents/review-queue')
  @RequirePermissions(Permission.DocumentsRead)
  @UseGuards(PermissionsGuard)
  @ApiOkResponse({ type: [DriverDocumentResponseDto] })
  listDocumentReviewQueue(
    @CurrentTenant() ctx: TenantContext,
    @Query('status') status?: 'pending' | 'rejected' | 'expired',
    @Query('q') q?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.service.listDocumentReviewQueue(ctx.tenantId, {
      ...(status ? { status } : {}),
      ...(q ? { q } : {}),
      ...(typeof page === 'number' ? { page } : {}),
      ...(typeof limit === 'number' ? { limit } : {}),
    });
  }

  @Get('licence-verifications/review-queue')
  @RequirePermissions(Permission.DocumentsRead)
  @UseGuards(PermissionsGuard)
  @ApiOkResponse({ type: Object })
  listDriverLicenceReviewQueue(
    @CurrentTenant() ctx: TenantContext,
    @Query('q') q?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.service.listDriverLicenceReviewQueue(ctx.tenantId, {
      ...(q ? { q } : {}),
      ...(typeof page === 'number' ? { page } : {}),
      ...(typeof limit === 'number' ? { limit } : {}),
    });
  }

  @Get('import-template.csv')
  @RequirePermissions(Permission.DriversRead)
  @UseGuards(PermissionsGuard)
  @ApiOkResponse({ type: String })
  async downloadImportTemplate(@Res({ passthrough: true }) res: HeaderWritableResponse) {
    const csv = [
      'fleetName,firstName,lastName,phone,email,dateOfBirth,nationality',
      'Lagos Core Fleet,Seyi,Adelaju,08012345678,seyi@example.com,1992-05-20,NG',
    ].join('\n');
    res.setHeader('content-type', 'text/csv; charset=utf-8');
    res.setHeader('content-disposition', 'attachment; filename="driver-import-template.csv"');
    return new StreamableFile(Buffer.from(csv, 'utf-8'));
  }

  @Get('export.csv')
  @RequirePermissions(Permission.DriversRead)
  @UseGuards(PermissionsGuard)
  @ApiOkResponse({ type: String })
  async exportDrivers(
    @CurrentTenant() ctx: TenantContext,
    @Res({ passthrough: true }) res: HeaderWritableResponse,
  ) {
    const csv = await this.service.exportDriversCsv(ctx.tenantId, {
      ...(getAssignedFleetIds(ctx).length ? { fleetIds: getAssignedFleetIds(ctx) } : {}),
    });
    res.setHeader('content-type', 'text/csv; charset=utf-8');
    res.setHeader('content-disposition', 'attachment; filename="drivers.csv"');
    return new StreamableFile(Buffer.from(csv, 'utf-8'));
  }

  @Post('import')
  @RequirePermissions(Permission.DriversWrite)
  @RequireTenantLifecycleFeature('driver_onboarding')
  @UseGuards(PermissionsGuard)
  @ApiCreatedResponse({ type: Object })
  importDrivers(
    @CurrentTenant() ctx: TenantContext,
    @Body('csvContent') csvContent: string,
    @Body('autoSendSelfServiceLink') autoSendSelfServiceLink?: boolean,
  ) {
    return this.service.importDriversFromCsv(ctx.tenantId, csvContent, {
      ...(typeof autoSendSelfServiceLink === 'boolean' ? { autoSendSelfServiceLink } : {}),
    });
  }

  @Post(':id/self-service-links')
  @RequirePermissions(Permission.DriversWrite)
  @UseGuards(PermissionsGuard)
  @ApiCreatedResponse({ type: Object })
  sendSelfServiceLink(
    @CurrentTenant() ctx: TenantContext,
    @Param('id') id: string,
    @Body()
    body?: {
      driverPaysKycOverride?: boolean;
      verificationTierOverride?:
        | 'BASIC_IDENTITY'
        | 'VERIFIED_IDENTITY'
        | 'FULL_TRUST_VERIFICATION';
      forceReverification?: boolean;
    },
  ): Promise<{ delivery: 'email'; verificationUrl: string; destination: string }> {
    return this.service.sendSelfServiceLink(ctx.tenantId, id, {
      ...(body?.driverPaysKycOverride !== undefined
        ? { driverPaysKycOverride: body.driverPaysKycOverride }
        : {}),
      ...(body?.verificationTierOverride
        ? { verificationTierOverride: body.verificationTierOverride }
        : {}),
      ...(body?.forceReverification !== undefined
        ? { forceReverification: body.forceReverification }
        : {}),
      requestedBy: ctx.userId ?? null,
    });
  }

  @Get(':id/guarantor')
  @RequirePermissions(Permission.GuarantorsRead)
  @UseGuards(PermissionsGuard)
  @ApiOkResponse({ type: DriverGuarantorResponseDto })
  getGuarantor(
    @CurrentTenant() ctx: TenantContext,
    @Param('id') id: string,
  ): Promise<DriverGuarantorResponseDto> {
    return this.service.getGuarantor(ctx.tenantId, id);
  }

  @Get(':id/mobile-access')
  @RequirePermissions(Permission.DriversRead)
  @UseGuards(PermissionsGuard)
  @ApiOkResponse({ type: DriverMobileAccessResponseDto })
  async getMobileAccess(
    @CurrentTenant() ctx: TenantContext,
    @Param('id') id: string,
  ): Promise<DriverMobileAccessResponseDto> {
    const result = await this.service.getMobileAccess(ctx.tenantId, id);
    return {
      linkedUser: result.linkedUser ? this.toMobileAccessUser(result.linkedUser) : null,
      suggestedUsers: result.suggestedUsers.map((user) => this.toMobileAccessUser(user)),
    };
  }

  @Post(':id/mobile-access/link')
  @RequirePermissions(Permission.DriversWrite)
  @UseGuards(PermissionsGuard)
  @ApiCreatedResponse({ type: DriverMobileAccessUserDto })
  linkMobileAccessUser(
    @CurrentTenant() ctx: TenantContext,
    @Param('id') id: string,
    @Body() dto: LinkDriverUserDto,
  ): Promise<DriverMobileAccessUserDto> {
    return this.service
      .linkUserToDriver(ctx.tenantId, id, dto.userId)
      .then((user) => this.toMobileAccessUser(user));
  }

  @Delete(':id/mobile-access/:userId')
  @RequirePermissions(Permission.DriversWrite)
  @UseGuards(PermissionsGuard)
  @ApiOkResponse({ type: Object })
  async unlinkMobileAccessUser(
    @CurrentTenant() ctx: TenantContext,
    @Param('id') id: string,
    @Param('userId') userId: string,
  ): Promise<{ success: true }> {
    await this.service.unlinkUserFromDriver(ctx.tenantId, id, userId);
    return { success: true };
  }

  @Post(':id/mobile-access/:userId/status')
  @RequirePermissions(Permission.DriversWrite)
  @UseGuards(PermissionsGuard)
  @ApiOkResponse({ type: Object })
  async updateMobileAccessStatus(
    @CurrentTenant() ctx: TenantContext,
    @Param('id') id: string,
    @Param('userId') userId: string,
    @Body('revoked') revoked: boolean,
  ): Promise<{ success: true }> {
    await this.service.updateDriverMobileAccessStatus(ctx.tenantId, id, userId, revoked);
    return { success: true };
  }

  @Delete(':id/mobile-access/:userId/push-devices/:deviceId')
  @RequirePermissions(Permission.DriversWrite)
  @UseGuards(PermissionsGuard)
  @ApiOkResponse({ type: Object })
  async disableMobileAccessDevice(
    @CurrentTenant() ctx: TenantContext,
    @Param('id') id: string,
    @Param('userId') userId: string,
    @Param('deviceId') deviceId: string,
  ): Promise<{ success: true }> {
    await this.service.disableDriverMobileAccessDevice(ctx.tenantId, id, userId, deviceId);
    return { success: true };
  }

  @Post(':id/guarantor')
  @RequirePermissions(Permission.GuarantorsWrite)
  @UseGuards(PermissionsGuard)
  @ApiCreatedResponse({ type: DriverGuarantorResponseDto })
  createOrUpdateGuarantor(
    @CurrentTenant() ctx: TenantContext,
    @Param('id') id: string,
    @Body() dto: CreateOrUpdateDriverGuarantorDto,
  ): Promise<DriverGuarantorResponseDto> {
    return this.service.createOrUpdateGuarantor(ctx.tenantId, id, dto);
  }

  @Delete(':id/guarantor')
  @RequirePermissions(Permission.GuarantorsWrite)
  @UseGuards(PermissionsGuard)
  @ApiOkResponse({ type: Object })
  async removeGuarantor(
    @CurrentTenant() ctx: TenantContext,
    @Param('id') id: string,
    @Body('reason') reason?: string,
  ): Promise<{ success: true }> {
    await this.service.removeGuarantor(ctx.tenantId, id, reason);
    return { success: true };
  }

  /**
   * Resolves the identity of the guarantor linked to this driver.
   * Links the guarantor to a canonical person record in the intelligence plane.
   * Returns a crossRoleConflict flag when the guarantor is also a registered
   * driver at this tenant — a risk signal is emitted automatically.
   * Throws 409 if the guarantor resolves to the same canonical person as the driver.
   */
  @Post(':id/guarantor/self-service-links')
  @RequirePermissions(Permission.GuarantorsWrite)
  @UseGuards(PermissionsGuard)
  @ApiCreatedResponse({ type: Object })
  sendGuarantorSelfServiceLink(
    @CurrentTenant() ctx: TenantContext,
    @Param('id') id: string,
  ): Promise<{ delivery: 'email'; verificationUrl: string; destination: string; otpCode: string }> {
    return this.service.sendGuarantorSelfServiceLink(ctx.tenantId, id);
  }

  @Post(':id/guarantor/reminder-controls')
  @RequirePermissions(Permission.GuarantorsWrite)
  @UseGuards(PermissionsGuard)
  @ApiCreatedResponse({ type: DriverGuarantorResponseDto })
  updateGuarantorReminderControls(
    @CurrentTenant() ctx: TenantContext,
    @Param('id') id: string,
    @Body('suppressed') suppressed: boolean,
  ): Promise<DriverGuarantorResponseDto> {
    return this.service.updateGuarantorReminderSuppression(ctx.tenantId, id, suppressed === true);
  }

  @Post(':id/guarantor/identity-resolution')
  @RequirePermissions(Permission.GuarantorsWrite)
  @UseGuards(PermissionsGuard)
  @ApiCreatedResponse({ type: Object })
  resolveGuarantorIdentity(
    @CurrentTenant() ctx: TenantContext,
    @Param('id') id: string,
    @Body() dto: ResolveDriverIdentityDto,
  ) {
    return this.service.resolveGuarantorIdentity(ctx.tenantId, id, dto);
  }

  @Get(':id')
  @RequirePermissions(Permission.DriversRead)
  @UseGuards(PermissionsGuard)
  @ApiOkResponse({ type: DriverResponseDto })
  async findOne(
    @CurrentTenant() ctx: TenantContext,
    @Param('id') id: string,
  ): Promise<DriverResponseDto> {
    assertLinkedDriverAccess(ctx, id);
    const [driver, hasPortrait] = await Promise.all([
      this.service.findOne(ctx.tenantId, id),
      this.service.hasPortrait(ctx.tenantId, id),
    ]);
    assertFleetAccess(ctx, driver.fleetId);
    return {
      ...this.toResponse(driver),
      photoUrl: hasPortrait ? `/api/drivers/${id}/portrait` : null,
      selfieImageUrl: driver.selfieImageUrl ?? null,
      providerImageUrl: driver.providerImageUrl ?? null,
      identitySignatureImageUrl: driver.identitySignatureImageUrl ?? null,
    };
  }

  @Get(':id/portrait')
  @RequirePermissions(Permission.DriversRead)
  @UseGuards(PermissionsGuard)
  async getPortrait(
    @CurrentTenant() ctx: TenantContext,
    @Param('id') id: string,
    @Res({ passthrough: true }) response: HeaderWritableResponse,
  ): Promise<StreamableFile> {
    const portrait = await this.service.getPortrait(ctx.tenantId, id);
    response.setHeader('content-type', portrait.contentType);
    response.setHeader('content-disposition', 'inline');
    return new StreamableFile(portrait.buffer);
  }

  @Get(':id/identity-image/:kind')
  @RequirePermissions(Permission.DriversRead)
  @UseGuards(PermissionsGuard)
  async getIdentityImage(
    @CurrentTenant() ctx: TenantContext,
    @Param('id') id: string,
    @Param('kind') kind: 'selfie' | 'provider' | 'signature',
    @Res({ passthrough: true }) response: HeaderWritableResponse,
  ): Promise<StreamableFile> {
    if (!['selfie', 'provider', 'signature'].includes(kind)) {
      throw new BadRequestException("kind must be one of 'selfie', 'provider', or 'signature'");
    }

    const image = await this.service.getIdentityImage(ctx.tenantId, id, kind);
    response.setHeader('content-type', image.contentType);
    response.setHeader('content-disposition', 'inline');
    return new StreamableFile(image.buffer);
  }

  @Get(':id/identity-summary')
  @RequirePermissions(Permission.DriversRead)
  @UseGuards(PermissionsGuard)
  @ApiOkResponse({ type: DriverIdentitySummaryDto })
  getIdentitySummary(
    @CurrentTenant() ctx: TenantContext,
    @Param('id') id: string,
  ): Promise<DriverIdentitySummaryDto> {
    return this.service.getIdentitySummary(ctx.tenantId, id);
  }

  @Get(':id/documents')
  @RequirePermissions(Permission.DocumentsRead)
  @UseGuards(PermissionsGuard)
  @ApiOkResponse({ type: [DriverDocumentResponseDto] })
  listDocuments(
    @CurrentTenant() ctx: TenantContext,
    @Param('id') id: string,
  ): Promise<DriverDocumentResponseDto[]> {
    return this.service.listDocuments(ctx.tenantId, id).then((documents) =>
      documents.map((document) => ({
        ...document,
        storageKey: document.storageKey ?? null,
        storageUrl: document.storageUrl ?? null,
        previewUrl: document.storageUrl?.startsWith('http')
          ? document.storageUrl
          : `/api/drivers/${id}/documents/${document.id}/content`,
      })),
    );
  }

  @Get(':id/documents/:documentId/content')
  @RequirePermissions(Permission.DocumentsRead)
  @UseGuards(PermissionsGuard)
  async getDocumentContent(
    @CurrentTenant() ctx: TenantContext,
    @Param('id') id: string,
    @Param('documentId') documentId: string,
    @Res({ passthrough: true }) response: HeaderWritableResponse,
  ): Promise<StreamableFile> {
    const document = await this.service.getDocumentContent(ctx.tenantId, id, documentId);
    response.setHeader('content-type', document.contentType);
    response.setHeader(
      'content-disposition',
      `inline; filename="${document.fileName.replace(/"/g, '')}"`,
    );
    return new StreamableFile(document.buffer);
  }

  @Post(':id/documents')
  @RequirePermissions(Permission.DocumentsWrite)
  @UseGuards(PermissionsGuard)
  @ApiCreatedResponse({ type: DriverDocumentResponseDto })
  uploadDocument(
    @CurrentTenant() ctx: TenantContext,
    @Param('id') id: string,
    @Body() dto: CreateDriverDocumentDto,
  ): Promise<DriverDocumentResponseDto> {
    return this.service.uploadDocument(ctx.tenantId, id, {
      ...dto,
      uploadedBy: ctx.userId ?? dto.uploadedBy,
    });
  }

  @Patch(':id/documents/:documentId')
  @RequirePermissions(Permission.DocumentsWrite)
  @UseGuards(PermissionsGuard)
  @ApiOkResponse({ type: DriverDocumentResponseDto })
  reviewDocument(
    @CurrentTenant() ctx: TenantContext,
    @Param('id') id: string,
    @Param('documentId') documentId: string,
    @Body() dto: UpdateDriverDocumentReviewDto,
  ): Promise<DriverDocumentResponseDto> {
    return this.service.reviewDocument(
      ctx.tenantId,
      id,
      documentId,
      dto,
      ctx.userId ?? 'tenant_operator',
    );
  }

  @Post()
  @RequirePermissions(Permission.DriversWrite)
  @RequireTenantLifecycleFeature('driver_onboarding')
  @UseGuards(PermissionsGuard)
  @ApiCreatedResponse({ type: DriverResponseDto })
  create(
    @CurrentTenant() ctx: TenantContext,
    @Body() dto: CreateDriverDto,
  ): Promise<DriverResponseDto> {
    assertFleetAccess(ctx, dto.fleetId);
    return this.service.create(ctx.tenantId, dto).then((driver) => this.toResponse(driver));
  }

  @Patch(':id/status')
  @RequirePermissions(Permission.DriversWrite)
  @UseGuards(PermissionsGuard)
  @ApiOkResponse({ type: DriverResponseDto })
  updateStatus(
    @CurrentTenant() ctx: TenantContext,
    @Param('id') id: string,
    @Body('status') status: string,
  ): Promise<DriverResponseDto> {
    return this.service.findOne(ctx.tenantId, id).then((driver) => {
      assertFleetAccess(ctx, driver.fleetId);
      return this.service
        .updateStatus(ctx.tenantId, id, status)
        .then((updatedDriver) => this.toResponse(updatedDriver));
    });
  }

  @Post(':id/archive')
  @RequirePermissions(Permission.DriversWrite)
  @UseGuards(PermissionsGuard)
  @ApiOkResponse({ type: Object })
  archiveDriver(
    @CurrentTenant() ctx: TenantContext,
    @Param('id') id: string,
    @Body('reason') reason?: string,
  ): Promise<{ message: string; mode: 'archived' }> {
    return this.service.findOne(ctx.tenantId, id).then((driver) => {
      assertFleetAccess(ctx, driver.fleetId);
      return this.service.archiveDriver(ctx.tenantId, id, {
        archivedBy: ctx.userId ?? null,
        ...(reason !== undefined ? { reason } : {}),
      });
    });
  }

  @Post(':id/identity/liveness-sessions')
  @RequirePermissions(Permission.DriversWrite)
  @UseGuards(PermissionsGuard)
  @ApiCreatedResponse({ type: Object })
  initializeIdentityLivenessSession(
    @CurrentTenant() ctx: TenantContext,
    @Param('id') id: string,
    @Body('countryCode') countryCode?: string,
  ): Promise<{
    providerName: string;
    sessionId: string;
    expiresAt?: string;
    fallbackChain: string[];
  }> {
    return this.service.initializeIdentityLivenessSession(ctx.tenantId, id, countryCode);
  }

  @Post(':id/identity-resolution')
  @RequirePermissions(Permission.DriversWrite)
  @UseGuards(PermissionsGuard)
  @ApiCreatedResponse({ type: Object })
  resolveIdentity(
    @CurrentTenant() ctx: TenantContext,
    @Param('id') id: string,
    @Body() dto: ResolveDriverIdentityDto,
  ): Promise<{
    decision: string;
    personId?: string;
    reviewCaseId?: string;
    providerLookupStatus?: string;
    providerVerificationStatus?: string;
    providerName?: string;
    matchedIdentifierType?: string;
    isVerifiedMatch?: boolean;
    verifiedProfile?: {
      fullName?: string;
      dateOfBirth?: string;
      address?: string;
      gender?: string;
      photoUrl?: string;
    };
    globalRiskScore?: number;
    riskBand?: string;
    isWatchlisted?: boolean;
    hasDuplicateIdentityFlag?: boolean;
    fraudIndicatorCount?: number;
    verificationConfidence?: number;
    livenessPassed?: boolean;
    livenessProviderName?: string;
    livenessConfidenceScore?: number;
    livenessReason?: string;
  }> {
    return this.service.resolveIdentity(ctx.tenantId, id, dto);
  }

  @Post(':id/identity-resolution/retry')
  @RequirePermissions(Permission.DriversWrite)
  @UseGuards(PermissionsGuard)
  @ApiCreatedResponse({ type: Object })
  @ApiOperation({
    summary: 'Retry identity verification for a driver in provider_unavailable pending state',
    description:
      'Re-uses the identifiers captured at the original submission. Only valid when the driver identity status is pending_verification and the latest attempt has pendingReason=provider_unavailable.',
  })
  retryIdentityVerification(
    @CurrentTenant() ctx: TenantContext,
    @Param('id') id: string,
  ): Promise<{ queued: boolean; reason?: string }> {
    return this.service.adminRetryIdentityVerification(ctx.tenantId, id);
  }

  @Patch(':id/admin-override')
  @RequirePermissions(Permission.DriversWrite)
  @UseGuards(PermissionsGuard)
  @ApiOkResponse({ type: Object })
  @ApiOperation({
    summary: 'Set or clear the admin assignment override for a driver',
    description:
      'When set, the driver is treated as eligible for assignment even if standard readiness checks are incomplete. Ignored when the org setting allowAdminAssignmentOverride is false or when the driver has active fraud flags.',
  })
  async setAdminOverride(
    @CurrentTenant() ctx: TenantContext,
    @Param('id') id: string,
    @Body('override') override: boolean,
  ): Promise<{ adminAssignmentOverride: boolean }> {
    if (typeof override !== 'boolean') {
      throw new BadRequestException('override must be a boolean');
    }
    await this.service.setAdminAssignmentOverride(ctx.tenantId, id, override, ctx.userId);
    return { adminAssignmentOverride: override };
  }

  @Post(':id/admin-override/request')
  @RequirePermissions(Permission.DriversWrite)
  @UseGuards(PermissionsGuard)
  @ApiOkResponse({ type: Object })
  @ApiOperation({
    summary: 'Request an admin assignment override OTP',
    description:
      'Captures the override reason and optional evidence, sends an OTP to the acting admin, and records the pending override request for audit.',
  })
  requestAdminOverride(
    @CurrentTenant() ctx: TenantContext,
    @Param('id') id: string,
    @Body('reason') reason: string,
    @Body('evidenceImageDataUrl') evidenceImageDataUrl?: string,
  ): Promise<{ destination: string; expiresAt: string }> {
    if (!reason?.trim()) {
      throw new BadRequestException('reason is required');
    }

    return this.service.requestAdminAssignmentOverride(ctx.tenantId, ctx.userId, id, {
      reason,
      ...(evidenceImageDataUrl?.trim()
        ? { evidenceImageDataUrl: evidenceImageDataUrl.trim() }
        : {}),
    });
  }

  @Post(':id/admin-override/confirm')
  @RequirePermissions(Permission.DriversWrite)
  @UseGuards(PermissionsGuard)
  @ApiOkResponse({ type: Object })
  @ApiOperation({
    summary: 'Confirm an admin assignment override with OTP',
    description:
      'Validates the OTP that was sent to the acting admin and only then enables the assignment-readiness override.',
  })
  confirmAdminOverride(
    @CurrentTenant() ctx: TenantContext,
    @Param('id') id: string,
    @Body('otpCode') otpCode: string,
  ): Promise<{ adminAssignmentOverride: boolean }> {
    if (!otpCode?.trim()) {
      throw new BadRequestException('otpCode is required');
    }

    return this.service.confirmAdminAssignmentOverride(ctx.tenantId, ctx.userId, id, otpCode);
  }

  private toResponse(
    driver: DriverWithIdentityState &
      Partial<DriverIntelligenceSummary> &
      Partial<DriverGuarantorSummary> &
      Partial<DriverDocumentSummary> &
      Partial<DriverMobileAccessSummary> &
      Partial<DriverReadinessSummary> &
      Partial<DriverInviteSummary> & { locked?: boolean },
  ): DriverResponseDto {
    return {
      id: driver.id,
      tenantId: driver.tenantId,
      fleetId: driver.fleetId,
      businessEntityId: driver.businessEntityId,
      operatingUnitId: driver.operatingUnitId,
      status: driver.status,
      firstName: driver.firstName,
      lastName: driver.lastName,
      phone: driver.phone,
      email: driver.email,
      organisationName: (driver as { organisationName?: string | null }).organisationName ?? null,
      selfieImageUrl: driver.selfieImageUrl ?? null,
      providerImageUrl: driver.providerImageUrl ?? null,
      identitySignatureImageUrl: driver.identitySignatureImageUrl ?? null,
      selfServiceInviteStatus:
        (driver as Partial<DriverInviteSummary>).selfServiceInviteStatus ?? null,
      selfServiceInviteReason:
        (driver as Partial<DriverInviteSummary>).selfServiceInviteReason ?? null,
      identityProfile:
        (driver as { identityProfile?: Record<string, unknown> | null }).identityProfile ?? null,
      operationalProfile:
        (driver as { operationalProfile?: Record<string, unknown> | null }).operationalProfile ??
        null,
      identityVerificationMetadata:
        (driver as { identityVerificationMetadata?: Record<string, unknown> | null })
          .identityVerificationMetadata ?? null,
      identityProviderRawData:
        (driver as { identityProviderRawData?: Record<string, unknown> | null })
          .identityProviderRawData ?? null,
      dateOfBirth: driver.dateOfBirth,
      gender: driver.gender ?? null,
      nationality: driver.nationality,
      hasResolvedIdentity: Boolean(driver.personId),
      identityStatus: driver.identityStatus,
      identityReviewCaseId: driver.identityReviewCaseId ?? null,
      identityReviewStatus: driver.identityReviewStatus ?? null,
      identityLastDecision: driver.identityLastDecision ?? null,
      identityVerificationConfidence: driver.identityVerificationConfidence ?? null,
      identityLastVerifiedAt: driver.identityLastVerifiedAt ?? null,
      identityLivenessPassed: driver.identityLivenessPassed ?? null,
      identityLivenessProvider: driver.identityLivenessProvider ?? null,
      identityLivenessConfidence: driver.identityLivenessConfidence ?? null,
      identityLivenessReason: driver.identityLivenessReason ?? null,
      verificationProvider: driver.verificationProvider ?? null,
      verificationStatus: driver.verificationStatus ?? null,
      verificationCountryCode: driver.verificationCountryCode ?? null,
      globalRiskScore: driver.globalRiskScore ?? null,
      riskBand: driver.riskBand ?? null,
      isWatchlisted: driver.isWatchlisted ?? null,
      duplicateIdentityFlag: driver.duplicateIdentityFlag ?? null,
      reverificationRequired:
        (driver as { reverificationRequired?: boolean | null }).reverificationRequired ?? null,
      reverificationReason:
        (driver as { reverificationReason?: string | null }).reverificationReason ?? null,
      hasGuarantor: driver.hasGuarantor ?? false,
      guarantorStatus: driver.guarantorStatus ?? null,
      guarantorDisconnectedAt: driver.guarantorDisconnectedAt ?? null,
      guarantorPersonId: driver.guarantorPersonId ?? null,
      guarantorRiskBand: driver.guarantorRiskBand ?? null,
      guarantorIsWatchlisted: driver.guarantorIsWatchlisted ?? null,
      guarantorReverificationRequired:
        (driver as { guarantorReverificationRequired?: boolean | null })
          .guarantorReverificationRequired ?? null,
      guarantorReverificationReason:
        (driver as { guarantorReverificationReason?: string | null })
          .guarantorReverificationReason ?? null,
      guarantorIsAlsoDriver: driver.guarantorIsAlsoDriver ?? false,
      hasApprovedLicence: driver.hasApprovedLicence ?? false,
      hasMobileAccess: driver.hasMobileAccess ?? false,
      mobileAccessStatus: driver.mobileAccessStatus ?? null,
      pendingDocumentCount: driver.pendingDocumentCount ?? 0,
      rejectedDocumentCount: driver.rejectedDocumentCount ?? 0,
      expiredDocumentCount: driver.expiredDocumentCount ?? 0,
      driverLicenceVerification:
        (driver as Partial<DriverDocumentSummary>).driverLicenceVerification ?? null,
      authenticationAccess: driver.authenticationAccess ?? 'not_ready',
      authenticationAccessReasons: driver.authenticationAccessReasons ?? [],
      activationReadiness: driver.activationReadiness ?? 'not_ready',
      activationReadinessReasons: driver.activationReadinessReasons ?? [],
      assignmentReadiness: driver.assignmentReadiness ?? 'not_ready',
      assignmentReadinessReasons: driver.assignmentReadinessReasons ?? [],
      remittanceReadiness: driver.remittanceReadiness ?? 'not_ready',
      remittanceReadinessReasons: driver.remittanceReadinessReasons ?? [],
      adminAssignmentOverride: driver.adminAssignmentOverride ?? false,
      createdAt: driver.createdAt,
      updatedAt: driver.updatedAt,
      locked: driver.locked ?? false,
    };
  }

  private toMobileAccessUser(user: {
    id: string;
    email: string;
    phone?: string | null;
    name: string;
    role: string;
    settings?: unknown;
    isActive: boolean;
    mobileAccessRevoked?: boolean | null;
    activePushDeviceCount?: number;
    lastPushDeviceSeenAt?: Date | null;
    pushDevices?: Array<{
      id: string;
      platform: string;
      deviceToken: string;
      lastSeenAt: Date;
      createdAt: Date;
      disabledAt: Date | null;
    }>;
    driverId?: string | null;
    matchReason?: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): DriverMobileAccessUserDto {
    return {
      id: user.id,
      email: user.email,
      phone: user.phone ?? null,
      name: user.name,
      role: user.role,
      accessMode:
        typeof user.settings === 'object' &&
        user.settings &&
        !Array.isArray(user.settings) &&
        (user.settings as Record<string, unknown>).accessMode === 'driver_mobile'
          ? 'driver_mobile'
          : user.driverId
            ? 'driver_mobile'
            : 'tenant_user',
      isActive: user.isActive,
      mobileAccessRevoked: user.mobileAccessRevoked ?? null,
      activePushDeviceCount: user.activePushDeviceCount ?? 0,
      lastPushDeviceSeenAt: user.lastPushDeviceSeenAt?.toISOString() ?? null,
      pushDevices:
        user.pushDevices?.map(
          (device): DriverMobileAccessPushDeviceDto => ({
            id: device.id,
            platform: device.platform as DriverMobileAccessPushDeviceDto['platform'],
            tokenPreview:
              device.deviceToken.length <= 12
                ? device.deviceToken
                : `${device.deviceToken.slice(0, 8)}...${device.deviceToken.slice(-4)}`,
            lastSeenAt: device.lastSeenAt.toISOString(),
            registeredAt: device.createdAt.toISOString(),
            disabledAt: device.disabledAt?.toISOString() ?? null,
          }),
        ) ?? [],
      driverId: user.driverId ?? null,
      matchReason: user.matchReason ?? null,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}

@Controller('driver-self-service')
export class DriverSelfServiceController {
  constructor(
    private readonly service: DriversService,
    private readonly notificationsService: NotificationsService,
    private readonly assignmentsService: AssignmentsService,
    private readonly remittanceService: RemittanceService,
  ) {}

  @Post('exchange-otp')
  @ApiCreatedResponse({ type: Object })
  exchangeOtp(@Body('otpCode') otpCode: string): Promise<{ token: string }> {
    return this.service.exchangeDriverSelfServiceOtp(otpCode);
  }

  // Password-based login for returning drivers who have already completed account setup.
  // Returns the same self-service token shape as exchange-otp so the frontend can
  // use a single token-bearing flow regardless of entry point.
  @Post('login')
  @ApiCreatedResponse({ type: Object })
  loginWithPassword(
    @Body('identifier') identifier: string,
    @Body('password') password: string,
  ): Promise<{ token: string }> {
    if (!identifier?.trim() || !password?.trim()) {
      throw new BadRequestException('identifier and password are required');
    }
    return this.service.loginDriverSelfServiceWithPassword(identifier, password);
  }

  // Backend-driven state machine: returns the single next required onboarding step.
  // The frontend must call this after each step completion instead of computing
  // flow state itself from raw driver fields.
  @Post('onboarding-step')
  @ApiCreatedResponse({ type: Object })
  getOnboardingStep(@Body('token') token: string) {
    if (!token?.trim()) {
      throw new BadRequestException('token is required');
    }
    return this.service.getOnboardingStep(token);
  }

  @Post('context')
  @ApiCreatedResponse({ type: DriverResponseDto })
  async getContext(@Body('token') token: string): Promise<DriverResponseDto> {
    const driver = await this.service.getSelfServiceContext(token);
    const guarantorSummary = driver as Partial<DriverGuarantorSummary>;
    return {
      id: driver.id,
      tenantId: driver.tenantId,
      fleetId: driver.fleetId,
      businessEntityId: driver.businessEntityId,
      operatingUnitId: driver.operatingUnitId,
      status: driver.status,
      firstName: driver.firstName,
      lastName: driver.lastName,
      phone: driver.phone,
      email: driver.email,
      organisationName: (driver as { organisationName?: string | null }).organisationName ?? null,
      photoUrl: driver.selfieImageUrl ? `/api/drivers/${driver.id}/portrait` : null,
      selfieImageUrl: driver.selfieImageUrl ?? null,
      providerImageUrl: driver.providerImageUrl ?? null,
      identitySignatureImageUrl: driver.identitySignatureImageUrl ?? null,
      identityProfile:
        (driver as { identityProfile?: Record<string, unknown> | null }).identityProfile ?? null,
      operationalProfile:
        (driver as { operationalProfile?: Record<string, unknown> | null }).operationalProfile ??
        null,
      identityVerificationMetadata:
        (driver as { identityVerificationMetadata?: Record<string, unknown> | null })
          .identityVerificationMetadata ?? null,
      identityProviderRawData:
        (driver as { identityProviderRawData?: Record<string, unknown> | null })
          .identityProviderRawData ?? null,
      dateOfBirth: driver.dateOfBirth,
      gender: driver.gender ?? null,
      nationality: driver.nationality,
      hasResolvedIdentity: Boolean(driver.personId),
      identityStatus: driver.identityStatus,
      identityReviewCaseId: driver.identityReviewCaseId ?? null,
      identityReviewStatus: driver.identityReviewStatus ?? null,
      identityLastDecision: driver.identityLastDecision ?? null,
      identityVerificationConfidence: driver.identityVerificationConfidence ?? null,
      identityLastVerifiedAt: driver.identityLastVerifiedAt ?? null,
      identityLivenessPassed: driver.identityLivenessPassed ?? null,
      identityLivenessProvider: driver.identityLivenessProvider ?? null,
      identityLivenessConfidence: driver.identityLivenessConfidence ?? null,
      identityLivenessReason: driver.identityLivenessReason ?? null,
      verificationProvider: driver.verificationProvider ?? null,
      verificationStatus: driver.verificationStatus ?? null,
      verificationCountryCode: driver.verificationCountryCode ?? null,
      globalRiskScore: driver.globalRiskScore ?? null,
      riskBand: driver.riskBand ?? null,
      isWatchlisted: driver.isWatchlisted ?? null,
      duplicateIdentityFlag: driver.duplicateIdentityFlag ?? null,
      reverificationRequired:
        (driver as { reverificationRequired?: boolean | null }).reverificationRequired ?? null,
      reverificationReason:
        (driver as { reverificationReason?: string | null }).reverificationReason ?? null,
      hasGuarantor: guarantorSummary.hasGuarantor ?? false,
      guarantorStatus: guarantorSummary.guarantorStatus ?? null,
      guarantorDisconnectedAt: guarantorSummary.guarantorDisconnectedAt ?? null,
      guarantorPersonId: guarantorSummary.guarantorPersonId ?? null,
      guarantorRiskBand: guarantorSummary.guarantorRiskBand ?? null,
      guarantorIsWatchlisted: guarantorSummary.guarantorIsWatchlisted ?? null,
      guarantorReverificationRequired: guarantorSummary.guarantorReverificationRequired ?? null,
      guarantorReverificationReason: guarantorSummary.guarantorReverificationReason ?? null,
      guarantorIsAlsoDriver: guarantorSummary.guarantorIsAlsoDriver ?? false,
      hasApprovedLicence: (driver as Partial<DriverDocumentSummary>).hasApprovedLicence ?? false,
      driverLicenceVerification:
        (driver as Partial<DriverDocumentSummary>).driverLicenceVerification ?? null,
      hasMobileAccess: (driver as Partial<DriverMobileAccessSummary>).hasMobileAccess ?? false,
      mobileAccessStatus: (driver as Partial<DriverMobileAccessSummary>).mobileAccessStatus ?? null,
      enabledDriverIdentifierTypes:
        (driver as { enabledDriverIdentifierTypes?: string[] }).enabledDriverIdentifierTypes ?? [],
      requiredDriverIdentifierTypes:
        (driver as { requiredDriverIdentifierTypes?: string[] }).requiredDriverIdentifierTypes ??
        [],
      requiredDriverDocumentSlugs:
        (driver as { requiredDriverDocumentSlugs?: string[] }).requiredDriverDocumentSlugs ?? [],
      driverPaysKyc: (driver as { driverPaysKyc?: boolean }).driverPaysKyc ?? false,
      verificationTier:
        (
          driver as {
            verificationTier?:
              | 'BASIC_IDENTITY'
              | 'VERIFIED_IDENTITY'
              | 'FULL_TRUST_VERIFICATION';
          }
        ).verificationTier ?? 'BASIC_IDENTITY',
      verificationTierLabel:
        (driver as { verificationTierLabel?: string | null }).verificationTierLabel ??
        'Basic Identity',
      verificationTierDescription:
        (driver as { verificationTierDescription?: string | null }).verificationTierDescription ??
        'Confirm who the driver is',
      verificationTierComponents:
        (
          driver as {
            verificationTierComponents?: Array<'identity' | 'guarantor' | 'drivers_license'>;
          }
        ).verificationTierComponents ?? ['identity'],
      verificationComponents:
        (
          driver as {
            verificationComponents?: Array<{
              key: 'identity' | 'guarantor' | 'drivers_license';
              label: string;
              required: boolean;
              status: 'completed' | 'pending' | 'not_required';
              message: string;
            }>;
          }
        ).verificationComponents ?? [],
      kycPaymentVerified: (driver as { kycPaymentVerified?: boolean }).kycPaymentVerified ?? false,
      verificationPaymentState:
        (
          driver as {
            verificationPaymentState?:
              | 'not_required'
              | 'required'
              | 'pending'
              | 'paid'
              | 'reconciled';
          }
        ).verificationPaymentState ?? 'not_required',
      verificationEntitlementState:
        (
          driver as {
            verificationEntitlementState?:
              | 'none'
              | 'paid'
              | 'reserved'
              | 'consumed'
              | 'expired'
              | 'refunded'
              | 'cancelled';
          }
        ).verificationEntitlementState ?? 'none',
      verificationState:
        (
          driver as {
            verificationState?:
              | 'not_started'
              | 'in_progress'
              | 'provider_called'
              | 'success'
              | 'failed';
          }
        ).verificationState ?? 'not_started',
      verificationEntitlementCode:
        (driver as { verificationEntitlementCode?: string | null }).verificationEntitlementCode ??
        null,
      verificationPaymentReference:
        (driver as { verificationPaymentReference?: string | null }).verificationPaymentReference ??
        null,
      verificationConsumedAt: (() => {
        const consumedAt = (
          driver as {
            verificationConsumedAt?: Date | string | null;
          }
        ).verificationConsumedAt;
        if (!consumedAt) {
          return null;
        }
        return consumedAt instanceof Date
          ? consumedAt.toISOString()
          : new Date(consumedAt).toISOString();
      })(),
      verificationAttemptCount:
        (driver as { verificationAttemptCount?: number }).verificationAttemptCount ?? 0,
      verificationBlockedReason:
        (driver as { verificationBlockedReason?: string | null }).verificationBlockedReason ?? null,
      verificationPayer:
        (driver as { verificationPayer?: 'driver' | 'organisation' }).verificationPayer ??
        'organisation',
      verificationAmountMinorUnits:
        (driver as { verificationAmountMinorUnits?: number }).verificationAmountMinorUnits ?? 0,
      verificationCurrency:
        (driver as { verificationCurrency?: string }).verificationCurrency ?? null,
      verificationWalletBalanceMinorUnits:
        (driver as { verificationWalletBalanceMinorUnits?: number })
          .verificationWalletBalanceMinorUnits ?? 0,
      verificationAvailableSpendMinorUnits:
        (driver as { verificationAvailableSpendMinorUnits?: number })
          .verificationAvailableSpendMinorUnits ?? 0,
      verificationCreditLimitMinorUnits:
        (driver as { verificationCreditLimitMinorUnits?: number })
          .verificationCreditLimitMinorUnits ?? 0,
      verificationCreditUsedMinorUnits:
        (driver as { verificationCreditUsedMinorUnits?: number })
          .verificationCreditUsedMinorUnits ?? 0,
      verificationStarterCreditActive:
        (driver as { verificationStarterCreditActive?: boolean })
          .verificationStarterCreditActive ?? false,
      verificationCardCreditActive:
        (driver as { verificationCardCreditActive?: boolean }).verificationCardCreditActive ??
        false,
      verificationSavedCard:
        (driver as {
          verificationSavedCard?: {
            provider: string;
            last4: string;
            brand: string;
            status: string;
            active: boolean;
            createdAt: string;
            initialReference?: string | null;
          } | null;
        }).verificationSavedCard ?? null,
      verificationPaymentStatus:
        (
          driver as {
            verificationPaymentStatus?:
              | 'not_required'
              | 'ready'
              | 'driver_payment_required'
              | 'wallet_missing'
              | 'insufficient_balance';
          }
        ).verificationPaymentStatus ?? 'not_required',
      verificationPaymentMessage:
        (driver as { verificationPaymentMessage?: string | null }).verificationPaymentMessage ??
        null,
      localRiskFlags: (driver as { localRiskFlags?: string[] }).localRiskFlags ?? [],
      ...((driver as {
        canonicalInsights?: {
          driverIdentity: {
            personId: string | null;
            tenantCount: number | null;
            hasMultiTenantPresence: boolean;
            hasMultiRolePresence: boolean;
            linkedRoles: string[];
          };
          guarantorIdentity: {
            personId: string | null;
            tenantCount: number | null;
            hasMultiTenantPresence: boolean;
            hasMultiRolePresence: boolean;
            linkedRoles: string[];
            reuseCount: number | null;
          } | null;
          fraudIndicators: string[];
        } | null;
      }).canonicalInsights
        ? {
            canonicalInsights: (driver as {
              canonicalInsights?: {
                driverIdentity: {
                  personId: string | null;
                  tenantCount: number | null;
                  hasMultiTenantPresence: boolean;
                  hasMultiRolePresence: boolean;
                  linkedRoles: string[];
                };
                guarantorIdentity: {
                  personId: string | null;
                  tenantCount: number | null;
                  hasMultiTenantPresence: boolean;
                  hasMultiRolePresence: boolean;
                  linkedRoles: string[];
                  reuseCount: number | null;
                } | null;
                fraudIndicators: string[];
              } | null;
            }).canonicalInsights,
          }
        : {}),
      pendingDocumentCount: (driver as Partial<DriverDocumentSummary>).pendingDocumentCount ?? 0,
      rejectedDocumentCount: (driver as Partial<DriverDocumentSummary>).rejectedDocumentCount ?? 0,
      expiredDocumentCount: (driver as Partial<DriverDocumentSummary>).expiredDocumentCount ?? 0,
      authenticationAccess:
        (driver as Partial<DriverReadinessSummary>).authenticationAccess ?? 'not_ready',
      authenticationAccessReasons:
        (driver as Partial<DriverReadinessSummary>).authenticationAccessReasons ?? [],
      activationReadiness:
        (driver as Partial<DriverReadinessSummary>).activationReadiness ?? 'not_ready',
      activationReadinessReasons:
        (driver as Partial<DriverReadinessSummary>).activationReadinessReasons ?? [],
      assignmentReadiness:
        (driver as Partial<DriverReadinessSummary>).assignmentReadiness ?? 'not_ready',
      assignmentReadinessReasons:
        (driver as Partial<DriverReadinessSummary>).assignmentReadinessReasons ?? [],
      remittanceReadiness:
        (driver as Partial<DriverReadinessSummary>).remittanceReadiness ?? 'not_ready',
      remittanceReadinessReasons:
        (driver as Partial<DriverReadinessSummary>).remittanceReadinessReasons ?? [],
      adminAssignmentOverride: driver.adminAssignmentOverride ?? false,
      createdAt: driver.createdAt,
      updatedAt: driver.updatedAt,
      locked: false, // self-service context is never subscription-locked
    };
  }

  @Post('notify-organisation')
  @ApiCreatedResponse({ type: Object })
  async notifyOrganisation(@Body('token') token: string): Promise<{ message: string }> {
    if (!token?.trim()) {
      throw new BadRequestException('token is required');
    }

    const driver = await this.service.getSelfServiceContext(token);
    await this.notificationsService.notifyDriverVerificationSetupRequired({
      tenantId: driver.tenantId,
      driverId: driver.id,
      driverName: `${driver.firstName ?? ''} ${driver.lastName ?? ''}`.trim() || 'Driver',
      organisationName: (driver as { organisationName?: string | null }).organisationName ?? null,
      tenantCountry: null,
      verificationTierLabel:
        (driver as { verificationTierLabel?: string | null }).verificationTierLabel ?? null,
      actionUrl: `/drivers/${driver.id}`,
    });

    return {
      message: 'Your organisation has been notified that you are ready to continue verification.',
    };
  }

  @Post('assignments')
  @ApiCreatedResponse({ type: Object })
  listAssignments(@Body('token') token: string) {
    if (!token?.trim()) {
      throw new BadRequestException('token is required');
    }
    return this.service.listAssignmentsFromSelfService(token);
  }

  @Post('notifications')
  @ApiCreatedResponse({ type: [UserNotificationResponseDto] })
  async listNotifications(
    @Body('token') token: string,
  ): Promise<UserNotificationResponseDto[]> {
    if (!token?.trim()) {
      throw new BadRequestException('token is required');
    }

    const notifications = await this.service.listNotificationsFromSelfService(token);
    return notifications.map(mapUserNotification);
  }

  @Post('notifications/:notificationId/read')
  @ApiCreatedResponse({ type: UserNotificationResponseDto })
  async markNotificationRead(
    @Body('token') token: string,
    @Param('notificationId') notificationId: string,
  ): Promise<UserNotificationResponseDto> {
    if (!token?.trim()) {
      throw new BadRequestException('token is required');
    }

    return mapUserNotification(
      await this.service.markNotificationReadFromSelfService(token, notificationId),
    );
  }

  @Post('assignments/:assignmentId/accept')
  @ApiCreatedResponse({ type: Object })
  async acceptAssignment(
    @Body('token') token: string,
    @Param('assignmentId') assignmentId: string,
    @Body('note') note?: string,
  ) {
    if (!token?.trim()) {
      throw new BadRequestException('token is required');
    }
    const context = await this.service.getSelfServiceContext(token);
    const assignment = await this.assignmentsService.findOne(context.tenantId, assignmentId);
    if (assignment.driverId !== context.id) {
      throw new BadRequestException('This assignment does not belong to the signed-in driver.');
    }
    return this.assignmentsService.acceptDriverTerms(context.tenantId, assignmentId, {
      acceptedFrom: 'driver_self_service_web',
      confirmationMethod: 'self_service_web',
      ...(note ? { note } : {}),
    });
  }

  @Post('assignments/:assignmentId/decline')
  @ApiCreatedResponse({ type: Object })
  async declineAssignment(
    @Body('token') token: string,
    @Param('assignmentId') assignmentId: string,
    @Body('note') note?: string,
  ) {
    if (!token?.trim()) {
      throw new BadRequestException('token is required');
    }
    const context = await this.service.getSelfServiceContext(token);
    const assignment = await this.assignmentsService.findOne(context.tenantId, assignmentId);
    if (assignment.driverId !== context.id) {
      throw new BadRequestException('This assignment does not belong to the signed-in driver.');
    }
    return this.assignmentsService.decline(context.tenantId, assignmentId, {
      declinedFrom: 'driver_self_service_web',
      ...(note ? { note } : {}),
    });
  }

  @Post('remittance/list')
  @ApiCreatedResponse({ type: Object })
  async listRemittance(@Body('token') token: string) {
    if (!token?.trim()) {
      throw new BadRequestException('token is required');
    }

    const context = await this.service.getSelfServiceContext(token);
    const result = await this.remittanceService.list(context.tenantId, {
      driverId: context.id,
      limit: 50,
    });
    return result.data;
  }

  @Post('remittance')
  @ApiCreatedResponse({ type: Object })
  async recordRemittance(
    @Body()
    body: {
      token?: string;
      assignmentId?: string;
      fleetId?: string;
      amountMinorUnits?: number;
      currency?: string;
      dueDate?: string;
      notes?: string;
      clientReferenceId?: string;
      submissionSource?: string;
      syncStatus?: string;
      originalCapturedAt?: string;
      evidence?: Record<string, unknown>;
      shiftCode?: string;
      checkpointLabel?: string;
    },
  ) {
    const token = body.token?.trim();
    if (!token) {
      throw new BadRequestException('token is required');
    }
    if (!body.assignmentId?.trim()) {
      throw new BadRequestException('assignmentId is required');
    }

    const context = await this.service.getSelfServiceContext(token);
    const assignment = await this.assignmentsService.findOne(context.tenantId, body.assignmentId);
    if (assignment.driverId !== context.id) {
      throw new BadRequestException('This assignment does not belong to the signed-in driver.');
    }

    return this.remittanceService.record(context.tenantId, {
      assignmentId: body.assignmentId,
      ...(body.fleetId ? { fleetId: body.fleetId } : {}),
      ...(typeof body.amountMinorUnits === 'number'
        ? { amountMinorUnits: body.amountMinorUnits }
        : {}),
      ...(body.currency ? { currency: body.currency } : {}),
      ...(body.dueDate ? { dueDate: body.dueDate } : {}),
      ...(body.notes ? { notes: body.notes } : {}),
      ...(body.clientReferenceId ? { clientReferenceId: body.clientReferenceId } : {}),
      submissionSource: body.submissionSource ?? 'online',
      ...(body.syncStatus ? { syncStatus: body.syncStatus } : {}),
      ...(body.originalCapturedAt ? { originalCapturedAt: body.originalCapturedAt } : {}),
      ...(body.evidence ? { evidence: body.evidence } : {}),
      ...(body.shiftCode ? { shiftCode: body.shiftCode } : {}),
      ...(body.checkpointLabel ? { checkpointLabel: body.checkpointLabel } : {}),
    });
  }

  @Post('liveness-sessions')
  @ApiCreatedResponse({ type: Object })
  initializeIdentityLivenessSession(
    @Body('token') token: string,
    @Body('countryCode') countryCode?: string,
  ) {
    return this.service.initializeIdentityLivenessSessionFromSelfService(token, countryCode);
  }

  @Post('liveness-readiness')
  @ApiCreatedResponse({ type: Object })
  getIdentityLivenessReadiness(
    @Body('token') token: string,
    @Body('countryCode') countryCode?: string,
  ) {
    return this.service.getIdentityLivenessReadinessFromSelfService(token, countryCode);
  }

  @Post('identity-resolution')
  @ApiCreatedResponse({ type: Object })
  resolveIdentity(
    @Body('token') token: string,
    @Body() dto: ResolveDriverIdentityDto & { token?: string },
  ) {
    const { token: _ignored, ...payload } = dto;
    return this.service.resolveIdentityFromSelfService(token, payload);
  }

  @Post('verification-consent')
  @ApiCreatedResponse({ type: Object })
  recordVerificationConsent(@Body('token') token: string) {
    if (!token?.trim()) {
      throw new BadRequestException('token is required');
    }
    return this.service.recordDriverSelfServiceVerificationConsent(token);
  }

  @Post('documents')
  @ApiCreatedResponse({ type: DriverDocumentResponseDto })
  uploadDocument(
    @Body('token') token: string,
    @Body() dto: CreateDriverDocumentDto & { token?: string },
  ) {
    const { token: _ignored, ...payload } = dto;
    return this.service.uploadDocumentFromSelfService(token, payload);
  }

  @Post('documents/:documentId/remove')
  @ApiCreatedResponse({ type: Object })
  removeDocument(@Body('token') token: string, @Param('documentId') documentId: string) {
    return this.service.removeDocumentFromSelfService(token, documentId);
  }

  @Post('create-account')
  @ApiCreatedResponse({ type: Object })
  createAccount(
    @Body('token') token: string,
    @Body('email') email: string,
    @Body('password') password: string,
  ) {
    if (!token?.trim() || !email?.trim() || !password?.trim()) {
      throw new BadRequestException('token, email and password are required');
    }
    return this.service.createDriverMobileAccountFromSelfService(token, email, password);
  }

  @Post('update-contact')
  @ApiCreatedResponse({ type: Object })
  updateContact(
    @Body('token') token: string,
    @Body('email') email?: string,
    @Body('phone') phone?: string,
  ): Promise<{ message: string }> {
    if (!token?.trim()) {
      throw new BadRequestException('token is required');
    }
    return this.service.updateContactFromSelfService(token, {
      ...(email ? { email } : {}),
      ...(phone ? { phone } : {}),
    });
  }

  @Post('update-profile')
  @ApiCreatedResponse({ type: Object })
  updateProfile(
    @Body('token') token: string,
    @Body('phoneNumber') phoneNumber?: string,
    @Body('address') address?: string,
    @Body('town') town?: string,
    @Body('localGovernmentArea') localGovernmentArea?: string,
    @Body('state') state?: string,
    @Body('nextOfKinName') nextOfKinName?: string,
    @Body('nextOfKinPhone') nextOfKinPhone?: string,
    @Body('nextOfKinRelationship') nextOfKinRelationship?: string,
    @Body('emergencyContactName') emergencyContactName?: string,
    @Body('emergencyContactPhone') emergencyContactPhone?: string,
    @Body('emergencyContactRelationship') emergencyContactRelationship?: string,
  ): Promise<{ message: string }> {
    if (!token?.trim()) {
      throw new BadRequestException('token is required');
    }
    return this.service.updateProfileFromSelfService(token, {
      ...(phoneNumber ? { phoneNumber } : {}),
      ...(address ? { address } : {}),
      ...(town ? { town } : {}),
      ...(localGovernmentArea ? { localGovernmentArea } : {}),
      ...(state ? { state } : {}),
      ...(nextOfKinName ? { nextOfKinName } : {}),
      ...(nextOfKinPhone ? { nextOfKinPhone } : {}),
      ...(nextOfKinRelationship ? { nextOfKinRelationship } : {}),
      ...(emergencyContactName ? { emergencyContactName } : {}),
      ...(emergencyContactPhone ? { emergencyContactPhone } : {}),
      ...(emergencyContactRelationship ? { emergencyContactRelationship } : {}),
    });
  }

  @Post('guarantor')
  @ApiCreatedResponse({ type: Object })
  submitGuarantor(
    @Body('token') token: string,
    @Body() dto: CreateOrUpdateDriverGuarantorDto & { token?: string },
  ) {
    const { token: _ignored, ...guarantorDto } = dto;
    return this.service.submitGuarantorFromSelfService(token, guarantorDto);
  }

  @Post('guarantor-capacity')
  @ApiCreatedResponse({ type: Object })
  assessGuarantorCapacity(
    @Body('token') token: string,
    @Body('phone') phone?: string,
    @Body('email') email?: string,
    @Body('countryCode') countryCode?: string,
  ) {
    if (!token?.trim()) {
      throw new BadRequestException('token is required');
    }
    return this.service.assessGuarantorCapacityFromSelfService(token, {
      ...(phone ? { phone } : {}),
      ...(email ? { email } : {}),
      ...(countryCode ? { countryCode } : {}),
    });
  }

  @Post('guarantor/resend-invite')
  @ApiCreatedResponse({ type: Object })
  resendGuarantorInvite(@Body('token') token: string) {
    if (!token?.trim()) {
      throw new BadRequestException('token is required');
    }
    return this.service.resendGuarantorInviteFromSelfService(token);
  }

  @Post('kyc-checkout')
  @ApiCreatedResponse({ type: Object })
  initiateKycCheckout(
    @Body('token') token: string,
    @Body('provider') provider: 'paystack' | 'flutterwave',
    @Body('returnUrl') returnUrl?: string,
  ) {
    return this.service.initiateKycCheckoutFromSelfService(
      token,
      provider ?? 'paystack',
      returnUrl,
    );
  }

  @Post('verify-kyc-payment')
  @ApiCreatedResponse({ type: Object })
  verifyKycPayment(
    @Body('token') token: string,
    @Body('provider') provider: string,
    @Body('reference') reference: string,
  ) {
    return this.service.verifyKycPaymentFromSelfService(token, provider, reference);
  }

  @Post('verification-addon-checkout')
  @ApiCreatedResponse({ type: Object })
  initiateVerificationAddonCheckout(
    @Body('token') token: string,
    @Body('chargeKey') chargeKey: 'guarantor_verification' | 'drivers_license_verification',
    @Body('provider') provider: 'paystack' | 'flutterwave',
    @Body('returnUrl') returnUrl?: string,
  ) {
    return this.service.initiateVerificationAddonCheckoutFromSelfService(
      token,
      chargeKey,
      provider ?? 'paystack',
      returnUrl,
    );
  }

  @Post('verify-verification-addon-payment')
  @ApiCreatedResponse({ type: Object })
  verifyVerificationAddonPayment(
    @Body('token') token: string,
    @Body('chargeKey') chargeKey: 'guarantor_verification' | 'drivers_license_verification',
    @Body('provider') provider: string,
    @Body('reference') reference: string,
  ) {
    return this.service.verifyVerificationAddonPaymentFromSelfService(
      token,
      chargeKey,
      provider,
      reference,
    );
  }

  @Post('documents/list')
  @ApiCreatedResponse({ type: [DriverDocumentResponseDto] })
  listDocuments(@Body('token') token: string) {
    return this.service.listDocumentsFromSelfService(token).then((documents) =>
      documents.map((document) => ({
        ...document,
        storageKey: document.storageKey ?? null,
        storageUrl: document.storageUrl ?? null,
        previewUrl: document.storageUrl?.startsWith('http')
          ? document.storageUrl
          : `/api/drivers/${document.driverId}/documents/${document.id}/content?token=${encodeURIComponent(token)}`,
      })),
    );
  }

  // Zero-trust document verification: submit document type + ID number.
  // Calls the configured identity provider and stores the result.
  @Post('verify-document-id')
  @ApiCreatedResponse({ type: Object })
  verifyDocumentId(
    @Body('token') token: string,
    @Body('documentType') documentType: string,
    @Body('idNumber') idNumber: string,
    @Body('countryCode') countryCode: string,
    @Body('firstName') firstName?: string,
    @Body('lastName') lastName?: string,
    @Body('dateOfBirth') dateOfBirth?: string,
  ) {
    if (!token?.trim() || !documentType?.trim() || !idNumber?.trim() || !countryCode?.trim()) {
      throw new BadRequestException('token, documentType, idNumber, and countryCode are required');
    }
    return this.service.verifyDocumentIdFromSelfService(token, {
      documentType,
      idNumber,
      countryCode,
      ...(firstName ? { firstName } : {}),
      ...(lastName ? { lastName } : {}),
      ...(dateOfBirth ? { dateOfBirth } : {}),
    });
  }

  // List all document verification records for the self-service driver.
  @Post('document-verifications/list')
  @ApiCreatedResponse({ type: Object })
  listDocumentVerifications(@Body('token') token: string) {
    if (!token?.trim()) {
      throw new BadRequestException('token is required');
    }
    return this.service.listDocumentVerificationsFromSelfService(token);
  }

  @Post('authenticated-token')
  @UseGuards(TenantAuthGuard, TenantLifecycleGuard)
  @ApiCreatedResponse({ type: Object })
  issueAuthenticatedContinuationToken(@CurrentTenant() ctx: TenantContext) {
    return this.service.issueDriverSelfServiceContinuationToken(ctx.tenantId, ctx.userId);
  }

  @Get('documents/:documentId/content')
  async getDocumentContent(
    @Query('token') token: string,
    @Param('documentId') documentId: string,
    @Res({ passthrough: true }) response: HeaderWritableResponse,
  ): Promise<StreamableFile> {
    const document = await this.service.getDocumentContentFromSelfService(token, documentId);
    response.setHeader('content-type', document.contentType);
    response.setHeader(
      'content-disposition',
      `inline; filename="${document.fileName.replace(/"/g, '')}"`,
    );
    return new StreamableFile(document.buffer);
  }
}

@Controller('guarantor-self-service')
export class GuarantorSelfServiceController {
  constructor(private readonly service: DriversService) {}

  @Post('exchange-otp')
  @ApiCreatedResponse({ type: Object })
  exchangeOtp(@Body('otpCode') otpCode: string): Promise<{ token: string }> {
    return this.service.exchangeGuarantorSelfServiceOtp(otpCode);
  }

  @Post('context')
  @ApiCreatedResponse({ type: Object })
  getContext(@Body('token') token: string) {
    return this.service.getGuarantorSelfServiceContext(token);
  }

  @Post('liveness-sessions')
  @ApiCreatedResponse({ type: Object })
  initializeLivenessSession(
    @Body('token') token: string,
    @Body('countryCode') countryCode?: string,
  ) {
    return this.service.initializeGuarantorLivenessSessionFromSelfService(token, countryCode);
  }

  @Post('identity-resolution')
  @ApiCreatedResponse({ type: Object })
  resolveIdentity(
    @Body('token') token: string,
    @Body() dto: ResolveDriverIdentityDto & { token?: string },
  ) {
    const { token: _ignored, ...payload } = dto;
    return this.service.resolveGuarantorIdentityFromSelfService(token, payload);
  }

  @Post('verification-consent')
  @ApiCreatedResponse({ type: Object })
  recordVerificationConsent(@Body('token') token: string) {
    if (!token?.trim()) {
      throw new BadRequestException('token is required');
    }
    return this.service.recordGuarantorSelfServiceVerificationConsent(token);
  }

  @Post('create-account')
  @ApiCreatedResponse({ type: Object })
  createAccount(
    @Body('token') token: string,
    @Body('email') email: string,
    @Body('password') password: string,
  ) {
    if (!token?.trim() || !email?.trim() || !password?.trim()) {
      throw new BadRequestException('token, email and password are required');
    }
    return this.service.createGuarantorSelfServiceAccountFromSelfService(token, email, password);
  }

  @Post('authenticated-token')
  @UseGuards(TenantAuthGuard, TenantLifecycleGuard)
  @ApiCreatedResponse({ type: Object })
  issueAuthenticatedContinuationToken(@CurrentTenant() ctx: TenantContext) {
    return this.service.issueGuarantorSelfServiceContinuationToken(ctx.tenantId, ctx.userId);
  }

  @Post('update-profile')
  @ApiCreatedResponse({ type: Object })
  updateProfile(
    @Body('token') token: string,
    @Body('name') name?: string,
    @Body('phone') phone?: string,
    @Body('email') email?: string,
    @Body('countryCode') countryCode?: string,
    @Body('relationship') relationship?: string,
  ) {
    if (!token?.trim()) {
      throw new BadRequestException('token is required');
    }
    return this.service.updateGuarantorProfileFromSelfService(token, {
      ...(name ? { name } : {}),
      ...(phone ? { phone } : {}),
      ...(email ? { email } : {}),
      ...(countryCode ? { countryCode } : {}),
      ...(relationship ? { relationship } : {}),
    });
  }

  @Post('disconnect')
  @ApiCreatedResponse({ type: Object })
  disconnectGuarantor(
    @Body('token') token: string,
    @Body('reason') reason?: string,
  ): Promise<{ message: string }> {
    if (!token?.trim()) {
      throw new BadRequestException('token is required');
    }
    return this.service.removeGuarantorFromSelfService(token, reason);
  }
}
