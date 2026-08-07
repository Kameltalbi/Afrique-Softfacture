import type { Metadata } from 'next';
import { MarketingShell } from '@/components/marketing/marketing-shell';
import { FeaturePageHero, HeroAccent } from '@/components/marketing/feature-page-hero';
import { ExpenseHeroVisual } from '@/components/marketing/feature-hero-visuals';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('featurePages.notesDeFrais');
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
  };
}

export default async function NotesDeFraisMarketingPage() {
  const t = await getTranslations('featurePages.notesDeFrais');

  return (
    <MarketingShell activeNav="expenses">
      <FeaturePageHero
        tone="expenses"
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
        visual={<ExpenseHeroVisual />}
      />
    </MarketingShell>
  );
}
