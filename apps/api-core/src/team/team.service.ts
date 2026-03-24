import { randomBytes } from 'node:crypto';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { AuthService } from '../auth/auth.service';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { PrismaService } from '../database/prisma.service';
import { hashPassword } from '../auth/password-utils';
import { readUserSettings, writeUserSettings } from '../auth/user-settings';
import { getDefaultLanguageForCountry } from '../tenants/tenant-settings';
import { SubscriptionEntitlementsService } from '../tenant-billing/subscription-entitlements.service';
import type { InviteTeamMemberDto } from './dto/invite-team-member.dto';
import type { TeamMemberResponseDto } from './dto/team-member-response.dto';
import type { UpdateTeamMemberAccessDto } from './dto/update-team-member-access.dto';

@Injectable()
export class TeamService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
    private readonly subscriptionEntitlementsService: SubscriptionEntitlementsService,
  ) {}

  private async mapTeamMember(user: {
    id: string;
    tenantId: string;
    name: string;
    email: string;
    phone?: string | null;
    role: string;
    isActive: boolean;
    isEmailVerified: boolean;
    createdAt: Date;
    settings?: unknown;
  }): Promise<TeamMemberResponseDto> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: user.tenantId },
      select: { country: true },
    });
    const settings = readUserSettings(user.settings, {
      preferredLanguage: getDefaultLanguageForCountry(tenant?.country),
      role: user.role,
      hasLinkedDriver: false,
    });

    return {
      id: user.id,
      tenantId: user.tenantId,
      name: user.name,
      email: user.email,
      phone: user.phone ?? null,
      role: user.role,
      assignedFleetIds: settings.assignedFleetIds,
      customPermissions: settings.customPermissions,
      isActive: user.isActive,
      isEmailVerified: user.isEmailVerified,
      createdAt: user.createdAt.toISOString(),
    };
  }

  async listMembers(tenantId: string): Promise<TeamMemberResponseDto[]> {
    const users = await this.prisma.user.findMany({
      where: { tenantId, driverId: null },
      orderBy: { createdAt: 'asc' },
    });

    return Promise.all(users.map((user) => this.mapTeamMember(user)));
  }

  async inviteMember(tenantId: string, dto: InviteTeamMemberDto): Promise<TeamMemberResponseDto> {
    const activeSeatCount = await this.prisma.user.count({
      where: { tenantId, driverId: null, isActive: true },
    });
    await this.subscriptionEntitlementsService.enforceSeatCapacity(tenantId, activeSeatCount);

    const existingUser = await this.prisma.user.findFirst({
      where: { tenantId, email: dto.email.trim().toLowerCase() },
    });

    if (existingUser) {
      throw new ConflictException(`A user with email '${dto.email}' already exists in this organisation.`);
    }

    // Create user with a random unusable password — they must reset via the email link.
    const tempPassword = randomBytes(32).toString('hex');
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { country: true },
    });
    const settings = writeUserSettings(
      null,
      {
        assignedFleetIds: dto.assignedFleetIds?.filter(Boolean) ?? [],
        customPermissions: dto.customPermissions?.filter(Boolean) ?? [],
      },
      {
        preferredLanguage: getDefaultLanguageForCountry(tenant?.country),
        role: dto.role,
        hasLinkedDriver: false,
      },
    );

    const user = await this.prisma.user.create({
      data: {
        tenantId,
        name: dto.name.trim(),
        email: dto.email.trim().toLowerCase(),
        phone: dto.phone?.trim() || null,
        role: dto.role,
        passwordHash: hashPassword(tempPassword),
        isActive: true,
        isEmailVerified: false,
        settings: settings as Prisma.InputJsonValue,
      },
    });

    // Send a password reset email so the invited user can set their own password.
    await this.authService.requestPasswordReset({ identifier: user.email });

    return this.mapTeamMember(user);
  }

  async updateAccess(
    tenantId: string,
    userId: string,
    dto: UpdateTeamMemberAccessDto,
  ): Promise<TeamMemberResponseDto> {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, tenantId, driverId: null },
    });

    if (!user) {
      throw new NotFoundException('Team member not found.');
    }

    const invalidFleetIds =
      dto.assignedFleetIds && dto.assignedFleetIds.length > 0
        ? await this.prisma.fleet.count({
            where: {
              tenantId,
              id: { in: dto.assignedFleetIds },
            },
          })
        : 0;

    if (dto.assignedFleetIds && dto.assignedFleetIds.length > 0 && invalidFleetIds !== dto.assignedFleetIds.length) {
      throw new ConflictException('One or more selected fleets do not belong to this organisation.');
    }

    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { country: true },
    });
    const settings = writeUserSettings(
      user.settings,
      {
        ...(dto.assignedFleetIds ? { assignedFleetIds: dto.assignedFleetIds.filter(Boolean) } : {}),
        ...(dto.customPermissions ? { customPermissions: dto.customPermissions.filter(Boolean) } : {}),
      },
      {
        preferredLanguage: getDefaultLanguageForCountry(tenant?.country),
        role: user.role,
        hasLinkedDriver: false,
      },
    );

    const updated = await this.prisma.user.update({
      where: { id: user.id },
      data: { settings: settings as Prisma.InputJsonValue },
    });

    return this.mapTeamMember(updated);
  }

  async deactivateMember(tenantId: string, userId: string): Promise<{ message: string }> {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, tenantId, driverId: null },
    });

    if (!user) {
      throw new NotFoundException('Team member not found.');
    }

    if (user.role === 'TENANT_OWNER') {
      throw new ConflictException('The tenant owner account cannot be deactivated via this endpoint.');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { isActive: false },
    });

    return { message: 'Team member deactivated.' };
  }

  async resendInvite(tenantId: string, userId: string): Promise<{ message: string }> {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, tenantId, driverId: null, isActive: true },
    });

    if (!user) {
      throw new NotFoundException('Team member not found.');
    }

    await this.authService.requestPasswordReset({ identifier: user.email });

    return { message: `Invite reset link sent to ${user.email}.` };
  }
}
