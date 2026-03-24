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
