import { describe, expect, it } from 'vitest';
import { buildCreateAssignmentPayload } from './action-helpers';

function makeFormData(entries: Record<string, string>) {
  const formData = new FormData();
  for (const [key, value] of Object.entries(entries)) {
    formData.set(key, value);
  }
  return formData;
}

describe('buildCreateAssignmentPayload', () => {
  it('rejects remittance assignments without a positive amount', () => {
    const result = buildCreateAssignmentPayload(
      makeFormData({
        fleetId: 'fleet_1',
        driverId: 'driver_1',
        vehicleId: 'vehicle_1',
        paymentModel: 'remittance',
        remittanceAmountMinorUnits: '0',
      }),
    );

    expect(result).toEqual({
      error: 'Expected remittance amount must be greater than 0.',
    });
  });

  it('builds a hire-purchase payload with normalized finance fields', () => {
    const result = buildCreateAssignmentPayload(
      makeFormData({
        fleetId: 'fleet_1',
        driverId: 'driver_1',
        vehicleId: 'vehicle_1',
        paymentModel: 'hire_purchase',
        remittanceAmountMinorUnits: '125000',
        remittanceFrequency: 'monthly',
        remittanceCurrency: 'ngn',
        remittanceModel: 'hire_purchase',
        remittanceStartDate: '2026-04-05',
        remittanceCollectionDay: '12',
        contractType: 'hire_purchase',
        principalAmountMinorUnits: '800000',
        totalTargetAmountMinorUnits: '920000',
        depositAmountMinorUnits: '120000',
        contractDurationPeriods: '10',
        finalInstallmentAmountMinorUnits: '50000',
        contractEndDate: '2027-02-05',
        notes: '  keep insured  ',
      }),
    );

    expect(result).toEqual({
      payload: {
        fleetId: 'fleet_1',
        driverId: 'driver_1',
        vehicleId: 'vehicle_1',
        paymentModel: 'hire_purchase',
        remittanceAmountMinorUnits: 125000,
        contractType: 'hire_purchase',
        remittanceFrequency: 'monthly',
        remittanceModel: 'hire_purchase',
        remittanceCurrency: 'NGN',
        remittanceStartDate: '2026-04-05',
        remittanceCollectionDay: 12,
        principalAmountMinorUnits: 800000,
        totalTargetAmountMinorUnits: 920000,
        depositAmountMinorUnits: 120000,
        contractDurationPeriods: 10,
        finalInstallmentAmountMinorUnits: 50000,
        contractEndDate: '2027-02-05',
        notes: 'keep insured',
      },
    });
  });

  it('builds a salary payload without remittance-only fields', () => {
    const result = buildCreateAssignmentPayload(
      makeFormData({
        fleetId: 'fleet_1',
        driverId: 'driver_1',
        vehicleId: 'vehicle_1',
        paymentModel: 'salary',
        remittanceAmountMinorUnits: '0',
      }),
    );

    expect(result).toEqual({
      payload: {
        fleetId: 'fleet_1',
        driverId: 'driver_1',
        vehicleId: 'vehicle_1',
        paymentModel: 'salary',
      },
    });
  });
});
