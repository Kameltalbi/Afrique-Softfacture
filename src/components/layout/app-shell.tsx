'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import {
  LayoutDashboard,
  FileText,
  Users,
  Package,
  Settings,
  Shield,
  ChevronRight,
  BarChart3,
  ClipboardList,
  Receipt,
  RefreshCw,
  Inbox,
  Warehouse,
  Wallet,
  Menu,
  X,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import { resolveLogoDisplayUrl } from '@/lib/org-logo';
import { BrandWordmark } from '@/components/brand/brand-wordmark';
import { ProfileMenu } from '@/components/layout/profile-menu';
import { TenantHeaderPlan } from '@/components/layout/tenant-header-plan';
import { MobileBottomNav } from '@/components/layout/mobile-bottom-nav';
import { useLogout } from '@/hooks/use-logout';
import { FEATURES } from '@/lib/feature-flags';
import { organizationManagesStock } from '@/lib/stock-management';

const billingLinks = [
  { href: '/invoices', key: 'invoices' as const, icon: FileText },
  ...(FEATURES.einvoiceUi
    ? [{ href: '/received-invoices' as const, key: 'receivedInvoices' as const, icon: Inbox }]
    : []),
  { href: '/quotes', key: 'quotes' as const, icon: ClipboardList },
  { href: '/invoices/deposit/new', key: 'depositInvoices' as const, icon: Receipt },
  { href: '/recurring-invoices', key: 'recurring' as const, icon: RefreshCw },
];

const mainNav = [
  { href: '/dashboard', key: 'dashboard' as const, icon: LayoutDashboard },
  { href: '/clients', key: 'clients' as const, icon: Users },
  { href: '/products', key: 'products' as const, icon: Package },
  ...(FEATURES.expenseReports
    ? [{ href: '/notes-de-frais' as const, key: 'expenseReports' as const, icon: Wallet }]
    : []),
  { href: '/stock', key: 'stock' as const, icon: Warehouse },
  { href: '/settings', key: 'settings' as const, icon: Settings },
];

function isNavActive(pathname: string, href: string): boolean {
  if (href === '/settings') {
    return pathname === '/settings' || pathname.startsWith('/settings');
  }
  if (href === '/invoices') {
    return (
      pathname === '/invoices' ||
      (pathname.startsWith('/invoices/') && !pathname.startsWith('/invoices/deposit'))
    );
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

function isBillingActive(pathname: string): boolean {
  return billingLinks.some((l) => isNavActive(pathname, l.href));
}

function isDocumentEditorPath(pathname: string): boolean {
  return (
    pathname === '/quotes/new' ||
    pathname === '/invoices/new' ||
    pathname === '/invoices/deposit/new' ||
    pathname === '/recurring-invoices/new'
  );
}

function formatHeaderDateParts(date: Date): { date: string; time: string } {
  const pad = (value: number) => String(value).padStart(2, '0');
  return {
    date: `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`,
    time: `${pad(date.getHours())}:${pad(date.getMinutes())}`,
  };
}

function useLiveClock(tickMs = 1000) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), tickMs);
    return () => window.clearInterval(id);
  }, [tickMs]);
  return now;
}

function orgInitialsFromName(name: string): string {
  return name
    .split(/[\s@]+/)
    .map((part) => part.charAt(0))
    .join('')
    .slice(0, 3)
    .toUpperCase();
}

