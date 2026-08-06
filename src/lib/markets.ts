/** Marchés SoftFacture Afrique — devises d'abonnement & facturation. */

export const MARKET_COUNTRY_CODES = ['TN', 'DZ', 'MA', 'MR', 'SN', 'CI', 'ML', 'LY', 'EG'] as const;
export type MarketCountryCode = (typeof MARKET_COUNTRY_CODES)[number];

export type BillingCurrency = 'TND' | 'USD';

export type MarketCountry = {
  code: MarketCountryCode;
  nameFr: string;
  /** Devise d'abonnement SaaS et devise par défaut des factures. */
  currency: BillingCurrency;
  /** Taux de TVA par défaut sur les factures clients (%). */
  defaultVatRate: number;
  phonePlaceholder: string;
};

export const MARKET_COUNTRIES: readonly MarketCountry[] = [
  {
    code: 'TN',
    nameFr: 'Tunisie',
    currency: 'TND',
    defaultVatRate: 19,
    phonePlaceholder: '+216 20 000 000',
  },
  {
    code: 'DZ',
    nameFr: 'Algérie',
    currency: 'USD',
    defaultVatRate: 19,
    phonePlaceholder: '+213 555 00 00 00',
  },
  {
    code: 'MA',
    nameFr: 'Maroc',
    currency: 'USD',
    defaultVatRate: 20,
    phonePlaceholder: '+212 600 000 000',
  },
  {
    code: 'LY',
    nameFr: 'Libye',
    currency: 'USD',
    defaultVatRate: 0,
    phonePlaceholder: '+218 91 000 0000',
  },
  {
    code: 'EG',
    nameFr: 'Égypte',
    currency: 'USD',
    defaultVatRate: 14,
    phonePlaceholder: '+20 100 000 0000',
  },
  {
    code: 'MR',
    nameFr: 'Mauritanie',
    currency: 'USD',
    defaultVatRate: 16,
    phonePlaceholder: '+222 36 00 00 00',
  },
  {
    code: 'SN',
    nameFr: 'Sénégal',
    currency: 'USD',
    defaultVatRate: 18,
    phonePlaceholder: '+221 77 000 00 00',
  },
  {
    code: 'CI',
    nameFr: "Côte d'Ivoire",
    currency: 'USD',
    defaultVatRate: 18,
    phonePlaceholder: '+225 07 00 00 00 00',
  },
  {
    code: 'ML',
    nameFr: 'Mali',
    currency: 'USD',
    defaultVatRate: 18,
    phonePlaceholder: '+223 70 00 00 00',
  },
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
