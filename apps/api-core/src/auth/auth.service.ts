import type { TenantRole } from '@mobility-os/authz-model';
import { getGrantedPermissions } from '@mobility-os/authz-model';
import {
  getCountryConfig,
  getFormattingLocale,
  isCountrySupported,
} from '@mobility-os/domain-config';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { ConfigService } from '@nestjs/config';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { JwtService } from '@nestjs/jwt';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { PrismaService } from '../database/prisma.service';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { AuthEmailService } from '../notifications/auth-email.service';
import { getDefaultLanguageForCountry, readOrganisationSettings } from '../tenants/tenant-settings';
import { readUserSettings, writeUserSettings } from './user-settings';
import { generateOtpCode, generatePasswordResetToken, hashAuthSecret } from './auth-token-utils';
// biome-ignore lint/style/useImportType: DTO classes are part of the public service contract.
import { AccountVerificationResponseDto } from './dto/account-verification-response.dto';
// biome-ignore lint/style/useImportType: DTO classes are part of the public service contract.
import { AuthMessageResponseDto } from './dto/auth-message-response.dto';
import type { ChangePasswordDto } from './dto/change-password.dto';
import type { LoginDto } from './dto/login.dto';
import type { RequestAccountVerificationOtpDto } from './dto/request-account-verification-otp.dto';
import type { RequestPasswordResetDto } from './dto/request-password-reset.dto';
import type { ResetPasswordDto } from './dto/reset-password.dto';
import type { SendOnboardingEmailDto } from './dto/send-onboarding-email.dto';
import type { AuthSessionResponseDto } from './dto/session-response.dto';
import type { UpdateProfileDto } from './dto/update-profile.dto';
import type { VerifyAccountVerificationOtpDto } from './dto/verify-account-verification-otp.dto';
import { hashPassword } from './password-utils';
import { verifyPassword } from './password-utils';

function normalizePhoneIdentifier(identifier: string): string {
  return identifier.replace(/[\s()-]/g, '');
}

const ACCOUNT_VERIFICATION_PURPOSE = 'ACCOUNT_VERIFICATION';
const GENERIC_AUTH_MESSAGE =
  'If the account exists and is eligible, the requested auth message has been sent.';
const PASSWORD_RESET_SUCCESS_MESSAGE = 'Your password has been reset successfully.';

function deriveMobileRole(user: {
  role: string;
  driverId?: string | null;
}): 'driver' | 'field_officer' | null {
  if (user.driverId) {
    return 'driver';
  }
  if (user.role === 'FIELD_OFFICER') {
    return 'field_officer';
  }
  return null;
}

