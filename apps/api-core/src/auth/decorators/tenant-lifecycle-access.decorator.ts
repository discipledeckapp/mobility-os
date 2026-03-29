import { SetMetadata } from '@nestjs/common';

export type TenantLifecycleFeature =
  | 'driver_onboarding'
  | 'vehicle_onboarding'
  | 'assignment_creation';

export const TENANT_LIFECYCLE_FEATURE_KEY = 'tenantLifecycleFeature';

export const RequireTenantLifecycleFeature = (
  feature: TenantLifecycleFeature,
): MethodDecorator => SetMetadata(TENANT_LIFECYCLE_FEATURE_KEY, feature);
