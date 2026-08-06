import { ArrowRight } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { getTranslations } from 'next-intl/server';
import { BrandLogo } from '@/components/brand/brand-logo';
import { LocaleSwitcher } from '@/components/locale-switcher';
import { MobileLandingMenu } from '@/components/marketing/mobile-landing-menu';
import { AnnouncementBar } from '@/components/marketing/announcement-bar';

export type SiteHeaderActive = 'home' | 'pricing' | 'features' | 'how' | 'faq' | null;

/**
 * Header marketing unifié (inspiré SoftFacture Tunisie) :
 * bandeau info + nav + Connexion verte / Inscription bleue.
 */
export async function SiteHeader({ activeNav = null }: { activeNav?: SiteHeaderActive }) {
  const t = await getTranslations('marketing');
  const navT = await getTranslations('nav');

  const links = [
    { href: '/#features', label: t('navFeatures'), id: 'features' as const },
    { href: '/#how', label: t('navHow'), id: 'how' as const },
    { href: '/tarifs', label: t('navPricing'), id: 'pricing' as const },
    { href: '/#faq', label: t('navFaq'), id: 'faq' as const },
  ];

  return (
    <>
      <AnnouncementBar message={t('announceMessage')} ctaLabel={t('announceCta')} ctaHref="/#faq" />
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-[4.25rem] max-w-7xl items-center justify-between gap-4 px-4 md:px-8">
          <BrandLogo href="/" priority={activeNav === 'home' || activeNav === null} />

          <nav className="hidden items-center gap-7 text-[15px] font-medium text-slate-600 lg:flex">
            {links.map((l) => {
              const active = activeNav === l.id;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={
                    active ? 'font-semibold text-slate-900' : 'transition hover:text-slate-900'
                  }
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2 sm:gap-2.5">
            <LocaleSwitcher className="hidden sm:inline-flex" />
            <MobileLandingMenu
              links={links.map(({ href, label }) => ({ href, label }))}
              loginLabel={navT('login')}
              registerLabel={navT('register')}
            />
            <Link href="/login" className="hidden sm:inline">
              <Button className="h-10 rounded-lg bg-brand px-4 text-sm font-semibold text-white shadow-sm shadow-brand/25 hover:bg-brand-hover">
                {navT('login')}
              </Button>
            </Link>
            <Link href="/register" className="hidden sm:inline">
              <Button className="h-10 gap-1.5 rounded-lg bg-brand-blue px-4 text-sm font-semibold text-white shadow-sm shadow-brand-blue/25 hover:bg-brand-blue-hover">
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
