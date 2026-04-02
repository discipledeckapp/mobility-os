import type { TenantContext } from '@mobility-os/tenancy-domain';
import {
  Body,
  Controller,
  Get,
  Headers,
  Patch,
  Post,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { AuthService } from './auth.service';
import { CurrentTenant } from './decorators/tenant-context.decorator';
import { AccountVerificationResponseDto } from './dto/account-verification-response.dto';
import { AuthMessageResponseDto } from './dto/auth-message-response.dto';
// biome-ignore lint/style/useImportType: DTO classes are used by Nest decorators at runtime.
import { ChangePasswordDto } from './dto/change-password.dto';
import { LoginResponseDto } from './dto/login-response.dto';
// biome-ignore lint/style/useImportType: DTO classes are used by Nest decorators at runtime.
import { LoginDto } from './dto/login.dto';
import type { RefreshTokenDto } from './dto/refresh-token.dto';
// biome-ignore lint/style/useImportType: DTO classes are used by Nest decorators at runtime.
import { RequestAccountVerificationOtpDto } from './dto/request-account-verification-otp.dto';
// biome-ignore lint/style/useImportType: DTO classes are used by Nest decorators at runtime.
import { RequestPasswordResetDto } from './dto/request-password-reset.dto';
// biome-ignore lint/style/useImportType: DTO classes are used by Nest decorators at runtime.
import { ResetPasswordDto } from './dto/reset-password.dto';
// biome-ignore lint/style/useImportType: DTO classes are used by Nest decorators at runtime.
import { SendOnboardingEmailDto } from './dto/send-onboarding-email.dto';
import { AuthSessionResponseDto } from './dto/session-response.dto';
// biome-ignore lint/style/useImportType: DTO classes are used by Nest decorators at runtime.
import { UpdateProfileDto } from './dto/update-profile.dto';
// biome-ignore lint/style/useImportType: DTO classes are used by Nest decorators at runtime.
import { VerifyAccountVerificationOtpDto } from './dto/verify-account-verification-otp.dto';
import { TenantAuthGuard } from './guards/tenant-auth.guard';
import { TenantLifecycleGuard } from './guards/tenant-lifecycle.guard';

type HeaderWritableResponse = {
  setHeader(name: string, value: string | string[]): void;
};

const ACCESS_COOKIE_NAME = 'mobility_os_tenant_jwt';
const REFRESH_COOKIE_NAME = 'mobility_os_refresh';

function readCookieValue(cookieHeader: string | undefined, cookieName: string): string | null {
  if (!cookieHeader) {
    return null;
  }

  for (const part of cookieHeader.split(';')) {
    const [rawName, ...rawValueParts] = part.trim().split('=');
    if (rawName === cookieName) {
      const rawValue = rawValueParts.join('=');
      return rawValue ? decodeURIComponent(rawValue) : null;
    }
  }

  return null;
}

function buildAuthCookie(name: string, value: string, secure: boolean): string {
  const attributes = [`${name}=${encodeURIComponent(value)}`, 'Path=/', 'HttpOnly', 'SameSite=Lax'];

  if (secure) {
    attributes.push('Secure');
  }

  return attributes.join('; ');
}

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  @ApiOkResponse({ type: LoginResponseDto })
  login(@Body() dto: LoginDto): Promise<LoginResponseDto> {
    return this.authService.login(dto);
  }

  @Post('refresh')
  @Throttle({ default: { ttl: 60_000, limit: 120 } })
  @ApiOkResponse({ type: LoginResponseDto })
  async refresh(
    @Body() dto?: Partial<RefreshTokenDto>,
    @Headers('cookie') cookieHeader?: string,
    @Res({ passthrough: true }) response?: HeaderWritableResponse,
  ): Promise<LoginResponseDto> {
    const refreshToken = dto?.refreshToken ?? readCookieValue(cookieHeader, REFRESH_COOKIE_NAME);

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is required.');
    }

    const tokens = await this.authService.refresh(refreshToken);
    const isSecure = process.env.NODE_ENV === 'production';

    response?.setHeader('set-cookie', [
      buildAuthCookie(ACCESS_COOKIE_NAME, tokens.accessToken, isSecure),
      buildAuthCookie(REFRESH_COOKIE_NAME, tokens.refreshToken, isSecure),
    ]);

    return tokens;
  }

  @Get('session')
  @UseGuards(TenantAuthGuard, TenantLifecycleGuard)
  @ApiOkResponse({ type: AuthSessionResponseDto })
  session(@CurrentTenant() ctx: TenantContext): Promise<AuthSessionResponseDto> {
    return this.authService.getSession(ctx.userId, ctx.tenantId);
  }

  @Patch('me')
  @UseGuards(TenantAuthGuard, TenantLifecycleGuard)
  @ApiOkResponse({ type: AuthSessionResponseDto })
  updateProfile(
    @CurrentTenant() ctx: TenantContext,
    @Body() dto: UpdateProfileDto,
  ): Promise<AuthSessionResponseDto> {
    return this.authService.updateProfile(ctx.userId, ctx.tenantId, dto);
  }

  @Post('password-change')
  @UseGuards(TenantAuthGuard, TenantLifecycleGuard)
  @ApiOkResponse({ type: AuthMessageResponseDto })
  changePassword(
    @CurrentTenant() ctx: TenantContext,
    @Body() dto: ChangePasswordDto,
  ): Promise<AuthMessageResponseDto> {
    return this.authService.changePassword(ctx.userId, ctx.tenantId, dto);
  }

  @Post('onboarding/send')
  @ApiOkResponse({ type: AuthMessageResponseDto })
  sendOnboardingEmail(@Body() dto: SendOnboardingEmailDto): Promise<AuthMessageResponseDto> {
    return this.authService.sendOnboardingEmail(dto);
  }

  @Post('password-reset/request')
  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  @ApiOkResponse({ type: AuthMessageResponseDto })
  requestPasswordReset(@Body() dto: RequestPasswordResetDto): Promise<AuthMessageResponseDto> {
    return this.authService.requestPasswordReset(dto);
  }

  @Post('password-reset/confirm')
  @ApiOkResponse({ type: AuthMessageResponseDto })
  resetPassword(@Body() dto: ResetPasswordDto): Promise<AuthMessageResponseDto> {
    return this.authService.resetPassword(dto);
  }

  @Post('account-verification/request-otp')
  @ApiOkResponse({ type: AuthMessageResponseDto })
  requestAccountVerificationOtp(
    @Body() dto: RequestAccountVerificationOtpDto,
  ): Promise<AuthMessageResponseDto> {
    return this.authService.requestAccountVerificationOtp(dto);
  }

  @Post('account-verification/verify-otp')
  @ApiOkResponse({ type: AccountVerificationResponseDto })
  verifyAccountVerificationOtp(
    @Body() dto: VerifyAccountVerificationOtpDto,
  ): Promise<AccountVerificationResponseDto> {
    return this.authService.verifyAccountVerificationOtp(dto);
  }
}
