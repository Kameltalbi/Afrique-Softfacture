export const PLAN_IDS = ['free', 'pro', 'business'] as const;
export type PlanId = (typeof PLAN_IDS)[number];

export const HIGHLIGHTED_PLAN_ID: PlanId = 'pro';

/**
 * Montants mensuels d'abonnement (même chiffre en TND Tunisie / USD autres pays).
 * Synchroniser avec backend/src/lib/billing/plans.ts
 */
export const PLAN_PRICES: Record<PlanId, number> = {
  free: 0,
  pro: 9.9,
  business: 24.9,
};

/** @deprecated Alias — montants identiques en TND/USD */
export const PLAN_PRICES_HT_EUR = PLAN_PRICES;

/**
 * Équivalent mensuel en facturation annuelle (~2 mois offerts).
 * Affiché lorsque le toggle « Annuel » est actif.
 */
export const PLAN_PRICES_YEARLY_EQ: Record<PlanId, number> = {
  free: 0,
  pro: 7.9,
  business: 19.9,
};

/** @deprecated */
export const PLAN_PRICES_YEARLY_EQ_HT_EUR = PLAN_PRICES_YEARLY_EQ;

/** @deprecated Utiliser PLAN_PRICES */
export const PLAN_PRICES_EUR = PLAN_PRICES;

/** Pas de TVA SaaS forcée — prix affiché = montant facturé (TND ou USD). */
export const SUBSCRIPTION_VAT_RATE = 0;

export const TRIAL_DAYS = 30;

export const PLAN_TO_SUBSCRIPTION_API: Record<PlanId, 'FREE' | 'PRO' | 'BUSINESS'> = {
  free: 'FREE',
  pro: 'PRO',
  business: 'BUSINESS',
};

export const SUBSCRIPTION_API_TO_PLAN: Record<'FREE' | 'PRO' | 'BUSINESS', PlanId> = {
  FREE: 'free',
  PRO: 'pro',
  BUSINESS: 'business',
};

export function isPlanId(value: string | null | undefined): value is PlanId {
  return value === 'free' || value === 'pro' || value === 'business';
}

export function isPaidPlanId(plan: PlanId): boolean {
  return plan === 'pro' || plan === 'business';
}

export function priceHtToTtc(ht: number, vatRate = SUBSCRIPTION_VAT_RATE): number {
  return Math.round(ht * (1 + vatRate / 100) * 100) / 100;
}

export function formatPlanAmount(amount: number): string {
  return amount.toFixed(2).replace('.', ',');
}

/** @deprecated Utiliser formatPlanAmount */
export function formatEur(amount: number): string {
  return formatPlanAmount(amount);
}

/** Affichage marketing : même montant en TND et USD. */
export function formatPlanPriceDual(amount: number): string {
  const n = formatPlanAmount(amount);
  return `${n} TND / ${n} USD`;
}

/** Keys for plan card bullet highlights (i18n: pricing.plans.{id}.highlights.{key}) */
export const PLAN_HIGHLIGHT_KEYS: Record<PlanId, string[]> = {
  free: ['users', 'quotes', 'invoices', 'clients', 'pdf', 'support'],
  pro: ['users', 'quotes', 'invoices', 'clients', 'pdf', 'reminders', 'payments', 'support'],
  business: ['users', 'stock', 'banking', 'recurring', 'accountant', 'companies', 'support'],
};

export type ComparisonRowType = 'text' | 'boolean';

export const COMPARISON_ROWS: { key: string; type: ComparisonRowType }[] = [
  { key: 'users', type: 'text' },
  { key: 'quotes', type: 'text' },
  { key: 'invoices', type: 'text' },
  { key: 'creditNotesDeposits', type: 'boolean' },
  { key: 'recurring', type: 'boolean' },
  { key: 'reminders', type: 'text' },
  { key: 'payments', type: 'text' },
  { key: 'accountingExport', type: 'text' },
  { key: 'accountantAccess', type: 'boolean' },
  { key: 'stock', type: 'text' },
  { key: 'pdfTemplates', type: 'text' },
  { key: 'dashboard', type: 'text' },
  { key: 'clients', type: 'text' },
  { key: 'multiCompany', type: 'text' },
  { key: 'support', type: 'text' },
];

export const COMPARISON_BOOLEAN: Record<string, Record<PlanId, boolean>> = {
  creditNotesDeposits: { free: true, pro: true, business: true },
  recurring: { free: false, pro: false, business: true },
  accountantAccess: { free: false, pro: false, business: true },
};
