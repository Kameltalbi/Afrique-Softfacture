import { Camera, CheckCircle2, Plus, Zap } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';

const DEMO_ROWS = [
  { date: '05/08', owner: 'Vous', label: 'Déjeuner client', ttc: '85,000', vat: '13,559' },
  { date: '03/08', owner: 'Vous', label: 'Taxi aéroport', ttc: '42,500', vat: '6,780' },
  { date: '01/08', owner: 'Vous', label: 'Fournitures bureau', ttc: '120,000', vat: '19,153' },
  { date: '28/07', owner: 'Vous', label: 'Hôtel mission', ttc: '310,000', vat: '49,407' },
] as const;

/**
 * État vide notes de frais — composition type Tiime :
 * 3 points forts + aperçu tableau + CTA création.
 */
export function ExpenseReportsEmpty() {
  const t = useTranslations('expenseReports');

  const highlights = [
    {
      icon: Camera,
      tone: 'bg-orange-50 text-orange-600',
      title: t('emptyCard1Title'),
      desc: t('emptyCard1Desc'),
    },
    {
      icon: Zap,
      tone: 'bg-sky-50 text-sky-600',
      title: t('emptyCard2Title'),
      desc: t('emptyCard2Desc'),
    },
    {
      icon: CheckCircle2,
      tone: 'bg-emerald-50 text-emerald-600',
      title: t('emptyCard3Title'),
      desc: t('emptyCard3Desc'),
    },
  ] as const;

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-3">
        {highlights.map((item) => (
          <div
            key={item.title}
            className="rounded-2xl border border-slate-200/80 bg-white px-5 py-5 shadow-sm"
          >
            <span
              className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${item.tone}`}
            >
              <item.icon className="h-5 w-5" strokeWidth={2} />
            </span>
            <p className="mt-4 text-xs font-bold uppercase tracking-wide text-slate-400">
              {item.title}
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-700">{item.desc}</p>
          </div>
        ))}
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-[#f4f7fb]">
        <div className="border-b border-slate-200/80 bg-white px-5 py-3">
          <p className="text-sm font-semibold text-slate-800">{t('emptyPreviewTitle')}</p>
          <p className="text-xs text-slate-500">{t('emptyPreviewSubtitle')}</p>
        </div>

        <div className="overflow-x-auto px-2 pb-28 pt-2 sm:px-4 sm:pb-32">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="text-[11px] uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-3 py-2 font-medium">{t('date')}</th>
                <th className="px-3 py-2 font-medium">{t('emptyColOwner')}</th>
                <th className="px-3 py-2 font-medium">{t('description')}</th>
                <th className="px-3 py-2 text-right font-medium">{t('amount')}</th>
                <th className="px-3 py-2 text-right font-medium">{t('vat')}</th>
              </tr>
            </thead>
            <tbody>
              {DEMO_ROWS.map((row) => (
                <tr key={row.label} className="border-t border-slate-100/80 bg-white/70">
                  <td className="px-3 py-2.5 tabular-nums text-slate-500">{row.date}</td>
                  <td className="px-3 py-2.5 text-slate-600">{row.owner}</td>
                  <td className="px-3 py-2.5 font-medium text-slate-800">{row.label}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums text-slate-800">
                    {row.ttc} DT
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums text-slate-500">
                    {row.vat} DT
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#f4f7fb] via-[#f4f7fb]/90 to-transparent" />

        <div className="absolute inset-x-4 bottom-5 mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-xl shadow-slate-900/10 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:p-6">
          <p className="text-base font-semibold tracking-tight text-slate-900 sm:text-lg">
            {t('emptyCtaTitle')}
          </p>
          <p className="mt-1.5 text-sm text-slate-500">{t('emptyCtaHint')}</p>
          <Link
            href="/notes-de-frais/new"
            className="pointer-events-auto mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-s-accent px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-s-accent/25 hover:bg-s-accent-hover"
          >
            <Plus className="h-4 w-4" />
            {t('emptyCta')}
          </Link>
        </div>
      </div>
    </div>
  );
}
