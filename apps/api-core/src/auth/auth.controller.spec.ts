import { Controller, Get, Module, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { FastifyAdapter, type NestFastifyApplication } from '@nestjs/platform-fastify';
import { Test } from '@nestjs/testing';
import { PrismaService } from '../database/prisma.service';
import { AuthEmailService } from '../notifications/auth-email.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { CurrentTenant } from './decorators/tenant-context.decorator';
import { TenantAuthGuard } from './guards/tenant-auth.guard';
import { TenantLifecycleGuard } from './guards/tenant-lifecycle.guard';
import { hashPassword } from './password-utils';

@Controller('protected')
@UseGuards(TenantAuthGuard)
class ProtectedTestController {
  @Get()
  getProtected(@CurrentTenant() tenantContext: { tenantId: string; userId: string }) {
    return tenantContext;
  }
}

@Module({
  imports: [
    JwtModule.register({
      secret: 'test-jwt-secret-with-sufficient-length-12345',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [AuthController, ProtectedTestController],
  providers: [
    AuthService,
    TenantAuthGuard,
    {
      provide: ConfigService,
      useValue: {
        getOrThrow(key: string) {
          if (key === 'JWT_SECRET') {
            return 'test-jwt-secret-with-sufficient-length-12345';
          }
          if (key === 'JWT_EXPIRES_IN') {
            return '1h';
          }
          if (key === 'JWT_REFRESH_SECRET') {
            return 'test-refresh-secret-with-sufficient-length-12345';
          }
          if (key === 'JWT_REFRESH_EXPIRES_IN') {
            return '30d';
          }
          if (key === 'TENANT_WEB_URL') {
            return 'https://mobiris.ng';
          }
          if (key === 'SUPPORT_EMAIL') {
            return 'support@mobiris.ng';
          }
          if (key === 'SUPPORT_PHONE_PRIMARY') {
            return '08053108039';
          }
          if (key === 'SUPPORT_PHONE_SECONDARY') {
            return '09135947155';
          }
          if (key === 'SOCIAL_HANDLE') {
            return '@getmobiris';
          }
          if (key === 'WEBSITE_URL') {
            return 'https://mobiris.ng';
          }
          throw new Error(`Unexpected config lookup: ${key}`);
        },
      },
    },
    {
      provide: PrismaService,
      useValue: {
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
      },
    },
    {
      provide: AuthEmailService,
      useValue: {
        sendOnboardingEmail: jest.fn(),
        sendPasswordResetEmail: jest.fn(),
        sendAccountVerificationOtpEmail: jest.fn(),
      },
    },
  ],
})
class AuthTestModule {}

describe('AuthController', () => {
  let app: NestFastifyApplication;

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
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const moduleRef = await Test.createTestingModule({
      imports: [AuthTestModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prisma)
      .overrideGuard(TenantLifecycleGuard)
      .useValue({ canActivate: jest.fn().mockResolvedValue(true) })
      .compile();

    app = moduleRef.createNestApplication<NestFastifyApplication>(new FastifyAdapter());
    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  afterEach(async () => {
    if (app) {
      await app.close();
    }
  });

  it('logs in and uses the returned JWT on a guarded route', async () => {
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
        passwordHash: hashPassword('password123'),
      },
    ]);

    const loginResponse = await app.inject({
      method: 'POST',
      url: '/auth/login',
      payload: {
        identifier: 'owner@tenant.com',
        password: 'password123',
      },
    });

    expect(loginResponse.statusCode).toBe(201);
    const { accessToken, refreshToken } = JSON.parse(loginResponse.body) as {
      accessToken: string;
      refreshToken: string;
    };
    expect(typeof accessToken).toBe('string');
    expect(typeof refreshToken).toBe('string');

    const protectedResponse = await app.inject({
      method: 'GET',
      url: '/protected',
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
    });

    expect(protectedResponse.statusCode).toBe(200);
    expect(JSON.parse(protectedResponse.body)).toEqual({
      tenantId: 'tenant_1',
      userId: 'user_1',
      businessEntityId: 'be_1',
      role: 'TENANT_OWNER',
    });
  });

  it('logs in with phone number credentials', async () => {
    prisma.user.findMany.mockResolvedValue([
      {
        id: 'user_2',
        tenantId: 'tenant_2',
        businessEntityId: 'be_2',
        operatingUnitId: null,
        role: 'TENANT_MANAGER',
        isActive: true,
        email: 'manager@tenant.com',
        phone: '+2348012349999',
        passwordHash: hashPassword('password123'),
      },
    ]);

    const response = await app.inject({
      method: 'POST',
      url: '/auth/login',
      payload: {
        identifier: '+2348012349999',
        password: 'password123',
      },
    });

    expect(response.statusCode).toBe(201);
    expect(JSON.parse(response.body)).toEqual({
      accessToken: expect.any(String),
      refreshToken: expect.any(String),
    });
  });

  it('refreshes an existing refresh token', async () => {
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
        passwordHash: hashPassword('password123'),
      },
    ]);
    prisma.user.findFirst.mockResolvedValue({
      id: 'user_9',
      tenantId: 'tenant_9',
      businessEntityId: 'be_9',
      operatingUnitId: null,
      role: 'FIELD_OFFICER',
      driverId: 'driver_9',
      isActive: true,
    });
    prisma.authRefreshToken.findFirst.mockResolvedValue({
      id: 'refresh_9',
      userId: 'user_9',
      tokenHash: expect.anything(),
      consumedAt: null,
      expiresAt: new Date(Date.now() + 60_000),
    });

    const loginResponse = await app.inject({
      method: 'POST',
      url: '/auth/login',
      payload: {
        identifier: 'owner@tenant.com',
        password: 'password123',
      },
    });
    const { refreshToken } = JSON.parse(loginResponse.body) as { refreshToken: string };

    prisma.authRefreshToken.findFirst.mockResolvedValueOnce({
      id: 'refresh_10',
      userId: 'user_1',
      tokenHash: expect.anything(),
      consumedAt: null,
      expiresAt: new Date(Date.now() + 60_000),
    });
    prisma.user.findFirst.mockResolvedValueOnce({
      id: 'user_1',
      tenantId: 'tenant_1',
      businessEntityId: 'be_1',
      operatingUnitId: null,
      role: 'TENANT_OWNER',
      driverId: null,
      isActive: true,
    });

    const refreshResponse = await app.inject({
      method: 'POST',
      url: '/auth/refresh',
      payload: {
        refreshToken,
      },
    });

    expect(refreshResponse.statusCode).toBe(201);
    expect(JSON.parse(refreshResponse.body)).toEqual({
      accessToken: expect.any(String),
      refreshToken: expect.any(String),
    });
  });

  it('accepts a password reset request without exposing account existence', async () => {
    prisma.user.findMany.mockResolvedValue([
      {
        id: 'user_3',
        tenantId: 'tenant_3',
        businessEntityId: 'be_3',
        operatingUnitId: null,
        role: 'TENANT_OWNER',
        isActive: true,
        email: 'reset@tenant.com',
        phone: '+2348012300000',
        name: 'Reset User',
        passwordHash: hashPassword('password123'),
      },
    ]);

    const response = await app.inject({
      method: 'POST',
      url: '/auth/password-reset/request',
      payload: {
        identifier: 'reset@tenant.com',
      },
    });

    expect(response.statusCode).toBe(201);
    expect(JSON.parse(response.body)).toEqual({
      message: 'If the account exists and is eligible, the requested auth message has been sent.',
    });
    expect(prisma.passwordResetToken.create).toHaveBeenCalledTimes(1);
  });
});
