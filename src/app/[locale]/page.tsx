import { LandingHero } from '@/components/marketing/landing-hero';
import { MarketingShell } from '@/components/marketing/marketing-shell';
import {
  LandingAudienceSection,
  LandingBenefitsSection,
  LandingFaqSection,
  LandingFeaturesSection,
  LandingFinalCta,
  LandingHowSection,
  LandingProblemSection,
} from '@/components/marketing/landing-sections';
import { VisitorAssistant } from '@/components/marketing/visitor-assistant';

export default function HomePage() {
  return (
    <MarketingShell activeNav="home">
      <LandingHero />
      <LandingProblemSection />
      <LandingFeaturesSection />
      <LandingHowSection />
      <LandingAudienceSection />
      <LandingBenefitsSection />
      <LandingFaqSection />
      <LandingFinalCta />
      <VisitorAssistant />
    </MarketingShell>
  );
}
