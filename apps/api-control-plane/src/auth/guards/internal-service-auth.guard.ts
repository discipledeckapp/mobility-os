import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { ConfigService } from '@nestjs/config';

interface HttpRequestWithInternalHeader {
  headers: {
    'x-internal-service-token'?: string;
  };
}

@Injectable()
export class InternalServiceAuthGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<HttpRequestWithInternalHeader>();
    const presentedToken = request.headers['x-internal-service-token'];
    const expectedToken = this.configService.getOrThrow<string>('INTERNAL_SERVICE_TOKEN');

    if (!presentedToken || presentedToken !== expectedToken) {
      throw new UnauthorizedException('Invalid internal service token');
    }

    return true;
  }
}