export function AppShell({
  user,
  children,
}: {
  user: { name?: string | null; email?: string | null; role: 'USER' | 'ADMIN' | 'SUPERADMIN' };
  children: React.ReactNode;
}) {
  const { user: authUser } = useAuth();
  const logoutAndRedirect = useLogout();
  const t = useTranslations('nav');
  const pathname = usePathname();
  const now = useLiveClock();
  /** Desktop (≥ md) : sidebar étendue. Mobile : drawer overlay. */
  const [desktopExpanded, setDesktopExpanded] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [billingOpen, setBillingOpen] = useState(() => isBillingActive(pathname));
  const documentFocusMode = isDocumentEditorPath(pathname);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (documentFocusMode) {
      setMobileOpen(false);
    }
  }, [documentFocusMode]);

  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  const isSuperadmin = user.role === 'SUPERADMIN';
  const organization = authUser?.organization;
  const orgName = organization?.name ?? '';
  const orgLogoUrl = resolveLogoDisplayUrl(organization?.logoUrl ?? null);
  const orgInitials = orgInitialsFromName(orgName || user.name || user.email || 'SF');
  const { date: headerDate, time: headerTime } = formatHeaderDateParts(now);
  const showStockNav = organizationManagesStock(organization);

  const navLinkClass = (active: boolean, collapsed: boolean) =>
    cn(
      'flex items-center rounded-lg text-sm font-medium transition',
      collapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5',
      active ? 'bg-brand text-white' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
    );

  function renderNav(opts: { expanded: boolean; onNavigate?: () => void }) {
    const { expanded, onNavigate } = opts;
    return (
      <nav
        className={cn(
          'flex flex-1 flex-col gap-0.5 overflow-y-auto',
          expanded ? 'p-3' : 'px-2 py-3'
        )}
      >
        {!isSuperadmin && (
          <>
            <Link
              href="/dashboard"
              title={expanded ? undefined : t('dashboard')}
              onClick={onNavigate}
              className={navLinkClass(isNavActive(pathname, '/dashboard'), !expanded)}
            >
              <LayoutDashboard className="h-4 w-4 shrink-0" />
              {expanded ? t('dashboard') : null}
            </Link>

            <div>
              {expanded ? (
                <>
                  <button
                    type="button"
                    onClick={() => setBillingOpen((v) => !v)}
                    className={navLinkClass(isBillingActive(pathname), false)}
                  >
                    <FileText className="h-4 w-4 shrink-0" />
                    <span className="flex-1 text-start">{t('billing')}</span>
                    <ChevronRight
                      className={cn('h-4 w-4 shrink-0 transition', billingOpen ? 'rotate-90' : '')}
                    />
                  </button>
                  {billingOpen ? (
                    <div className="ms-4 mt-0.5 space-y-0.5 border-s-2 border-slate-100 ps-2">
                      {billingLinks.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={onNavigate}
                          className={cn(
                            'flex items-center gap-2 rounded-md px-2 py-2 text-sm transition',
                            isNavActive(pathname, item.href)
                              ? 'font-medium text-brand'
                              : 'text-slate-500 hover:text-slate-800'
                          )}
                        >
                          <item.icon className="h-3.5 w-3.5 shrink-0" />
                          {t(item.key)}
                        </Link>
                      ))}
                    </div>
                  ) : null}
                </>
              ) : (
                <button
                  type="button"
                  title={t('billing')}
                  onClick={() => {
                    setDesktopExpanded(true);
                    setBillingOpen(true);
                  }}
                  className={cn(navLinkClass(isBillingActive(pathname), true), 'w-full')}
                >
                  <FileText className="h-4 w-4 shrink-0" />
                </button>
              )}
            </div>

            {mainNav.slice(1, -1).map((item) => {
              if (item.href === '/stock' && !showStockNav) return null;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={expanded ? undefined : t(item.key)}
                  onClick={onNavigate}
                  className={navLinkClass(isNavActive(pathname, item.href), !expanded)}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {expanded ? t(item.key) : null}
                </Link>
              );
            })}

            <Link
              href="/dashboard"
              title={expanded ? undefined : t('dataExport')}
              onClick={onNavigate}
              className={navLinkClass(false, !expanded)}
            >
              <BarChart3 className="h-4 w-4 shrink-0" />
              {expanded ? t('dataExport') : null}
            </Link>

            <Link
              href="/settings"
              title={expanded ? undefined : t('settings')}
              onClick={onNavigate}
              className={navLinkClass(isNavActive(pathname, '/settings'), !expanded)}
            >
              <Settings className="h-4 w-4 shrink-0" />
              {expanded ? t('settings') : null}
            </Link>
          </>
        )}

        {user.role === 'SUPERADMIN' ? (
          <Link
            href="/admin"
            title={expanded ? undefined : t('admin')}
            onClick={onNavigate}
            className={navLinkClass(pathname.startsWith('/admin'), !expanded)}
          >
            <Shield className="h-4 w-4 shrink-0" />
            {expanded ? t('admin') : null}
          </Link>
        ) : null}
      </nav>
    );
  }

  function renderBrandHeader(expanded: boolean) {
    return (
      <div
        className={cn(
          'shrink-0 border-b border-slate-200',
          expanded ? 'px-4 py-4' : 'flex justify-center px-2 py-3'
        )}
      >
        {expanded ? (
          orgLogoUrl ? (
            <div className="flex min-h-[4.5rem] w-full items-center justify-start rounded-lg border border-slate-100 bg-slate-50/80 p-2">
              <img
                src={orgLogoUrl}
                alt={orgName ? `Logo ${orgName}` : 'Logo entreprise'}
                className="h-14 w-full max-w-full object-contain object-left"
              />
            </div>
          ) : (
            <div className="flex min-h-[4.5rem] items-center gap-3">
              <div
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-sm font-bold text-slate-700"
                title={orgName || undefined}
              >
                {orgInitials}
              </div>
              {orgName ? (
                <p className="line-clamp-2 text-sm font-semibold leading-snug text-slate-800">
                  {orgName}
                </p>
              ) : null}
            </div>
          )
        ) : (
          <div
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700"
            title={orgName || undefined}
          >
            {orgLogoUrl ? (
              <img
                src={orgLogoUrl}
                alt={orgName ? `Logo ${orgName}` : 'Logo entreprise'}
                className="h-8 w-8 object-contain"
              />
            ) : (
              orgInitials.slice(0, 2)
            )}
          </div>
        )}
        {expanded && orgLogoUrl && orgName ? (
          <p className="mt-2 truncate text-center text-xs font-medium text-slate-500">{orgName}</p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh bg-slate-50">
      {/* Overlay mobile */}
      {mobileOpen && !documentFocusMode ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-slate-900/40 md:hidden"
          aria-label={t('closeMenu')}
          onClick={() => setMobileOpen(false)}
        />
      ) : null}

      {/* Drawer mobile */}
      <aside
        className={cn(
          'fixed inset-y-0 start-0 z-50 flex w-[min(18rem,88vw)] flex-col border-e border-slate-200 bg-white shadow-xl transition-transform duration-300 ease-out md:hidden',
          documentFocusMode || !mobileOpen
            ? '-translate-x-full rtl:translate-x-full'
            : 'translate-x-0'
        )}
        aria-hidden={!mobileOpen || documentFocusMode}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
          <BrandWordmark className="text-base" />
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
            aria-label={t('closeMenu')}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {renderBrandHeader(true)}
        {renderNav({ expanded: true, onNavigate: () => setMobileOpen(false) })}
        <div className="shrink-0 border-t border-slate-200 px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <p className="text-[11px] text-slate-400">{t('appVersion')}</p>
          <p className="text-[10px] text-slate-400">{t('appCopyright')}</p>
        </div>
      </aside>

      {/* Sidebar desktop */}
      <aside
        className={cn(
          'fixed inset-y-0 start-0 z-40 hidden flex-col border-e border-slate-200 bg-white transition-[width] duration-300 ease-out md:flex',
          documentFocusMode
            ? 'w-0 overflow-hidden border-e-0 pointer-events-none'
            : desktopExpanded
              ? 'w-60'
              : 'w-16'
        )}
        aria-hidden={documentFocusMode}
      >
        {renderBrandHeader(desktopExpanded && !documentFocusMode)}
        {renderNav({ expanded: desktopExpanded })}
        <div
          className={cn(
            'shrink-0 border-t border-slate-200',
            desktopExpanded ? 'px-3 py-3' : 'p-2'
          )}
        >
          <button
            type="button"
            onClick={() => setDesktopExpanded((v) => !v)}
            aria-label={t('toggleSidebar')}
            aria-expanded={desktopExpanded}
            title={t('toggleSidebar')}
            className={cn(
              'flex items-center rounded-lg border border-slate-200 bg-slate-50 text-slate-700 transition hover:border-slate-300 hover:bg-slate-100 hover:text-slate-900',
              desktopExpanded ? 'w-full justify-center px-3 py-2.5' : 'mx-auto justify-center p-2.5'
            )}
          >
            <ChevronRight
              strokeWidth={2.5}
              className={cn(
                'h-5 w-5 shrink-0 transition-transform duration-300',
                desktopExpanded && 'rotate-180'
              )}
            />
          </button>
        </div>
        {desktopExpanded ? (
          <div className="shrink-0 border-t border-slate-200 px-4 py-4">
            <BrandWordmark className="text-base" />
            <p className="mt-1 text-[11px] text-slate-400">{t('appVersion')}</p>
            <p className="text-[10px] text-slate-400">{t('appCopyright')}</p>
          </div>
        ) : null}
      </aside>

      <div
        className={cn(
          'flex min-h-dvh min-w-0 flex-1 flex-col transition-[margin-inline-start] duration-300 ease-out',
          documentFocusMode ? 'ms-0' : desktopExpanded ? 'md:ms-60' : 'md:ms-16'
        )}
      >
        <header
          className={cn(
            'sticky top-0 z-20 grid h-14 grid-cols-[1fr_auto_1fr] items-center gap-2 border-b border-slate-200 bg-white/95 px-3 pt-[env(safe-area-inset-top,0px)] backdrop-blur sm:gap-3 sm:px-4 md:px-6',
            documentFocusMode && 'hidden'
          )}
        >
          <div className="flex min-w-0 items-center gap-2">
            <button
              type="button"
              className="inline-flex rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label={t('openMenu')}
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex min-w-0 items-center gap-2">
              {orgName ? (
                <p className="truncate text-sm font-semibold text-slate-900">{orgName}</p>
              ) : null}
              {!isSuperadmin ? <TenantHeaderPlan organization={organization} /> : null}
            </div>
          </div>
          <time
            dateTime={now.toISOString()}
            className="hidden items-center justify-center gap-4 tabular-nums text-sm font-semibold sm:flex"
          >
            <span className="text-brand-blue">{headerDate}</span>
            <span className="text-brand">{headerTime}</span>
          </time>
          <div className="flex shrink-0 items-center justify-self-end gap-2">
            <ProfileMenu user={user} onLogout={logoutAndRedirect} />
          </div>
        </header>

        <main
          className={cn(
            'min-w-0 flex-1',
            documentFocusMode
              ? 'bg-slate-100/80 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:p-6'
              : 'p-3 pb-[calc(3.5rem+env(safe-area-inset-bottom,0px))] sm:p-4 md:p-6 md:pb-6'
          )}
        >
          {children}
        </main>
      </div>

      {!isSuperadmin ? (
        <MobileBottomNav hidden={documentFocusMode} onOpenMenu={() => setMobileOpen(true)} />
      ) : null}
    </div>
  );
}
