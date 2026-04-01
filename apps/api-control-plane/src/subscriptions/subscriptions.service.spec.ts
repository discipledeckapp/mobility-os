import { SubscriptionsService } from './subscriptions.service';

describe('SubscriptionsService', () => {
  const prisma = {
    cpSubscription: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };
  const plansService = {
    listPlans: jest.fn(),
    getPlan: jest.fn(),
  };
  const staffNotification = {
    notifySubscriptionTierUpgraded: jest.fn(),
  };
  const apiCoreTenantsClient = {
    getTenant: jest.fn(),
    listTenants: jest.fn(),
  };
  const tenantLifecycleService = {
    resolveEnforcementState: jest.fn(),
  };

  let service: SubscriptionsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new SubscriptionsService(
      prisma as never,
      plansService as never,
      staffNotification as never,
      apiCoreTenantsClient as never,
      tenantLifecycleService as never,
    );
  });

  it('bootstraps a USD monthly growth trial for non-Nigerian tenants even when annual plans exist', async () => {
    prisma.cpSubscription.findUnique.mockResolvedValueOnce(null).mockResolvedValueOnce(null);
    plansService.listPlans.mockResolvedValue([
      {
        id: 'growth_usd_annual',
        currency: 'USD',
        tier: 'growth',
        billingInterval: 'annual',
        isActive: true,
      },
      {
        id: 'growth_usd_monthly',
        currency: 'USD',
        tier: 'growth',
        billingInterval: 'monthly',
        isActive: true,
      },
    ]);
    plansService.getPlan.mockImplementation(async (planId: string) => ({
      id: planId,
      isActive: true,
    }));
    prisma.cpSubscription.create.mockImplementation(async ({ data }: { data: Record<string, unknown> }) => ({
      id: 'sub_1',
      ...data,
    }));

    const subscription = await service.ensureBootstrapSubscription({
      tenantId: 'tenant_1',
      currency: 'USD',
      trialDays: 14,
    });

    expect(plansService.getPlan).toHaveBeenCalledWith('growth_usd_monthly');
    expect(subscription.planId).toBe('growth_usd_monthly');
    expect(subscription.status).toBe('trialing');
    expect(subscription.trialEndsAt).toBeTruthy();
  });
});
