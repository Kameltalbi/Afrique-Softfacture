import type { SubscriptionPlan } from '../../generated/prisma/index.js';
import { APP_BRAND } from '../appBrand.js';
import { isStripeEnabled } from './stripeClient.js';

export type BillingPlanSlug = 'free' | 'pro' | 'business';

export const BILLING_PLAN_SLUGS: BillingPlanSlug[] = ['free', 'pro', 'business'];

export const PAID_BILLING_PLAN_SLUGS: BillingPlanSlug[] = ['pro', 'business'];

const SLUG_TO_PLAN: Record<BillingPlanSlug, SubscriptionPlan> = {
  free: 'FREE',
  pro: 'PRO',
  business: 'BUSINESS',
};

const PLAN_TO_SLUG: Record<SubscriptionPlan, BillingPlanSlug> = {
  FREE: 'free',
  PRO: 'pro',
  BUSINESS: 'business',
};

/**
 * Prix mensuels — identiques à `src/lib/pricing-plans.ts` PLAN_PRICES.
 * Même montant en TND (Tunisie) et USD (autres pays).
 */
export const PLAN_PRICE: Record<SubscriptionPlan, number> = {
  FREE: 0,
  PRO: 9.9,
  BUSINESS: 24.9,
};

/** @deprecated */
export const PLAN_PRICE_HT_EUR = PLAN_PRICE;

/** Équivalent mensuel en annuel (affichage marketing). */
export const PLAN_PRICE_YEARLY_EQ: Record<SubscriptionPlan, number> = {
  FREE: 0,
  PRO: 7.9,
  BUSINESS: 19.9,
};

/** @deprecated */
export const PLAN_PRICE_YEARLY_EQ_HT_EUR = PLAN_PRICE_YEARLY_EQ;

/** @deprecated Utiliser PLAN_PRICE */
export const PLAN_PRICE_TTC_EUR = PLAN_PRICE;

/** Libellés produit Stripe (marque SoftFacture Afrique, éditeur Nexiora). */
export const PLAN_STRIPE_LABELS: Record<SubscriptionPlan, string> = {
  FREE: `${APP_BRAND} Gratuit (Nexiora)`,
  PRO: `${APP_BRAND} Pro (Nexiora)`,
  BUSINESS: `${APP_BRAND} Business (Nexiora)`,
};

/** Pas de TVA SaaS forcée — montant affiché = montant facturé. */
export const SUBSCRIPTION_VAT_RATE_PERCENT = 0;
export const TRIAL_DAYS = 30;

export function slugToSubscriptionPlan(slug: string): SubscriptionPlan | null {
  if (slug === 'free' || slug === 'pro' || slug === 'business') {
    return SLUG_TO_PLAN[slug];
  }
  // Compat anciennes URLs / sessions
  if (slug === 'starter') return 'FREE';
  return null;
}

export function subscriptionPlanToSlug(plan: SubscriptionPlan): BillingPlanSlug {
  return PLAN_TO_SLUG[plan];
}

export function isPaidPlan(plan: SubscriptionPlan): boolean {
  return plan === 'PRO' || plan === 'BUSINESS';
}

export function priceHtToTtcEur(ht: number): number {
  return Math.round(ht * (1 + SUBSCRIPTION_VAT_RATE_PERCENT / 100) * 100) / 100;
}

export function priceHtToCents(ht: number): number {
  return Math.round(ht * 100);
}

export function priceTtcToCents(ttc: number): number {
  return Math.round(ttc * 100);
}

export function stripePriceIdForPlan(plan: SubscriptionPlan): string | undefined {
  if (plan === 'FREE') return undefined;
  const key = plan === 'PRO' ? 'STRIPE_PRICE_PRO' : 'STRIPE_PRICE_BUSINESS';
  const id = process.env[key]?.trim();
  return id || undefined;
}

export function planFromStripePriceId(priceId: string): SubscriptionPlan | null {
  if (priceId === process.env.STRIPE_PRICE_PRO?.trim()) return 'PRO';
  if (priceId === process.env.STRIPE_PRICE_BUSINESS?.trim()) return 'BUSINESS';
  // Ancien price Starter → freemium
  if (priceId === process.env.STRIPE_PRICE_STARTER?.trim()) return 'FREE';
  return null;
}

/** Stripe actif dès que la clé secrète est présente (montants = page /tarifs). */
export function isStripeCheckoutReady(): boolean {
  return isStripeEnabled();
}

/** Montant unitaire Stripe en centimes (toujours HT — TVA via Stripe Tax si activé). */
export function stripeLineItemAmountCents(plan: SubscriptionPlan): number {
  return priceHtToCents(PLAN_PRICE_HT_EUR[plan]);
}

export function isStripeAutomaticTaxEnabled(): boolean {
  return process.env.STRIPE_AUTOMATIC_TAX !== 'false';
}

export function getFrontendBaseUrl(): string {
  const base = (
    process.env.FRONTEND_URL ??
    process.env.CORS_ORIGIN?.split(',')[0] ??
    'http://localhost:3000'
  ).trim();
  return base.replace(/\/$/, '');
}
