import type { ReactNode } from 'react';
import { SiteHeader, type SiteHeaderActive } from '@/components/marketing/site-header';
import { SiteFooter } from '@/components/marketing/site-footer';

/**
 * Coque pages publiques : même header + footer partout.
 */
export async function MarketingShell({
  children,
  activeNav = null,
}: {
  children: ReactNode;
  activeNav?: SiteHeaderActive;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-900">
      <SiteHeader activeNav={activeNav} />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
