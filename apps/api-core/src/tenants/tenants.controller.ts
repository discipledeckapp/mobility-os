import type { TenantContext } from '@mobility-os/tenancy-domain';
import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Permission } from '@mobility-os/authz-model';
import { AllowBlockedTenantAccess } from '../auth/decorators/allow-blocked-tenant-access.decorator';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';
import { CurrentTenant } from '../auth/decorators/tenant-context.decorator';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { TenantAuthGuard } from '../auth/guards/tenant-auth.guard';
import { TenantLifecycleGuard } from '../auth/guards/tenant-lifecycle.guard';
import { TenantResponseDto } from './dto/tenant-response.dto';
import { UpdateTenantSettingsDto } from './dto/update-tenant-settings.dto';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { TenantsService } from './tenants.service';
import { readOrganisationSettings } from './tenant-settings';

@ApiTags('Tenants')
@ApiBearerAuth()
@UseGuards(TenantAuthGuard, TenantLifecycleGuard, PermissionsGuard)
@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  /**
   * Returns the authenticated tenant's own record.
   * Tenants can only access their own data — no tenantId path param is exposed.
   */
  @Get('me')
  @AllowBlockedTenantAccess()
  @ApiOkResponse({ type: TenantResponseDto })
  async getMe(@CurrentTenant() ctx: TenantContext): Promise<TenantResponseDto> {
    const tenant = await this.tenantsService.findById(ctx.tenantId);
    const settings = readOrganisationSettings(tenant.metadata, tenant.country);

    return {
      ...tenant,
      metadata:
        tenant.metadata !== null && typeof tenant.metadata === 'object'
          ? (tenant.metadata as Record<string, unknown>)
          : null,
      displayName: settings.branding.displayName ?? null,
      logoUrl: settings.branding.logoUrl ?? null,
      defaultLanguage: settings.operations.defaultLanguage,
      guarantorMaxActiveDrivers: settings.operations.guarantorMaxActiveDrivers,
      autoSendDriverSelfServiceLinkOnCreate:
        settings.operations.autoSendDriverSelfServiceLinkOnCreate,
      requireIdentityVerificationForActivation:
        settings.operations.requireIdentityVerificationForActivation,
      requireBiometricVerification: settings.operations.requireBiometricVerification,
      requireGovernmentVerificationLookup:
        settings.operations.requireGovernmentVerificationLookup,
      enabledDriverIdentifierTypes: settings.operations.enabledDriverIdentifierTypes,
      requiredDriverIdentifierTypes: settings.operations.requiredDriverIdentifierTypes,
      customDriverDocumentTypes: settings.operations.customDriverDocumentTypes,
      requiredDriverDocumentSlugs: settings.operations.requiredDriverDocumentSlugs,
      requiredVehicleDocumentSlugs: settings.operations.requiredVehicleDocumentSlugs,
    };
  }

  @Patch('me/settings')
  @RequirePermissions(Permission.TenantsWrite)
  @ApiOkResponse({ type: TenantResponseDto })
  async updateSettings(
    @CurrentTenant() ctx: TenantContext,
    @Body() dto: UpdateTenantSettingsDto,
  ): Promise<TenantResponseDto> {
    const tenant = await this.tenantsService.updateSettings(ctx.tenantId, dto);
    const settings = readOrganisationSettings(tenant.metadata, tenant.country);

    return {
      ...tenant,
      metadata:
        tenant.metadata !== null && typeof tenant.metadata === 'object'
          ? (tenant.metadata as Record<string, unknown>)
          : null,
      displayName: settings.branding.displayName ?? null,
      logoUrl: settings.branding.logoUrl ?? null,
      defaultLanguage: settings.operations.defaultLanguage,
      guarantorMaxActiveDrivers: settings.operations.guarantorMaxActiveDrivers,
      autoSendDriverSelfServiceLinkOnCreate:
        settings.operations.autoSendDriverSelfServiceLinkOnCreate,
      requireIdentityVerificationForActivation:
        settings.operations.requireIdentityVerificationForActivation,
      requireBiometricVerification: settings.operations.requireBiometricVerification,
      requireGovernmentVerificationLookup:
        settings.operations.requireGovernmentVerificationLookup,
      enabledDriverIdentifierTypes: settings.operations.enabledDriverIdentifierTypes,
      requiredDriverIdentifierTypes: settings.operations.requiredDriverIdentifierTypes,
      customDriverDocumentTypes: settings.operations.customDriverDocumentTypes,
      requiredDriverDocumentSlugs: settings.operations.requiredDriverDocumentSlugs,
      requiredVehicleDocumentSlugs: settings.operations.requiredVehicleDocumentSlugs,
    };
  }
}
