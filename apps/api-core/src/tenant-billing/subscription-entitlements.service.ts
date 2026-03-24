import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ControlPlaneBillingClient } from './control-plane-billing.client';

function readNumericFeature(features: Record<string, unknown>, key: string): number | null {
  const value = features[key];
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

@Injectable()
export class SubscriptionEntitlementsService {
  constructor(private readonly billingClient: ControlPlaneBillingClient) {}

  async getSubscriptionSummary(tenantId: string) {
    return this.billingClient.getSubscription(tenantId);
  }

  async enforceDriverCapacity(tenantId: string, currentDriverCount: number): Promise<void> {
    const subscription = await this.getSubscriptionSummary(tenantId);
    const driverCap =
      readNumericFeature(subscription.features, 'driverCap') ??
      readNumericFeature(subscription.features, 'seatLimit');

    if (driverCap !== null && currentDriverCount >= driverCap) {
      throw new HttpException(
        `Your current ${subscription.planName} plan supports up to ${driverCap} managed drivers. Upgrade the organisation plan to add more drivers.`,
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
        `Your current ${subscription.planName} plan supports up to ${vehicleCap} managed vehicles. Upgrade the organisation plan to add more vehicles.`,
        HttpStatus.PAYMENT_REQUIRED,
      );
    }
  }

  async enforceSeatCapacity(tenantId: string, currentSeatCount: number): Promise<void> {
    const subscription = await this.getSubscriptionSummary(tenantId);
    const seatLimit = readNumericFeature(subscription.features, 'seatLimit');

    if (seatLimit !== null && currentSeatCount >= seatLimit) {
      throw new HttpException(
        `Your current ${subscription.planName} plan supports up to ${seatLimit} active operator seats. Upgrade the organisation plan to invite more team members.`,
        HttpStatus.PAYMENT_REQUIRED,
      );
    }
  }
}
