import { randomUUID } from 'node:crypto';
import { JwtService } from '@nestjs/jwt';

const jwtService = new JwtService();

export interface InternalServiceJwtClaims {
  iss: string;
  sub: string;
  aud: string;
  scope: 'internal-service';
  jti: string;
  iat?: number;
  exp?: number;
}

export interface InternalServiceJwtConfig {
  secret: string;
  callerId: string;
  audience: string;
  expiresIn: string;
}

export async function signInternalServiceJwt(
  config: InternalServiceJwtConfig,
): Promise<string> {
  return jwtService.signAsync(
    {
      scope: 'internal-service',
    },
    {
      secret: config.secret,
      issuer: config.callerId,
      subject: config.callerId,
      audience: config.audience,
      expiresIn: config.expiresIn,
      jwtid: randomUUID(),
    },
  );
}

export async function verifyInternalServiceJwt(
  token: string,
  config: Pick<InternalServiceJwtConfig, 'secret' | 'audience'>,
): Promise<InternalServiceJwtClaims> {
  return jwtService.verifyAsync<InternalServiceJwtClaims>(token, {
    secret: config.secret,
    audience: config.audience,
  });
}

export function extractBearerToken(value: string | undefined): string | null {
  if (!value) {
    return null;
  }

  const match = value.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() ?? null;
}
