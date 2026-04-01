import { randomUUID } from 'node:crypto';
import { JwtService } from '@nestjs/jwt';

const jwtService = new JwtService();

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
