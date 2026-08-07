import type { Metadata } from 'next';
import { MarketingShell } from '@/components/marketing/marketing-shell';
import { FeaturePageHero, HeroAccent } from '@/components/marketing/feature-page-hero';
import { EinvoiceHeroVisual } from '@/components/marketing/feature-hero-visuals';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('featurePages.factureElectronique');
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
  };
}

export default async function FactureElectroniqueMarketingPage() {
  const t = await getTranslations('featurePages.factureElectronique');

  return (
    <MarketingShell activeNav="einvoice">
      <FeaturePageHero
        tone="einvoice"
        label={t('label')}
        title={
          <>
            {t('titleBefore')} <HeroAccent>{t('titleAccent')}</HeroAccent>
          </>
        }
        description={t('description')}
        benefits={[t('benefit1'), t('benefit2'), t('benefit3'), t('benefit4')]}
        primaryCta={{ href: '/register', label: t('cta') }}
        secondaryCta={{ href: '/#faq', label: t('ctaSecondary') }}
        reassurance={t('reassurance')}
        visual={<EinvoiceHeroVisual />}
      />
    </MarketingShell>
  );
}
