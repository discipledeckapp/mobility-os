import { ConflictException } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import { hashAuthSecret } from '../auth/auth-token-utils';
import { hashPassword } from '../auth/password-utils';
import type { AuthEmailService } from '../notifications/auth-email.service';
import { SelfSignupService } from './self-signup.service';

describe('SelfSignupService', () => {
  const tx = {
    tenant: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    user: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    businessEntity: {
      create: jest.fn(),
    },
    operatingUnit: {
      create: jest.fn(),
    },
    fleet: {
      create: jest.fn(),
    },
    operationalWallet: {
      upsert: jest.fn(),
    },
  };

  const prisma = {
    $transaction: jest.fn(),
    authOtp: {
      create: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    user: {
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  };

  const config = {
    get: jest.fn((key: string) => {
      if (key === 'NODE_ENV') {
        return 'test';
      }
      return undefined;
    }),
    getOrThrow: jest.fn((key: string) => {
      if (key === 'TENANT_WEB_URL') {
        return 'https://tenant.mobiris.test';
      }
      throw new Error(`Unexpected config lookup: ${key}`);
    }),
  } as unknown as ConfigService;

  const authEmailService = {
    sendOrgSignupOtpEmail: jest.fn(),
    sendOrgWelcomeEmail: jest.fn(),
  } as unknown as AuthEmailService;

  let service: SelfSignupService;

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.$transaction.mockImplementation(
      async (callback: (client: typeof tx) => Promise<unknown>) => callback(tx),
    );

    tx.tenant.findUnique.mockResolvedValue(null);
    tx.user.findFirst.mockResolvedValue(null);
    tx.tenant.create.mockResolvedValue({
      id: 'tenant_1',
      slug: 'acme-transport',
      name: 'Acme Transport',
      country: 'NG',
    });
    tx.businessEntity.create.mockResolvedValue({
      id: 'be_1',
      tenantId: 'tenant_1',
      name: 'Acme Transport',
    });
    tx.operatingUnit.create.mockResolvedValue({
      id: 'ou_1',
      businessEntityId: 'be_1',
    });
    tx.fleet.create.mockResolvedValue({
      id: 'fleet_1',
    });
    tx.operationalWallet.upsert.mockResolvedValue({
      id: 'wallet_1',
    });
    tx.user.create.mockResolvedValue({
      id: 'user_1',
      tenantId: 'tenant_1',
      email: 'owner@acme.ng',
      name: 'Ada Owner',
      passwordHash: hashPassword('FleetPass123!'),
    });

    service = new SelfSignupService(prisma as never, config, authEmailService);
  });

  it('registers an organisation, creates the tenant hierarchy, and sends an OTP', async () => {
    const result = await service.registerOrganisation({
      orgName: 'Acme Transport',
      slug: 'acme-transport',
      country: 'NG',
      businessModel: 'hire-purchase',
      adminName: 'Ada Owner',
      adminEmail: 'owner@acme.ng',
      adminPhone: '+2348012345678',
      adminPassword: 'FleetPass123!',
    });

    expect(result).toEqual({
      userId: 'user_1',
      tenantId: 'tenant_1',
      tenantSlug: 'acme-transport',
      message:
        'Organisation registered. Check your email for a verification code to activate your account.',
    });
    expect(tx.tenant.create).toHaveBeenCalled();
    expect(tx.businessEntity.create).toHaveBeenCalled();
    expect(tx.operatingUnit.create).toHaveBeenCalled();
    expect(tx.fleet.create).toHaveBeenCalled();
    expect(prisma.authOtp.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: 'user_1',
        identifier: 'owner@acme.ng',
        codeHash: expect.any(String),
      }),
    });
    expect(authEmailService.sendOrgSignupOtpEmail).toHaveBeenCalledTimes(1);
  });

  it('rejects duplicate organisation slugs', async () => {
    tx.tenant.findUnique.mockResolvedValue({
      id: 'tenant_existing',
      slug: 'acme-transport',
    });

    await expect(
      service.registerOrganisation({
        orgName: 'Acme Transport',
        slug: 'acme-transport',
        country: 'NG',
        businessModel: 'hire-purchase',
        adminName: 'Ada Owner',
        adminEmail: 'owner@acme.ng',
        adminPassword: 'FleetPass123!',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('rejects duplicate admin emails', async () => {
    tx.user.findFirst.mockResolvedValue({
      id: 'user_existing',
      email: 'owner@acme.ng',
    });

    await expect(
      service.registerOrganisation({
        orgName: 'Acme Transport',
        slug: 'acme-transport',
        country: 'NG',
        businessModel: 'hire-purchase',
        adminName: 'Ada Owner',
        adminEmail: 'owner@acme.ng',
        adminPassword: 'FleetPass123!',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('verifies a valid signup OTP and sends a welcome email', async () => {
    prisma.user.findFirst.mockResolvedValue({
      id: 'user_1',
      email: 'owner@acme.ng',
      name: 'Ada Owner',
      tenant: {
        slug: 'acme-transport',
        name: 'Acme Transport',
      },
    });
    prisma.authOtp.findFirst.mockResolvedValue({
      id: 'otp_1',
      userId: 'user_1',
      codeHash: hashAuthSecret('123456'),
      consumedAt: null,
      expiresAt: new Date(Date.now() + 60_000),
    });
    prisma.$transaction.mockResolvedValueOnce([
      { id: 'otp_1' },
      { id: 'user_1', isEmailVerified: true },
    ]);

    await expect(service.verifyOrgSignupOtp('owner@acme.ng', '123456')).resolves.toEqual({
      verified: true,
      tenantSlug: 'acme-transport',
    });

    expect(authEmailService.sendOrgWelcomeEmail).toHaveBeenCalledWith({
      email: 'owner@acme.ng',
      name: 'Ada Owner',
      orgName: 'Acme Transport',
      loginUrl: 'https://tenant.mobiris.test/login',
    });
  });

  it('returns verified false for a wrong OTP', async () => {
    prisma.user.findFirst.mockResolvedValue({
      id: 'user_1',
      email: 'owner@acme.ng',
      name: 'Ada Owner',
      tenant: {
        slug: 'acme-transport',
        name: 'Acme Transport',
      },
    });
    prisma.authOtp.findFirst.mockResolvedValue(null);

    await expect(service.verifyOrgSignupOtp('owner@acme.ng', '654321')).resolves.toEqual({
      verified: false,
      tenantSlug: '',
    });
  });

  it('returns verified false for an expired OTP', async () => {
    prisma.user.findFirst.mockResolvedValue({
      id: 'user_1',
      email: 'owner@acme.ng',
      name: 'Ada Owner',
      tenant: {
        slug: 'acme-transport',
        name: 'Acme Transport',
      },
    });
    prisma.authOtp.findFirst.mockResolvedValue(null);

    await expect(service.verifyOrgSignupOtp('owner@acme.ng', '123456')).resolves.toEqual({
      verified: false,
      tenantSlug: '',
    });
  });
});
