import { getCountryConfig } from '@mobility-os/domain-config';
import { Injectable } from '@nestjs/common';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { PrismaService } from '../database/prisma.service';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { PlatformWalletsService } from '../platform-wallets/platform-wallets.service';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { TenantLifecycleService } from '../tenant-lifecycle/tenant-lifecycle.service';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { ApiCoreTenantsClient } from './api-core-tenants.client';
import type { TenantDetailDto } from './dto/tenant-detail.dto';
import type { TenantListItemDto } from './dto/tenant-list-item.dto';

@Injectable()
export class TenantsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly apiCoreTenantsClient: ApiCoreTenantsClient,
    private readonly subscriptionsService: SubscriptionsService,
    private readonly platformWalletsService: PlatformWalletsService,
    private readonly tenantLifecycleService: TenantLifecycleService,
  ) {}

  private resolveBootstrapCurrency(countryCode?: string | null): string | undefined {
    if (!countryCode) {
      return undefined;
    }

    try {
      return getCountryConfig(countryCode).currency;
    } catch {
      return undefined;
    }
  }

  private async ensureTenantGovernanceScaffold(params: {
    tenantId: string;
    countryCode?: string | null;
    tenantStatus?: string | null;
  }): Promise<void> {
    const bootstrapCurrency = this.resolveBootstrapCurrency(params.countryCode);

    await this.subscriptionsService
      .ensureBootstrapSubscription({
        tenantId: params.tenantId,
        ...(bootstrapCurrency ? { currency: bootstrapCurrency } : {}),
      })
      .catch(() => undefined);

    await this.platformWalletsService
      .getWalletByTenant(params.tenantId)
      .catch(async () => {
        const subscription = await this.subscriptionsService
          .getTenantSubscriptionSummary(params.tenantId)
          .catch(() => null);

        if (subscription) {
          await this.platformWalletsService.getOrCreateWallet(
            params.tenantId,
            subscription.currency,
          );
        }
      })
      .catch(() => undefined);

    const existingLifecycleEvents = await this.prisma.cpTenantLifecycleEvent.count({
      where: { tenantId: params.tenantId },
    });

    if (existingLifecycleEvents === 0 && params.tenantStatus) {
      await this.prisma.cpTenantLifecycleEvent.create({
        data: {
          tenantId: params.tenantId,
          toStatus: params.tenantStatus,
          triggeredBy: 'system',
          reason: 'bootstrap_reconciliation',
          metadata: {
            source: 'control_plane_reconciliation',
          },
        },
      });
    }
  }

  async listTenants(): Promise<TenantListItemDto[]> {
    const tenants = await this.apiCoreTenantsClient.listTenants();

    await Promise.all(
      tenants.map((tenant) =>
        this.ensureTenantGovernanceScaffold({
          tenantId: tenant.id,
          countryCode: tenant.country,
          tenantStatus: tenant.status,
        }).catch(() => undefined),
      ),
    );

    const subscriptions = await this.prisma.cpSubscription.findMany({
      include: {
        plan: true,
      },
    });

    const subscriptionsByTenantId = new Map(
      subscriptions.map((subscription) => [subscription.tenantId, subscription]),
    );

    return tenants.map((tenant) => {
      const subscription = subscriptionsByTenantId.get(tenant.id);
      return {
        id: tenant.id,
        slug: tenant.slug,
        name: tenant.name,
        country: tenant.country,
        status: tenant.status,
        planName: subscription?.plan.name ?? null,
        planTier: subscription?.plan.tier ?? null,
        subscriptionStatus: subscription?.status ?? null,
        createdAt: new Date(tenant.createdAt),
      };
    });
  }

  async getTenantDetail(tenantId: string): Promise<TenantDetailDto> {
    const tenant = await this.apiCoreTenantsClient.getTenant(tenantId);

    await this.ensureTenantGovernanceScaffold({
      tenantId,
      countryCode: tenant.country,
      tenantStatus: tenant.status,
    });

    const [subscription, invoices, lifecycleState, lifecycleEvents, overrides, ownerSummary] =
      await Promise.all([
        this.prisma.cpSubscription.findUnique({
          where: { tenantId },
          include: { plan: true },
        }),
        this.prisma.cpInvoice.findMany({
          where: { tenantId },
          include: { lineItems: true },
          orderBy: { createdAt: 'desc' },
          take: 20,
        }),
        this.prisma.cpSubscription.findUnique({
          where: { tenantId },
          select: {
            tenantId: true,
            id: true,
            status: true,
            currentPeriodStart: true,
            currentPeriodEnd: true,
            cancelAtPeriodEnd: true,
          },
        }),
        this.prisma.cpTenantLifecycleEvent.findMany({
          where: { tenantId },
          orderBy: { occurredAt: 'desc' },
          take: 20,
        }),
        this.prisma.cpFeatureFlagOverride.findMany({
          where: { tenantId },
          include: { flag: true },
          orderBy: { createdAt: 'desc' },
        }),
        this.apiCoreTenantsClient.getTenantOwnerSummary(tenantId).catch(() => null),
      ]);

    return {
      id: tenant.id,
      slug: tenant.slug,
      name: tenant.name,
      country: tenant.country,
      status: tenant.status,
      createdAt: new Date(tenant.createdAt),
      subscription: subscription
        ? {
            id: subscription.id,
            planId: subscription.planId,
            planName: subscription.plan.name,
            planTier: subscription.plan.tier,
            status: subscription.status,
            currency: subscription.plan.currency,
            currentPeriodStart: subscription.currentPeriodStart,
            currentPeriodEnd: subscription.currentPeriodEnd,
          }
        : null,
      invoices,
      featureFlagOverrides: overrides.map((override) => ({
        id: override.id,
        flagKey: override.flag.key,
        countryCode: override.countryCode,
        planTier: override.planTier,
        isEnabled: override.isEnabled,
      })),
      lifecycleState: lifecycleState
        ? {
            tenantId: lifecycleState.tenantId,
            subscriptionId: lifecycleState.id,
            status: lifecycleState.status,
            currentPeriodStart: lifecycleState.currentPeriodStart,
            currentPeriodEnd: lifecycleState.currentPeriodEnd,
            cancelAtPeriodEnd: lifecycleState.cancelAtPeriodEnd,
            enforcement: this.tenantLifecycleService.resolveEnforcementState(lifecycleState),
          }
        : null,
      lifecycleEvents,
      ownerSummary,
    };
  }
}
