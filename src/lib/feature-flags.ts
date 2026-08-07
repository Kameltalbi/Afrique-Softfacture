/**
 * Feature flags produit.
 * - einvoiceUi : PA, Factur-X, réception — NEXT_PUBLIC_FEATURES_EINVOICE=true
 * - expenseReports : notes de frais — désactivé par défaut (reviendra plus tard)
 * - localeSwitcher : FR/EN/AR — masqué seulement si NEXT_PUBLIC_SHOW_LOCALE_SWITCHER=false
 */
export const FEATURES = {
  einvoiceUi: process.env.NEXT_PUBLIC_FEATURES_EINVOICE === 'true',
  /** Module notes de frais — garder false jusqu’à réactivation produit. */
  expenseReports: process.env.NEXT_PUBLIC_FEATURES_EXPENSE_REPORTS === 'true',
  localeSwitcher: process.env.NEXT_PUBLIC_SHOW_LOCALE_SWITCHER !== 'false',
} as const;
