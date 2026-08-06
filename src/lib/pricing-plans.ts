export const PLAN_IDS = ['free', 'pro', 'business'] as const;
export type PlanId = (typeof PLAN_IDS)[number];

export const HIGHLIGHTED_PLAN_ID: PlanId = 'pro';

/**
 * Prix USD mensuels (hors Tunisie).
 * Synchroniser avec backend/src/lib/billing/plans.ts
 */
export const PLAN_PRICES_USD_MONTHLY: Record<PlanId, number> = {
  free: 0,
  pro: 9.9,
  business: 24.9,
};

/** Équivalent mensuel USD en annuel (~2 mois offerts). */
export const PLAN_PRICES_USD_YEARLY_EQ: Record<PlanId, number> = {
  free: 0,
  pro: 7.9,
  business: 19.9,
};

/**
 * Prix Tunisie HT annuels (affichage DT) — SoftFacture Tunisie.
 * Gratuit 0 · Essentiel 320 · Business 480
 */
export const PLAN_PRICES_TND_YEARLY_HT: Record<PlanId, number> = {
  free: 0,
  pro: 320,
  business: 480,
};

/** @deprecated Alias USD mensuel */
export const PLAN_PRICES = PLAN_PRICES_USD_MONTHLY;
/** @deprecated */
export const PLAN_PRICES_HT_EUR = PLAN_PRICES_USD_MONTHLY;
/** @deprecated */
export const PLAN_PRICES_YEARLY_EQ = PLAN_PRICES_USD_YEARLY_EQ;
/** @deprecated */
export const PLAN_PRICES_YEARLY_EQ_HT_EUR = PLAN_PRICES_USD_YEARLY_EQ;
/** @deprecated */
export const PLAN_PRICES_EUR = PLAN_PRICES_USD_MONTHLY;

/** Pas de TVA SaaS forcée — prix affiché = montant facturé (sauf mention HT Tunisie). */
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
  if (Number.isInteger(amount)) return String(amount);
  return amount.toFixed(2).replace('.', ',');
}

/** @deprecated Utiliser formatPlanAmount */
export function formatEur(amount: number): string {
  return formatPlanAmount(amount);
}

/** Affichage prix avec une seule devise (TND→DT ou USD). */
export function formatPlanPrice(amount: number, currency: 'TND' | 'USD'): string {
  const unit = currency === 'TND' ? 'DT' : 'USD';
  return `${formatPlanAmount(amount)} ${unit}`;
}

/** Prix à afficher selon marché / cycle. */
export function getDisplayedPlanPrice(
  planId: PlanId,
  currency: 'TND' | 'USD',
  yearly: boolean
): { amount: number; suffix: string; hint?: string } {
  if (currency === 'TND') {
    const amount = PLAN_PRICES_TND_YEARLY_HT[planId];
    if (planId === 'free') {
      return { amount: 0, suffix: 'DT', hint: 'noCard' };
    }
    const perDay = amount / 365;
    return {
      amount,
      suffix: 'DT HT / an',
      hint: planId === 'pro' ? `perDay:${perDay.toFixed(3).replace('.', ',')}` : 'yearlyOnly',
    };
  }

  const amount = yearly ? PLAN_PRICES_USD_YEARLY_EQ[planId] : PLAN_PRICES_USD_MONTHLY[planId];
  return {
    amount,
    suffix: yearly ? 'USD' : 'USD',
    hint: yearly ? 'yearlyEq' : 'monthly',
  };
}

/** @deprecated Préférer formatPlanPrice(amount, currency) */
export function formatPlanPriceDual(amount: number): string {
  return formatPlanPrice(amount, 'USD');
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
