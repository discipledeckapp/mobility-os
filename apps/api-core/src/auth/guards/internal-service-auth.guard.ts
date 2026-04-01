import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { ConfigService } from '@nestjs/config';
import { extractBearerToken, verifyInternalServiceJwt } from '../internal-service-jwt';

interface HttpRequestWithInternalHeader {
  headers: {
    authorization?: string;
  };
}

@Injectable()
export class InternalServiceAuthGuard implements CanActivate {
  private readonly allowedCallers: Set<string>;

  constructor(private readonly configService: ConfigService) {
    this.allowedCallers = new Set(
      this.configService
        .get<string>('INTERNAL_SERVICE_ALLOWED_CALLERS', 'api-control-plane')
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean),
    );
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<HttpRequestWithInternalHeader>();
    const bearerToken = extractBearerToken(request.headers.authorization);
    const secret = this.configService.getOrThrow<string>('INTERNAL_SERVICE_JWT_SECRET');
    const audience = this.configService.get<string>('INTERNAL_SERVICE_AUDIENCE', 'api-core');

    if (!bearerToken) {
      throw new UnauthorizedException('Missing internal service bearer token');
    }

    return this.validateToken(bearerToken, secret, audience);
  }

  private async validateToken(
    token: string,
    secret: string,
    audience: string,
  ): Promise<boolean> {
    let payload: Awaited<ReturnType<typeof verifyInternalServiceJwt>>;
    try {
      payload = await verifyInternalServiceJwt(token, {
        secret,
        audience,
      });
    } catch {
      throw new UnauthorizedException('Invalid internal service bearer token');
    }

    if (
      typeof payload !== 'object' ||
      payload.scope !== 'internal-service' ||
      payload.iss !== payload.sub ||
      !this.allowedCallers.has(payload.iss)
    ) {
      throw new UnauthorizedException('Invalid internal service caller');
    }

    return true;
  }
}
