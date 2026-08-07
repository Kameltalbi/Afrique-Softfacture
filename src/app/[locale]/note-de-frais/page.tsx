import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { MarketingShell } from '@/components/marketing/marketing-shell';
import { FeaturePageHero, HeroAccent } from '@/components/marketing/feature-page-hero';
import { ExpenseHeroVisual } from '@/components/marketing/feature-hero-visuals';
import { getTranslations } from 'next-intl/server';
import { FEATURES } from '@/lib/feature-flags';

export async function generateMetadata(): Promise<Metadata> {
  if (!FEATURES.expenseReports) {
    return { title: 'SoftFacture Afrique' };
  }
  const t = await getTranslations('featurePages.notesDeFrais');
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
  };
}

export default async function NotesDeFraisMarketingPage() {
  if (!FEATURES.expenseReports) {
    redirect('/');
  }

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
