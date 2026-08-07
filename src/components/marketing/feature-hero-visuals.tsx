import type { ReactNode } from 'react';
import { BrandWordmark } from '@/components/brand/brand-wordmark';
import { cn } from '@/lib/utils';

function SoftLaptop({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('relative w-full', className)}>
      <div className="rounded-[1rem] border border-slate-700/80 bg-slate-800 p-2 shadow-2xl shadow-slate-900/25 sm:rounded-[1.2rem] sm:p-2.5">
        <div className="overflow-hidden rounded-md bg-white ring-1 ring-slate-200 sm:rounded-lg">
          <div className="flex items-center gap-1.5 border-b border-slate-100 bg-slate-50 px-3 py-1.5">
            <span className="h-2 w-2 rounded-full bg-red-400/80" />
            <span className="h-2 w-2 rounded-full bg-amber-400/80" />
            <span className="h-2 w-2 rounded-full bg-emerald-400/80" />
            <span className="ms-2 truncate text-[10px] font-medium text-slate-400">
              SoftFacture — bureau
            </span>
          </div>
          {children}
        </div>
      </div>
      <div className="mx-auto h-2 w-[72%] rounded-b-md bg-slate-700/80" />
      <div className="mx-auto h-1.5 w-[42%] rounded-b-sm bg-slate-600/70" />
    </div>
  );
}

/** Smartphone au premier plan — composition type Tiime (mobile + desktop). */
function SoftPhone({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'relative w-[9.25rem] shrink-0 rounded-[1.65rem] border-[3px] border-slate-900 bg-slate-900 p-1.5 shadow-2xl shadow-slate-900/35 sm:w-[10.5rem]',
        className
      )}
    >
      <div className="relative overflow-hidden rounded-[1.25rem] bg-white">
        <div className="absolute inset-x-0 top-0 z-10 flex justify-center pt-1.5">
          <span className="h-1.5 w-14 rounded-full bg-slate-900/90" />
        </div>
        <div className="min-h-[17rem] bg-slate-50 pt-5 sm:min-h-[19rem]">{children}</div>
      </div>
    </div>
  );
}

function DocHeader({ title, number }: { title: string; number: string }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-2.5">
      <div>
        <BrandWordmark className="text-[0.95rem]" />
        <p className="mt-1 text-[9px] font-semibold uppercase tracking-wider text-brand-blue">
          {title}
        </p>
        <p className="text-[10px] text-slate-500">{number}</p>
      </div>
      <div className="text-end text-[9px] leading-relaxed text-slate-500">
        <p className="font-semibold text-slate-800">Atelier Médina SARL</p>
        <p>Tunis, Tunisie</p>
        <p>MF 1234567/A</p>
      </div>
    </div>
  );
}

function DocLines({
  rows,
}: {
  rows: { label: string; qty: string; price: string; total: string }[];
}) {
  return (
    <div className="mt-2.5 overflow-hidden rounded-md border border-slate-100">
      <div className="grid grid-cols-[1.4fr_0.35fr_0.55fr_0.55fr] bg-brand-blue px-2 py-1.5 text-[8px] font-semibold uppercase tracking-wide text-white">
        <span>Désignation</span>
        <span className="text-center">Qté</span>
        <span className="text-end">P.U. HT</span>
        <span className="text-end">Total HT</span>
      </div>
      {rows.map((row) => (
        <div
          key={row.label}
          className="grid grid-cols-[1.4fr_0.35fr_0.55fr_0.55fr] border-t border-slate-50 px-2 py-1.5 text-[9px] text-slate-700"
        >
          <span className="truncate font-medium">{row.label}</span>
          <span className="text-center">{row.qty}</span>
          <span className="text-end tabular-nums">{row.price}</span>
          <span className="text-end tabular-nums font-semibold">{row.total}</span>
        </div>
      ))}
    </div>
  );
}

