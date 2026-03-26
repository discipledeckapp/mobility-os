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
import type { Driver } from '@prisma/client';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';
import { CurrentTenant } from '../auth/decorators/tenant-context.decorator';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { TenantAuthGuard } from '../auth/guards/tenant-auth.guard';
import { TenantLifecycleGuard } from '../auth/guards/tenant-lifecycle.guard';
import {
  applyFleetScope,
  assertLinkedDriverAccess,
  assertFleetAccess,
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
  authenticationAccess: string;
  authenticationAccessReasons: string[];
  activationReadiness: string;
  activationReadinessReasons: string[];
  assignmentReadiness: string;
  assignmentReadinessReasons: string[];
  remittanceReadiness: string;
  remittanceReadinessReasons: string[];
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
          [driver.firstName, driver.lastName, driver.phone, driver.email ?? ''].some((value) =>
            value.toLowerCase().includes(q),
          );
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
    res.setHeader('content-disposition', 'attachment; filename=\"driver-import-template.csv\"');
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
    res.setHeader('content-disposition', 'attachment; filename=\"drivers.csv\"');
    return new StreamableFile(Buffer.from(csv, 'utf-8'));
  }

  @Post('import')
  @RequirePermissions(Permission.DriversWrite)
  @UseGuards(PermissionsGuard)
  @ApiCreatedResponse({ type: Object })
  importDrivers(
    @CurrentTenant() ctx: TenantContext,
    @Body('csvContent') csvContent: string,
    @Body('autoSendSelfServiceLink') autoSendSelfServiceLink?: boolean,
  ) {
    return this.service.importDriversFromCsv(ctx.tenantId, csvContent, {
      ...(typeof autoSendSelfServiceLink === 'boolean'
        ? { autoSendSelfServiceLink }
        : {}),
    });
  }

  @Post(':id/self-service-links')
  @RequirePermissions(Permission.DriversWrite)
  @UseGuards(PermissionsGuard)
  @ApiCreatedResponse({ type: Object })
  sendSelfServiceLink(
    @CurrentTenant() ctx: TenantContext,
    @Param('id') id: string,
    @Body() body?: { driverPaysKycOverride?: boolean },
  ): Promise<{ delivery: 'email'; verificationUrl: string; destination: string }> {
    return this.service.sendSelfServiceLink(ctx.tenantId, id, body?.driverPaysKycOverride);
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
    await this.service.setAdminAssignmentOverride(ctx.tenantId, id, override);
    return { adminAssignmentOverride: override };
  }

  private toResponse(
    driver: DriverWithIdentityState &
      Partial<DriverIntelligenceSummary> &
      Partial<DriverGuarantorSummary> &
      Partial<DriverDocumentSummary> &
      Partial<DriverMobileAccessSummary> &
      Partial<DriverReadinessSummary> &
      { locked?: boolean },
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
  ): Promise<{ message: string }> {
    if (!token?.trim()) {
      throw new BadRequestException('token is required');
    }
    return this.service.updateContactFromSelfService(token, { ...(email ? { email } : {}) });
  }

  @Post('update-profile')
  @ApiCreatedResponse({ type: Object })
  updateProfile(
    @Body('token') token: string,
    @Body('firstName') firstName?: string,
    @Body('lastName') lastName?: string,
    @Body('dateOfBirth') dateOfBirth?: string,
  ): Promise<{ message: string }> {
    if (!token?.trim()) {
      throw new BadRequestException('token is required');
    }
    return this.service.updateProfileFromSelfService(token, {
      ...(firstName ? { firstName } : {}),
      ...(lastName ? { lastName } : {}),
      ...(dateOfBirth ? { dateOfBirth } : {}),
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

  @Post('kyc-checkout')
  @ApiCreatedResponse({ type: Object })
  initiateKycCheckout(
    @Body('token') token: string,
    @Body('provider') provider: 'paystack' | 'flutterwave',
  ) {
    return this.service.initiateKycCheckoutFromSelfService(token, provider ?? 'paystack');
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
