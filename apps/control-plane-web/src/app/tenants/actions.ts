'use server';

import { revalidatePath } from 'next/cache';
import { provisionTenant } from '../../lib/api-control-plane';

export interface ProvisionTenantActionState {
  error?: string;
  success?: string;
  result?: {
    tenantId: string;
    businessEntityId: string;
    operatorEmail: string;
    subscriptionId: string;
    fleetId: string;
  };
}

function getTrimmedValue(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === 'string' ? value.trim() : '';
}

function getOptionalTrimmedValue(formData: FormData, key: string): string | undefined {
  const value = getTrimmedValue(formData, key);
  return value ? value : undefined;
}

export async function provisionTenantAction(
  _prevState: ProvisionTenantActionState,
  formData: FormData,
): Promise<ProvisionTenantActionState> {
  const tenantSlug = getTrimmedValue(formData, 'tenantSlug');
  const tenantName = getTrimmedValue(formData, 'tenantName');
  const tenantCountry = getTrimmedValue(formData, 'tenantCountry');
  const businessEntityName = getTrimmedValue(formData, 'businessEntityName');
  const businessModel = getTrimmedValue(formData, 'businessModel');
  const operatingUnitName = getOptionalTrimmedValue(formData, 'operatingUnitName');
  const fleetName = getOptionalTrimmedValue(formData, 'fleetName');
  const operatorName = getTrimmedValue(formData, 'operatorName');
  const operatorEmail = getTrimmedValue(formData, 'operatorEmail');
  const operatorPhone = getOptionalTrimmedValue(formData, 'operatorPhone');
  const operatorPassword = getTrimmedValue(formData, 'operatorPassword');
  const planId = getTrimmedValue(formData, 'planId');
  const initialCreditRaw = getTrimmedValue(formData, 'initialPlatformWalletCreditMinorUnits');

  if (
    !tenantSlug ||
    !tenantName ||
    !tenantCountry ||
    !businessEntityName ||
    !businessModel ||
    !operatorName ||
    !operatorEmail ||
    !operatorPassword ||
    !planId
  ) {
    return { error: 'Complete all required onboarding fields.' };
  }

  const initialPlatformWalletCreditMinorUnits = initialCreditRaw
    ? Number.parseInt(initialCreditRaw, 10)
    : 0;

  if (
    Number.isNaN(initialPlatformWalletCreditMinorUnits) ||
    initialPlatformWalletCreditMinorUnits < 0
  ) {
    return { error: 'Initial platform wallet credit must be zero or positive.' };
  }

  try {
    const result = await provisionTenant({
      tenantSlug,
      tenantName,
      tenantCountry,
      businessEntityName,
      businessModel,
      operatorName,
      operatorEmail,
      operatorPassword,
      planId,
      initialPlatformWalletCreditMinorUnits,
      ...(operatingUnitName ? { operatingUnitName } : {}),
      ...(fleetName ? { fleetName } : {}),
      ...(operatorPhone ? { operatorPhone } : {}),
    });

    revalidatePath('/tenants');

    return {
      success: 'Tenant provisioning completed successfully.',
      result: {
        tenantId: result.tenant.id,
        businessEntityId: result.businessEntity.id,
        operatorEmail: result.operatorUser.email,
        subscriptionId: result.subscription.id,
        fleetId: result.fleet.id,
      },
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unable to provision tenant at this time.',
    };
  }
}