function getExpiryDate(expiresIn: string): Date {
  const match = /^(\d+)([smhd])$/.exec(expiresIn.trim());
  if (!match) {
    return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  }

  const value = Number(match[1]);
  const unit = match[2];
  const unitMs =
    unit === 's'
      ? 1000
      : unit === 'm'
        ? 60 * 1000
        : unit === 'h'
          ? 60 * 60 * 1000
          : 24 * 60 * 60 * 1000;

  return new Date(Date.now() + value * unitMs);
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly authEmailService: AuthEmailService,
  ) {}

  private getTenantLoginUrl(fallback?: string): string {
    return fallback ?? `${this.config.getOrThrow<string>('TENANT_WEB_URL')}/login`;
  }

  private buildPasswordResetUrl(token: string): string {
    const tenantWebUrl = this.config.getOrThrow<string>('TENANT_WEB_URL').replace(/\/$/, '');
    return `${tenantWebUrl}/reset-password?token=${encodeURIComponent(token)}`;
  }

  private resolveIdentifierFilter(identifier: string) {
    const trimmedIdentifier = identifier.trim();
    const normalizedPhone = normalizePhoneIdentifier(trimmedIdentifier);
    const isEmailIdentifier = trimmedIdentifier.includes('@');

    return {
      trimmedIdentifier,
      isEmailIdentifier,
      where: isEmailIdentifier
        ? {
            email: trimmedIdentifier.toLowerCase(),
          }
        : {
            phone: {
              in: Array.from(new Set([trimmedIdentifier, normalizedPhone].filter(Boolean))),
            },
          },
    };
  }

  private async findUsersByIdentifier(identifier: string) {
    const { trimmedIdentifier, isEmailIdentifier, where } =
      this.resolveIdentifierFilter(identifier);

    const users = await this.prisma.user.findMany({
      where: {
        isActive: true,
        ...where,
      },
      take: 2,
    });

    return { users, trimmedIdentifier, isEmailIdentifier };
  }

  private async findSingleUserByIdentifier(identifier: string) {
    const { users, isEmailIdentifier } = await this.findUsersByIdentifier(identifier);

    if (users.length === 0) {
      return { user: null, isEmailIdentifier };
    }

    if (users.length > 1) {
      throw new UnauthorizedException(
        `Login is ambiguous for this ${isEmailIdentifier ? 'email address' : 'phone number'}; contact support.`,
      );
    }

    return { user: users[0] ?? null, isEmailIdentifier };
  }

  private async issueTokens(user: {
    id: string;
    tenantId: string;
    businessEntityId?: string | null;
    operatingUnitId?: string | null;
    role: string;
    driverId?: string | null;
    settings?: Prisma.JsonValue | null;
  }) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: user.tenantId },
      select: { country: true },
    });
    const organisationDefaultLanguage = getDefaultLanguageForCountry(tenant?.country);
    const userSettings = readUserSettings(user.settings, {
      preferredLanguage: organisationDefaultLanguage,
      role: user.role,
      hasLinkedDriver: Boolean(user.driverId),
    });

    const accessToken = await this.jwtService.signAsync(
      {
        sub: user.id,
        tenantId: user.tenantId,
        businessEntityId: user.businessEntityId,
        role: user.role,
        mobileRole: deriveMobileRole(user),
        assignedFleetIds: userSettings.assignedFleetIds,
        customPermissions: userSettings.customPermissions,
        ...(user.operatingUnitId ? { operatingUnitId: user.operatingUnitId } : {}),
      },
      {
        secret: this.config.getOrThrow<string>('JWT_SECRET'),
        expiresIn: this.config.getOrThrow<string>('JWT_EXPIRES_IN'),
      },
    );

    const refreshToken = await this.jwtService.signAsync(
      {
        sub: user.id,
        tenantId: user.tenantId,
        type: 'refresh',
      },
      {
        secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.config.getOrThrow<string>('JWT_REFRESH_EXPIRES_IN'),
      },
    );

    await this.prisma.authRefreshToken.create({
      data: {
        userId: user.id,
        tokenHash: hashAuthSecret(refreshToken),
        expiresAt: getExpiryDate(this.config.getOrThrow<string>('JWT_REFRESH_EXPIRES_IN')),
      },
    });

    return { accessToken, refreshToken };
  }

  async getLinkedDriverForUser(tenantId: string, user: { driverId?: string | null }) {
    if (user.driverId) {
      const linkedDriver = await this.prisma.driver.findFirst({
        where: {
          id: user.driverId,
          tenantId,
        },
      });

      if (linkedDriver) {
        return linkedDriver;
      }
    }
    return null;
  }

  async login(dto: LoginDto): Promise<{ accessToken: string; refreshToken: string }> {
    const { user } = await this.findSingleUserByIdentifier(dto.identifier);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.passwordHash || !verifyPassword(dto.password, user.passwordHash)) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.businessEntityId) {
      throw new UnauthorizedException(
        'User is missing business-entity scope required for tenant access.',
      );
    }

    return this.issueTokens(user);
  }

  async refresh(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    let payload: { sub: string; tenantId: string; type?: string };

    try {
      payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token.');
    }

    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('Invalid refresh token.');
    }

    const tokenHash = hashAuthSecret(refreshToken);
    const storedToken = await this.prisma.authRefreshToken.findFirst({
      where: {
        tokenHash,
        consumedAt: null,
        expiresAt: { gt: new Date() },
      },
    });

    if (!storedToken) {
      throw new UnauthorizedException('Refresh token is no longer valid.');
    }

    const user = await this.prisma.user.findFirst({
      where: {
        id: payload.sub,
        tenantId: payload.tenantId,
        isActive: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('The authenticated session is no longer valid.');
    }

    await this.prisma.authRefreshToken.update({
      where: { id: storedToken.id },
      data: { consumedAt: new Date() },
    });

    return this.issueTokens(user);
  }

  async updateProfile(
    userId: string,
    tenantId: string,
    dto: UpdateProfileDto,
  ): Promise<AuthSessionResponseDto> {
    const user = await this.prisma.user.findFirst({
      where: {
        id: userId,
        tenantId,
        isActive: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('The authenticated session is no longer valid.');
    }

    const normalizedName = dto.name.trim();
    const normalizedPhone = dto.phone?.trim() || null;

    if (!normalizedName) {
      throw new BadRequestException('Name is required.');
    }

    if (normalizedPhone) {
      const existingUser = await this.prisma.user.findFirst({
        where: {
          tenantId,
          phone: normalizedPhone,
          NOT: { id: userId },
        },
      });

      if (existingUser) {
        throw new ConflictException(
          `Phone number '${normalizedPhone}' is already in use for this organisation.`,
        );
      }
    }

    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { country: true },
    });
    const nextSettings = writeUserSettings(
      user.settings,
      {
        ...(dto.preferredLanguage ? { preferredLanguage: dto.preferredLanguage } : {}),
      },
      {
        preferredLanguage: getDefaultLanguageForCountry(tenant?.country),
        role: user.role,
        hasLinkedDriver: Boolean(user.driverId),
      },
    );

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        name: normalizedName,
        phone: normalizedPhone,
        settings: nextSettings as Prisma.InputJsonValue,
      },
    });

    return this.getSession(userId, tenantId);
  }

  async changePassword(
    userId: string,
    tenantId: string,
    dto: ChangePasswordDto,
  ): Promise<AuthMessageResponseDto> {
    const user = await this.prisma.user.findFirst({
      where: {
        id: userId,
        tenantId,
        isActive: true,
      },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('The authenticated session is no longer valid.');
    }

    if (!verifyPassword(dto.currentPassword, user.passwordHash)) {
      throw new UnauthorizedException('Current password is incorrect.');
    }

    if (dto.currentPassword === dto.newPassword) {
      throw new BadRequestException('New password must be different from the current password.');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: hashPassword(dto.newPassword) },
    });

    return { message: PASSWORD_RESET_SUCCESS_MESSAGE };
  }

  async getSession(userId: string, tenantId: string): Promise<AuthSessionResponseDto> {
    const user = await this.prisma.user.findFirst({
      where: {
        id: userId,
        tenantId,
        isActive: true,
      },
      include: {
        tenant: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('The authenticated session is no longer valid.');
    }

    const linkedDriver = await this.getLinkedDriverForUser(tenantId, user);
    const tenantCountry = user.tenant.country;
    const defaultCurrency = isCountrySupported(tenantCountry)
      ? getCountryConfig(tenantCountry).currency
      : null;
    const currencyMinorUnit = isCountrySupported(tenantCountry)
      ? getCountryConfig(tenantCountry).currencyMinorUnit
      : null;
    const formattingLocale = getFormattingLocale(tenantCountry);
    const organisationSettings = readOrganisationSettings(user.tenant.metadata, tenantCountry);
    const userSettings = readUserSettings(user.settings, {
      preferredLanguage: organisationSettings.operations.defaultLanguage,
      role: user.role,
      hasLinkedDriver: Boolean(user.driverId),
    });

    return {
      userId: user.id,
      tenantId: user.tenantId,
      email: user.email,
      phone: user.phone ?? null,
      name: user.name,
      role: user.role,
      businessEntityId: user.businessEntityId ?? null,
      operatingUnitId: user.operatingUnitId ?? null,
      tenantName: user.tenant.name,
      tenantCountry,
      defaultCurrency,
      currencyMinorUnit,
      formattingLocale,
      organisationDisplayName: organisationSettings.branding.displayName ?? null,
      organisationLogoUrl: organisationSettings.branding.logoUrl ?? null,
      defaultLanguage: organisationSettings.operations.defaultLanguage,
      preferredLanguage: userSettings.preferredLanguage,
      guarantorMaxActiveDrivers: organisationSettings.operations.guarantorMaxActiveDrivers,
      notificationPreferences: userSettings.notificationPreferences,
      permissions: Array.from(
        getGrantedPermissions(user.role as TenantRole, userSettings.customPermissions),
      ),
      assignedFleetIds: userSettings.assignedFleetIds,
      customPermissions: userSettings.customPermissions,
      linkedDriverId: linkedDriver?.id ?? null,
      linkedDriverStatus: linkedDriver?.status ?? null,
      linkedDriverIdentityStatus: linkedDriver?.identityStatus ?? null,
      mobileRole: deriveMobileRole(user),
      mobileAccessRevoked: user.mobileAccessRevoked ?? null,
    };
  }

  async sendOnboardingEmail(dto: SendOnboardingEmailDto): Promise<AuthMessageResponseDto> {
    const { user } = await this.findSingleUserByIdentifier(dto.identifier);

    if (!user?.email) {
      return { message: GENERIC_AUTH_MESSAGE };
    }

    const code = generateOtpCode();
    await this.prisma.authOtp.create({
      data: {
        userId: user.id,
        identifier: user.email.toLowerCase(),
        purpose: ACCOUNT_VERIFICATION_PURPOSE,
        codeHash: hashAuthSecret(code),
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      },
    });

    await this.authEmailService.sendOnboardingEmail({
      email: user.email,
      name: user.name,
      loginUrl: this.getTenantLoginUrl(dto.loginUrl),
      verificationCode: code,
    });

    return { message: GENERIC_AUTH_MESSAGE };
  }

  async requestPasswordReset(dto: RequestPasswordResetDto): Promise<AuthMessageResponseDto> {
    const { user } = await this.findSingleUserByIdentifier(dto.identifier);

    if (!user?.email) {
      return { message: GENERIC_AUTH_MESSAGE };
    }

    const resetToken = generatePasswordResetToken();
    await this.prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash: hashAuthSecret(resetToken),
        expiresAt: new Date(Date.now() + 30 * 60 * 1000),
      },
    });

    await this.authEmailService.sendPasswordResetEmail({
      email: user.email,
      name: user.name,
      resetUrl: this.buildPasswordResetUrl(resetToken),
      resetToken,
    });

    return { message: GENERIC_AUTH_MESSAGE };
  }

  async resetPassword(dto: ResetPasswordDto): Promise<AuthMessageResponseDto> {
    const tokenHash = hashAuthSecret(dto.token.trim());
    const resetRecord = await this.prisma.passwordResetToken.findFirst({
      where: {
        tokenHash,
        consumedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!resetRecord) {
      throw new UnauthorizedException('Invalid or expired password reset token.');
    }

    await this.prisma.passwordResetToken.update({
      where: { id: resetRecord.id },
      data: { consumedAt: new Date() },
    });

    await this.prisma.user.update({
      where: { id: resetRecord.userId },
      data: { passwordHash: hashPassword(dto.newPassword) },
    });

    return { message: PASSWORD_RESET_SUCCESS_MESSAGE };
  }

  async requestAccountVerificationOtp(
    dto: RequestAccountVerificationOtpDto,
  ): Promise<AuthMessageResponseDto> {
    const { user } = await this.findSingleUserByIdentifier(dto.identifier);

    if (!user?.email) {
      return { message: GENERIC_AUTH_MESSAGE };
    }

    const code = generateOtpCode();
    await this.prisma.authOtp.create({
      data: {
        userId: user.id,
        identifier: user.email.toLowerCase(),
        purpose: ACCOUNT_VERIFICATION_PURPOSE,
        codeHash: hashAuthSecret(code),
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      },
    });

    await this.authEmailService.sendAccountVerificationOtpEmail({
      email: user.email,
      name: user.name,
      code,
    });

    return { message: GENERIC_AUTH_MESSAGE };
  }

  async verifyAccountVerificationOtp(
    dto: VerifyAccountVerificationOtpDto,
  ): Promise<AccountVerificationResponseDto> {
    const { user } = await this.findSingleUserByIdentifier(dto.identifier);

    if (!user) {
      throw new UnauthorizedException('Invalid or expired verification code.');
    }

    const otpRecords = await this.prisma.authOtp.findMany({
      where: {
        userId: user.id,
        purpose: ACCOUNT_VERIFICATION_PURPOSE,
        consumedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    const matchingRecord = otpRecords.find(
      (record) => record.codeHash === hashAuthSecret(dto.code),
    );

    if (!matchingRecord) {
      throw new UnauthorizedException('Invalid or expired verification code.');
    }

    await this.prisma.authOtp.update({
      where: { id: matchingRecord.id },
      data: { consumedAt: new Date() },
    });

    await this.prisma.user.update({
      where: { id: user.id },
      data: { isEmailVerified: true },
    });

    return { verified: true };
  }
}
