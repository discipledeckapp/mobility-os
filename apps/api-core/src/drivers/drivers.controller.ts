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
  Res,
  StreamableFile,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import type { Driver } from '@prisma/client';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';
import { CurrentTenant } from '../auth/decorators/tenant-context.decorator';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { TenantAuthGuard } from '../auth/guards/tenant-auth.guard';
import { TenantLifecycleGuard } from '../auth/guards/tenant-lifecycle.guard';
import { applyFleetScope, assertFleetAccess } from '../auth/tenant-access';
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
  DriverMobileAccessResponseDto,
  DriverMobileAccessUserDto,
} from './dto/driver-mobile-access-response.dto';
import { DriverResponseDto } from './dto/driver-response.dto';
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
};

type DriverIntelligenceSummary = {
  globalRiskScore?: number | undefined;
  riskBand?: string | undefined;
  isWatchlisted?: boolean | undefined;
  duplicateIdentityFlag?: boolean | undefined;
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
  guarantorIsAlsoDriver?: boolean;
};

type DriverDocumentSummary = {
  hasApprovedLicence: boolean;
  pendingDocumentCount: number;
  rejectedDocumentCount: number;
  expiredDocumentCount: number;
};

type DriverMobileAccessSummary = {
  hasMobileAccess: boolean;
  mobileAccessStatus?: string | null;
};

