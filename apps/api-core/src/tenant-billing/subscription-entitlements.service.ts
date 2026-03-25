import { HttpException, HttpStatus, Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ControlPlaneBillingClient } from './control-plane-billing.client';

function readNumericFeature(features: Record<string, unknown>, key: string): number | null {
  const value = features[key];
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

const BILLING_UNAVAILABLE =
  'Your subscription could not be verified right now. Please try again in a moment or contact support if this continues.';

@Injectable()
export class SubscriptionEntitlementsService {
  constructor(private readonly billingClient: ControlPlaneBillingClient) {}

  async getSubscriptionSummary(tenantId: string) {
    try {
      return await this.billingClient.getSubscription(tenantId);
    } catch (error) {
      if (error instanceof ServiceUnavailableException) {
        throw new ServiceUnavailableException(BILLING_UNAVAILABLE);
      }
      throw error;
    }
  }

  async enforceDriverCapacity(tenantId: string, currentDriverCount: number): Promise<void> {
    const subscription = await this.getSubscriptionSummary(tenantId);
    const driverCap =
      readNumericFeature(subscription.features, 'driverCap') ??
      readNumericFeature(subscription.features, 'seatLimit');

    if (driverCap !== null && currentDriverCount >= driverCap) {
      throw new HttpException(
        `Your ${subscription.planName} plan includes up to ${driverCap} drivers. Upgrade your plan to add more.`,
        HttpStatus.PAYMENT_REQUIRED,
      );
    }
  }

  async enforceVehicleCapacity(tenantId: string, currentVehicleCount: number): Promise<void> {
    const subscription = await this.getSubscriptionSummary(tenantId);
    const vehicleCap =
      readNumericFeature(subscription.features, 'vehicleCap') ??
      readNumericFeature(subscription.features, 'fleetCap');

    if (vehicleCap !== null && currentVehicleCount >= vehicleCap) {
      throw new HttpException(
        `Your ${subscription.planName} plan includes up to ${vehicleCap} vehicles. Upgrade your plan to add more.`,
        HttpStatus.PAYMENT_REQUIRED,
      );
    }
  }

  async enforceSeatCapacity(tenantId: string, currentSeatCount: number): Promise<void> {
    const subscription = await this.getSubscriptionSummary(tenantId);
    const seatLimit = readNumericFeature(subscription.features, 'seatLimit');

    if (seatLimit !== null && currentSeatCount >= seatLimit) {
      throw new HttpException(
        `Your ${subscription.planName} plan includes up to ${seatLimit} operator seats. Upgrade your plan to invite more team members.`,
        HttpStatus.PAYMENT_REQUIRED,
      );
    }
  }
}
