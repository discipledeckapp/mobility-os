import { Module } from '@nestjs/common';
import { ControlPlaneBillingClient } from './control-plane-billing.client';
import { ControlPlaneMeteringClient } from './control-plane-metering.client';
import { ControlPlaneSettingsClient } from './control-plane-settings.client';
import { SmileIdentityProvider, YouVerifyProvider } from './identity-providers';
import { IdentityVerificationService } from './identity-verification.service';
import { LivenessService } from './liveness.service';

@Module({
  providers: [
    ControlPlaneBillingClient,
    ControlPlaneMeteringClient,
    ControlPlaneSettingsClient,
    IdentityVerificationService,
    LivenessService,
    YouVerifyProvider,
    SmileIdentityProvider,
  ],
  exports: [IdentityVerificationService, LivenessService],
})
export class ProvidersModule {}
