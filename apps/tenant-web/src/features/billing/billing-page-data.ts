import {
  type TenantBillingPlanRecord,
  type TenantBillingSummaryRecord,
  getTenantBillingSummary,
  getTenantMe,
  listTenantBillingPlans,
} from '../../lib/api-core';
import { getFormattingLocale } from '../../lib/locale';

export interface BillingPageDataResult {
  billingSummary: TenantBillingSummaryRecord | null;
  plans: TenantBillingPlanRecord[];
  locale: string;
  billingError: string | null;
}

export async function getBillingPageData(): Promise<BillingPageDataResult> {
  let billingSummary: TenantBillingSummaryRecord | null = null;
  let plans: TenantBillingPlanRecord[] = [];
  let billingError: string | null = null;
  let locale = 'en-US';

  try {
    const [tenant, billingResult, plansResult] = await Promise.all([
      getTenantMe(),
      getTenantBillingSummary(),
      listTenantBillingPlans(),
    ]);
    locale = getFormattingLocale(tenant.country);
    billingSummary = billingResult;
    plans = plansResult;
  } catch (error) {
    billingError =
      error instanceof Error ? error.message : 'Unable to load billing details right now.';
  }

  return { billingSummary, plans, locale, billingError };
}
