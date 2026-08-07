'use client';

import { useEffect } from 'react';
import { useRouter } from '@/i18n/navigation';
import { FEATURES } from '@/lib/feature-flags';

/** Masque le module notes de frais tant que FEATURES.expenseReports est false. */
export function ExpenseReportsFeatureGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    if (!FEATURES.expenseReports) router.replace('/dashboard');
  }, [router]);

  if (!FEATURES.expenseReports) return null;
  return children;
}
