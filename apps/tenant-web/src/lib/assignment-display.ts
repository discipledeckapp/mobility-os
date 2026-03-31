export function formatAssignmentStatusLabel(status: string): string {
  return status.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

export function getAssignmentDisplayName(input: {
  driverLabel?: string | null | undefined;
  vehicleLabel?: string | null | undefined;
  fleetLabel?: string | null | undefined;
  fallbackId?: string | null | undefined;
}): string {
  const driverLabel = input.driverLabel?.trim();
  const vehicleLabel = input.vehicleLabel?.trim();
  const fleetLabel = input.fleetLabel?.trim();

  if (driverLabel && vehicleLabel) {
    return `${driverLabel} assigned to ${vehicleLabel}`;
  }

  if (vehicleLabel && fleetLabel) {
    return `${vehicleLabel} for ${fleetLabel}`;
  }

  if (driverLabel) {
    return driverLabel;
  }

  if (vehicleLabel) {
    return vehicleLabel;
  }

  if (fleetLabel) {
    return `${fleetLabel} assignment`;
  }

  return input.fallbackId?.trim() || 'Assignment record';
}
