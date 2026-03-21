import { tenantContextFromJwt } from '@mobility-os/tenancy-domain';
import { type ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { ConfigService } from '@nestjs/config';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';

interface RequestWithAuthorizationHeader {
  headers: {
    authorization?: string;
  };
  tenantContext?: unknown;
}

/**
 * Validates the tenant Bearer JWT and attaches a typed TenantContext to the
 * request object. Controllers access it via the @CurrentTenant() decorator.
 *
 * Uses PLATFORM_JWT_SECRET is NOT used here — that secret is exclusively for
 * api-control-plane. This guard uses JWT_SECRET from env-config.
 */
@Injectable()
export class TenantAuthGuard extends AuthGuard('jwt') {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    super();
  }

  override canActivate(context: ExecutionContext): boolean {
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
      // tenantContextFromJwt throws if required claims are absent.
      request.tenantContext = tenantContextFromJwt(payload);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Malformed token claims';
      throw new UnauthorizedException(message);
    }

    return true;
  }

  private extractBearerToken(request: RequestWithAuthorizationHeader): string | undefined {
    const auth = request.headers.authorization;
    if (!auth?.startsWith('Bearer ')) return undefined;
    return auth.slice(7);
  }
}
