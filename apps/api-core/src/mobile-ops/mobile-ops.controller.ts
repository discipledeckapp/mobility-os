import { Permission } from '@mobility-os/authz-model';
import type { TenantContext } from '@mobility-os/tenancy-domain';
import { Body, Controller, Get, NotFoundException, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { AssignmentsService } from '../assignments/assignments.service';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { AuthService } from '../auth/auth.service';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';
import { CurrentTenant } from '../auth/decorators/tenant-context.decorator';
import { MobileAuthGuard } from '../auth/guards/mobile-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { TenantLifecycleGuard } from '../auth/guards/tenant-lifecycle.guard';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { DriversService } from '../drivers/drivers.service';
import { DriverResponseDto } from '../drivers/dto/driver-response.dto';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { NotificationsService } from '../notifications/notifications.service';
// biome-ignore lint/style/useImportType: DTO classes are used by Nest decorators at runtime.
import { RecordRemittanceDto } from '../remittance/dto/record-remittance.dto';
import { RemittanceResponseDto } from '../remittance/dto/remittance-response.dto';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { RemittanceService } from '../remittance/remittance.service';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { VehiclesService } from '../vehicles/vehicles.service';
import { VehicleIncidentResponseDto } from '../vehicles/dto/vehicle-operations.dto';
import { ReportAssignmentIncidentDto } from './dto/report-assignment-incident.dto';
import { MobileAssignmentResponseDto } from './dto/mobile-assignment-response.dto';

@ApiTags('MobileOps')
@ApiBearerAuth()
@UseGuards(MobileAuthGuard, TenantLifecycleGuard)
@Controller('mobile-ops')
export class MobileOpsController {
  constructor(
    private readonly authService: AuthService,
    private readonly assignmentsService: AssignmentsService,
    private readonly driversService: DriversService,
    private readonly notificationsService: NotificationsService,
    private readonly remittanceService: RemittanceService,
    private readonly vehiclesService: VehiclesService,
  ) {}

  @Get('assignments')
  @RequirePermissions(Permission.AssignmentsRead)
  @UseGuards(PermissionsGuard)
  @ApiOkResponse({ type: [MobileAssignmentResponseDto] })
  async listAssignments(
    @CurrentTenant() ctx: TenantContext,
  ): Promise<MobileAssignmentResponseDto[]> {
    const driver = await this.getLinkedDriver(ctx);
    const assignments = await this.assignmentsService.list(ctx.tenantId, {
      driverId: driver.id,
    });

    return Promise.all(
      assignments.data.map((assignment) => this.toMobileAssignment(ctx.tenantId, assignment)),
    );
  }

  @Get('assignments/:id')
  @RequirePermissions(Permission.AssignmentsRead)
  @UseGuards(PermissionsGuard)
  @ApiOkResponse({ type: MobileAssignmentResponseDto })
  async getAssignment(
    @CurrentTenant() ctx: TenantContext,
    @Param('id') id: string,
  ): Promise<MobileAssignmentResponseDto> {
    const driver = await this.getLinkedDriver(ctx);
    const assignment = await this.assignmentsService.findOne(ctx.tenantId, id);
    this.assertAssignmentOwnership(assignment.driverId, driver.id);
    return this.toMobileAssignment(ctx.tenantId, assignment);
  }

  @Post('assignments/:id/start')
  @RequirePermissions(Permission.AssignmentsWrite)
  @UseGuards(PermissionsGuard)
  @ApiOkResponse({ type: MobileAssignmentResponseDto })
  async startAssignment(
    @CurrentTenant() ctx: TenantContext,
    @Param('id') id: string,
  ): Promise<MobileAssignmentResponseDto> {
    const driver = await this.getLinkedDriver(ctx);
    const assignment = await this.assignmentsService.findOne(ctx.tenantId, id);
    this.assertAssignmentOwnership(assignment.driverId, driver.id);
    const updated = await this.assignmentsService.start(ctx.tenantId, id);
    return this.toMobileAssignment(ctx.tenantId, updated);
  }

  @Post('assignments/:id/accept-terms')
  @RequirePermissions(Permission.AssignmentsWrite)
  @UseGuards(PermissionsGuard)
  @ApiOkResponse({ type: MobileAssignmentResponseDto })
  async acceptAssignmentTerms(
    @CurrentTenant() ctx: TenantContext,
    @Param('id') id: string,
    @Body('note') note?: string,
  ): Promise<MobileAssignmentResponseDto> {
    const driver = await this.getLinkedDriver(ctx);
    const assignment = await this.assignmentsService.findOne(ctx.tenantId, id);
    this.assertAssignmentOwnership(assignment.driverId, driver.id);
    const updated = await this.assignmentsService.acceptDriverTerms(ctx.tenantId, id, {
      acceptedFrom: 'driver_mobile',
      confirmationMethod: 'app',
      ...(note ? { note } : {}),
    });
    return this.toMobileAssignment(ctx.tenantId, updated);
  }

  @Post('assignments/:id/decline')
  @RequirePermissions(Permission.AssignmentsWrite)
  @UseGuards(PermissionsGuard)
  @ApiOkResponse({ type: MobileAssignmentResponseDto })
  async declineAssignment(
    @CurrentTenant() ctx: TenantContext,
    @Param('id') id: string,
    @Body('notes') notes?: string,
  ): Promise<MobileAssignmentResponseDto> {
    const driver = await this.getLinkedDriver(ctx);
    const assignment = await this.assignmentsService.findOne(ctx.tenantId, id);
    this.assertAssignmentOwnership(assignment.driverId, driver.id);
    const updated = await this.assignmentsService.decline(ctx.tenantId, id, {
      declinedFrom: 'driver_mobile',
      ...(notes ? { note: notes } : {}),
    });
    return this.toMobileAssignment(ctx.tenantId, updated);
  }

  @Post('assignments/:id/complete')
  @RequirePermissions(Permission.AssignmentsWrite)
  @UseGuards(PermissionsGuard)
  @ApiOkResponse({ type: MobileAssignmentResponseDto })
  async completeAssignment(
    @CurrentTenant() ctx: TenantContext,
    @Param('id') id: string,
    @Body('notes') notes?: string,
  ): Promise<MobileAssignmentResponseDto> {
    const driver = await this.getLinkedDriver(ctx);
    const assignment = await this.assignmentsService.findOne(ctx.tenantId, id);
    this.assertAssignmentOwnership(assignment.driverId, driver.id);
    const updated = await this.assignmentsService.end(ctx.tenantId, id, 'ended', {
      ...(notes ? { notes } : {}),
      returnedBy: driver.id,
      closeCurrentRemittanceAs: 'partially_settled',
    });
    return this.toMobileAssignment(ctx.tenantId, updated);
  }

  @Post('assignments/:id/cancel')
  @RequirePermissions(Permission.AssignmentsWrite)
  @UseGuards(PermissionsGuard)
  @ApiOkResponse({ type: MobileAssignmentResponseDto })
  async cancelAssignment(
    @CurrentTenant() ctx: TenantContext,
    @Param('id') id: string,
    @Body('notes') notes?: string,
  ): Promise<MobileAssignmentResponseDto> {
    const driver = await this.getLinkedDriver(ctx);
    const assignment = await this.assignmentsService.findOne(ctx.tenantId, id);
    this.assertAssignmentOwnership(assignment.driverId, driver.id);
    const updated = await this.assignmentsService.end(ctx.tenantId, id, 'cancelled', {
      ...(notes ? { notes } : {}),
      returnedBy: driver.id,
      closeCurrentRemittanceAs: 'cancelled_due_to_assignment_end',
    });
    return this.toMobileAssignment(ctx.tenantId, updated);
  }

  @Post('assignments/:id/incidents')
  @RequirePermissions(Permission.AssignmentsWrite)
  @UseGuards(PermissionsGuard)
  @ApiCreatedResponse({ type: VehicleIncidentResponseDto })
  async reportIncident(
    @CurrentTenant() ctx: TenantContext,
    @Param('id') id: string,
    @Body() dto: ReportAssignmentIncidentDto,
  ): Promise<VehicleIncidentResponseDto> {
    const driver = await this.getLinkedDriver(ctx);
    const assignment = await this.assignmentsService.findOne(ctx.tenantId, id);
    this.assertAssignmentOwnership(assignment.driverId, driver.id);
    const incident = await this.vehiclesService.createIncident(ctx.tenantId, assignment.vehicleId, ctx.userId, {
      ...dto,
      driverId: driver.id,
    });
    await this.notificationsService.notifyVehicleIncidentReported({
      tenantId: ctx.tenantId,
      vehicleId: assignment.vehicleId,
      fleetId: assignment.fleetId,
      driverId: driver.id,
      title: incident.title,
      severity: incident.severity,
      incidentId: incident.id,
    });
    return {
      ...incident,
      occurredAt: incident.occurredAt.toISOString(),
      createdAt: incident.createdAt.toISOString(),
    };
  }

  @Get('profile')
  @RequirePermissions(Permission.DriversRead)
  @UseGuards(PermissionsGuard)
  @ApiOkResponse({ type: DriverResponseDto })
  async getProfile(@CurrentTenant() ctx: TenantContext): Promise<DriverResponseDto> {
    const driver = await this.getLinkedDriver(ctx);
    const record = await this.driversService.findOne(ctx.tenantId, driver.id);
    return this.toDriverResponse(record);
  }

  @Post('remittance')
  @RequirePermissions(Permission.RemittanceWrite)
  @UseGuards(PermissionsGuard)
  @ApiCreatedResponse({ type: RemittanceResponseDto })
  async recordRemittance(
    @CurrentTenant() ctx: TenantContext,
    @Body() dto: RecordRemittanceDto,
  ): Promise<RemittanceResponseDto> {
    const driver = await this.getLinkedDriver(ctx);
    const assignment = await this.assignmentsService.findOne(ctx.tenantId, dto.assignmentId);
    this.assertAssignmentOwnership(assignment.driverId, driver.id);
    return this.remittanceService.record(ctx.tenantId, dto);
  }

  @Get('remittance')
  @RequirePermissions(Permission.RemittanceRead)
  @UseGuards(PermissionsGuard)
  @ApiOkResponse({ type: [RemittanceResponseDto] })
  async listRemittanceHistory(
    @CurrentTenant() ctx: TenantContext,
  ): Promise<RemittanceResponseDto[]> {
    const driver = await this.getLinkedDriver(ctx);
    const result = await this.remittanceService.list(ctx.tenantId, {
      driverId: driver.id,
      limit: 20,
    });
    return result.data;
  }

  private async getLinkedDriver(ctx: TenantContext) {
    const session = await this.authService.getSession(ctx.userId, ctx.tenantId);
    if (!session.linkedDriverId) {
      throw new NotFoundException('No driver profile is linked to this mobile account yet.');
    }

    const driver = await this.authService.getLinkedDriverForUser(ctx.tenantId, {
      driverId: session.linkedDriverId,
    });
    if (!driver) {
      throw new NotFoundException('No driver profile is linked to this mobile account yet.');
    }

    return driver;
  }

  private assertAssignmentOwnership(assignmentDriverId: string, linkedDriverId: string) {
    if (assignmentDriverId !== linkedDriverId) {
      throw new NotFoundException('Assignment not found');
    }
  }

  private async toMobileAssignment(
    tenantId: string,
    assignment: {
      id: string;
      fleetId: string;
      businessEntityId: string;
      operatingUnitId: string;
      driverId: string;
      vehicleId: string;
      status: string;
      startedAt?: Date | null;
      endedAt?: Date | null;
      notes?: string | null;
      remittanceModel?: string | null;
      remittanceFrequency?: string | null;
      remittanceAmountMinorUnits?: number | null;
      remittanceCurrency?: string | null;
      remittanceStartDate?: string | null;
      remittanceCollectionDay?: number | null;
      contractVersion?: string | null;
      contractSnapshot?: unknown | null;
      contractStatus?: string | null;
      driverAcceptedTermsAt?: Date | null;
      driverAcceptanceEvidence?: unknown | null;
      driverConfirmedAt?: Date | null;
      driverConfirmationMethod?: string | null;
      driverConfirmationEvidence?: unknown | null;
      acceptanceSnapshotHash?: string | null;
      returnedAt?: Date | null;
      returnedBy?: string | null;
      returnEvidence?: unknown | null;
      createdAt: Date;
      updatedAt: Date;
    },
  ): Promise<MobileAssignmentResponseDto> {
    const vehicle = await this.vehiclesService.findOne(tenantId, assignment.vehicleId);
    return {
      ...assignment,
      vehicle,
    };
  }

  private toDriverResponse(
    driver: Awaited<ReturnType<DriversService['findOne']>>,
  ): DriverResponseDto {
    return {
      id: driver.id,
      tenantId: driver.tenantId,
      fleetId: driver.fleetId,
      businessEntityId: driver.businessEntityId,
      operatingUnitId: driver.operatingUnitId,
      status: driver.status,
      firstName: driver.firstName ?? null,
      lastName: driver.lastName ?? null,
      phone: driver.phone ?? null,
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
      authenticationAccess: driver.authenticationAccess ?? 'not_ready',
      authenticationAccessReasons: driver.authenticationAccessReasons ?? [],
      remittanceReadiness: driver.remittanceReadiness ?? 'not_ready',
      remittanceReadinessReasons: driver.remittanceReadinessReasons ?? [],
      enforcementStatus: driver.enforcementStatus ?? 'clear',
      enforcementActions: driver.enforcementActions ?? [],
      adminAssignmentOverride: driver.adminAssignmentOverride ?? false,
      createdAt: driver.createdAt,
      updatedAt: driver.updatedAt,
      locked: false,
    };
  }
}
