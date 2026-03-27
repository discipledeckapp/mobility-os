import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { ConfigService } from '@nestjs/config';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { JwtService } from '@nestjs/jwt';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { PrismaService } from '../database/prisma.service';
import { hashPassword } from '../auth/password-utils';
import type { CreateStaffMemberDto } from './dto/create-staff-member.dto';
import type { CreateStaffInvitationDto } from './dto/create-staff-invitation.dto';
import type { CompleteStaffInvitationDto } from './dto/complete-staff-invitation.dto';
import type { StaffInvitationPreviewDto } from './dto/staff-invitation-preview.dto';
import type { StaffMemberResponseDto } from './dto/staff-member-response.dto';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { StaffNotificationService } from '../notifications/staff-notification.service';

type StaffRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: Date;
};

type PlatformUsersDelegate = {
  findMany(args: { orderBy?: { createdAt?: 'asc' | 'desc' } }): Promise<StaffRow[]>;
  findFirst(args: { where: { email?: string; id?: string } }): Promise<StaffRow | null>;
  findUnique(args: { where: { email?: string; id?: string } }): Promise<StaffRow | null>;
  create(args: { data: { name: string; email: string; role: string; passwordHash: string; isActive: boolean } }): Promise<StaffRow>;
  update(args: { where: { id: string }; data: { isActive?: boolean; name?: string; role?: string; passwordHash?: string } }): Promise<StaffRow>;
};

@Injectable()
export class StaffService {
  private readonly invitationExpiresIn = '7d';

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly staffNotification: StaffNotificationService,
  ) {}

  private get platformUsers(): PlatformUsersDelegate {
    // TODO(control-plane-prisma): Prisma delegate typing can lag after schema changes.
    return (this.prisma as unknown as { cpPlatformUser: PlatformUsersDelegate }).cpPlatformUser;
  }

  async listStaff(): Promise<StaffMemberResponseDto[]> {
    const users = await this.platformUsers.findMany({ orderBy: { createdAt: 'asc' } });

    return users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      isActive: u.isActive,
      createdAt: u.createdAt.toISOString(),
    }));
  }

  async createStaffMember(dto: CreateStaffMemberDto): Promise<StaffMemberResponseDto> {
    const email = dto.email.trim().toLowerCase();
    const existing = await this.platformUsers.findFirst({ where: { email } });

    if (existing) {
      throw new ConflictException(`A platform user with email '${email}' already exists.`);
    }

    const user = await this.platformUsers.create({
      data: {
        name: dto.name.trim(),
        email,
        role: dto.role,
        passwordHash: hashPassword(dto.password),
        isActive: true,
      },
    });

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt.toISOString(),
    };
  }

  async createStaffInvitation(dto: CreateStaffInvitationDto): Promise<StaffMemberResponseDto> {
    const email = dto.email.trim().toLowerCase();
    const existing = await this.platformUsers.findFirst({ where: { email } });

    if (existing?.isActive) {
      throw new ConflictException(`A platform user with email '${email}' already exists.`);
    }

    const placeholderPasswordHash = hashPassword(`invite:${email}:${Date.now()}`);
    const user = existing
      ? await this.platformUsers.update({
          where: { id: existing.id },
          data: {
            name: dto.name.trim(),
            role: dto.role,
            passwordHash: placeholderPasswordHash,
            isActive: false,
          },
        })
      : await this.platformUsers.create({
          data: {
            name: dto.name.trim(),
            email,
            role: dto.role,
            passwordHash: placeholderPasswordHash,
            isActive: false,
          },
        });

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const invitationToken = await this.jwtService.signAsync(
      {
        sub: user.id,
        email: user.email,
        role: user.role,
        type: 'staff_invitation',
      },
      { expiresIn: this.invitationExpiresIn },
    );
    const invitationUrl = this.buildInvitationUrl(invitationToken);

    if (invitationUrl) {
      await this.staffNotification.sendPlatformStaffInvitation({
        name: user.name,
        email: user.email,
        role: user.role,
        invitationUrl,
        expiresAt,
      });
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt.toISOString(),
      invitationToken,
      invitationUrl,
      invitationExpiresAt: expiresAt.toISOString(),
    };
  }

  async previewInvitation(token: string): Promise<StaffInvitationPreviewDto> {
    const invite = await this.verifyInvitationToken(token);
    const user = await this.platformUsers.findUnique({ where: { id: invite.userId } });

    if (!user || user.isActive) {
      throw new UnauthorizedException('This invitation is no longer available.');
    }

    return {
      name: user.name,
      email: user.email,
      role: user.role,
      expiresAt: invite.expiresAt,
    };
  }

  async completeInvitation(dto: CompleteStaffInvitationDto): Promise<{ message: string }> {
    const invite = await this.verifyInvitationToken(dto.token);
    const user = await this.platformUsers.findUnique({ where: { id: invite.userId } });

    if (!user || user.isActive) {
      throw new UnauthorizedException('This invitation is no longer available.');
    }

    await this.platformUsers.update({
      where: { id: user.id },
      data: {
        passwordHash: hashPassword(dto.password),
        isActive: true,
      },
    });

    return { message: 'Invitation completed. You can now sign in.' };
  }

  async deactivateStaffMember(userId: string): Promise<{ message: string }> {
    const user = await this.platformUsers.findFirst({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('Staff member not found.');
    }

    await this.platformUsers.update({
      where: { id: userId },
      data: { isActive: false },
    });

    return { message: 'Staff member deactivated.' };
  }

  private buildInvitationUrl(token: string): string | null {
    const baseUrl = this.configService.get<string>('CONTROL_PLANE_WEB_URL')?.replace(/\/$/, '');
    if (!baseUrl) {
      return null;
    }

    return `${baseUrl}/staff/accept?token=${encodeURIComponent(token)}`;
  }

  private async verifyInvitationToken(token: string): Promise<{
    userId: string;
    expiresAt: string;
  }> {
    try {
      const payload = await this.jwtService.verifyAsync<{
        sub?: string;
        type?: string;
        exp?: number;
      }>(token);

      if (!payload.sub || payload.type !== 'staff_invitation') {
        throw new UnauthorizedException('This invitation is invalid.');
      }

      return {
        userId: payload.sub,
        expiresAt: new Date((payload.exp ?? 0) * 1000).toISOString(),
      };
    } catch {
      throw new UnauthorizedException('This invitation is invalid or has expired.');
    }
  }
}
