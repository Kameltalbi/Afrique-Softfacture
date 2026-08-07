'use client';

import { Suspense, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Eye, EyeOff } from 'lucide-react';
import { Link, useRouter } from '@/i18n/navigation';
import { isPlanId } from '@/lib/pricing-plans';
import {
  DEFAULT_MARKET_COUNTRY,
  MARKET_COUNTRIES,
  type MarketCountryCode,
  getMarketByCountry,
} from '@/lib/markets';
import { useAuth } from '@/contexts/auth-context';
import { BrandWordmark } from '@/components/brand/brand-wordmark';
import { LocaleSwitcher } from '@/components/locale-switcher';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { cn } from '@/lib/utils';

function fieldClassName(extra?: string) {
  return cn(
    'h-12 rounded-lg border-slate-200 bg-white px-3 text-base text-s-navy placeholder:text-slate-400 focus:border-brand-blue focus:ring-brand-blue/15 sm:h-11 sm:text-sm',
    extra
  );
}

function RegisterContent() {
  const t = useTranslations('auth');
  const tMarkets = useTranslations('markets');
  const tc = useTranslations('common');
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();
  const { register } = useAuth();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [country, setCountry] = useState<MarketCountryCode>(DEFAULT_MARKET_COUNTRY);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [pending, setPending] = useState(false);

  const market = useMemo(() => getMarketByCountry(country), [country]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (phone.trim().length < 8) {
      toast.push(t('phoneInvalid'), 'error');
      return;
    }
    if (password.length < 8) {
      toast.push(t('registerPasswordHint'), 'error');
      return;
    }
    if (!acceptedTerms) {
      toast.push(t('registerTermsRequired'), 'error');
      return;
    }

    setPending(true);

    try {
      await register({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        organizationName: companyName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
        country,
      });

      toast.push(t('welcome'));

      const plan = searchParams.get('plan');

      if (isPlanId(plan)) {
        router.replace(`/checkout?plan=${plan}`);
      } else {
        router.replace('/dashboard');
      }
    } catch (er: unknown) {
      const msg = er instanceof Error ? er.message : tc('error');
      toast.push(msg, 'error');
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex min-h-dvh flex-col lg:flex-row">
      <section className="flex flex-1 flex-col bg-white px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))] sm:px-8 lg:px-12">
        <div className="mb-6 flex items-center justify-between gap-3 sm:mb-8">
          <Link href="/" aria-label={t('backHome')}>
            <BrandWordmark />
          </Link>
          <div className="flex items-center gap-3 sm:gap-4">
            <LocaleSwitcher />
            <Link href="/login" className="text-sm text-brand-blue hover:underline">
              {t('hasAccount')}
            </Link>
          </div>
        </div>

        <div className="mx-auto w-full max-w-xl flex-1">
          <h1 className="text-lg font-semibold tracking-tight text-s-navy sm:text-xl">
            {t('registerTitle')}
          </h1>
          <p className="mt-1 text-sm text-slate-500">{t('registerFormTitle')}</p>

          <form onSubmit={(e) => void onSubmit(e)} className="mt-6 space-y-4 sm:mt-8">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  {t('lastName')} *
                </label>
                <Input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  className={fieldClassName()}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  {t('firstName')} *
                </label>
                <Input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  className={fieldClassName()}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  {t('phone')} *
                </label>
                <Input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={market.phonePlaceholder}
                  required
                  minLength={8}
                  className={fieldClassName()}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  {t('companyName')} *
                </label>
                <Input
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required
                  className={fieldClassName()}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  {t('email')} *
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={fieldClassName()}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  {t('password')} *
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    className={fieldClassName('pr-10')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-s-navy"
                    aria-label={showPassword ? t('hidePassword') : t('showPassword')}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  {t('country')} *
                </label>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value as MarketCountryCode)}
                  required
                  className={fieldClassName('w-full outline-none focus:ring-2')}
                >
                  {MARKET_COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {tMarkets(c.code)} ({c.currency})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <label className="flex cursor-pointer items-start gap-3 pt-1 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-brand accent-brand"
              />
              <span>
                {t.rich('registerTerms', {
                  cgv: (chunks) => (
                    <Link href="/cgv" className="text-brand-blue hover:underline">
                      {chunks}
                    </Link>
                  ),
                  privacy: (chunks) => (
                    <Link
                      href="/politique-de-confidentialite"
                      className="text-brand-blue hover:underline"
                    >
                      {chunks}
                    </Link>
                  ),
                })}
              </span>
            </label>

            <Button
              type="submit"
              disabled={pending}
              className="mt-2 h-12 w-full rounded-lg bg-brand text-base font-semibold text-white hover:bg-brand-hover sm:h-11 sm:w-auto sm:min-w-[200px] sm:text-sm"
            >
              {pending ? '…' : t('submitRegister')}
            </Button>
          </form>
        </div>
      </section>

      <aside className="relative hidden w-[38%] shrink-0 bg-[#EAF3FC] lg:block">
        <div className="flex h-full flex-col items-center justify-center px-12">
          <p className="max-w-xs text-center text-xl font-semibold leading-snug text-[#1e3a5f]">
            {t('loginPromoShort')}
          </p>
          <div className="mt-8 w-full max-w-xs rounded-2xl border border-white/80 bg-white/70 p-5 shadow-sm">
            <div className="space-y-2.5">
              <div className="h-2 w-1/2 rounded-full bg-slate-100" />
              <div className="h-2 w-full rounded-full bg-slate-100" />
              <div className="h-2 w-4/5 rounded-full bg-slate-100" />
              <div className="mt-3 h-14 rounded-xl bg-[#E4F0FB]" />
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-sm text-slate-500">
          …
        </div>
      }
    >
      <RegisterContent />
    </Suspense>
  );
}
