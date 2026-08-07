'use client';

import { useLocale } from 'next-intl';
import { Globe } from 'lucide-react';
import { routing } from '@/i18n/routing';
import { usePathname, useRouter } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import { FEATURES } from '@/lib/feature-flags';

const LOCALE_META: Record<(typeof routing.locales)[number], { label: string; color: string }> = {
  fr: { label: 'Français', color: 'text-[#2663eb] hover:text-[#1d4ed8]' },
  en: { label: 'English', color: 'text-[#ef4444] hover:text-[#dc2626]' },
  ar: { label: 'العربية', color: 'text-[#22c55e] hover:text-[#16a34a]' },
};

function nextLocale(current: string): (typeof routing.locales)[number] {
  const list = routing.locales;
  const idx = list.indexOf(current as (typeof routing.locales)[number]);
  return list[(idx + 1) % list.length];
}

export function LocaleSwitcher({
  className,
  variant = 'default',
  showCode = false,
}: {
  className?: string;
  variant?: 'default' | 'hero';
  /** Affiche le code langue (FR / EN / AR) à côté du globe. */
  showCode?: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const active = useLocale() as (typeof routing.locales)[number];

  if (!FEATURES.localeSwitcher) {
    return null;
  }

  const meta = LOCALE_META[active] ?? LOCALE_META.fr;
  const upcoming = nextLocale(active);

  function cycleLocale() {
    router.replace(pathname, { locale: upcoming });
  }

  return (
    <button
      type="button"
      onClick={cycleLocale}
      title={`${meta.label} → ${LOCALE_META[upcoming].label}`}
      aria-label={`Changer de langue (actuel : ${meta.label})`}
      className={cn(
        'inline-flex items-center justify-center transition',
        variant === 'hero' ? 'text-white hover:text-white/80' : meta.color,
        className
      )}
    >
      <Globe className="h-5 w-5" strokeWidth={2} aria-hidden />
      {showCode ? (
        <span className="text-xs font-bold uppercase tracking-wide">{active}</span>
      ) : (
        <span className="sr-only">{meta.label}</span>
      )}
    </button>
  );
}
