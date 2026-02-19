export function formatCurrency(amount: number, currency: string = 'ILS', locale: string = 'he-IL'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}
