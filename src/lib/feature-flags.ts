/**
 * Feature flags produit.
 * - einvoiceUi : PA, Factur-X, réception — NEXT_PUBLIC_FEATURES_EINVOICE=true
 * - localeSwitcher : FR/EN/AR — masqué seulement si NEXT_PUBLIC_SHOW_LOCALE_SWITCHER=false
 */
export const FEATURES = {
  einvoiceUi: process.env.NEXT_PUBLIC_FEATURES_EINVOICE === 'true',
  localeSwitcher: process.env.NEXT_PUBLIC_SHOW_LOCALE_SWITCHER !== 'false',
} as const;
