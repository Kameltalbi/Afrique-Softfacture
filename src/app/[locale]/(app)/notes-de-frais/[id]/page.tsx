'use client';

import { useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { format } from 'date-fns';
import { useParams } from 'next/navigation';
import { Link, useRouter } from '@/i18n/navigation';
import { apiFetch } from '@/lib/api-client';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { useToast } from '@/components/ui/toast';
import { formatMoneyAmount } from '@/lib/format-money-currency';
import { cn } from '@/lib/utils';
import { ExpenseReportsFeatureGate } from '@/components/expense-reports/expense-reports-feature-gate';

type ExpenseStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'REIMBURSED';
type Category = 'MEALS' | 'TRANSPORT' | 'ACCOMMODATION' | 'SUPPLIES' | 'TELECOM' | 'OTHER';

type ExpenseLine = {
  id: string;
  expenseDate: string;
  category: Category;
  description: string;
  vendor: string | null;
  amountHt: unknown;
  taxRate: unknown;
  vatAmount: unknown;
  amountTtc: unknown;
};

type ExpenseDetail = {
  id: string;
  title: string;
  number: string | null;
  status: ExpenseStatus;
  currency: string;
  expenseDate: string;
  notes: string | null;
  subtotalHt: unknown;
  vatTotal: unknown;
  totalTtc: unknown;
  rejectionReason: string | null;
  submittedAt: string | null;
  approvedAt: string | null;
  rejectedAt: string | null;
  reimbursedAt: string | null;
  createdBy?: { name: string | null; email: string } | null;
  lines: ExpenseLine[];
};

const STATUS_STYLES: Record<ExpenseStatus, string> = {
  DRAFT: 'bg-slate-100 text-slate-700',
  SUBMITTED: 'bg-sky-100 text-sky-800',
  APPROVED: 'bg-emerald-100 text-emerald-800',
  REJECTED: 'bg-rose-100 text-rose-800',
  REIMBURSED: 'bg-violet-100 text-violet-800',
};

export default function ExpenseReportDetailPage() {
  const t = useTranslations('expenseReports');
  const tc = useTranslations('common');
  const toast = useToast();
  const router = useRouter();
  const { token } = useAuth();
  const params = useParams();
  const id = String(params.id);

  const [report, setReport] = useState<ExpenseDetail | null>(null);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const data = await apiFetch<ExpenseDetail>(`/expense-reports/${id}`);
    setReport(data);
  }, [id]);

  useEffect(() => {
    if (!token) return;
    void load().catch((e: unknown) =>
      toast.push(e instanceof Error ? e.message : tc('error'), 'error')
    );
  }, [token, load, toast, tc]);

  async function runAction(
    path: 'submit' | 'approve' | 'reject' | 'reimburse' | 'delete',
    body?: Record<string, string>,
    successKey: 'submitted' | 'approved' | 'rejected' | 'reimbursed' | 'deleted' = 'submitted'
  ) {
    setBusy(true);
    try {
      if (path === 'delete') {
        await apiFetch(`/expense-reports/${id}`, { method: 'DELETE' });
        toast.push(t(successKey), 'success');
        router.push('/notes-de-frais');
        return;
      }
      await apiFetch(`/expense-reports/${id}/${path}`, {
        method: 'POST',
        ...(body ? { body: JSON.stringify(body) } : {}),
      });
      toast.push(t(successKey), 'success');
      setRejectOpen(false);
      setRejectReason('');
      await load();
    } catch (e: unknown) {
      toast.push(e instanceof Error ? e.message : tc('error'), 'error');
    } finally {
      setBusy(false);
    }
  }

  if (!report) {
    return (
      <ExpenseReportsFeatureGate>
        <p className="text-sm text-slate-500">{tc('loading')}</p>
      </ExpenseReportsFeatureGate>
    );
  }

  const editable = report.status === 'DRAFT' || report.status === 'REJECTED';

  return (
    <ExpenseReportsFeatureGate>
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Link href="/notes-de-frais" className="text-sm text-slate-500 hover:text-slate-800">
              ← {tc('back')}
            </Link>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-semibold text-slate-900">{report.title}</h1>
              <span
                className={cn(
                  'inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium',
                  STATUS_STYLES[report.status]
                )}
              >
                {t(`status.${report.status}`)}
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              {report.number ? `${t('number')}: ${report.number} · ` : null}
              {format(new Date(report.expenseDate), 'dd/MM/yyyy')}
              {report.createdBy ? ` · ${report.createdBy.name || report.createdBy.email}` : null}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {editable ? (
              <>
                <Button
                  type="button"
                  variant="ghost"
                  disabled={busy}
                  onClick={() => void runAction('delete', undefined, 'deleted')}
                >
                  {tc('delete')}
                </Button>
                <Button
                  type="button"
                  disabled={busy}
                  onClick={() => void runAction('submit', undefined, 'submitted')}
                >
                  {t('submit')}
                </Button>
              </>
            ) : null}
            {report.status === 'SUBMITTED' ? (
              <>
                <Button
                  type="button"
                  variant="ghost"
                  disabled={busy}
                  onClick={() => setRejectOpen(true)}
                >
                  {t('reject')}
                </Button>
                <Button
                  type="button"
                  disabled={busy}
                  onClick={() => void runAction('approve', undefined, 'approved')}
                >
                  {t('approve')}
                </Button>
              </>
            ) : null}
            {report.status === 'APPROVED' ? (
              <Button
                type="button"
                disabled={busy}
                onClick={() => void runAction('reimburse', undefined, 'reimbursed')}
              >
                {t('markReimbursed')}
              </Button>
            ) : null}
          </div>
        </div>

        {report.rejectionReason ? (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            <strong>{t('rejectionReason')}:</strong> {report.rejectionReason}
          </div>
        ) : null}

        {report.notes ? (
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-slate-900">{t('notes')}</h2>
            <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">{report.notes}</p>
          </div>
        ) : null}

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50/80 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">{t('date')}</th>
                <th className="px-4 py-3 font-medium">{t('category')}</th>
                <th className="px-4 py-3 font-medium">{t('description')}</th>
                <th className="px-4 py-3 font-medium text-right">{t('amountHt')}</th>
                <th className="px-4 py-3 font-medium text-right">{t('vat')}</th>
                <th className="px-4 py-3 font-medium text-right">{t('totalTtc')}</th>
              </tr>
            </thead>
            <tbody>
              {report.lines.map((line) => (
                <tr key={line.id} className="border-b border-slate-50 last:border-0">
                  <td className="px-4 py-3 text-slate-600">
                    {format(new Date(line.expenseDate), 'dd/MM/yyyy')}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{t(`categories.${line.category}`)}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900">{line.description}</div>
                    {line.vendor ? (
                      <div className="text-xs text-slate-400">{line.vendor}</div>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {formatMoneyAmount(Number(line.amountHt) || 0, report.currency)}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-slate-500">
                    {formatMoneyAmount(Number(line.vatAmount) || 0, report.currency)}
                    <span className="ms-1 text-xs">({Number(line.taxRate) || 0}%)</span>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums font-medium">
                    {formatMoneyAmount(Number(line.amountTtc) || 0, report.currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex flex-col items-end gap-1 border-t border-slate-100 px-4 py-4 text-sm">
            <div className="flex w-full max-w-xs justify-between text-slate-600">
              <span>{t('subtotalHt')}</span>
              <span className="tabular-nums">
                {formatMoneyAmount(Number(report.subtotalHt) || 0, report.currency)}
              </span>
            </div>
            <div className="flex w-full max-w-xs justify-between text-slate-600">
              <span>{t('vat')}</span>
              <span className="tabular-nums">
                {formatMoneyAmount(Number(report.vatTotal) || 0, report.currency)}
              </span>
            </div>
            <div className="flex w-full max-w-xs justify-between font-semibold text-slate-900">
              <span>{t('totalTtc')}</span>
              <span className="tabular-nums">
                {formatMoneyAmount(Number(report.totalTtc) || 0, report.currency)}
              </span>
            </div>
          </div>
        </div>

        <Modal
          open={rejectOpen}
          onClose={() => setRejectOpen(false)}
          title={t('rejectTitle')}
          footer={
            <>
              <Button type="button" variant="ghost" onClick={() => setRejectOpen(false)}>
                {tc('cancel')}
              </Button>
              <Button
                type="button"
                variant="danger"
                disabled={busy || !rejectReason.trim()}
                onClick={() =>
                  void runAction('reject', { reason: rejectReason.trim() }, 'rejected')
                }
              >
                {t('reject')}
              </Button>
            </>
          }
        >
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-slate-700">{t('rejectionReason')}</span>
            <Input
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder={t('rejectionPlaceholder')}
            />
          </label>
        </Modal>
      </div>
    </ExpenseReportsFeatureGate>
  );
}
