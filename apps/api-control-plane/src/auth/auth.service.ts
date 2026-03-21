import { PlatformRole } from '@mobility-os/authz-model';
import { Injectable, type OnModuleInit, UnauthorizedException } from '@nestjs/common';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { ConfigService } from '@nestjs/config';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { JwtService } from '@nestjs/jwt';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { PrismaService } from '../database/prisma.service';
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
    email: string;
    role: string;
    passwordHash: string;
    isActive: boolean;
  } | null>;
};

@Injectable()
export class AuthService implements OnModuleInit {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
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
}
