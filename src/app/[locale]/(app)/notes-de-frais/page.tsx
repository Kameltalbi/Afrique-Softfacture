'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { format } from 'date-fns';
import { Plus, Search, Trash2 } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { apiFetch } from '@/lib/api-client';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { useToast } from '@/components/ui/toast';
import { formatMoneyAmount } from '@/lib/format-money-currency';
import { cn } from '@/lib/utils';
import { ListPagination, StatTabButton, paginateRows } from '@/components/list/list-ui';
import { ExpenseReportsEmpty } from '@/components/expense-reports/expense-reports-empty';
import { ExpenseReportsFeatureGate } from '@/components/expense-reports/expense-reports-feature-gate';

type ExpenseStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'REIMBURSED';

type ExpenseRow = {
  id: string;
  title: string;
  number: string | null;
  status: ExpenseStatus;
  currency: string;
  expenseDate: string;
  totalTtc: unknown;
  createdBy?: { name: string | null; email: string } | null;
  _count?: { lines: number };
};

type StatusTab = 'all' | ExpenseStatus;

const STATUS_TABS: StatusTab[] = [
  'all',
  'DRAFT',
  'SUBMITTED',
  'APPROVED',
  'REJECTED',
  'REIMBURSED',
];

const STATUS_STYLES: Record<ExpenseStatus, string> = {
  DRAFT: 'bg-slate-100 text-slate-700',
  SUBMITTED: 'bg-sky-100 text-sky-800',
  APPROVED: 'bg-emerald-100 text-emerald-800',
  REJECTED: 'bg-rose-100 text-rose-800',
  REIMBURSED: 'bg-violet-100 text-violet-800',
};

function amount(row: ExpenseRow): number {
  return Number(row.totalTtc) || 0;
}

