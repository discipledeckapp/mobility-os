import { SetMetadata } from '@nestjs/common';

export const ALLOW_BLOCKED_TENANT_ACCESS_KEY = 'allowBlockedTenantAccess';

export const AllowBlockedTenantAccess = (): MethodDecorator =>
  SetMetadata(ALLOW_BLOCKED_TENANT_ACCESS_KEY, true);
