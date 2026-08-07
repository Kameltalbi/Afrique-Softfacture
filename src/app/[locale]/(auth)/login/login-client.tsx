'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  Eye,
  EyeOff,
  Phone,
  Mail,
  Lock,
  MousePointer2,
  ShieldCheck,
  Headphones,
} from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { useAuth } from '@/contexts/auth-context';
import { BrandWordmark } from '@/components/brand/brand-wordmark';
import { LocaleSwitcher } from '@/components/locale-switcher';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

function readReturnUrl(): string | null {
  const returnUrl = new URLSearchParams(window.location.search).get('returnUrl');
  if (returnUrl && returnUrl.startsWith('/') && !returnUrl.startsWith('//')) return returnUrl;
  return null;
}

function loginRedirectPath(role: string, returnUrl: string | null): string {
  if (role === 'SUPERADMIN') return '/admin';
  if (returnUrl) return returnUrl;
  return '/dashboard';
}

export default function LoginClient() {
  const t = useTranslations('auth');
  const tm = useTranslations('marketing');
  const tc = useTranslations('common');
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('sf-remember-email');
      if (saved) setEmail(saved);
    } catch {
      /* ignore */
    }
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !password) {
      setErr(t('fillAllFields'));
      return;
    }

    setLoading(true);
    setErr(null);
    try {
      try {
        if (remember) localStorage.setItem('sf-remember-email', trimmedEmail);
        else localStorage.removeItem('sf-remember-email');
      } catch {
        /* ignore */
      }
      const user = await login(trimmedEmail, password);
      const target = loginRedirectPath(user.role, readReturnUrl());
      window.location.assign(target);
    } catch (ex: unknown) {
      const msg = ex instanceof Error ? ex.message : '';
      const isUnreachableApi = ex instanceof TypeError || msg === 'Failed to fetch';
      setErr(
        isUnreachableApi ? t('loginNetworkError') : ex instanceof Error ? ex.message : tc('error')
      );
      setLoading(false);
    }
  }

  const features = [
    { icon: MousePointer2, label: t('loginFeatureSimple') },
    { icon: ShieldCheck, label: t('loginFeatureSecure') },
    { icon: Headphones, label: t('loginFeatureSupport') },
  ] as const;

  return (
    <div className="flex min-h-dvh flex-col bg-[#f4f7fb] lg:flex-row">
      <aside className="relative flex w-full flex-1 flex-col px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))] sm:px-8 lg:flex-[1.05] lg:px-10">
        <div className="flex items-center justify-between gap-3">
          <Link href="/" aria-label={t('backHome')}>
            <BrandWordmark />
          </Link>
          <LocaleSwitcher
            className="gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm font-semibold text-brand-blue shadow-sm"
            showCode
          />
        </div>

        <div className="mx-auto flex w-full max-w-[420px] flex-1 flex-col justify-center py-8 sm:py-10">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_12px_40px_-16px_rgba(15,23,42,0.18)] sm:p-8">
            <h1 className="text-xl font-bold tracking-tight text-[#0f2744] sm:text-2xl">
              {t('loginWelcomeTitle')}
            </h1>
            <p className="mt-1.5 text-sm text-slate-500">{t('loginWelcomeSubtitle')}</p>

            <form onSubmit={(e) => void onSubmit(e)} className="mt-6 space-y-4">
              <div>
                <label
                  htmlFor="login-email"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  {t('emailAddress')}
                </label>
                <div className="relative">
                  <Mail
                    className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                    aria-hidden
                  />
                  <Input
                    id="login-email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    placeholder={t('emailPlaceholder')}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 rounded-xl border-slate-200 bg-white ps-10 text-base text-s-navy placeholder:text-slate-400 focus:border-brand-blue focus:ring-brand-blue/15 sm:h-11 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="login-password"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  {t('password')}
                </label>
                <div className="relative">
                  <Lock
                    className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                    aria-hidden
                  />
                  <Input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder={t('passwordPlaceholder')}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 rounded-xl border-slate-200 bg-white ps-10 pe-11 text-base text-s-navy placeholder:text-slate-400 focus:border-brand-blue focus:ring-brand-blue/15 sm:h-11 sm:text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute end-1.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-50 hover:text-s-navy"
                    aria-label={showPassword ? t('hidePassword') : t('showPassword')}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-slate-600">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-brand-blue accent-brand-blue"
                  />
                  {t('rememberMe')}
                </label>
                <Link
                  href="/forgot-password"
                  className="text-sm font-medium text-brand-blue hover:underline"
                >
                  {t('forgotPassword')}
                </Link>
              </div>

              {err ? (
                <p
                  role="alert"
                  className="rounded-xl bg-red-50 px-3 py-2 text-center text-sm text-red-700"
                >
                  {err}
                </p>
              ) : null}

              <Button
                type="submit"
                className="h-12 w-full rounded-xl bg-brand-blue text-base font-semibold text-white shadow-sm shadow-brand-blue/25 hover:bg-brand-blue-hover sm:h-11 sm:text-sm"
                disabled={loading}
              >
                {loading ? t('submittingLogin') : t('submitLogin')}
              </Button>
            </form>

            <div className="my-5 flex items-center gap-3">
              <div className="h-px flex-1 bg-slate-200" />
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                {t('orSeparator')}
              </span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>

            <Link
              href="/register"
              className="flex h-12 w-full items-center justify-center rounded-xl border-2 border-brand-blue/30 bg-white text-base font-semibold text-brand-blue transition hover:border-brand-blue hover:bg-brand-blue-soft sm:h-11 sm:text-sm"
            >
              {t('createAccountFree')}
            </Link>
          </div>

          <a
            href={tm('headerPhoneHref')}
            className="mt-6 inline-flex items-center justify-center gap-2 text-sm text-slate-500 hover:text-brand-blue"
          >
            <Phone className="h-3.5 w-3.5" aria-hidden />
            <span>
              {t('loginHelpTitle')}{' '}
              <span className="font-medium tabular-nums text-slate-700">{tm('headerPhone')}</span>
            </span>
          </a>
        </div>
      </aside>

      <section className="relative hidden overflow-hidden bg-[#E8F1FB] lg:flex lg:flex-1 lg:flex-col">
        <div
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            backgroundImage:
              'radial-gradient(circle at 15% 20%, rgba(38,99,235,0.08), transparent 40%), radial-gradient(circle at 85% 75%, rgba(34,197,94,0.08), transparent 35%)',
          }}
          aria-hidden
        />
        <div className="relative z-10 flex h-full flex-col justify-center px-10 py-12 xl:px-14">
          <h2 className="max-w-md text-3xl font-bold tracking-tight text-[#0f2744] xl:text-4xl">
            {t('loginPromoShort')}
          </h2>
          <p className="mt-3 max-w-md text-base text-slate-600">{t('loginPromoBody')}</p>

          <div className="relative mt-10 max-w-lg">
            <div className="rounded-2xl border border-white/80 bg-white p-5 shadow-xl shadow-slate-900/10">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                {t('loginMockDashboard')}
              </p>
              <div className="mt-4 grid grid-cols-3 gap-3">
                {[
                  { label: t('loginMockRevenue'), value: '14 850 DT' },
                  { label: t('loginMockInvoices'), value: '28' },
                  { label: t('loginMockQuotes'), value: '12' },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-xl bg-[#F3F7FC] px-3 py-3">
                    <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                      {stat.label}
                    </p>
                    <p className="mt-1 text-sm font-bold tabular-nums text-[#0f2744]">
                      {stat.value}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full w-[68%] rounded-full bg-gradient-to-r from-brand-blue to-brand" />
              </div>
            </div>

            <div className="absolute -bottom-6 -end-2 w-40 rounded-xl border border-white bg-white p-3 shadow-lg sm:w-44">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                {t('loginMockPayments')}
              </p>
              <div className="mt-2 flex items-center gap-3">
                <div
                  className="h-12 w-12 rounded-full"
                  style={{
                    background: 'conic-gradient(#22c55e 0 55%, #f59e0b 55% 78%, #ef4444 78% 100%)',
                  }}
                  aria-hidden
                />
                <div className="space-y-1 text-[10px] text-slate-500">
                  <p>
                    <span className="me-1 inline-block h-1.5 w-1.5 rounded-full bg-brand" />
                    {t('loginMockPaid')}
                  </p>
                  <p>
                    <span className="me-1 inline-block h-1.5 w-1.5 rounded-full bg-amber-500" />
                    {t('loginMockPartial')}
                  </p>
                  <p>
                    <span className="me-1 inline-block h-1.5 w-1.5 rounded-full bg-red-500" />
                    {t('loginMockUnpaid')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <ul className="mt-16 grid max-w-lg grid-cols-3 gap-4">
            {features.map((f) => (
              <li key={f.label} className="text-center">
                <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-white text-brand-blue shadow-sm">
                  <f.icon className="h-5 w-5" strokeWidth={2} />
                </span>
                <p className="mt-2 text-xs font-medium leading-snug text-slate-600">{f.label}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