export default function ExpenseReportsPage() {
  const t = useTranslations('expenseReports');
  const tc = useTranslations('common');
  const toast = useToast();
  const { token } = useAuth();
  const [list, setList] = useState<ExpenseRow[] | null>(null);
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState<StatusTab>('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [delId, setDelId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const data = await apiFetch<ExpenseRow[]>('/expense-reports');
    setList(data);
  }, []);

  useEffect(() => {
    if (!token) return;
    void load().catch((e: unknown) =>
      toast.push(e instanceof Error ? e.message : tc('error'), 'error')
    );
  }, [token, load, toast, tc]);

  useEffect(() => {
    setPage(1);
  }, [query, tab, pageSize]);

  const filtered = useMemo(() => {
    if (!list) return [];
    const q = query.trim().toLowerCase();
    return list.filter((row) => {
      if (tab !== 'all' && row.status !== tab) return false;
      if (!q) return true;
      return (
        row.title.toLowerCase().includes(q) ||
        (row.number?.toLowerCase().includes(q) ?? false) ||
        (row.createdBy?.name?.toLowerCase().includes(q) ?? false) ||
        (row.createdBy?.email?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [list, query, tab]);

  const counts = useMemo(() => {
    const base = {
      all: list?.length ?? 0,
      DRAFT: 0,
      SUBMITTED: 0,
      APPROVED: 0,
      REJECTED: 0,
      REIMBURSED: 0,
    };
    for (const row of list ?? []) {
      base[row.status] += 1;
    }
    return base;
  }, [list]);

  const { rows: pageRows, safePage } = paginateRows(filtered, page, pageSize);
  const rowStart = filtered.length ? (safePage - 1) * pageSize + 1 : 0;
  const rowEnd = Math.min(safePage * pageSize, filtered.length);

  async function confirmDelete() {
    if (!delId) return;
    try {
      await apiFetch(`/expense-reports/${delId}`, { method: 'DELETE' });
      setDelId(null);
      toast.push(t('deleted'), 'success');
      await load();
    } catch (e: unknown) {
      toast.push(e instanceof Error ? e.message : tc('error'), 'error');
    }
  }

  return (
    <ExpenseReportsFeatureGate>
      <div className="space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{t('title')}</h1>
            <p className="mt-1 text-sm text-slate-500">{t('subtitle')}</p>
          </div>
          {list && list.length > 0 ? (
            <Link
              href="/notes-de-frais/new"
              className="inline-flex items-center gap-2 rounded-md bg-s-accent px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-s-accent/25 hover:bg-s-accent-hover"
            >
              <Plus className="h-4 w-4" />
              {t('new')}
            </Link>
          ) : null}
        </div>

        {!list ? (
          <p className="text-sm text-slate-500">{tc('loading')}</p>
        ) : list.length === 0 ? (
          <ExpenseReportsEmpty />
        ) : (
          <>
            <div className="overflow-x-auto border-b border-s-border">
              <div className="flex min-w-max">
                {STATUS_TABS.map((key) => (
                  <StatTabButton
                    key={key}
                    active={tab === key}
                    count={counts[key]}
                    showAmount={false}
                    onClick={() => setTab(key)}
                    label={key === 'all' ? t('tabAll') : t(`status.${key}`)}
                  />
                ))}
              </div>
            </div>

            <div className="relative max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('searchPlaceholder')}
                className="pl-9"
              />
            </div>

            {filtered.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-6 py-16 text-center">
                <p className="text-sm font-medium text-slate-700">{t('emptyFiltered')}</p>
              </div>
            ) : (
              <>
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                  <table className="w-full text-left text-sm">
                    <thead className="border-b border-slate-100 bg-slate-50/80 text-xs uppercase tracking-wide text-slate-500">
                      <tr>
                        <th className="px-4 py-3 font-medium">{t('number')}</th>
                        <th className="px-4 py-3 font-medium">{t('reportTitle')}</th>
                        <th className="px-4 py-3 font-medium">{t('date')}</th>
                        <th className="px-4 py-3 font-medium">{t('statusLabel')}</th>
                        <th className="px-4 py-3 font-medium text-right">{t('amount')}</th>
                        <th className="px-4 py-3 font-medium text-right">{tc('actions')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pageRows.map((row) => (
                        <tr
                          key={row.id}
                          className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60"
                        >
                          <td className="px-4 py-3 tabular-nums text-slate-500">
                            {row.number ?? '—'}
                          </td>
                          <td className="px-4 py-3">
                            <Link
                              href={`/notes-de-frais/${row.id}`}
                              className="font-medium text-slate-900 hover:text-blue-600"
                            >
                              {row.title}
                            </Link>
                            {row._count?.lines != null ? (
                              <p className="text-xs text-slate-400">
                                {t('linesCount', { count: row._count.lines })}
                              </p>
                            ) : null}
                          </td>
                          <td className="px-4 py-3 text-slate-600">
                            {format(new Date(row.expenseDate), 'dd/MM/yyyy')}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={cn(
                                'inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium',
                                STATUS_STYLES[row.status]
                              )}
                            >
                              {t(`status.${row.status}`)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right tabular-nums font-medium text-slate-900">
                            {formatMoneyAmount(amount(row), row.currency)}
                          </td>
                          <td className="px-4 py-3 text-right">
                            {(row.status === 'DRAFT' || row.status === 'REJECTED') && (
                              <button
                                type="button"
                                onClick={() => setDelId(row.id)}
                                className="inline-flex rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                                title={tc('delete')}
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <ListPagination
                  page={page}
                  pageSize={pageSize}
                  total={filtered.length}
                  onPageChange={setPage}
                  onPageSizeChange={setPageSize}
                  rowsText={t('paginationRows', {
                    start: rowStart,
                    end: rowEnd,
                    total: filtered.length,
                  })}
                  prevLabel={t('paginationPrev')}
                  nextLabel={t('paginationNext')}
                />
              </>
            )}
          </>
        )}

        <Modal
          open={!!delId}
          onClose={() => setDelId(null)}
          title={t('deleteTitle')}
          footer={
            <>
              <Button type="button" variant="ghost" onClick={() => setDelId(null)}>
                {tc('cancel')}
              </Button>
              <Button type="button" variant="danger" onClick={() => void confirmDelete()}>
                {tc('delete')}
              </Button>
            </>
          }
        >
          <p>{t('deleteConfirm')}</p>
        </Modal>
      </div>
    </ExpenseReportsFeatureGate>
  );
}
