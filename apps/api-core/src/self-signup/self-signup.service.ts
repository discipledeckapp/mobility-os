import { TenantRole } from '@mobility-os/authz-model';
import { getBusinessModel, getCountryConfig } from '@mobility-os/domain-config';
import { ConflictException, Injectable, Logger } from '@nestjs/common';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { ConfigService } from '@nestjs/config';
import { generateOtpCode, hashAuthSecret } from '../auth/auth-token-utils';
import { hashPassword } from '../auth/password-utils';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { PrismaService } from '../database/prisma.service';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { AuthEmailService } from '../notifications/auth-email.service';
import type { RegisterOrganisationDto } from './dto/register-organisation.dto';

const ORG_SIGNUP_OTP_PURPOSE = 'ORG_SIGNUP_VERIFICATION';

export interface RegisterOrganisationResult {
  userId: string;
  tenantId: string;
  tenantSlug: string;
  message: string;
}

@Injectable()
export class SelfSignupService {
  private readonly logger = new Logger(SelfSignupService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly authEmailService: AuthEmailService,
  ) {}

  private getLoginUrl(): string {
    return `${this.config.getOrThrow<string>('TENANT_WEB_URL')}/login`;
  }

  private async ensureControlPlaneSubscription(tenantId: string, currency: string): Promise<void> {
    const controlPlaneApiUrl = this.config.get<string>('CONTROL_PLANE_API_URL');
    const internalServiceToken = this.config.get<string>('INTERNAL_SERVICE_TOKEN');

    if (!controlPlaneApiUrl || !internalServiceToken) {
      this.logger.warn(
        `Skipping control-plane subscription bootstrap for tenant '${tenantId}' because control-plane integration is not configured.`,
      );
      return;
    }

    try {
      const response = await fetch(
        `${controlPlaneApiUrl.replace(/\/$/, '')}/api/internal/subscriptions/bootstrap`,
        {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            'x-internal-service-token': internalServiceToken,
          },
          body: JSON.stringify({
            tenantId,
            currency,
            trialDays: 14,
          }),
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(
          `Control-plane subscription bootstrap failed for tenant '${tenantId}': ${response.status} ${errorText}`,
        );
      }
    } catch (error) {
      this.logger.error(
        `Control-plane subscription bootstrap failed for tenant '${tenantId}': ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
    }
  }

  async registerOrganisation(dto: RegisterOrganisationDto): Promise<RegisterOrganisationResult> {
    // Validate business model (throws if invalid)
    getBusinessModel(dto.businessModel);

    const countryConfig = getCountryConfig(dto.country);

    const { userId, tenantId, tenantSlug } = await this.prisma.$transaction(async (tx) => {
      const existingSlug = await tx.tenant.findUnique({
        where: { slug: dto.slug },
      });
      if (existingSlug) {
        throw new ConflictException(
          `The organisation slug '${dto.slug}' is already taken. Please choose a different one.`,
        );
      }

      const existingUser = await tx.user.findFirst({
        where: { email: dto.adminEmail.toLowerCase() },
      });
      if (existingUser) {
        throw new ConflictException(`An account with email '${dto.adminEmail}' already exists.`);
      }

      const tenant = await tx.tenant.create({
        data: {
          slug: dto.slug,
          name: dto.orgName,
          country: dto.country,
          status: 'trialing',
        },
      });

      const businessEntity = await tx.businessEntity.create({
        data: {
          tenantId: tenant.id,
          name: dto.orgName,
          country: dto.country,
          businessModel: dto.businessModel,
          status: 'active',
        },
      });

      const operatingUnit = await tx.operatingUnit.create({
        data: {
          tenantId: tenant.id,
          businessEntityId: businessEntity.id,
          name: `${dto.orgName} Main`,
          status: 'active',
        },
      });

      await tx.fleet.create({
        data: {
          tenantId: tenant.id,
          operatingUnitId: operatingUnit.id,
          name: 'Main Fleet',
          businessModel: dto.businessModel,
          status: 'active',
        },
      });

      await tx.operationalWallet.upsert({
        where: { businessEntityId: businessEntity.id },
        create: {
          tenantId: tenant.id,
          businessEntityId: businessEntity.id,
          currency: countryConfig.currency,
        },
        update: {},
      });

      const user = await tx.user.create({
        data: {
          tenantId: tenant.id,
          email: dto.adminEmail.toLowerCase(),
          phone: dto.adminPhone ?? null,
          name: dto.adminName,
          role: TenantRole.TenantOwner,
          isActive: true,
          isEmailVerified: false,
          businessEntityId: businessEntity.id,
          passwordHash: hashPassword(dto.adminPassword),
        },
      });

      return {
        userId: user.id,
        tenantId: tenant.id,
        tenantSlug: tenant.slug,
      };
    });

    // Generate and store OTP
    const code = generateOtpCode();
    await this.prisma.authOtp.create({
      data: {
        userId,
        identifier: dto.adminEmail.toLowerCase(),
        purpose: ORG_SIGNUP_OTP_PURPOSE,
        codeHash: hashAuthSecret(code),
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      },
    });

    // Log OTP to console in non-production for easy dev access
    if (this.config.get('NODE_ENV') !== 'production') {
      this.logger.log('[DEV] Signup OTP generated for organisation verification. Check the database or mail stub for the code.');
    }

    // Send branded OTP email
    await this.authEmailService.sendOrgSignupOtpEmail({
      email: dto.adminEmail,
      name: dto.adminName,
      orgName: dto.orgName,
      code,
    });

    await this.ensureControlPlaneSubscription(tenantId, countryConfig.currency);

    return {
      userId,
      tenantId,
      tenantSlug,
      message:
        'Organisation registered. Check your email for a verification code to activate your account.',
    };
  }

  async verifyOrgSignupOtp(
    email: string,
    code: string,
  ): Promise<{ verified: boolean; tenantSlug: string }> {
    const user = await this.prisma.user.findFirst({
      where: { email: email.toLowerCase(), isActive: true },
      include: { tenant: true },
    });

    if (!user) {
      return { verified: false, tenantSlug: '' };
    }

    const record = await this.prisma.authOtp.findFirst({
      where: {
        userId: user.id,
        purpose: ORG_SIGNUP_OTP_PURPOSE,
        consumedAt: null,
        codeHash: hashAuthSecret(code),
        expiresAt: { gt: new Date() },
      },
    });

    if (!record) {
      return { verified: false, tenantSlug: '' };
    }

    await this.prisma.$transaction([
      this.prisma.authOtp.update({
        where: { id: record.id },
        data: { consumedAt: new Date() },
      }),
      this.prisma.user.update({
        where: { id: user.id },
        data: { isEmailVerified: true },
      }),
    ]);

    // Send welcome email after verification
    await this.authEmailService.sendOrgWelcomeEmail({
      email: user.email,
      name: user.name,
      orgName: user.tenant.name,
      loginUrl: this.getLoginUrl(),
    });

    return { verified: true, tenantSlug: user.tenant.slug };
  }
}
