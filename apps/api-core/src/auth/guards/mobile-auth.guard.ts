import { tenantContextFromJwt } from '@mobility-os/tenancy-domain';
import { type ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { ConfigService } from '@nestjs/config';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { JwtService } from '@nestjs/jwt';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { PrismaService } from '../../database/prisma.service';
import { readUserSettings } from '../user-settings';

interface RequestWithAuthorizationHeader {
  headers: {
    authorization?: string;
  };
  tenantContext?: unknown;
  mobileRole?: 'driver' | 'field_officer';
}

@Injectable()
export class MobileAuthGuard {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithAuthorizationHeader>();
    const token = this.extractBearerToken(request);

    if (!token) {
      throw new UnauthorizedException('Missing Bearer token');
    }

    let payload: Record<string, unknown>;
    try {
      payload = this.jwtService.verify<Record<string, unknown>>(token, {
        secret: this.configService.getOrThrow<string>('JWT_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }

    try {
      request.tenantContext = tenantContextFromJwt(payload);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Malformed token claims';
      throw new UnauthorizedException(message);
    }

    const tenantContext = request.tenantContext as
      | { userId?: string; tenantId?: string }
      | undefined;

    if (!tenantContext?.userId || !tenantContext.tenantId) {
      throw new UnauthorizedException('The mobile session is missing tenant context.');
    }

    const user = await this.prisma.user.findFirst({
      where: {
        id: tenantContext.userId,
        tenantId: tenantContext.tenantId,
        isActive: true,
      },
    });

    if (!user || user.mobileAccessRevoked) {
      throw new UnauthorizedException('Mobile access has been revoked for this account.');
    }

    const userSettings = readUserSettings(user.settings, {
      preferredLanguage: 'en',
      role: user.role,
      hasLinkedDriver: Boolean(user.driverId),
    });
    const mobileRole =
      userSettings.accessMode === 'driver_mobile' || user.driverId
        ? 'driver'
        : user.role === 'FIELD_OFFICER'
          ? 'field_officer'
          : null;

    if (!mobileRole) {
      throw new UnauthorizedException('This account does not have mobile operations access.');
    }

    request.mobileRole = mobileRole;
    return true;
  }

  private extractBearerToken(request: RequestWithAuthorizationHeader): string | undefined {
    const auth = request.headers.authorization;
    if (!auth?.startsWith('Bearer ')) return undefined;
    return auth.slice(7);
  }
}
