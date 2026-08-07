'use client';

import { LayoutDashboard, FileText, ClipboardList, Users, Menu } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { cn } from '@/lib/utils';

type Props = {
  onOpenMenu: () => void;
  hidden?: boolean;
};

function isActive(pathname: string, href: string): boolean {
  if (href === '/invoices') {
    return (
      pathname === '/invoices' ||
      (pathname.startsWith('/invoices/') && !pathname.startsWith('/invoices/deposit'))
    );
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Navigation bas d’écran — mobile / PWA. */
export function MobileBottomNav({ onOpenMenu, hidden }: Props) {
  const t = useTranslations('nav');
  const pathname = usePathname();

  if (hidden) return null;

  const items = [
    { href: '/dashboard', label: t('dashboard'), icon: LayoutDashboard },
    { href: '/invoices', label: t('invoices'), icon: FileText },
    { href: '/quotes', label: t('quotes'), icon: ClipboardList },
    { href: '/clients', label: t('clients'), icon: Users },
  ] as const;

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom,0px)] backdrop-blur md:hidden"
      aria-label={t('mobileNav')}
    >
      <div className="grid h-14 grid-cols-5">
        {items.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium',
                active ? 'text-brand' : 'text-slate-500'
              )}
            >
              <item.icon className="h-5 w-5" strokeWidth={active ? 2.25 : 2} />
              <span className="truncate px-0.5">{item.label}</span>
            </Link>
          );
        })}
        <button
          type="button"
          onClick={onOpenMenu}
          className="flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium text-slate-500"
        >
          <Menu className="h-5 w-5" />
          <span>{t('mobileMore')}</span>
        </button>
      </div>
    </nav>
  );
}
