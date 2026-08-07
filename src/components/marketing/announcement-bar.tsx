'use client';

import { useEffect, useState } from 'react';
import { Info, X } from 'lucide-react';

type Props = {
  message: string;
  /** Bandeau edge-to-edge (home). */
  fullWidth?: boolean;
};

const STORAGE_KEY = 'sf-announce-dismissed-v2';

export function AnnouncementBar({ message, fullWidth = false }: Props) {
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
    <div className="relative w-full border-b border-[#cfe0f2] bg-[#E4F0FB]">
      <div
        className={
          fullWidth
            ? 'flex w-full items-center gap-2.5 px-4 py-2.5 pe-10 sm:px-6 md:px-10'
            : 'mx-auto flex max-w-7xl items-center gap-2.5 px-4 py-2.5 pe-10 md:px-8'
        }
      >
        <Info className="h-4 w-4 shrink-0 text-[#5c7cc2]" strokeWidth={2} aria-hidden />
        <p className="min-w-0 flex-1 text-[13px] leading-snug text-[#1a1d23]">{message}</p>
        <button
          type="button"
          onClick={dismiss}
          className="absolute end-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-[#5c7cc2]/80 hover:bg-white/70 hover:text-[#1e3a5f]"
          aria-label="Fermer"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
