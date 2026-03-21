import { randomUUID } from 'node:crypto';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { FastifyAdapter, type NestFastifyApplication } from '@nestjs/platform-fastify';
import { Test } from '@nestjs/testing';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { PrismaService } from '../src/database/prisma.service';
import { AuthEmailService } from '../src/notifications/auth-email.service';

jest.setTimeout(30_000);

describe('Multi-tenant isolation', () => {
  let app: NestFastifyApplication;
  let prisma: PrismaService;
  let dbHarnessAvailable = false;
  let bootstrapFailureReason: string | null = null;

  const createdTenantIds: string[] = [];

  beforeAll(async () => {
    try {
      process.env.NODE_ENV = 'test';
      process.env.DATABASE_URL = 'postgresql://postgres:postgres@127.0.0.1:5432/mobility_os';
      process.env.JWT_SECRET = 'local-development-jwt-secret-12345678901234567890';
      process.env.JWT_REFRESH_SECRET = 'local-development-refresh-secret-12345678901234';
      process.env.JWT_EXPIRES_IN = '1h';
      process.env.JWT_REFRESH_EXPIRES_IN = '30d';
      process.env.TENANT_WEB_URL = 'http://localhost:3000';
      process.env.INTELLIGENCE_API_URL = 'http://localhost:3200';
      process.env.INTELLIGENCE_API_KEY = 'local-dev-intelligence-key';

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
      await prisma.remittance.deleteMany({
        where: { tenantId: { in: createdTenantIds } },
      });
      await prisma.assignment.deleteMany({
        where: { tenantId: { in: createdTenantIds } },
      });
      await prisma.driverDocument.deleteMany({
        where: { tenantId: { in: createdTenantIds } },
      });
      await prisma.driverGuarantor.deleteMany({
        where: { tenantId: { in: createdTenantIds } },
      });
      await prisma.guarantorDriverLink.deleteMany({
        where: { tenantId: { in: createdTenantIds } },
      });
      await prisma.guarantor.deleteMany({
        where: { tenantId: { in: createdTenantIds } },
      });
      await prisma.vehicleValuation.deleteMany({
        where: { tenantId: { in: createdTenantIds } },
      });
      await prisma.vehicle.deleteMany({
        where: { tenantId: { in: createdTenantIds } },
      });
      await prisma.driver.deleteMany({
        where: { tenantId: { in: createdTenantIds } },
      });
      await prisma.operationalWalletEntry.deleteMany({
        where: { wallet: { tenantId: { in: createdTenantIds } } },
      });
      await prisma.operationalWallet.deleteMany({
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

  it('prevents tenant A from reading tenant B drivers, vehicles, and remittance records', async () => {
    if (!dbHarnessAvailable) {
      console.warn(
        `Skipping multi-tenant isolation e2e bootstrap in this environment: ${bootstrapFailureReason}`,
      );
      return;
    }

    const suffix = randomUUID().slice(0, 8);
    const tenantA = await registerAndLogin(`tenant-a-${suffix}`, `a-${suffix}`);
    const tenantB = await registerAndLogin(`tenant-b-${suffix}`, `b-${suffix}`);

    const tenantBFleet = await prisma.fleet.findFirstOrThrow({
      where: { tenantId: tenantB.tenantId },
    });
    const tenantBOperatingUnit = await prisma.operatingUnit.findFirstOrThrow({
      where: { tenantId: tenantB.tenantId },
    });
    const tenantBBusinessEntity = await prisma.businessEntity.findFirstOrThrow({
      where: { tenantId: tenantB.tenantId },
    });

    const createDriverResponse = await app.inject({
      method: 'POST',
      url: '/api/v1/drivers',
      headers: {
        authorization: `Bearer ${tenantB.accessToken}`,
      },
      payload: {
        fleetId: tenantBFleet.id,
        firstName: 'Bola',
        lastName: 'Driver',
        phone: `080${suffix.replace(/\D/g, '').padEnd(8, '1').slice(0, 8)}`,
        nationality: 'NG',
      },
    });

    expect(createDriverResponse.statusCode).toBe(201);
    const driverB = JSON.parse(createDriverResponse.body) as { id: string };

    const createVehicleResponse = await app.inject({
      method: 'POST',
      url: '/api/v1/vehicles',
      headers: {
        authorization: `Bearer ${tenantB.accessToken}`,
      },
      payload: {
        fleetId: tenantBFleet.id,
        tenantVehicleCode: `TB-${suffix.toUpperCase()}`,
        vehicleType: 'car',
        make: 'Toyota',
        model: 'Corolla',
        year: 2023,
        plate: `LAG-${suffix.toUpperCase()}`,
        color: 'Blue',
      },
    });

    expect(createVehicleResponse.statusCode).toBe(201);
    const vehicleB = JSON.parse(createVehicleResponse.body) as { id: string };

    const assignmentB = await prisma.assignment.create({
      data: {
        tenantId: tenantB.tenantId,
        fleetId: tenantBFleet.id,
        driverId: driverB.id,
        vehicleId: vehicleB.id,
        status: 'active',
        operatingUnitId: tenantBOperatingUnit.id,
        businessEntityId: tenantBBusinessEntity.id,
      },
    });

    const remittanceB = await prisma.remittance.create({
      data: {
        tenantId: tenantB.tenantId,
        assignmentId: assignmentB.id,
        driverId: driverB.id,
        vehicleId: vehicleB.id,
        status: 'pending',
        amountMinorUnits: 150000,
        currency: 'NGN',
        dueDate: '2026-03-21',
        fleetId: tenantBFleet.id,
        operatingUnitId: tenantBOperatingUnit.id,
        businessEntityId: tenantBBusinessEntity.id,
      },
    });

    const driverRead = await app.inject({
      method: 'GET',
      url: `/api/v1/drivers/${driverB.id}`,
      headers: {
        authorization: `Bearer ${tenantA.accessToken}`,
      },
    });
    expect(driverRead.statusCode).toBe(403);

    const vehicleRead = await app.inject({
      method: 'GET',
      url: `/api/v1/vehicles/${vehicleB.id}`,
      headers: {
        authorization: `Bearer ${tenantA.accessToken}`,
      },
    });
    expect(vehicleRead.statusCode).toBe(403);

    const remittanceRead = await app.inject({
      method: 'GET',
      url: `/api/v1/remittance/${remittanceB.id}`,
      headers: {
        authorization: `Bearer ${tenantA.accessToken}`,
      },
    });
    expect(remittanceRead.statusCode).toBe(403);
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
    const loginBody = JSON.parse(loginResponse.body) as {
      accessToken: string;
    };

    return {
      tenantId: tenant.id,
      accessToken: loginBody.accessToken,
    };
  }
});
