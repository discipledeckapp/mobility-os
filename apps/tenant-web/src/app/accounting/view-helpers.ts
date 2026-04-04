export function getEntryTone(
  type: 'credit' | 'debit' | 'reversal',
): 'success' | 'warning' | 'neutral' {
  if (type === 'credit') return 'success';
  if (type === 'debit') return 'warning';
  return 'neutral';
}

export function getNetProfitAccent(
  netProfitMinorUnits: number,
): 'success' | 'danger' {
  return netProfitMinorUnits >= 0 ? 'success' : 'danger';
}
