import { Injectable } from '@nestjs/common';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { StaffNotificationService } from '../notifications/staff-notification.service';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { PlansService } from '../plans/plans.service';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { PlatformWalletsService } from '../platform-wallets/platform-wallets.service';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { ApiCoreProvisioningClient } from './api-core-provisioning.client';
import type { ProvisionTenantDto } from './dto/provision-tenant.dto';

export interface ProvisionTenantResult {
  tenant: {
    id: string;
    slug: string;
    name: string;
    country: string;
  };
  businessEntity: {
    id: string;
    name: string;
    country: string;
    businessModel: string;
  };
  operatingUnit: {
    id: string;
    name: string;
  };
  fleet: {
    id: string;
    name: string;
    businessModel: string;
  };
  operatorUser: {
    id: string;
    email: string;
    role: string;
    businessEntityId: string;
  };
  operationalWallet: {
    id: string;
    currency: string;
  };
  subscription: {
    id: string;
    planId: string;
    status: string;
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
  };
  platformWallet: {
    id: string;
    currency: string;
    initialCreditMinorUnits: number;
  };
}

@Injectable()
export class ProvisioningService {
  constructor(
    private readonly apiCoreProvisioningClient: ApiCoreProvisioningClient,
    private readonly plansService: PlansService,
    private readonly subscriptionsService: SubscriptionsService,
    private readonly platformWalletsService: PlatformWalletsService,
    private readonly staffNotification: StaffNotificationService,
  ) {}

  async provisionTenant(dto: ProvisionTenantDto): Promise<ProvisionTenantResult> {
    const plan = await this.plansService.getPlan(dto.planId);
    const currentPeriodStart = new Date();
    const currentPeriodEnd = this.calculatePeriodEnd(currentPeriodStart, plan.billingInterval);

    const coreResult = await this.apiCoreProvisioningClient.provisionTenant({
      tenantSlug: dto.tenantSlug,
      tenantName: dto.tenantName,
      tenantCountry: dto.tenantCountry,
      businessEntityName: dto.businessEntityName,
      businessModel: dto.businessModel,
      walletCurrency: plan.currency,
      operatorName: dto.operatorName,
      operatorEmail: dto.operatorEmail,
      operatorPassword: dto.operatorPassword,
      ...(dto.operatingUnitName ? { operatingUnitName: dto.operatingUnitName } : {}),
      ...(dto.fleetName ? { fleetName: dto.fleetName } : {}),
      ...(dto.operatorPhone ? { operatorPhone: dto.operatorPhone } : {}),
    });

    const subscription = await this.subscriptionsService.createSubscription({
      tenantId: coreResult.tenant.id,
      planId: dto.planId,
      currentPeriodStart: currentPeriodStart.toISOString(),
      currentPeriodEnd: currentPeriodEnd.toISOString(),
    });

    const platformWallet = await this.platformWalletsService.getOrCreateWallet(
      coreResult.tenant.id,
      plan.currency,
    );

    const initialCreditMinorUnits = dto.initialPlatformWalletCreditMinorUnits ?? 0;

    if (initialCreditMinorUnits > 0) {
      await this.platformWalletsService.createEntry(coreResult.tenant.id, {
        type: 'credit',
        amountMinorUnits: initialCreditMinorUnits,
        currency: plan.currency,
        referenceType: 'adjustment',
        description: 'Initial platform wallet provisioning credit',
      });
    }

    const result: ProvisionTenantResult = {
      ...coreResult,
      subscription: {
        id: subscription.id,
        planId: subscription.planId,
        status: subscription.status,
        currentPeriodStart: subscription.currentPeriodStart,
        currentPeriodEnd: subscription.currentPeriodEnd,
      },
      platformWallet: {
        id: platformWallet.id,
        currency: platformWallet.currency,
        initialCreditMinorUnits,
      },
    };

    // Fire-and-forget — never let notification failure block provisioning.
    void this.staffNotification
      .notifyNewTenantProvisioned({
        tenantName: coreResult.tenant.name,
        tenantSlug: coreResult.tenant.slug,
        tenantCountry: coreResult.tenant.country,
        operatorEmail: dto.operatorEmail,
        planName: plan.name,
        provisionedAt: new Date(),
      })
      .catch(() => undefined);

    return result;
  }

  private calculatePeriodEnd(start: Date, billingInterval: string): Date {
    const end = new Date(start);

    if (billingInterval === 'annual') {
      end.setFullYear(end.getFullYear() + 1);
      return end;
    }

    end.setMonth(end.getMonth() + 1);
    return end;
  }
}
