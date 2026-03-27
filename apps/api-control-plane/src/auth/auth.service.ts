import { PlatformRole } from '@mobility-os/authz-model';
import { Injectable, type OnModuleInit, UnauthorizedException } from '@nestjs/common';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { ConfigService } from '@nestjs/config';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { JwtService } from '@nestjs/jwt';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { PrismaService } from '../database/prisma.service';
import { StaffNotificationService } from '../notifications/staff-notification.service';
import type { PlatformLoginDto } from './dto/platform-login.dto';
import { hashPassword, verifyPassword } from './password-utils';

type PlatformUserDelegate = {
  upsert(args: {
    where: { email: string };
    update: {
      name: string;
      role: string;
      passwordHash: string;
      isActive: boolean;
    };
    create: {
      email: string;
      name: string;
      role: string;
      passwordHash: string;
      isActive: boolean;
    };
  }): Promise<unknown>;
  findUnique(args: { where: { email: string } }): Promise<{
    id: string;
    name: string;
    email: string;
    role: string;
    passwordHash: string;
    isActive: boolean;
  } | null>;
  findFirst(args: { where: { id?: string; email?: string } }): Promise<{
    id: string;
    name: string;
    email: string;
    role: string;
    passwordHash: string;
    isActive: boolean;
  } | null>;
  update(args: {
    where: { id: string };
    data: {
      passwordHash?: string;
      isActive?: boolean;
    };
  }): Promise<unknown>;
};

@Injectable()
export class AuthService implements OnModuleInit {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly staffNotificationService: StaffNotificationService,
  ) {}

  private get platformUsers() {
    // TODO(control-plane-prisma): Prisma delegate typing can lag briefly after
    // additive schema changes in this repo. Keep the workaround local here.
    return (
      this.prisma as PrismaService & {
        cpPlatformUser: PlatformUserDelegate;
      }
    ).cpPlatformUser;
  }

  async onModuleInit(): Promise<void> {
    await this.syncBootstrapAdminUser();
  }

  private async syncBootstrapAdminUser(): Promise<void> {
    const bootstrapEmail = this.configService.get<string>('PLATFORM_BOOTSTRAP_ADMIN_EMAIL');
    const bootstrapPassword = this.configService.get<string>('PLATFORM_BOOTSTRAP_ADMIN_PASSWORD');

    if (!bootstrapEmail || !bootstrapPassword) {
      return;
    }

    await this.platformUsers.upsert({
      where: { email: bootstrapEmail.trim().toLowerCase() },
      update: {
        name: 'Bootstrap Platform Admin',
        role: PlatformRole.PlatformAdmin,
        passwordHash: hashPassword(bootstrapPassword),
        isActive: true,
      },
      create: {
        email: bootstrapEmail.trim().toLowerCase(),
        name: 'Bootstrap Platform Admin',
        role: PlatformRole.PlatformAdmin,
        passwordHash: hashPassword(bootstrapPassword),
        isActive: true,
      },
    });
  }

  async login(dto: PlatformLoginDto): Promise<{ accessToken: string }> {
    const email = dto.email.trim().toLowerCase();
    const user = await this.platformUsers.findUnique({
      where: { email },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid platform credentials');
    }

    if (!verifyPassword(dto.password, user.passwordHash)) {
      throw new UnauthorizedException('Invalid platform credentials');
    }

    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      role: user.role,
      email: user.email,
    });

    return { accessToken };
  }

  async requestPasswordReset(emailInput: string): Promise<{ message: string }> {
    const email = emailInput.trim().toLowerCase();
    const user = await this.platformUsers.findUnique({
      where: { email },
    });

    if (!user || !user.isActive) {
      return {
        message:
          'If that platform staff account exists, a password reset link has been sent.',
      };
    }

    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    const token = await this.jwtService.signAsync(
      {
        sub: user.id,
        email: user.email,
        type: 'platform_password_reset',
      },
      { expiresIn: '1h' },
    );

    const resetUrl = this.buildPasswordResetUrl(token);
    if (resetUrl) {
      await this.staffNotificationService.sendPlatformPasswordReset({
        name: user.name,
        email: user.email,
        resetUrl,
        expiresAt,
      });
    }

    return {
      message:
        'If that platform staff account exists, a password reset link has been sent.',
    };
  }

  async resetPassword(token: string, password: string): Promise<{ message: string }> {
    const payload = await this.verifyPasswordResetToken(token);
    const user = await this.platformUsers.findFirst({
      where: { id: payload.userId },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('This password reset link is no longer available.');
    }

    await this.platformUsers.update({
      where: { id: user.id },
      data: {
        passwordHash: hashPassword(password),
        isActive: true,
      },
    });

    return { message: 'Password reset complete. You can now sign in.' };
  }

  private buildPasswordResetUrl(token: string): string | null {
    const baseUrl = this.configService.get<string>('CONTROL_PLANE_WEB_URL')?.replace(/\/$/, '');
    if (!baseUrl) {
      return null;
    }

    return `${baseUrl}/reset-password?token=${encodeURIComponent(token)}`;
  }

  private async verifyPasswordResetToken(token: string): Promise<{ userId: string }> {
    try {
      const payload = await this.jwtService.verifyAsync<{
        sub?: string;
        type?: string;
      }>(token);

      if (!payload.sub || payload.type !== 'platform_password_reset') {
        throw new UnauthorizedException('This password reset link is invalid.');
      }

      return { userId: payload.sub };
    } catch {
      throw new UnauthorizedException('This password reset link is invalid or has expired.');
    }
  }
}