function DocTotals({ ht, tva, ttc }: { ht: string; tva: string; ttc: string }) {
  return (
    <div className="mt-2.5 ms-auto w-[58%] space-y-1 text-[9px]">
      <div className="flex justify-between text-slate-600">
        <span>Total HT</span>
        <span className="tabular-nums">{ht}</span>
      </div>
      <div className="flex justify-between text-slate-600">
        <span>TVA 19 %</span>
        <span className="tabular-nums">{tva}</span>
      </div>
      <div className="flex justify-between rounded-md bg-brand-blue-soft px-2 py-1.5 font-bold text-brand-blue">
        <span>Total TTC</span>
        <span className="tabular-nums">{ttc}</span>
      </div>
    </div>
  );
}

/** Plateau bleu SoftFacture : desktop derrière + mobile devant. */
function DeviceDuo({
  panelClassName,
  desktop,
  mobile,
  badge,
}: {
  panelClassName: string;
  desktop: ReactNode;
  mobile: ReactNode;
  badge?: ReactNode;
}) {
  return (
    <div className="relative mx-auto w-full max-w-[640px] pb-10 lg:ms-auto lg:pb-6">
      <div
        className={cn(
          'relative overflow-visible rounded-[2rem] px-3 pb-16 pt-10 sm:rounded-[2.5rem] sm:px-5 sm:pb-20 sm:pt-12',
          panelClassName
        )}
      >
        {/* Desktop — arrière-plan, légèrement décalé à droite */}
        <div className="ms-auto w-[88%] sm:w-[86%]">{desktop}</div>

        {/* Mobile — premier plan, chevauche le desktop */}
        <div className="absolute -bottom-2 start-1 z-20 sm:-bottom-3 sm:start-2 md:start-0">
          <SoftPhone>{mobile}</SoftPhone>
          {badge}
        </div>
      </div>
    </div>
  );
}

function MobileDocCard({
  title,
  number,
  client,
  amount,
  status,
  statusClassName,
  cta,
}: {
  title: string;
  number: string;
  client: string;
  amount: string;
  status: string;
  statusClassName: string;
  cta: string;
}) {
  return (
    <div className="space-y-3 p-3">
      <div className="flex items-center justify-between gap-2">
        <BrandWordmark className="text-[0.7rem]" />
        <span className={cn('rounded-full px-2 py-0.5 text-[8px] font-bold', statusClassName)}>
          {status}
        </span>
      </div>
      <div>
        <p className="text-[9px] font-semibold uppercase tracking-wide text-brand-blue">{title}</p>
        <p className="text-[10px] text-slate-500">{number}</p>
      </div>
      <div className="rounded-xl bg-white p-2.5 shadow-sm ring-1 ring-slate-100">
        <p className="text-[8px] font-medium uppercase text-slate-400">Client</p>
        <p className="text-[11px] font-semibold text-slate-900">{client}</p>
        <p className="mt-2 text-[8px] font-medium uppercase text-slate-400">Total TTC</p>
        <p className="text-base font-bold tabular-nums text-slate-900">{amount}</p>
      </div>
      <div className="rounded-lg bg-brand-blue px-2.5 py-2 text-center text-[10px] font-semibold text-white">
        {cta}
      </div>
    </div>
  );
}

/** Composition hero page Devis — desktop + mobile. */
export function QuoteHeroVisual() {
  return (
    <DeviceDuo
      panelClassName="bg-gradient-to-br from-[#9eb8f5] via-[#b8ccf8] to-[#d4e2fb]"
      desktop={
        <SoftLaptop>
          <div className="bg-gradient-to-b from-slate-50 to-white p-3 sm:p-4">
            <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
              <DocHeader title="Devis" number="DEV-2026-0042" />
              <div className="mt-2.5 grid grid-cols-2 gap-2 text-[9px]">
                <div className="rounded-md bg-slate-50 p-2">
                  <p className="text-[8px] font-semibold uppercase text-slate-400">Client</p>
                  <p className="font-semibold text-slate-800">Studio Carthage</p>
                  <p className="text-slate-500">Sfax</p>
                </div>
                <div className="rounded-md bg-slate-50 p-2">
                  <p className="text-[8px] font-semibold uppercase text-slate-400">Validité</p>
                  <p className="font-semibold text-slate-800">30 jours</p>
                  <p className="text-slate-500">Émis le 07/08/2026</p>
                </div>
              </div>
              <DocLines
                rows={[
                  {
                    label: 'Conception site vitrine',
                    qty: '1',
                    price: '2 800,000',
                    total: '2 800,000',
                  },
                  {
                    label: 'Intégration responsive',
                    qty: '1',
                    price: '1 200,000',
                    total: '1 200,000',
                  },
                  { label: 'Formation équipe', qty: '2', price: '150,000', total: '300,000' },
                ]}
              />
              <DocTotals ht="4 300,000 DT" tva="817,000 DT" ttc="5 117,000 DT" />
            </div>
          </div>
        </SoftLaptop>
      }
      mobile={
        <MobileDocCard
          title="Devis"
          number="DEV-2026-0042"
          client="Studio Carthage"
          amount="4 850,000 DT"
          status="Accepté"
          statusClassName="bg-brand-soft text-brand-dark"
          cta="Convertir en facture"
        />
      }
    />
  );
}

