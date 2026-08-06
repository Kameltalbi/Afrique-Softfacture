'use client';

import { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { PricingCta } from '@/components/marketing/pricing-cta';
import { cn } from '@/lib/utils';
import {
  formatPlanAmount,
  getDisplayedPlanPrice,
  HIGHLIGHTED_PLAN_ID,
  PLAN_HIGHLIGHT_KEYS,
  PLAN_IDS,
  isPaidPlanId,
} from '@/lib/pricing-plans';
import type { PlanId } from '@/lib/pricing-plans';
import {
  DEFAULT_MARKET_COUNTRY,
  MARKET_COUNTRIES,
  billingCurrencyForCountry,
  isMarketCountryCode,
  type BillingCurrency,
  type MarketCountryCode,
} from '@/lib/markets';

type BillingCycle = 'monthly' | 'yearly';

const STORAGE_KEY = 'sf-pricing-country';

export function PricingToggleCards({
  labels,
}: {
  /** Conservé pour compat SSR — les montants TN/USD sont résolus côté client. */
  planPrices?: Record<PlanId, number>;
  labels: {
    monthly: string;
    yearly: string;
    yearlyBadge: string;
    yearlyNote: string;
    perMonth: string;
    perYear: string;
    billedYearly: string;
    trialBadge: string;
    freeForeverBadge: string;
    popularBadge: string;
    cta: string;
    ctaFree: string;
    plans: Record<PlanId, { name: string; audience: string; highlights: Record<string, string> }>;
  };
}) {
  const tMarkets = useTranslations('markets');
  const t = useTranslations('pricing');
  const [cycle, setCycle] = useState<BillingCycle>('monthly');
  const [country, setCountry] = useState<MarketCountryCode>(DEFAULT_MARKET_COUNTRY);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (isMarketCountryCode(saved)) setCountry(saved);
    } catch {
      /* ignore */
    }
  }, []);

  const currency: BillingCurrency = billingCurrencyForCountry(country);
  const isTunisia = country === 'TN';
  const yearly = isTunisia ? true : cycle === 'yearly';

  function onCountryChange(code: MarketCountryCode) {
    setCountry(code);
    try {
      localStorage.setItem(STORAGE_KEY, code);
    } catch {
      /* ignore */
    }
  }

  return (
    <>
      <div className="mt-6 flex flex-col items-center gap-3">
        <label className="flex flex-col items-center gap-1.5 text-sm text-slate-600">
          <span className="font-medium text-slate-800">{t('countrySelectLabel')}</span>
          <select
            value={country}
            onChange={(e) => onCountryChange(e.target.value as MarketCountryCode)}
            className="min-w-[220px] rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm outline-none focus:ring-2 focus:ring-brand-blue/25"
          >
            {MARKET_COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>
                {tMarkets(c.code)} — {c.code === 'TN' ? 'DT' : c.currency}
              </option>
            ))}
          </select>
        </label>

        {!isTunisia && (
          <>
            <div className="inline-flex rounded-full border border-slate-200 bg-white p-1 shadow-sm">
              <button
                type="button"
                className={cn(
                  'rounded-full px-4 py-2 text-sm font-semibold transition',
                  !yearly
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                )}
                onClick={() => setCycle('monthly')}
              >
                {labels.monthly}
              </button>
              <button
                type="button"
                className={cn(
                  'rounded-full px-4 py-2 text-sm font-semibold transition',
                  yearly
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                )}
                onClick={() => setCycle('yearly')}
              >
                {labels.yearly}
              </button>
            </div>
            <p className="text-sm font-medium text-emerald-700">{labels.yearlyBadge}</p>
          </>
        )}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {PLAN_IDS.map((planId) => {
          const highlighted = planId === HIGHLIGHTED_PLAN_ID;
          const isFree = !isPaidPlanId(planId);
          const shown = getDisplayedPlanPrice(planId, currency, yearly);

          return (
            <div
              key={planId}
              className={cn(
                'relative flex flex-col rounded-2xl border-2 bg-white p-7',
                highlighted ? 'border-emerald-600 shadow-lg' : 'border-slate-200'
              )}
            >
              {highlighted && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-emerald-600 px-3 py-1 text-[10px] font-bold uppercase text-white">
                  {labels.popularBadge}
                </span>
              )}
              <h3 className="text-xl font-bold">{labels.plans[planId].name}</h3>
              <p className="mt-1 text-sm text-slate-600">{labels.plans[planId].audience}</p>
              <p className="mt-4 text-3xl font-bold">
                {isFree ? (
                  <>
                    0{' '}
                    <span className="text-lg font-semibold text-slate-600">
                      {isTunisia ? 'DT' : 'USD'}
                    </span>
                  </>
                ) : isTunisia ? (
                  <>
                    {formatPlanAmount(shown.amount)}{' '}
                    <span className="text-lg font-semibold text-slate-600">DT HT</span>
                    <span className="text-base font-normal text-slate-500"> / an</span>
                  </>
                ) : (
                  <>
                    {formatPlanAmount(shown.amount)}{' '}
                    <span className="text-lg font-semibold text-slate-600">USD</span>
                    <span className="text-base font-normal text-slate-500">{labels.perMonth}</span>
                  </>
                )}
              </p>
              {isFree ? (
                <>
                  <p className="mt-2 text-xs font-medium text-emerald-700">
                    {isTunisia ? t('tunisia.noCard') : labels.freeForeverBadge}
                  </p>
                  {isTunisia && (
                    <p className="mt-1 text-xs font-medium text-emerald-700">
                      {t('tunisia.freeForever')}
                    </p>
                  )}
                </>
              ) : isTunisia ? (
                <p className="mt-2 text-xs font-medium text-emerald-700">
                  {planId === 'pro'
                    ? t('tunisia.perDay', { amount: '0,900' })
                    : t('tunisia.yearlyPayment')}
                </p>
              ) : yearly ? (
                <p className="mt-2 text-xs font-medium text-emerald-700">{labels.billedYearly}</p>
              ) : (
                <p className="mt-2 text-xs font-medium text-emerald-700">{labels.trialBadge}</p>
              )}
              <ul className="mt-6 flex-1 space-y-2.5 text-sm text-slate-700">
                {PLAN_HIGHLIGHT_KEYS[planId].map((key) => (
                  <li key={key} className="flex gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
                    <span>{labels.plans[planId].highlights[key]}</span>
                  </li>
                ))}
              </ul>
              <PricingCta
                label={
                  isFree
                    ? isTunisia
                      ? t('tunisia.ctaFree')
                      : labels.ctaFree
                    : isTunisia
                      ? planId === 'pro'
                        ? t('tunisia.ctaPro')
                        : t('tunisia.ctaBusiness')
                      : labels.cta
                }
                highlighted={highlighted}
                planId={planId}
              />
            </div>
          );
        })}
      </div>
      {!isTunisia && <p className="mt-4 text-center text-sm text-slate-600">{labels.yearlyNote}</p>}
    </>
  );
}
