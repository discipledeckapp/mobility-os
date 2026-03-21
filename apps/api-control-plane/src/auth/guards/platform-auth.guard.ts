import { type PlatformRole, isPlatformRole } from '@mobility-os/authz-model';
import {
  type ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { ConfigService } from '@nestjs/config';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';

export interface PlatformPrincipal {
  userId: string;
  role: PlatformRole;
  email: string;
}

interface HttpRequestWithAuthHeader {
  headers: {
    authorization?: string;
  };
  platformPrincipal?: PlatformPrincipal;
}

/**
 * Validates the platform Bearer JWT issued exclusively for staff users.
 * Uses PLATFORM_JWT_SECRET — a separate secret from the tenant JWT_SECRET —
 * to prevent cross-plane token abuse (a tenant token must never grant access
 * to control-plane endpoints).
 *
 * Attaches a PlatformPrincipal to request.platformPrincipal on success.
 */
@Injectable()
export class PlatformAuthGuard extends AuthGuard('jwt') {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    super();
  }

  override canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<HttpRequestWithAuthHeader>();
    const token = this.extractBearerToken(request);

    if (!token) {
      throw new UnauthorizedException('Missing Bearer token');
    }

    let payload: Record<string, unknown>;
    try {
      payload = this.jwtService.verify<Record<string, unknown>>(token, {
        secret: this.configService.getOrThrow<string>('PLATFORM_JWT_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired platform token');
    }

    const { sub, role, email } = payload as {
      sub?: unknown;
      role?: unknown;
      email?: unknown;
    };

    if (typeof sub !== 'string' || typeof role !== 'string' || typeof email !== 'string') {
      throw new UnauthorizedException('Malformed platform token claims');
    }

    if (!isPlatformRole(role)) {
      throw new ForbiddenException(`'${role}' is not a platform role`);
    }

    request.platformPrincipal = { userId: sub, role, email };

    return true;
  }

  private extractBearerToken(request: HttpRequestWithAuthHeader): string | undefined {
    const auth = request.headers.authorization;
    if (!auth?.startsWith('Bearer ')) return undefined;
    return auth.slice(7);
  }
}
