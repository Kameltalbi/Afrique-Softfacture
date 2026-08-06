'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Link } from '@/i18n/navigation';

type Props = {
  message: string;
  ctaLabel: string;
  ctaHref: string;
};

const STORAGE_KEY = 'sf-announce-dismissed-v1';

export function AnnouncementBar({ message, ctaLabel, ctaHref }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(STORAGE_KEY) !== '1') setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  function dismiss() {
    try {
      sessionStorage.setItem(STORAGE_KEY, '1');
    } catch {
      /* ignore */
    }
    setVisible(false);
  }

  return (
    <div className="relative bg-[#e8f1fb] text-[#1e3a5f]">
      <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 px-10 py-2.5 text-center text-sm md:px-8">
        <p className="text-[13px] leading-snug">
          {message}{' '}
          <Link
            href={ctaHref}
            className="font-semibold underline underline-offset-2 hover:text-brand-blue"
          >
            {ctaLabel}
          </Link>
        </p>
        <button
          type="button"
          onClick={dismiss}
          className="absolute end-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-[#1e3a5f]/70 hover:bg-white/60 hover:text-[#1e3a5f]"
          aria-label="Fermer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
