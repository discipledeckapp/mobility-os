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
import type { FastifyRequest } from 'fastify';

export interface PlatformPrincipal {
  userId: string;
  role: PlatformRole;
  email: string;
}

/**
 * Validates the platform Bearer JWT used for intelligence staff endpoints.
 * The intelligence plane shares the same platform-staff auth boundary as the
 * control plane, but remains a separate service and controller surface.
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
    const request = context.switchToHttp().getRequest<FastifyRequest>();
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

    (request as FastifyRequest & { platformPrincipal: PlatformPrincipal }).platformPrincipal = {
      userId: sub,
      role,
      email,
    };

    return true;
  }

  private extractBearerToken(request: FastifyRequest): string | undefined {
    const auth = request.headers.authorization;
    if (!auth?.startsWith('Bearer ')) return undefined;
    return auth.slice(7);
  }
}
