import { UnauthorizedException } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import type { JwtService } from '@nestjs/jwt';
import type { AuthEmailService } from '../notifications/auth-email.service';
import { hashAuthSecret } from './auth-token-utils';
import { AuthService } from './auth.service';
import { hashPassword } from './password-utils';

describe('AuthService', () => {
  const prisma = {
    user: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    authRefreshToken: {
      create: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    driver: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
    },
    authOtp: {
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    passwordResetToken: {
      create: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    tenant: {
      findUnique: jest.fn(),
    },
  };

  const jwtService = {
    signAsync: jest.fn(),
    verifyAsync: jest.fn(),
  } as unknown as JwtService;

  const config = {
    get: jest.fn((key: string) => {
      if (key === 'ZEPTOMAIL_API_KEY') {
        return undefined;
      }
      return undefined;
    }),
    getOrThrow: jest.fn((key: string) => {
      const values: Record<string, string> = {
        TENANT_WEB_URL: 'https://mobiris.ng',
        SUPPORT_EMAIL: 'support@mobiris.ng',
        SUPPORT_PHONE_PRIMARY: '08053108039',
        SUPPORT_PHONE_SECONDARY: '09135947155',
        SOCIAL_HANDLE: '@getmobiris',
        WEBSITE_URL: 'https://mobiris.ng',
        JWT_SECRET: 'test-jwt-secret-with-sufficient-length-12345',
        JWT_EXPIRES_IN: '1h',
        JWT_REFRESH_SECRET: 'test-refresh-secret-with-sufficient-length-12345',
        JWT_REFRESH_EXPIRES_IN: '30d',
      };

      const value = values[key];
      if (!value) {
        throw new Error(`Unexpected config lookup: ${key}`);
      }
      return value;
    }),
  } as unknown as ConfigService;

  const authEmailService = {
    sendOnboardingEmail: jest.fn(),
    sendPasswordResetEmail: jest.fn(),
    sendAccountVerificationOtpEmail: jest.fn(),
  } as unknown as AuthEmailService;

  let service: AuthService;

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.tenant.findUnique.mockResolvedValue({ country: 'NG' });
    service = new AuthService(prisma as never, jwtService, config, authEmailService);
  });

  it('requests a password reset without leaking account existence', async () => {
    prisma.user.findMany.mockResolvedValue([
      {
        id: 'user_1',
        tenantId: 'tenant_1',
        businessEntityId: 'be_1',
        operatingUnitId: null,
        role: 'TENANT_OWNER',
        isActive: true,
        email: 'owner@tenant.com',
        phone: '+2348012345678',
        name: 'Owner',
        passwordHash: hashPassword('password123'),
      },
    ]);

    await expect(service.requestPasswordReset({ identifier: 'owner@tenant.com' })).resolves.toEqual(
      {
        message: 'If the account exists and is eligible, the requested auth message has been sent.',
      },
    );

    expect(prisma.passwordResetToken.create).toHaveBeenCalledTimes(1);
    expect(authEmailService.sendPasswordResetEmail).toHaveBeenCalledTimes(1);
  });

  it('verifies an account OTP and marks the email as verified', async () => {
    prisma.user.findMany.mockResolvedValue([
      {
        id: 'user_2',
        tenantId: 'tenant_2',
        businessEntityId: 'be_2',
        operatingUnitId: null,
        role: 'TENANT_OWNER',
        isActive: true,
        email: 'owner2@tenant.com',
        phone: '+2348012345000',
        name: 'Owner Two',
        passwordHash: hashPassword('password123'),
      },
    ]);
    prisma.authOtp.findMany.mockResolvedValue([
      {
        id: 'otp_1',
        codeHash: hashAuthSecret('123456'),
      },
    ]);

    await expect(
      service.verifyAccountVerificationOtp({
        identifier: 'owner2@tenant.com',
        code: '123456',
      }),
    ).resolves.toEqual({ verified: true });

    expect(prisma.authOtp.update).toHaveBeenCalledWith({
      where: { id: 'otp_1' },
      data: { consumedAt: expect.any(Date) },
    });
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'user_2' },
      data: { isEmailVerified: true },
    });
  });

  it('rejects an invalid verification code', async () => {
    prisma.user.findMany.mockResolvedValue([
      {
        id: 'user_4',
        tenantId: 'tenant_4',
        businessEntityId: 'be_4',
        operatingUnitId: null,
        role: 'TENANT_OWNER',
        isActive: true,
        email: 'owner4@tenant.com',
        phone: '+2348012345111',
        name: 'Owner Four',
        passwordHash: hashPassword('password123'),
      },
    ]);
    prisma.authOtp.findMany.mockResolvedValue([]);

    await expect(
      service.verifyAccountVerificationOtp({
        identifier: 'owner4@tenant.com',
        code: '654321',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('returns session context without inferring a driver link from email or phone', async () => {
    prisma.user.findFirst.mockResolvedValue({
      id: 'user_5',
      tenantId: 'tenant_5',
      driverId: null,
      businessEntityId: 'be_5',
      operatingUnitId: null,
      role: 'FIELD_OFFICER',
      isActive: true,
      email: 'driver5@tenant.com',
      phone: '+2348011111111',
      name: 'Driver User',
      tenant: {
        id: 'tenant_5',
        name: 'Mobiris Test Tenant',
        country: 'NG',
      },
    });
    await expect(service.getSession('user_5', 'tenant_5')).resolves.toMatchObject({
      userId: 'user_5',
      tenantId: 'tenant_5',
      linkedDriverId: null,
      linkedDriverStatus: null,
      linkedDriverIdentityStatus: null,
      defaultCurrency: 'NGN',
      formattingLocale: 'en-NG',
    });

    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it('uses an existing persisted driver link without fallback matching', async () => {
    prisma.user.findFirst.mockResolvedValue({
      id: 'user_6',
      tenantId: 'tenant_6',
      driverId: 'driver_6',
      businessEntityId: 'be_6',
      operatingUnitId: null,
      role: 'FIELD_OFFICER',
      isActive: true,
      email: 'driver6@tenant.com',
      phone: '+2348022222222',
      name: 'Linked Driver User',
      tenant: {
        id: 'tenant_6',
        name: 'Linked Tenant',
        country: 'NG',
      },
    });
    prisma.driver.findFirst.mockResolvedValue({
      id: 'driver_6',
      status: 'inactive',
      identityStatus: 'pending_verification',
    });

    await expect(service.getSession('user_6', 'tenant_6')).resolves.toMatchObject({
      linkedDriverId: 'driver_6',
      linkedDriverStatus: 'inactive',
      linkedDriverIdentityStatus: 'pending_verification',
      formattingLocale: 'en-NG',
      currencyMinorUnit: 100,
    });

    expect(prisma.driver.findMany).not.toHaveBeenCalled();
  });

  it('logs in and returns rotated access and refresh tokens', async () => {
    prisma.user.findMany.mockResolvedValue([
      {
        id: 'user_7',
        tenantId: 'tenant_7',
        businessEntityId: 'be_7',
        operatingUnitId: null,
        role: 'FIELD_OFFICER',
        driverId: null,
        isActive: true,
        email: 'field@tenant.com',
        phone: '+2348033333333',
        passwordHash: hashPassword('password123'),
      },
    ]);
    (jwtService.signAsync as jest.Mock)
      .mockResolvedValueOnce('access-token')
      .mockResolvedValueOnce('refresh-token');

    await expect(
      service.login({
        identifier: 'field@tenant.com',
        password: 'password123',
      }),
    ).resolves.toEqual({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    });

    expect(prisma.authRefreshToken.create).toHaveBeenCalledWith({
      data: {
        userId: 'user_7',
        tokenHash: expect.any(String),
        expiresAt: expect.any(Date),
      },
    });
  });

  it('allows a linked driver mobile account to log in without an operator business-entity scope', async () => {
    prisma.user.findMany.mockResolvedValue([
      {
        id: 'user_driver_mobile',
        tenantId: 'tenant_driver_mobile',
        businessEntityId: null,
        operatingUnitId: null,
        role: 'FIELD_OFFICER',
        driverId: 'driver_9',
        isActive: true,
        email: 'driver@tenant.com',
        phone: '+2348044444444',
        passwordHash: hashPassword('password123'),
        settings: { accessMode: 'driver_mobile' },
      },
    ]);
    prisma.driver.findFirst.mockResolvedValue({
      id: 'driver_9',
      tenantId: 'tenant_driver_mobile',
      businessEntityId: 'be_driver',
      operatingUnitId: 'ou_driver',
      status: 'inactive',
      identityStatus: 'pending_verification',
    });
    (jwtService.signAsync as jest.Mock)
      .mockResolvedValueOnce('driver-access-token')
      .mockResolvedValueOnce('driver-refresh-token');

    await expect(
      service.login({
        identifier: 'driver@tenant.com',
        password: 'password123',
      }),
    ).resolves.toEqual({
      accessToken: 'driver-access-token',
      refreshToken: 'driver-refresh-token',
    });

    expect(jwtService.signAsync).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        businessEntityId: 'be_driver',
        operatingUnitId: 'ou_driver',
        mobileRole: 'driver',
      }),
      expect.any(Object),
    );
  });

  it('rejects login with the wrong password', async () => {
    prisma.user.findMany.mockResolvedValue([
      {
        id: 'user_wrong_password',
        tenantId: 'tenant_7',
        businessEntityId: 'be_7',
        operatingUnitId: null,
        role: 'FIELD_OFFICER',
        driverId: null,
        isActive: true,
        email: 'field@tenant.com',
        phone: '+2348033333333',
        passwordHash: hashPassword('password123'),
      },
    ]);

    await expect(
      service.login({
        identifier: 'field@tenant.com',
        password: 'wrong-password',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rejects login for inactive users', async () => {
    prisma.user.findMany.mockResolvedValue([]);

    await expect(
      service.login({
        identifier: 'inactive@tenant.com',
        password: 'password123',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('refreshes a valid refresh token and consumes the previous token record', async () => {
    (jwtService.verifyAsync as jest.Mock).mockResolvedValue({
      sub: 'user_8',
      tenantId: 'tenant_8',
      type: 'refresh',
    });
    prisma.authRefreshToken.findFirst.mockResolvedValue({
      id: 'refresh_1',
      userId: 'user_8',
      tokenHash: hashAuthSecret('valid-refresh-token'),
      consumedAt: null,
      expiresAt: new Date(Date.now() + 60_000),
    });
    prisma.user.findFirst.mockResolvedValue({
      id: 'user_8',
      tenantId: 'tenant_8',
      businessEntityId: 'be_8',
      operatingUnitId: null,
      role: 'FIELD_OFFICER',
      driverId: 'driver_8',
      isActive: true,
    });
    (jwtService.signAsync as jest.Mock)
      .mockResolvedValueOnce('next-access-token')
      .mockResolvedValueOnce('next-refresh-token');

    await expect(service.refresh('valid-refresh-token')).resolves.toEqual({
      accessToken: 'next-access-token',
      refreshToken: 'next-refresh-token',
    });

    expect(prisma.authRefreshToken.update).toHaveBeenCalledWith({
      where: { id: 'refresh_1' },
      data: { consumedAt: expect.any(Date) },
    });
  });

  it('rejects refresh when the token has already been consumed', async () => {
    (jwtService.verifyAsync as jest.Mock).mockResolvedValue({
      sub: 'user_8',
      tenantId: 'tenant_8',
      type: 'refresh',
    });
    prisma.authRefreshToken.findFirst.mockResolvedValue(null);

    await expect(service.refresh('consumed-refresh-token')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('rejects refresh when the token is expired', async () => {
    (jwtService.verifyAsync as jest.Mock).mockRejectedValue(new Error('jwt expired'));

    await expect(service.refresh('expired-refresh-token')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('returns the generic password reset message for an unknown email', async () => {
    prisma.user.findMany.mockResolvedValue([]);

    await expect(
      service.requestPasswordReset({ identifier: 'missing@tenant.com' }),
    ).resolves.toEqual({
      message: 'If the account exists and is eligible, the requested auth message has been sent.',
    });

    expect(prisma.passwordResetToken.create).not.toHaveBeenCalled();
    expect(authEmailService.sendPasswordResetEmail).not.toHaveBeenCalled();
  });

  it('resets a password with a valid token and consumes the token', async () => {
    prisma.passwordResetToken.findFirst.mockResolvedValue({
      id: 'reset_1',
      userId: 'user_10',
      tokenHash: hashAuthSecret('valid-reset-token'),
      consumedAt: null,
      expiresAt: new Date(Date.now() + 60_000),
    });

    await expect(
      service.resetPassword({
        token: 'valid-reset-token',
        newPassword: 'newPassword123',
      }),
    ).resolves.toEqual({
      message: 'Your password has been reset successfully.',
    });

    expect(prisma.passwordResetToken.update).toHaveBeenCalledWith({
      where: { id: 'reset_1' },
      data: { consumedAt: expect.any(Date) },
    });
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'user_10' },
      data: { passwordHash: expect.any(String) },
    });
  });

  it('rejects password reset for an expired token', async () => {
    prisma.passwordResetToken.findFirst.mockResolvedValue(null);

    await expect(
      service.resetPassword({
        token: 'expired-reset-token',
        newPassword: 'newPassword123',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
