export function getCurrencyLabel(currency?: string | null, locale?: string | null) {
  if (!currency) {
    return 'Currency';
  }

  try {
    const parts = new Intl.NumberFormat(locale ?? undefined, {
      style: 'currency',
      currency,
      currencyDisplay: 'narrowSymbol',
    }).formatToParts(1);
    const symbol = parts.find((part) => part.type === 'currency')?.value;
    return symbol ? `${symbol}` : currency;
  } catch {
    return currency;
  }
}
