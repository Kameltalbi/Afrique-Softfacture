'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Plus, Trash2 } from 'lucide-react';
import { Link, useRouter } from '@/i18n/navigation';
import { apiFetch } from '@/lib/api-client';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';
import { formatMoneyAmount } from '@/lib/format-money-currency';

type Category = 'MEALS' | 'TRANSPORT' | 'ACCOMMODATION' | 'SUPPLIES' | 'TELECOM' | 'OTHER';

type LineForm = {
  key: string;
  expenseDate: string;
  category: Category;
  description: string;
  vendor: string;
  amountHt: string;
  taxRate: string;
};

const CATEGORIES: Category[] = [
  'MEALS',
  'TRANSPORT',
  'ACCOMMODATION',
  'SUPPLIES',
  'TELECOM',
  'OTHER',
];

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function emptyLine(): LineForm {
  return {
    key: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    expenseDate: todayIso(),
    category: 'OTHER',
    description: '',
    vendor: '',
    amountHt: '',
    taxRate: '0',
  };
}

export default function NewExpenseReportPage() {
  const t = useTranslations('expenseReports');
  const tc = useTranslations('common');
  const toast = useToast();
  const router = useRouter();
  const { user } = useAuth();
  const currency = user?.organization?.defaultCurrency ?? 'TND';
  const defaultVat = Number(user?.organization?.defaultVatRate) || 0;

  const [title, setTitle] = useState('');
  const [expenseDate, setExpenseDate] = useState(todayIso());
  const [notes, setNotes] = useState('');
  const [lines, setLines] = useState<LineForm[]>([{ ...emptyLine(), taxRate: String(defaultVat) }]);
  const [saving, setSaving] = useState(false);

  const totals = useMemo(() => {
    let ht = 0;
    let vat = 0;
    for (const line of lines) {
      const amountHt = Number(line.amountHt) || 0;
      const taxRate = Number(line.taxRate) || 0;
      const vatAmount = (amountHt * taxRate) / 100;
      ht += amountHt;
      vat += vatAmount;
    }
    return { ht, vat, ttc: ht + vat };
  }, [lines]);

  function updateLine(key: string, patch: Partial<LineForm>) {
    setLines((prev) => prev.map((l) => (l.key === key ? { ...l, ...patch } : l)));
  }

  async function onSave(andSubmit: boolean) {
    if (!title.trim()) {
      toast.push(t('titleRequired'), 'error');
      return;
    }
    if (lines.some((l) => !l.description.trim() || !(Number(l.amountHt) >= 0))) {
      toast.push(t('linesRequired'), 'error');
      return;
    }

    setSaving(true);
    try {
      const report = await apiFetch<{ id: string }>('/expense-reports', {
        method: 'POST',
        body: JSON.stringify({
          title: title.trim(),
          expenseDate,
          currency,
          notes: notes.trim() || null,
          lines: lines.map((l) => ({
            expenseDate: l.expenseDate,
            category: l.category,
            description: l.description.trim(),
            vendor: l.vendor.trim() || null,
            amountHt: Number(l.amountHt) || 0,
            taxRate: Number(l.taxRate) || 0,
          })),
        }),
      });

      if (andSubmit) {
        await apiFetch(`/expense-reports/${report.id}/submit`, { method: 'POST' });
        toast.push(t('submitted'), 'success');
      } else {
        toast.push(t('saved'), 'success');
      }
      router.push(`/notes-de-frais/${report.id}`);
    } catch (e: unknown) {
      toast.push(e instanceof Error ? e.message : tc('error'), 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/notes-de-frais" className="text-sm text-slate-500 hover:text-slate-800">
            ← {tc('back')}
          </Link>
          <h1 className="mt-1 text-2xl font-semibold text-slate-900">{t('newTitle')}</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="ghost"
            disabled={saving}
            onClick={() => void onSave(false)}
          >
            {t('saveDraft')}
          </Button>
          <Button type="button" disabled={saving} onClick={() => void onSave(true)}>
            {t('saveAndSubmit')}
          </Button>
        </div>
      </div>

      <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block space-y-1.5 sm:col-span-2">
            <span className="text-sm font-medium text-slate-700">{t('reportTitle')}</span>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('titlePlaceholder')}
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-slate-700">{t('date')}</span>
            <Input
              type="date"
              value={expenseDate}
              onChange={(e) => setExpenseDate(e.target.value)}
            />
          </label>
          <label className="block space-y-1.5 sm:col-span-2">
            <span className="text-sm font-medium text-slate-700">{t('notes')}</span>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full rounded-md border border-s-border bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-s-accent focus:outline-none focus:ring-2 focus:ring-s-accent/20"
              placeholder={t('notesPlaceholder')}
            />
          </label>
        </div>
      </div>

      <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-slate-900">{t('lines')}</h2>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() =>
              setLines((prev) => [...prev, { ...emptyLine(), taxRate: String(defaultVat) }])
            }
          >
            <Plus className="h-4 w-4" />
            {t('addLine')}
          </Button>
        </div>

        <div className="space-y-4">
          {lines.map((line, index) => (
            <div
              key={line.key}
              className="grid gap-3 rounded-lg border border-slate-100 bg-slate-50/50 p-4 sm:grid-cols-6"
            >
              <div className="sm:col-span-6 flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  {t('lineN', { n: index + 1 })}
                </span>
                {lines.length > 1 ? (
                  <button
                    type="button"
                    className="rounded p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                    onClick={() => setLines((prev) => prev.filter((l) => l.key !== line.key))}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                ) : null}
              </div>
              <label className="block space-y-1 sm:col-span-2">
                <span className="text-xs text-slate-500">{t('date')}</span>
                <Input
                  type="date"
                  value={line.expenseDate}
                  onChange={(e) => updateLine(line.key, { expenseDate: e.target.value })}
                />
              </label>
              <label className="block space-y-1 sm:col-span-2">
                <span className="text-xs text-slate-500">{t('category')}</span>
                <select
                  value={line.category}
                  onChange={(e) => updateLine(line.key, { category: e.target.value as Category })}
                  className="w-full rounded-md border border-s-border bg-white px-3 py-2 text-sm"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {t(`categories.${c}`)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block space-y-1 sm:col-span-2">
                <span className="text-xs text-slate-500">{t('vendor')}</span>
                <Input
                  value={line.vendor}
                  onChange={(e) => updateLine(line.key, { vendor: e.target.value })}
                  placeholder={t('vendorPlaceholder')}
                />
              </label>
              <label className="block space-y-1 sm:col-span-3">
                <span className="text-xs text-slate-500">{t('description')}</span>
                <Input
                  value={line.description}
                  onChange={(e) => updateLine(line.key, { description: e.target.value })}
                  placeholder={t('descriptionPlaceholder')}
                />
              </label>
              <label className="block space-y-1 sm:col-span-2">
                <span className="text-xs text-slate-500">{t('amountHt')}</span>
                <Input
                  type="number"
                  min="0"
                  step="0.001"
                  value={line.amountHt}
                  onChange={(e) => updateLine(line.key, { amountHt: e.target.value })}
                />
              </label>
              <label className="block space-y-1">
                <span className="text-xs text-slate-500">{t('taxRate')}</span>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={line.taxRate}
                  onChange={(e) => updateLine(line.key, { taxRate: e.target.value })}
                />
              </label>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-end gap-1 border-t border-slate-100 pt-4 text-sm">
          <div className="flex w-full max-w-xs justify-between text-slate-600">
            <span>{t('subtotalHt')}</span>
            <span className="tabular-nums">{formatMoneyAmount(totals.ht, currency)}</span>
          </div>
          <div className="flex w-full max-w-xs justify-between text-slate-600">
            <span>{t('vat')}</span>
            <span className="tabular-nums">{formatMoneyAmount(totals.vat, currency)}</span>
          </div>
          <div className="flex w-full max-w-xs justify-between font-semibold text-slate-900">
            <span>{t('totalTtc')}</span>
            <span className="tabular-nums">{formatMoneyAmount(totals.ttc, currency)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
