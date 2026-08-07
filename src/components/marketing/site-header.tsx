import { ArrowRight, CircleHelp, Phone, UserRound } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { getTranslations } from 'next-intl/server';
import { BrandLogo } from '@/components/brand/brand-logo';
import { LocaleSwitcher } from '@/components/locale-switcher';
import { MobileLandingMenu } from '@/components/marketing/mobile-landing-menu';
import { ProductNavDropdown } from '@/components/marketing/product-nav-dropdown';
import { AnnouncementBar } from '@/components/marketing/announcement-bar';
import { cn } from '@/lib/utils';
import { FEATURES } from '@/lib/feature-flags';

export type SiteHeaderActive =
  | 'home'
  | 'pricing'
  | 'features'
  | 'how'
  | 'faq'
  | 'quotes'
  | 'invoices'
  | 'einvoice'
  | 'expenses'
  | null;

/**
 * Header marketing unifié :
 * bandeau info + barre utilitaire (tél. / aide / connexion) + nav principale + inscription.
 */
export async function SiteHeader({ activeNav = null }: { activeNav?: SiteHeaderActive }) {
  const t = await getTranslations('marketing');
  const navT = await getTranslations('nav');
  const isHome = activeNav === 'home' || activeNav === null;
  const productActive =
    activeNav === 'quotes' ||
    activeNav === 'invoices' ||
    activeNav === 'einvoice' ||
    (FEATURES.expenseReports && activeNav === 'expenses');

  const productItems = [
    {
      href: '/devis',
      label: t('navQuotes'),
      description: t('navQuotesDesc'),
      active: activeNav === 'quotes',
    },
    {
      href: '/factures',
      label: t('navInvoices'),
      description: t('navInvoicesDesc'),
      active: activeNav === 'invoices',
    },
    {
      href: '/facture-electronique',
      label: t('navEinvoice'),
      description: t('navEinvoiceDesc'),
      active: activeNav === 'einvoice',
    },
    ...(FEATURES.expenseReports
      ? [
          {
            href: '/note-de-frais',
            label: t('navExpenses'),
            description: t('navExpensesDesc'),
            active: activeNav === 'expenses',
          },
        ]
      : []),
  ];

  const topLinks = [
    { href: '/tarifs', label: t('navPricing'), id: 'pricing' as const },
    { href: '/#faq', label: t('navFaq'), id: 'faq' as const },
  ];

  const mobileLinks = [
    { href: '/devis', label: t('navQuotes'), group: t('navProduct') },
    { href: '/factures', label: t('navInvoices'), group: t('navProduct') },
    {
      href: '/facture-electronique',
      label: t('navEinvoice'),
      group: t('navProduct'),
    },
    ...(FEATURES.expenseReports
      ? [{ href: '/note-de-frais', label: t('navExpenses'), group: t('navProduct') }]
      : []),
    { href: '/tarifs', label: t('navPricing') },
    { href: '/#faq', label: t('navFaq') },
  ];

  const phoneHref = t('headerPhoneHref');
  const phoneLabel = t('headerPhone');

  return (
    <>
      <AnnouncementBar message={t('announceMessage')} fullWidth={isHome} />
      <header className="sticky top-0 z-50 border-b border-[#cfe0f2] bg-[#E4F0FB]">
        {/* Ligne 1 — utilitaire (tél. / aide / connexion) */}
        <div className="border-b border-[#b9d0e8] bg-[#d6e6f7]">
          <div className="mx-auto flex h-9 max-w-7xl items-center justify-end gap-4 px-4 text-[13px] font-medium text-[#1e3a5f] md:gap-5 md:px-8">
            <a
              href={phoneHref}
              className="inline-flex items-center gap-1.5 transition hover:text-brand-blue"
            >
              <Phone className="h-3.5 w-3.5 shrink-0" strokeWidth={2} aria-hidden />
              <span className="tabular-nums">{phoneLabel}</span>
            </a>
            <Link
              href="/#faq"
              className="hidden items-center gap-1.5 transition hover:text-brand-blue sm:inline-flex"
            >
              <CircleHelp className="h-3.5 w-3.5 shrink-0" strokeWidth={2} aria-hidden />
              {t('headerHelp')}
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 transition hover:text-brand-blue"
            >
              <UserRound className="h-3.5 w-3.5 shrink-0" strokeWidth={2} aria-hidden />
              {t('headerLogin')}
            </Link>
          </div>
        </div>

        {/* Ligne 2 — logo + navigation + inscription + langue */}
        <div className="mx-auto flex h-[4.25rem] max-w-7xl items-center justify-between gap-4 px-4 md:px-8">
          <BrandLogo href="/" priority={isHome} />

          <nav className="hidden items-center gap-8 text-[15px] font-medium text-brand-blue lg:flex">
            <ProductNavDropdown
              label={t('navProduct')}
              items={productItems}
              active={productActive}
            />
            {topLinks.map((l) => {
              const active = activeNav === l.id;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={cn(
                    'text-brand-blue transition hover:text-brand-blue-hover',
                    active ? 'font-semibold' : undefined
                  )}
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2 sm:gap-2.5">
            <LocaleSwitcher className="hidden sm:inline-flex" />
            <MobileLandingMenu
              links={mobileLinks}
              loginLabel={navT('login')}
              registerLabel={navT('register')}
            />
            <Link href="/register" className="hidden sm:inline">
              <Button className="h-10 gap-1.5 rounded-lg bg-brand px-4 text-sm font-semibold text-white shadow-sm shadow-brand/25 hover:bg-brand-hover">
                {navT('register')}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>
    </>
  );
}
