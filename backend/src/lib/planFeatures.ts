import type { SubscriptionPlan } from '../generated/prisma/index.js';
import { prisma } from './db.js';

/** Inventaire physique (comptage) — offre Business. */
export function planHasStockInventory(plan: SubscriptionPlan): boolean {
  return plan === 'BUSINESS';
}

/** Logo personnalisé sur les PDF — tous les plans (y compris Gratuit). */
export function planAllowsCustomLogo(_plan: SubscriptionPlan): boolean {
  return true;
}

/** Filigrane « Généré par Softfacture » sur les PDF — plan Gratuit. */
export function planShowsPdfWatermark(plan: SubscriptionPlan): boolean {
  return plan === 'FREE';
}

/** Factures récurrentes — offre Business. */
export function planHasRecurringInvoices(plan: SubscriptionPlan): boolean {
  return plan === 'BUSINESS';
}

export async function getOrganizationPlan(organizationId: string): Promise<SubscriptionPlan> {
  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { subscriptionPlan: true },
  });
  return org?.subscriptionPlan ?? 'FREE';
}
