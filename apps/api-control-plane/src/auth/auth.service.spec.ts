import { PlatformRole } from '@mobility-os/authz-model';
import { UnauthorizedException } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import type { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { hashPassword } from './password-utils';

describe('AuthService', () => {
  const prisma = {
    cpPlatformUser: {
      upsert: jest.fn(),
      findUnique: jest.fn(),
    },
  };

  const configService = {
    get: jest.fn((key: string) => {
      const values: Record<string, string> = {
        PLATFORM_BOOTSTRAP_ADMIN_EMAIL: 'admin@mobiris.ng',
        PLATFORM_BOOTSTRAP_ADMIN_PASSWORD: 'AdminPass123!',
      };
      return values[key];
    }),
  } as unknown as ConfigService;

  const jwtService = {
    signAsync: jest.fn(),
  } as unknown as JwtService;

  const staffNotificationService = {
    sendPlatformPasswordReset: jest.fn(),
  };

  let service: AuthService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AuthService(
      prisma as never,
      configService,
      jwtService,
      staffNotificationService as never,
    );
  });

  it('seeds the bootstrap admin user on module init', async () => {
    await service.onModuleInit();

    expect(prisma.cpPlatformUser.upsert).toHaveBeenCalledWith({
      where: { email: 'admin@mobiris.ng' },
      update: {
        name: 'Bootstrap Platform Admin',
        role: PlatformRole.PlatformAdmin,
        passwordHash: expect.any(String),
        isActive: true,
      },
      create: {
        email: 'admin@mobiris.ng',
        name: 'Bootstrap Platform Admin',
        role: PlatformRole.PlatformAdmin,
        passwordHash: expect.any(String),
        isActive: true,
      },
    });
  });

  it('logs in with a persisted platform admin user', async () => {
    prisma.cpPlatformUser.findUnique = jest.fn().mockResolvedValue({
      id: 'platform_admin_1',
      email: 'admin@mobiris.ng',
      role: PlatformRole.PlatformAdmin,
      passwordHash: hashPassword('AdminPass123!'),
      isActive: true,
    });
    (jwtService.signAsync as jest.Mock).mockResolvedValue('platform-jwt');

    await expect(
      service.login({
        email: 'admin@mobiris.ng',
        password: 'AdminPass123!',
      }),
    ).resolves.toEqual({
      accessToken: 'platform-jwt',
    });

    expect(jwtService.signAsync).toHaveBeenCalledWith({
      sub: 'platform_admin_1',
      role: PlatformRole.PlatformAdmin,
      email: 'admin@mobiris.ng',
    });
  });

  it('rejects invalid platform credentials', async () => {
    prisma.cpPlatformUser.findUnique = jest.fn().mockResolvedValue({
      id: 'platform_admin_1',
      email: 'admin@mobiris.ng',
      role: PlatformRole.PlatformAdmin,
      passwordHash: hashPassword('AdminPass123!'),
      isActive: true,
    });

    await expect(
      service.login({
        email: 'admin@mobiris.ng',
        password: 'wrong-password',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rejects login when bootstrap admin credentials are missing', async () => {
    (configService.get as jest.Mock).mockReturnValue(undefined);

    await expect(service.onModuleInit()).resolves.toBeUndefined();
  });
});
