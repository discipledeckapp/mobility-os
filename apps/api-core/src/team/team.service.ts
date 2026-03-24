import { randomBytes } from 'node:crypto';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { AuthService } from '../auth/auth.service';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { PrismaService } from '../database/prisma.service';
import { hashPassword } from '../auth/password-utils';
import type { InviteTeamMemberDto } from './dto/invite-team-member.dto';
import type { TeamMemberResponseDto } from './dto/team-member-response.dto';

@Injectable()
export class TeamService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
  ) {}

  async listMembers(tenantId: string): Promise<TeamMemberResponseDto[]> {
    const users = await this.prisma.user.findMany({
      where: { tenantId, driverId: null },
      orderBy: { createdAt: 'asc' },
    });

    return users.map((u) => ({
      id: u.id,
      tenantId: u.tenantId,
      name: u.name,
      email: u.email,
      phone: u.phone ?? null,
      role: u.role,
      isActive: u.isActive,
      isEmailVerified: u.isEmailVerified,
      createdAt: u.createdAt.toISOString(),
    }));
  }

  async inviteMember(tenantId: string, dto: InviteTeamMemberDto): Promise<TeamMemberResponseDto> {
    const existingUser = await this.prisma.user.findFirst({
      where: { tenantId, email: dto.email.trim().toLowerCase() },
    });

    if (existingUser) {
      throw new ConflictException(`A user with email '${dto.email}' already exists in this organisation.`);
    }

    // Create user with a random unusable password — they must reset via the email link.
    const tempPassword = randomBytes(32).toString('hex');

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
      },
    });

    // Send a password reset email so the invited user can set their own password.
    await this.authService.requestPasswordReset({ identifier: user.email });

    return {
      id: user.id,
      tenantId: user.tenantId,
      name: user.name,
      email: user.email,
      phone: user.phone ?? null,
      role: user.role,
      isActive: user.isActive,
      isEmailVerified: user.isEmailVerified,
      createdAt: user.createdAt.toISOString(),
    };
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