type DriverReadinessSummary = {
  activationReadiness: string;
  activationReadinessReasons: string[];
  assignmentReadiness: string;
  assignmentReadinessReasons: string[];
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
    return this.service.list(ctx.tenantId, applyFleetScope(query, ctx)).then((result) => ({
      ...result,
      data: result.data.map((driver) => this.toResponse(driver)),
    }));
  }

  @Post(':id/self-service-links')
  @RequirePermissions(Permission.DriversWrite)
  @UseGuards(PermissionsGuard)
  @ApiCreatedResponse({ type: Object })
  sendSelfServiceLink(
    @CurrentTenant() ctx: TenantContext,
    @Param('id') id: string,
  ): Promise<{ delivery: 'email'; verificationUrl: string; destination: string }> {
    return this.service.sendSelfServiceLink(ctx.tenantId, id);
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
  findOne(
    @CurrentTenant() ctx: TenantContext,
    @Param('id') id: string,
  ): Promise<DriverResponseDto> {
    return this.service.findOne(ctx.tenantId, id).then((driver) => {
      assertFleetAccess(ctx, driver.fleetId);
      return this.toResponse(driver);
    });
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
        previewUrl: `/api/drivers/${id}/documents/${document.id}/content`,
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

  private toResponse(
    driver: DriverWithIdentityState &
      Partial<DriverIntelligenceSummary> &
      Partial<DriverGuarantorSummary> &
      Partial<DriverDocumentSummary> &
      Partial<DriverMobileAccessSummary> &
      Partial<DriverReadinessSummary>,
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
      dateOfBirth: driver.dateOfBirth,
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
      hasGuarantor: driver.hasGuarantor ?? false,
      guarantorStatus: driver.guarantorStatus ?? null,
      guarantorDisconnectedAt: driver.guarantorDisconnectedAt ?? null,
      guarantorPersonId: driver.guarantorPersonId ?? null,
      guarantorRiskBand: driver.guarantorRiskBand ?? null,
      guarantorIsWatchlisted: driver.guarantorIsWatchlisted ?? null,
      guarantorIsAlsoDriver: driver.guarantorIsAlsoDriver ?? false,
      hasApprovedLicence: driver.hasApprovedLicence ?? false,
      hasMobileAccess: driver.hasMobileAccess ?? false,
      mobileAccessStatus: driver.mobileAccessStatus ?? null,
      pendingDocumentCount: driver.pendingDocumentCount ?? 0,
      rejectedDocumentCount: driver.rejectedDocumentCount ?? 0,
      expiredDocumentCount: driver.expiredDocumentCount ?? 0,
      activationReadiness: driver.activationReadiness ?? 'not_ready',
      activationReadinessReasons: driver.activationReadinessReasons ?? [],
      assignmentReadiness: driver.assignmentReadiness ?? 'not_ready',
      assignmentReadinessReasons: driver.assignmentReadinessReasons ?? [],
      createdAt: driver.createdAt,
      updatedAt: driver.updatedAt,
    };
  }

  private toMobileAccessUser(user: {
    id: string;
    email: string;
    phone?: string | null;
    name: string;
    role: string;
    isActive: boolean;
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
      isActive: user.isActive,
      driverId: user.driverId ?? null,
      matchReason: user.matchReason ?? null,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}

@Controller('driver-self-service')
export class DriverSelfServiceController {
  constructor(private readonly service: DriversService) {}

  @Post('exchange-otp')
  @ApiCreatedResponse({ type: Object })
  exchangeOtp(@Body('otpCode') otpCode: string): Promise<{ token: string }> {
    return this.service.exchangeDriverSelfServiceOtp(otpCode);
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
      dateOfBirth: driver.dateOfBirth,
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
      hasGuarantor: guarantorSummary.hasGuarantor ?? false,
      guarantorStatus: guarantorSummary.guarantorStatus ?? null,
      guarantorDisconnectedAt: guarantorSummary.guarantorDisconnectedAt ?? null,
      guarantorPersonId: guarantorSummary.guarantorPersonId ?? null,
      guarantorRiskBand: guarantorSummary.guarantorRiskBand ?? null,
      guarantorIsWatchlisted: guarantorSummary.guarantorIsWatchlisted ?? null,
      guarantorIsAlsoDriver: guarantorSummary.guarantorIsAlsoDriver ?? false,
      hasApprovedLicence: (driver as Partial<DriverDocumentSummary>).hasApprovedLicence ?? false,
      hasMobileAccess: (driver as Partial<DriverMobileAccessSummary>).hasMobileAccess ?? false,
      mobileAccessStatus: (driver as Partial<DriverMobileAccessSummary>).mobileAccessStatus ?? null,
      pendingDocumentCount: (driver as Partial<DriverDocumentSummary>).pendingDocumentCount ?? 0,
      rejectedDocumentCount: (driver as Partial<DriverDocumentSummary>).rejectedDocumentCount ?? 0,
      expiredDocumentCount: (driver as Partial<DriverDocumentSummary>).expiredDocumentCount ?? 0,
      activationReadiness:
        (driver as Partial<DriverReadinessSummary>).activationReadiness ?? 'not_ready',
      activationReadinessReasons:
        (driver as Partial<DriverReadinessSummary>).activationReadinessReasons ?? [],
      assignmentReadiness:
        (driver as Partial<DriverReadinessSummary>).assignmentReadiness ?? 'not_ready',
      assignmentReadinessReasons:
        (driver as Partial<DriverReadinessSummary>).assignmentReadinessReasons ?? [],
      createdAt: driver.createdAt,
      updatedAt: driver.updatedAt,
    };
  }

  @Post('liveness-sessions')
  @ApiCreatedResponse({ type: Object })
  initializeIdentityLivenessSession(
    @Body('token') token: string,
    @Body('countryCode') countryCode?: string,
  ) {
    return this.service.initializeIdentityLivenessSessionFromSelfService(token, countryCode);
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

  @Post('documents')
  @ApiCreatedResponse({ type: DriverDocumentResponseDto })
  uploadDocument(
    @Body('token') token: string,
    @Body() dto: CreateDriverDocumentDto & { token?: string },
  ) {
    const { token: _ignored, ...payload } = dto;
    return this.service.uploadDocumentFromSelfService(token, payload);
  }

  @Post('documents/list')
  @ApiCreatedResponse({ type: [DriverDocumentResponseDto] })
  listDocuments(@Body('token') token: string) {
    return this.service.listDocumentsFromSelfService(token).then((documents) =>
      documents.map((document) => ({
        ...document,
        storageKey: document.storageKey ?? null,
        storageUrl: document.storageUrl ?? null,
        previewUrl: `/api/drivers/${document.driverId}/documents/${document.id}/content?token=${encodeURIComponent(token)}`,
      })),
    );
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
}
