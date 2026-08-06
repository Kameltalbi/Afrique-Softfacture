/** Marchés SoftFacture Afrique — devises d'abonnement & facturation. */

export const MARKET_COUNTRY_CODES = ['TN', 'DZ', 'MA', 'MR', 'SN', 'CI', 'ML', 'LY', 'EG'] as const;
export type MarketCountryCode = (typeof MARKET_COUNTRY_CODES)[number];

export type BillingCurrency = 'TND' | 'USD';

export type MarketCountry = {
  code: MarketCountryCode;
  nameFr: string;
  currency: BillingCurrency;
  defaultVatRate: number;
};

export const MARKET_COUNTRIES: readonly MarketCountry[] = [
  { code: 'TN', nameFr: 'Tunisie', currency: 'TND', defaultVatRate: 19 },
  { code: 'DZ', nameFr: 'Algérie', currency: 'USD', defaultVatRate: 19 },
  { code: 'MA', nameFr: 'Maroc', currency: 'USD', defaultVatRate: 20 },
  { code: 'LY', nameFr: 'Libye', currency: 'USD', defaultVatRate: 0 },
  { code: 'EG', nameFr: 'Égypte', currency: 'USD', defaultVatRate: 14 },
  { code: 'MR', nameFr: 'Mauritanie', currency: 'USD', defaultVatRate: 16 },
  { code: 'SN', nameFr: 'Sénégal', currency: 'USD', defaultVatRate: 18 },
  { code: 'CI', nameFr: "Côte d'Ivoire", currency: 'USD', defaultVatRate: 18 },
  { code: 'ML', nameFr: 'Mali', currency: 'USD', defaultVatRate: 18 },
] as const;

export const DEFAULT_MARKET_COUNTRY: MarketCountryCode = 'TN';

export function isMarketCountryCode(value: string | null | undefined): value is MarketCountryCode {
  return MARKET_COUNTRY_CODES.includes(value as MarketCountryCode);
}

export function getMarketByCountry(code: string | null | undefined): MarketCountry {
  const found = MARKET_COUNTRIES.find((c) => c.code === code);
  return found ?? MARKET_COUNTRIES.find((c) => c.code === DEFAULT_MARKET_COUNTRY)!;
}

export function billingCurrencyForCountry(code: string | null | undefined): BillingCurrency {
  return getMarketByCountry(code).currency;
}
