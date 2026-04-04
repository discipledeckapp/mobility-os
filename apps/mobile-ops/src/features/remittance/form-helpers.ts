export function describeVariance(
  varianceMinorUnits: number | null,
): { direction: 'over' | 'under' | 'exact'; absoluteMinorUnits: number } | null {
  if (varianceMinorUnits === null) {
    return null;
  }

  if (varianceMinorUnits === 0) {
    return { direction: 'exact', absoluteMinorUnits: 0 };
  }

  return {
    direction: varianceMinorUnits > 0 ? 'over' : 'under',
    absoluteMinorUnits: Math.abs(varianceMinorUnits),
  };
}