/** Composition hero page Factures — desktop + mobile. */
export function InvoiceHeroVisual() {
  return (
    <DeviceDuo
      panelClassName="bg-gradient-to-br from-[#7ec8a3] via-[#a8dcc0] to-[#d4efe3]"
      desktop={
        <SoftLaptop>
          <div className="bg-gradient-to-b from-slate-50 to-white p-3 sm:p-4">
            <div className="mb-2 flex gap-2">
              <div className="flex-1 rounded-lg border border-slate-200 bg-white p-2 shadow-sm">
                <p className="text-[8px] font-medium text-slate-400">Encaissé</p>
                <p className="text-xs font-bold tabular-nums text-brand-dark">2 380,000 DT</p>
              </div>
              <div className="flex-1 rounded-lg border border-slate-200 bg-white p-2 shadow-sm">
                <p className="text-[8px] font-medium text-slate-400">En attente</p>
                <p className="text-xs font-bold tabular-nums text-amber-700">1 250,000 DT</p>
              </div>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
              <DocHeader title="Facture" number="FAC-2026-0118" />
              <div className="mt-2 flex items-center justify-between">
                <div className="text-[9px]">
                  <p className="font-semibold text-slate-800">Client · Olive & Co</p>
                  <p className="text-slate-500">Sousse</p>
                </div>
                <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[9px] font-bold text-brand-dark">
                  Payée
                </span>
              </div>
              <DocLines
                rows={[
                  { label: 'Prestation conseil', qty: '1', price: '1 500,000', total: '1 500,000' },
                  { label: 'Audit organisation', qty: '1', price: '500,000', total: '500,000' },
                ]}
              />
              <DocTotals ht="2 000,000 DT" tva="380,000 DT" ttc="2 380,000 DT" />
            </div>
          </div>
        </SoftLaptop>
      }
      mobile={
        <MobileDocCard
          title="Facture"
          number="FAC-2026-0118"
          client="Olive & Co"
          amount="2 380,000 DT"
          status="Payée"
          statusClassName="bg-brand-soft text-brand-dark"
          cta="Voir le détail"
        />
      }
      badge={
        <div className="absolute -end-3 bottom-10 z-30 hidden w-[7.5rem] rounded-xl border border-white bg-white p-2 shadow-lg ring-1 ring-slate-200/80 sm:block">
          <p className="text-[8px] font-semibold text-amber-800">Reste à encaisser</p>
          <p className="text-[11px] font-bold tabular-nums text-slate-900">1 250,000 DT</p>
        </div>
      }
    />
  );
}

