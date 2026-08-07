/** Affichage montant selon devise organisation (TND → DT). */
export function formatMoneyAmount(value: number, currency = 'TND', locale = 'fr-FR'): string {
  const code = currency.toUpperCase();
  if (code === 'TND') {
    return `${value.toLocaleString(locale, {
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    })} DT`;
  }
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${value.toLocaleString(locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })} ${code}`;
  }
}
