'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';

export type ProductNavItem = {
  href: string;
  label: string;
  description?: string;
  active?: boolean;
};

export function ProductNavDropdown({
  label,
  items,
  active = false,
}: {
  label: string;
  items: readonly ProductNavItem[];
  active?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const openedByHover = useRef(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const menuId = useId();

  function clearCloseTimer() {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }

  function openFromHover() {
    clearCloseTimer();
    openedByHover.current = true;
    setOpen(true);
  }

  function scheduleCloseFromHover() {
    clearCloseTimer();
    closeTimer.current = setTimeout(() => {
      openedByHover.current = false;
      setOpen(false);
    }, 120);
  }

  useEffect(() => {
    return () => clearCloseTimer();
  }, []);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent | TouchEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        openedByHover.current = false;
        setOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        openedByHover.current = false;
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('touchstart', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('touchstart', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div
      ref={rootRef}
      className="relative"
      onMouseEnter={openFromHover}
      onMouseLeave={scheduleCloseFromHover}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={menuId}
        className={cn(
          'inline-flex items-center gap-1 text-brand-blue transition hover:text-brand-blue-hover',
          active || open ? 'font-semibold' : 'font-medium'
        )}
        onClick={() => {
          // Évite de refermer immédiatement un menu déjà ouvert au survol.
          if (openedByHover.current && open) return;
          setOpen((v) => !v);
        }}
      >
        {label}
        <ChevronDown
          className={cn('h-4 w-4 transition-transform', open && 'rotate-180')}
          aria-hidden
        />
      </button>

      {open ? (
        <div id={menuId} role="menu" className="absolute start-0 top-full z-50 pt-3">
          <div className="w-[17.5rem] rounded-xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-900/10">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                role="menuitem"
                className={cn(
                  'block rounded-lg px-3 py-2.5 transition hover:bg-slate-50',
                  item.active && 'bg-brand-blue-soft'
                )}
                onClick={() => {
                  openedByHover.current = false;
                  setOpen(false);
                }}
              >
                <span
                  className={cn(
                    'block text-sm font-semibold',
                    item.active ? 'text-brand-blue' : 'text-slate-900'
                  )}
                >
                  {item.label}
                </span>
                {item.description ? (
                  <span className="mt-0.5 block text-xs font-normal leading-snug text-slate-500">
                    {item.description}
                  </span>
                ) : null}
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