/** Composition hero facture électronique — desktop + mobile, sans claim d’agrément. */
export function EinvoiceHeroVisual() {
  return (
    <DeviceDuo
      panelClassName="bg-gradient-to-br from-[#8fa8c9] via-[#b0c3da] to-[#d5e0ec]"
      desktop={
        <SoftLaptop>
          <div className="bg-slate-50 p-3 sm:p-4">
            <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
              <DocHeader title="Facture" number="FAC-2026-0204" />
              <DocLines
                rows={[
                  {
                    label: 'Abonnement SaaS annuel',
                    qty: '1',
                    price: '480,000',
                    total: '480,000',
                  },
                  {
                    label: 'Accompagnement mise en place',
                    qty: '1',
                    price: '200,000',
                    total: '200,000',
                  },
                ]}
              />
              <DocTotals ht="680,000 DT" tva="129,200 DT" ttc="809,200 DT" />
            </div>
          </div>
        </SoftLaptop>
      }
      mobile={
        <div className="space-y-3 p-3">
          <div className="flex items-center justify-between gap-2">
            <BrandWordmark className="text-[0.7rem]" />
            <span className="rounded-full bg-brand-blue-soft px-2 py-0.5 text-[8px] font-bold text-brand-blue">
              PDF
            </span>
          </div>
          <div className="rounded-xl bg-white p-2.5 shadow-sm ring-1 ring-slate-100">
            <p className="text-[9px] font-semibold text-slate-800">FAC-2026-0204</p>
            <p className="mt-1 text-[10px] text-slate-500">Document numérique</p>
            <p className="mt-2 text-sm font-bold tabular-nums text-slate-900">809,200 DT</p>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-white p-2.5 shadow-sm ring-1 ring-slate-100">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-blue-soft text-brand-blue">
              <svg
                viewBox="0 0 24 24"
                className="h-3.5 w-3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M3 7h18v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" />
                <path d="M3 7l2-3h14l2 3" />
              </svg>
            </span>
            <div>
              <p className="text-[9px] font-semibold text-slate-800">Archivage</p>
              <p className="text-[8px] text-slate-500">Historique centralisé</p>
            </div>
          </div>
          <div className="rounded-lg bg-brand-blue px-2.5 py-2 text-center text-[10px] font-semibold text-white">
            Ouvrir le document
          </div>
        </div>
      }
    />
  );
}

/** Composition hero notes de frais — liste + carte statut. */
export function ExpenseHeroVisual() {
  return (
    <DeviceDuo
      panelClassName="bg-gradient-to-br from-[#f0c27a] via-[#f5d7a3] to-[#f8e9c8]"
      desktop={
        <SoftLaptop>
          <div className="bg-gradient-to-b from-slate-50 to-white p-3 sm:p-4">
            <div className="mb-2 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-semibold text-slate-800">Notes de frais</p>
                <p className="text-[9px] text-slate-500">Août 2026</p>
              </div>
              <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[9px] font-bold text-sky-800">
                Soumise
              </span>
            </div>
            <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
              <div className="grid grid-cols-[1fr_0.7fr_0.7fr] border-b border-slate-100 bg-slate-50 px-2.5 py-1.5 text-[8px] font-semibold uppercase tracking-wide text-slate-500">
                <span>Libellé</span>
                <span>Catégorie</span>
                <span className="text-end">Montant</span>
              </div>
              {[
                { label: 'Déjeuner client Sfax', cat: 'Repas', amount: '86,000 DT' },
                { label: 'Taxi aéroport', cat: 'Transport', amount: '45,000 DT' },
                { label: 'Hôtel 1 nuit', cat: 'Hébergement', amount: '210,000 DT' },
                { label: 'Fournitures bureau', cat: 'Fournitures', amount: '38,500 DT' },
              ].map((row) => (
                <div
                  key={row.label}
                  className="grid grid-cols-[1fr_0.7fr_0.7fr] border-t border-slate-50 px-2.5 py-2 text-[9px] text-slate-700"
                >
                  <span className="truncate font-medium">{row.label}</span>
                  <span className="text-slate-500">{row.cat}</span>
                  <span className="text-end tabular-nums font-semibold">{row.amount}</span>
                </div>
              ))}
            </div>
            <div className="mt-2 flex justify-between rounded-md bg-brand-blue-soft px-2.5 py-2 text-[10px] font-bold text-brand-blue">
              <span>Total TTC</span>
              <span className="tabular-nums">379,500 DT</span>
            </div>
          </div>
        </SoftLaptop>
      }
      mobile={
        <MobileDocCard
          title="Note de frais"
          number="NF-2026-0012"
          client="Déplacement Sfax"
          amount="379,500 DT"
          status="Approuvée"
          statusClassName="bg-brand-soft text-brand-dark"
          cta="Voir le détail"
        />
      }
    />
  );
}
