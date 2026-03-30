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
import type { TeamMemberPushDeviceResponseDto } from './dto/team-member-push-device-response.dto';
import type { TeamMemberResponseDto } from './dto/team-member-response.dto';
import type { UpdateTeamMemberAccessDto } from './dto/update-team-member-access.dto';

@Injectable()
export class TeamService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
    private readonly subscriptionEntitlementsService: SubscriptionEntitlementsService,
  ) {}

  private maskPushToken(token: string): string {
    if (token.length <= 12) {
      return token;
    }

    return `${token.slice(0, 8)}...${token.slice(-4)}`;
  }

  private mapPushDevice(input: {
    id: string;
    platform: string;
    deviceToken: string;
    lastSeenAt: Date;
    createdAt: Date;
    disabledAt: Date | null;
  }): TeamMemberPushDeviceResponseDto {
    return {
      id: input.id,
      platform: input.platform as TeamMemberPushDeviceResponseDto['platform'],
      tokenPreview: this.maskPushToken(input.deviceToken),
      lastSeenAt: input.lastSeenAt.toISOString(),
      registeredAt: input.createdAt.toISOString(),
      disabledAt: input.disabledAt?.toISOString() ?? null,
    };
  }

  private async mapTeamMember(user: {
    id: string;
    tenantId: string;
    name: string;
    email: string;
    phone?: string | null;
    role: string;
    isActive: boolean;
    isEmailVerified: boolean;
    mobileAccessRevoked?: boolean;
    createdAt: Date;
    settings?: unknown;
  }, context?: {
    tenantCountry?: string | null;
    pushDevices?: Array<{
      id: string;
      platform: string;
      deviceToken: string;
      lastSeenAt: Date;
      createdAt: Date;
      disabledAt: Date | null;
    }>;
  }): Promise<TeamMemberResponseDto> {
    const settings = readUserSettings(user.settings, {
      preferredLanguage: getDefaultLanguageForCountry(context?.tenantCountry),
      role: user.role,
      hasLinkedDriver: false,
    });
    const pushDevices =
      context?.pushDevices ??
      (await this.prisma.userPushDevice.findMany({
        where: { tenantId: user.tenantId, userId: user.id },
        orderBy: [{ disabledAt: 'asc' }, { lastSeenAt: 'desc' }],
        select: {
          id: true,
          platform: true,
          deviceToken: true,
          lastSeenAt: true,
          createdAt: true,
          disabledAt: true,
        },
      }));
    const activePushDeviceCount = pushDevices.filter((device) => !device.disabledAt).length;
    const lastPushDeviceSeenAt =
      pushDevices.find((device) => !device.disabledAt)?.lastSeenAt ??
      pushDevices[0]?.lastSeenAt ??
      null;

    return {
      id: user.id,
      tenantId: user.tenantId,
      name: user.name,
      email: user.email,
      phone: user.phone ?? null,
      role: user.role,
      assignedFleetIds: settings.assignedFleetIds,
      assignedVehicleIds: settings.assignedVehicleIds,
      customPermissions: settings.customPermissions,
      isActive: user.isActive,
      isEmailVerified: user.isEmailVerified,
      mobileAccessRevoked: user.mobileAccessRevoked ?? false,
      activePushDeviceCount,
      lastPushDeviceSeenAt: lastPushDeviceSeenAt?.toISOString() ?? null,
      pushDevices: pushDevices.map((device) => this.mapPushDevice(device)),
      createdAt: user.createdAt.toISOString(),
    };
  }

  private isOperatorUser(user: {
    role: string;
    driverId?: string | null;
    settings?: unknown;
  }): boolean {
    return (
      readUserSettings(user.settings, {
        preferredLanguage: 'en',
        role: user.role,
        hasLinkedDriver: Boolean(user.driverId),
      }).accessMode === 'tenant_user'
    );
  }

  async listMembers(tenantId: string): Promise<TeamMemberResponseDto[]> {
    const [tenant, users, pushDevices] = await Promise.all([
      this.prisma.tenant.findUnique({
        where: { id: tenantId },
        select: { country: true },
      }),
      this.prisma.user.findMany({
        where: { tenantId },
        orderBy: { createdAt: 'asc' },
      }),
      this.prisma.userPushDevice.findMany({
        where: { tenantId },
        orderBy: [{ disabledAt: 'asc' }, { lastSeenAt: 'desc' }],
        select: {
          id: true,
          userId: true,
          platform: true,
          deviceToken: true,
          lastSeenAt: true,
          createdAt: true,
          disabledAt: true,
        },
      }),
    ]);

    const pushDevicesByUserId = new Map<
      string,
      Array<{
        id: string;
        platform: string;
        deviceToken: string;
        lastSeenAt: Date;
        createdAt: Date;
        disabledAt: Date | null;
      }>
    >();
    for (const device of pushDevices) {
      const current = pushDevicesByUserId.get(device.userId) ?? [];
      current.push(device);
      pushDevicesByUserId.set(device.userId, current);
    }

    return Promise.all(
      users
        .filter((user) => this.isOperatorUser(user))
        .map((user) =>
          this.mapTeamMember(user, {
            tenantCountry: tenant?.country ?? null,
            pushDevices: pushDevicesByUserId.get(user.id) ?? [],
          }),
        ),
    );
  }

  async inviteMember(tenantId: string, dto: InviteTeamMemberDto): Promise<TeamMemberResponseDto> {
    const activeUsers = await this.prisma.user.findMany({
      where: { tenantId, isActive: true },
    });
    const activeSeatCount = activeUsers.filter((user) => this.isOperatorUser(user)).length;
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
        assignedVehicleIds: dto.assignedVehicleIds?.filter(Boolean) ?? [],
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
      where: { id: userId, tenantId },
    });

    if (!user || !this.isOperatorUser(user)) {
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

    const validVehicleCount =
      dto.assignedVehicleIds && dto.assignedVehicleIds.length > 0
        ? await this.prisma.vehicle.count({
            where: {
              tenantId,
              id: { in: dto.assignedVehicleIds },
            },
          })
        : 0;

    if (dto.assignedFleetIds && dto.assignedFleetIds.length > 0 && invalidFleetIds !== dto.assignedFleetIds.length) {
      throw new ConflictException('One or more selected fleets do not belong to this organisation.');
    }

    if (
      dto.assignedVehicleIds &&
      dto.assignedVehicleIds.length > 0 &&
      validVehicleCount !== dto.assignedVehicleIds.length
    ) {
      throw new ConflictException('One or more selected vehicles do not belong to this organisation.');
    }

    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { country: true },
    });
    const settings = writeUserSettings(
      user.settings,
      {
        ...(dto.assignedFleetIds ? { assignedFleetIds: dto.assignedFleetIds.filter(Boolean) } : {}),
        ...(dto.assignedVehicleIds
          ? { assignedVehicleIds: dto.assignedVehicleIds.filter(Boolean) }
          : {}),
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

  async updateMobileAccess(
    tenantId: string,
    userId: string,
    revoked: boolean,
  ): Promise<TeamMemberResponseDto> {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, tenantId },
    });

    if (!user || !this.isOperatorUser(user)) {
      throw new NotFoundException('Team member not found.');
    }

    if (user.role === 'TENANT_OWNER') {
      throw new ConflictException('The tenant owner account cannot have mobile access changed here.');
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { mobileAccessRevoked: revoked },
    });

    return this.mapTeamMember(updated);
  }

  async disablePushDevice(
    tenantId: string,
    userId: string,
    deviceId: string,
  ): Promise<TeamMemberResponseDto> {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, tenantId },
    });

    if (!user || !this.isOperatorUser(user)) {
      throw new NotFoundException('Team member not found.');
    }

    const device = await this.prisma.userPushDevice.findFirst({
      where: { id: deviceId, tenantId, userId, disabledAt: null },
      select: { id: true },
    });

    if (!device) {
      throw new NotFoundException('Registered device not found.');
    }

    await this.prisma.userPushDevice.update({
      where: { id: deviceId },
      data: { disabledAt: new Date() },
    });

    const refreshedUser = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!refreshedUser) {
      throw new NotFoundException('Team member not found.');
    }

    return this.mapTeamMember(refreshedUser);
  }

  async deactivateMember(tenantId: string, userId: string): Promise<{ message: string }> {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, tenantId },
    });

    if (!user || !this.isOperatorUser(user)) {
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
      where: { id: userId, tenantId, isActive: true },
    });

    if (!user || !this.isOperatorUser(user)) {
      throw new NotFoundException('Team member not found.');
    }

    await this.authService.requestPasswordReset({ identifier: user.email });

    return { message: `Invite reset link sent to ${user.email}.` };
  }
}
