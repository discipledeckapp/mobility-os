import { Permission } from '@mobility-os/authz-model';
import type { TenantContext } from '@mobility-os/tenancy-domain';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';
import { CurrentTenant } from '../auth/decorators/tenant-context.decorator';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { TenantAuthGuard } from '../auth/guards/tenant-auth.guard';
import { TenantLifecycleGuard } from '../auth/guards/tenant-lifecycle.guard';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { InviteTeamMemberDto } from './dto/invite-team-member.dto';
import { TeamMemberResponseDto } from './dto/team-member-response.dto';
import { UpdateTeamMemberAccessDto } from './dto/update-team-member-access.dto';
import { UpdateTeamMemberMobileAccessDto } from './dto/update-team-member-mobile-access.dto';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { TeamService } from './team.service';

@ApiTags('Team')
@ApiBearerAuth()
@UseGuards(TenantAuthGuard, TenantLifecycleGuard, PermissionsGuard)
@Controller('team')
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  @Get()
  @RequirePermissions(Permission.TenantsRead)
  @ApiOkResponse({ type: [TeamMemberResponseDto] })
  listMembers(@CurrentTenant() ctx: TenantContext): Promise<TeamMemberResponseDto[]> {
    return this.teamService.listMembers(ctx.tenantId);
  }

  @Post('invite')
  @RequirePermissions(Permission.TenantsWrite)
  @ApiCreatedResponse({ type: TeamMemberResponseDto })
  inviteMember(
    @CurrentTenant() ctx: TenantContext,
    @Body() dto: InviteTeamMemberDto,
  ): Promise<TeamMemberResponseDto> {
    return this.teamService.inviteMember(ctx.tenantId, dto);
  }

  @Post(':userId/access')
  @RequirePermissions(Permission.TenantsWrite)
  @ApiOkResponse({ type: TeamMemberResponseDto })
  updateAccess(
    @CurrentTenant() ctx: TenantContext,
    @Param('userId') userId: string,
    @Body() dto: UpdateTeamMemberAccessDto,
  ): Promise<TeamMemberResponseDto> {
    return this.teamService.updateAccess(ctx.tenantId, userId, dto);
  }

  @Post(':userId/mobile-access')
  @RequirePermissions(Permission.TenantsWrite)
  @ApiOkResponse({ type: TeamMemberResponseDto })
  updateMobileAccess(
    @CurrentTenant() ctx: TenantContext,
    @Param('userId') userId: string,
    @Body() dto: UpdateTeamMemberMobileAccessDto,
  ): Promise<TeamMemberResponseDto> {
    return this.teamService.updateMobileAccess(ctx.tenantId, userId, dto.revoked);
  }

  @Delete(':userId/push-devices/:deviceId')
  @RequirePermissions(Permission.TenantsWrite)
  @ApiOkResponse({ type: TeamMemberResponseDto })
  disablePushDevice(
    @CurrentTenant() ctx: TenantContext,
    @Param('userId') userId: string,
    @Param('deviceId') deviceId: string,
  ): Promise<TeamMemberResponseDto> {
    return this.teamService.disablePushDevice(ctx.tenantId, userId, deviceId);
  }

  @Delete(':userId')
  @RequirePermissions(Permission.TenantsWrite)
  @ApiOkResponse()
  deactivateMember(
    @CurrentTenant() ctx: TenantContext,
    @Param('userId') userId: string,
  ): Promise<{ message: string }> {
    return this.teamService.deactivateMember(ctx.tenantId, userId);
  }

  @Post(':userId/resend-invite')
  @RequirePermissions(Permission.TenantsWrite)
  @ApiOkResponse()
  resendInvite(
    @CurrentTenant() ctx: TenantContext,
    @Param('userId') userId: string,
  ): Promise<{ message: string }> {
    return this.teamService.resendInvite(ctx.tenantId, userId);
  }
}
