import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { ConfigService } from '@nestjs/config';
import type { FastifyRequest } from 'fastify';

/**
 * Guards intelligence endpoints called by tenant services (api-core).
 *
 * Tenant callers authenticate with a shared API key passed in the
 * x-api-key header. Platform staff use Bearer JWT (PlatformAuthGuard)
 * and access separate admin endpoints.
 *
 * The key is compared using a constant-time check to prevent timing attacks.
 */
@Injectable()
export class IntelligenceApiKeyGuard implements CanActivate {
  private readonly expectedKey: string;

  constructor(private readonly configService: ConfigService) {
    this.expectedKey = this.configService.getOrThrow<string>('INTELLIGENCE_API_KEY');
  }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<FastifyRequest>();
    const providedKey = request.headers['x-api-key'];

    if (typeof providedKey !== 'string' || !this.constantTimeEqual(providedKey, this.expectedKey)) {
      throw new UnauthorizedException('Invalid or missing API key');
    }

    return true;
  }

  /**
   * Compares two strings in O(n) time regardless of where they differ,
   * mitigating timing-based key enumeration.
   */
  private constantTimeEqual(a: string, b: string): boolean {
    if (a.length !== b.length) {
      // Still iterate to avoid length-based timing leak.
      const shorter = a.length < b.length ? a : b;
      for (let i = 0; i < shorter.length; i++) {
        void (shorter.charCodeAt(i) ^ shorter.charCodeAt(i));
      }
      return false;
    }

    let mismatch = 0;
    for (let i = 0; i < a.length; i++) {
      mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return mismatch === 0;
  }
}
