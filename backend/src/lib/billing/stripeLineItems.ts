import type Stripe from 'stripe';
import type { SubscriptionPlan } from '../../generated/prisma/index.js';
import {
  PLAN_PRICE_HT_EUR,
  PLAN_PRICE_TND_YEARLY_HT,
  PLAN_STRIPE_LABELS,
  stripeLineItemAmountCents,
  stripePriceIdForPlan,
} from './plans.js';

/**
 * Ligne d'abonnement Checkout : Price ID Dashboard optionnel,
 * sinon montant de la page /tarifs via price_data.
 * Tunisie (TND) = annuel HT · autres = mensuel USD.
 */
export function buildSubscriptionLineItem(
  plan: SubscriptionPlan,
  currency: string = 'usd'
): Stripe.Checkout.SessionCreateParams.LineItem {
  if (plan === 'FREE') {
    throw new Error('Le plan Gratuit ne nécessite pas de session Stripe');
  }
  const priceId = stripePriceIdForPlan(plan);
  if (priceId) {
    return { price: priceId, quantity: 1 };
  }

  const cur = currency.toLowerCase();
  const isTnd = cur === 'tnd';
  const amount = isTnd ? PLAN_PRICE_TND_YEARLY_HT[plan] : PLAN_PRICE_HT_EUR[plan];
  const unitAmount = stripeLineItemAmountCents(plan, cur);

  return {
    quantity: 1,
    price_data: {
      currency: cur,
      unit_amount: unitAmount,
      product_data: {
        name: PLAN_STRIPE_LABELS[plan],
        description: isTnd
          ? `${amount} DT HT/an (page Tarifs Tunisie).`
          : `${amount.toFixed(2).replace('.', ',')} USD /mois (page Tarifs).`,
      },
      recurring: { interval: isTnd ? 'year' : 'month' },
    },
  };
}
