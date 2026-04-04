import { describe, expect, it } from 'vitest';
import { formatAssignmentStatusLabel, getAssignmentDisplayName } from './assignment-display';

describe('assignment display helpers', () => {
  it('formats assignment statuses for operator-friendly display', () => {
    expect(formatAssignmentStatusLabel('awaiting_driver_acceptance')).toBe(
      'Awaiting Driver Acceptance',
    );
  });

  it('prefers the driver and vehicle labels when both are present', () => {
    expect(
      getAssignmentDisplayName({
        driverLabel: 'Kelechi Nwafor',
        vehicleLabel: 'Toyota Corolla',
        fleetLabel: 'Airport fleet',
      }),
    ).toBe('Kelechi Nwafor assigned to Toyota Corolla');
  });

  it('falls back to a generic assignment label when no display fields exist', () => {
    expect(getAssignmentDisplayName({})).toBe('Assignment record');
  });
});
