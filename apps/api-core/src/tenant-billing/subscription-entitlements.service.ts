import { HttpException, HttpStatus, Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ControlPlaneBillingClient } from './control-plane-billing.client';

function readNumericFeature(features: Record<string, unknown>, key: string): number | null {
  const value = features[key];
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

@Injectable()
export class SubscriptionEntitlementsService {
  private readonly logger = new Logger(SubscriptionEntitlementsService.name);

  constructor(private readonly billingClient: ControlPlaneBillingClient) {}

  async getSubscriptionSummary(tenantId: string) {
    return this.billingClient.getSubscription(tenantId);
  }

  /**
   * Returns false if billing is reachable and the cap is exceeded.
   * Returns true (allow through) if billing is unreachable — we never block
   * user operations because the billing service is temporarily down.
   */
  async enforceDriverCapacity(tenantId: string, currentDriverCount: number): Promise<void> {
    let subscription: Awaited<ReturnType<ControlPlaneBillingClient['getSubscription']>>;
    try {
      subscription = await this.getSubscriptionSummary(tenantId);
    } catch (error) {
      if (error instanceof ServiceUnavailableException) {
        this.logger.warn(`Driver capacity check skipped for tenant '${tenantId}': ${error.message}`);
        return; // fail open — never block onboarding because billing is down
      }
      throw error;
    }

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
    let subscription: Awaited<ReturnType<ControlPlaneBillingClient['getSubscription']>>;
    try {
      subscription = await this.getSubscriptionSummary(tenantId);
    } catch (error) {
      if (error instanceof ServiceUnavailableException) {
        this.logger.warn(`Vehicle capacity check skipped for tenant '${tenantId}': ${error.message}`);
        return;
      }
      throw error;
    }

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

  /**
   * Returns the current plan's driver and vehicle caps without throwing.
   * Returns null for a cap if billing is unreachable or the plan has no cap.
   */
  async getCapInfo(tenantId: string): Promise<{
    driverCap: number | null;
    vehicleCap: number | null;
    planName: string | null;
  }> {
    try {
      const subscription = await this.getSubscriptionSummary(tenantId);
      const driverCap =
        readNumericFeature(subscription.features, 'driverCap') ??
        readNumericFeature(subscription.features, 'seatLimit');
      const vehicleCap =
        readNumericFeature(subscription.features, 'vehicleCap') ??
        readNumericFeature(subscription.features, 'fleetCap');
      return { driverCap, vehicleCap, planName: subscription.planName };
    } catch {
      return { driverCap: null, vehicleCap: null, planName: null };
    }
  }

  async enforceSeatCapacity(tenantId: string, currentSeatCount: number): Promise<void> {
    let subscription: Awaited<ReturnType<ControlPlaneBillingClient['getSubscription']>>;
    try {
      subscription = await this.getSubscriptionSummary(tenantId);
    } catch (error) {
      if (error instanceof ServiceUnavailableException) {
        this.logger.warn(`Seat capacity check skipped for tenant '${tenantId}': ${error.message}`);
        return;
      }
      throw error;
    }

    const seatLimit = readNumericFeature(subscription.features, 'seatLimit');

    if (seatLimit !== null && currentSeatCount >= seatLimit) {
      throw new HttpException(
        `Your ${subscription.planName} plan includes up to ${seatLimit} operator seats. Upgrade your plan to invite more team members.`,
        HttpStatus.PAYMENT_REQUIRED,
      );
    }
  }
}
