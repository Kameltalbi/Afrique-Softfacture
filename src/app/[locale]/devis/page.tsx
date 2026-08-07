import type { Metadata } from 'next';
import { MarketingShell } from '@/components/marketing/marketing-shell';
import { FeaturePageHero, HeroAccent } from '@/components/marketing/feature-page-hero';
import { QuoteHeroVisual } from '@/components/marketing/feature-hero-visuals';
import { DevisPageSections } from '@/components/marketing/devis-page-sections';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('featurePages.devis');
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
  };
}

export default async function DevisMarketingPage() {
  const t = await getTranslations('featurePages.devis');

  return (
    <MarketingShell activeNav="quotes">
      <FeaturePageHero
        tone="quotes"
        label={t('label')}
        title={
          <>
            {t('titleBefore')} <HeroAccent variant="pill">{t('titleAccent')}</HeroAccent>{' '}
            {t('titleAfter')}
          </>
        }
        description={t('description')}
        benefits={[t('benefit1'), t('benefit2'), t('benefit3'), t('benefit4')]}
        primaryCta={{ href: '/register', label: t('cta') }}
        reassurance={t('reassurance')}
        visual={<QuoteHeroVisual />}
      />
      <DevisPageSections />
    </MarketingShell>
  );
}
