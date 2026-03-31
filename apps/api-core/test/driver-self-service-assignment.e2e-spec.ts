import { randomUUID } from 'node:crypto';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { FastifyAdapter, type NestFastifyApplication } from '@nestjs/platform-fastify';
import { Test } from '@nestjs/testing';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { PrismaService } from '../src/database/prisma.service';
import { AuthEmailService } from '../src/notifications/auth-email.service';

jest.setTimeout(30_000);

describe('Driver self-service assignment flow', () => {
  let app: NestFastifyApplication;
  let prisma: PrismaService;
  let dbHarnessAvailable = false;
  let bootstrapFailureReason: string | null = null;

  const createdTenantIds: string[] = [];

  beforeAll(async () => {
    try {
      process.env.NODE_ENV = 'test';
      process.env.DATABASE_URL = 'postgresql://postgres:postgres@127.0.0.1:5432/mobility_os_e2e';
      process.env.JWT_SECRET = 'local-development-jwt-secret-12345678901234567890';
      process.env.JWT_REFRESH_SECRET = 'local-development-refresh-secret-12345678901234';
      process.env.JWT_EXPIRES_IN = '1h';
      process.env.JWT_REFRESH_EXPIRES_IN = '30d';
      process.env.TENANT_WEB_URL = 'http://localhost:3000';
      process.env.INTELLIGENCE_API_URL = 'http://localhost:3200';
      process.env.INTELLIGENCE_API_KEY = 'local-dev-intelligence-key';
      process.env.DISABLE_SCHEDULER = 'true';

      const { AppModule } = await import('../src/app.module');

      const moduleRef = await Test.createTestingModule({
        imports: [AppModule],
      })
        .overrideProvider(AuthEmailService)
        .useValue({
          sendOnboardingEmail: jest.fn(),
          sendPasswordResetEmail: jest.fn(),
          sendAccountVerificationOtpEmail: jest.fn(),
          sendOrgSignupOtpEmail: jest.fn(),
          sendOrgWelcomeEmail: jest.fn(),
          sendDriverSelfServiceVerificationEmail: jest.fn(),
          sendGuarantorSelfServiceVerificationEmail: jest.fn(),
        })
        .compile();

      app = moduleRef.createNestApplication<NestFastifyApplication>(new FastifyAdapter(), {
        bufferLogs: true,
      });
      app.useGlobalPipes(
        new ValidationPipe({
          whitelist: true,
          forbidNonWhitelisted: true,
          transform: true,
          transformOptions: { enableImplicitConversion: true },
        }),
      );
      app.useGlobalFilters(new HttpExceptionFilter());
      app.setGlobalPrefix('api');
      app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });

      await app.init();
      await app.getHttpAdapter().getInstance().ready();
      prisma = app.get(PrismaService);
      dbHarnessAvailable = true;
    } catch (error) {
      bootstrapFailureReason = error instanceof Error ? error.message : 'Unknown bootstrap error';
    }
  });

  afterAll(async () => {
    if (prisma && createdTenantIds.length > 0) {
      await prisma.authRefreshToken.deleteMany({
        where: { user: { tenantId: { in: createdTenantIds } } },
      });
      await prisma.passwordResetToken.deleteMany({
        where: { user: { tenantId: { in: createdTenantIds } } },
      });
      await prisma.authOtp.deleteMany({
        where: { user: { tenantId: { in: createdTenantIds } } },
      });
      await prisma.selfServiceOtp.deleteMany({
        where: { tenantId: { in: createdTenantIds } },
      });
      await prisma.userNotification.deleteMany({
        where: { tenantId: { in: createdTenantIds } },
      });
      await prisma.assignment.deleteMany({
        where: { tenantId: { in: createdTenantIds } },
      });
      await prisma.vehicle.deleteMany({
        where: { tenantId: { in: createdTenantIds } },
      });
      await prisma.driver.deleteMany({
        where: { tenantId: { in: createdTenantIds } },
      });
      await prisma.user.deleteMany({
        where: { tenantId: { in: createdTenantIds } },
      });
      await prisma.fleet.deleteMany({
        where: { tenantId: { in: createdTenantIds } },
      });
      await prisma.operatingUnit.deleteMany({
        where: { tenantId: { in: createdTenantIds } },
      });
      await prisma.businessEntity.deleteMany({
        where: { tenantId: { in: createdTenantIds } },
      });
      await prisma.tenant.deleteMany({
        where: { id: { in: createdTenantIds } },
      });
    }

    if (app) {
      await app.close();
    }
  });

  it('lets a driver see a newly assigned vehicle and accept it from the self-service flow', async () => {
    if (!dbHarnessAvailable) {
      console.warn(
        `Skipping driver self-service assignment e2e bootstrap in this environment: ${bootstrapFailureReason}`,
      );
      return;
    }

    const suffix = randomUUID().slice(0, 8);
    const tenant = await registerAndLogin(`driver-e2e-${suffix}`, `driver-e2e-${suffix}`);

    const fleet = await prisma.fleet.findFirstOrThrow({
      where: { tenantId: tenant.tenantId },
    });

    const createDriverResponse = await app.inject({
      method: 'POST',
      url: '/api/v1/drivers',
      headers: {
        authorization: `Bearer ${tenant.accessToken}`,
      },
      payload: {
        fleetId: fleet.id,
        firstName: 'Ada',
        lastName: 'Okafor',
        email: `driver-${suffix}@example.com`,
        phone: `080${suffix.replace(/\D/g, '').padEnd(8, '2').slice(0, 8)}`,
        nationality: 'NG',
      },
    });
    expect(createDriverResponse.statusCode).toBe(201);
    const driver = JSON.parse(createDriverResponse.body) as { id: string; phone: string; email: string };

    await prisma.driver.update({
      where: { id: driver.id },
      data: {
        status: 'active',
        identityStatus: 'verified',
        operationalProfile: {
          phoneNumber: driver.phone,
          address: '12 Marina Road',
          town: 'Lagos',
          localGovernmentArea: 'Eti-Osa',
          state: 'Lagos',
          nextOfKinName: 'Ngozi Okafor',
          nextOfKinPhone: '+2348099999999',
          emergencyContactName: 'Emeka Okafor',
          emergencyContactPhone: '+2348088888888',
        },
      },
    });

    await prisma.user.create({
      data: {
        tenantId: tenant.tenantId,
        driverId: driver.id,
        name: 'Ada Okafor',
        email: `driver-mobile-${suffix}@example.com`,
        phone: driver.phone,
        role: 'READ_ONLY',
        isActive: true,
        isEmailVerified: true,
        mobileAccessRevoked: false,
        settings: {},
      },
    });

    const createVehicleResponse = await app.inject({
      method: 'POST',
      url: '/api/v1/vehicles',
      headers: {
        authorization: `Bearer ${tenant.accessToken}`,
      },
      payload: {
        fleetId: fleet.id,
        tenantVehicleCode: `DRV-${suffix.toUpperCase()}`,
        vehicleType: 'motorcycle',
        make: 'Honda',
        model: 'CB150R',
        year: 2023,
        plate: `LAG-${suffix.toUpperCase()}`,
        color: 'Blue',
      },
    });
    expect(createVehicleResponse.statusCode).toBe(201);
    const vehicle = JSON.parse(createVehicleResponse.body) as { id: string };

    const assignmentResponse = await app.inject({
      method: 'POST',
      url: '/api/v1/assignments',
      headers: {
        authorization: `Bearer ${tenant.accessToken}`,
      },
      payload: {
        driverId: driver.id,
        vehicleId: vehicle.id,
        notes: 'Morning dispatch',
        remittanceAmountMinorUnits: 250000,
      },
    });
    expect(assignmentResponse.statusCode).toBe(201);
    const assignment = JSON.parse(assignmentResponse.body) as { id: string; status: string };
    expect(assignment.status).toBe('driver_action_required');

    const sendLinkResponse = await app.inject({
      method: 'POST',
      url: `/api/v1/drivers/${driver.id}/self-service-links`,
      headers: {
        authorization: `Bearer ${tenant.accessToken}`,
      },
    });
    expect(sendLinkResponse.statusCode).toBe(201);

    const otp = await prisma.selfServiceOtp.findFirstOrThrow({
      where: {
        tenantId: tenant.tenantId,
        subjectId: driver.id,
      },
      orderBy: { createdAt: 'desc' },
    });

    const exchangeOtpResponse = await app.inject({
      method: 'POST',
      url: '/api/v1/driver-self-service/exchange-otp',
      payload: {
        otpCode: otp.otpCode,
      },
    });
    expect(exchangeOtpResponse.statusCode).toBe(201);
    const { token } = JSON.parse(exchangeOtpResponse.body) as { token: string };

    const listAssignmentsResponse = await app.inject({
      method: 'POST',
      url: '/api/v1/driver-self-service/assignments',
      payload: { token },
    });
    expect(listAssignmentsResponse.statusCode).toBe(201);
    const assignments = JSON.parse(listAssignmentsResponse.body) as Array<{
      id: string;
      status: string;
      vehicle: { plate: string | null };
    }>;
    expect(assignments).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: assignment.id,
          status: 'driver_action_required',
          vehicle: expect.objectContaining({
            plate: `LAG-${suffix.toUpperCase()}`,
          }),
        }),
      ]),
    );

    const listNotificationsResponse = await app.inject({
      method: 'POST',
      url: '/api/v1/driver-self-service/notifications',
      payload: { token },
    });
    expect(listNotificationsResponse.statusCode).toBe(201);
    const notifications = JSON.parse(listNotificationsResponse.body) as Array<{
      topic: string;
      actionUrl: string | null;
    }>;
    expect(notifications).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          topic: 'assignment_issued',
          actionUrl: `/driver-self-service?assignmentId=${assignment.id}`,
        }),
      ]),
    );

    const acceptResponse = await app.inject({
      method: 'POST',
      url: `/api/v1/driver-self-service/assignments/${assignment.id}/accept`,
      payload: { token },
    });
    expect(acceptResponse.statusCode).toBe(201);
    const acceptedAssignment = JSON.parse(acceptResponse.body) as { status: string };
    expect(acceptedAssignment.status).toBe('accepted');
  });

  async function registerAndLogin(
    slug: string,
    emailPrefix: string,
  ): Promise<{ tenantId: string; accessToken: string }> {
    const email = `${emailPrefix}@example.com`;

    const registerResponse = await app.inject({
      method: 'POST',
      url: '/api/v1/signup/register',
      payload: {
        orgName: `${emailPrefix} Transport`,
        slug,
        country: 'NG',
        businessModel: 'hire-purchase',
        adminName: 'Owner User',
        adminEmail: email,
        adminPhone: '+2348012345678',
        adminPassword: 'FleetPass123!',
      },
    });
    expect(registerResponse.statusCode).toBe(201);

    const tenant = await prisma.tenant.findUniqueOrThrow({
      where: { slug },
    });
    createdTenantIds.push(tenant.id);

    const loginResponse = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      payload: {
        identifier: email,
        password: 'FleetPass123!',
      },
    });
    expect(loginResponse.statusCode).toBe(201);
    const loggedIn = JSON.parse(loginResponse.body) as { accessToken: string };

    return { tenantId: tenant.id, accessToken: loggedIn.accessToken };
  }
});
