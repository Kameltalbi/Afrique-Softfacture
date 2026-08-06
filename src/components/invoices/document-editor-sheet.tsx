'use client';

import { ImagePlus, Plus } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import { resolveLogoDisplayUrl } from '@/lib/org-logo';

type ClientOpt = { id: string; name: string };

type DocumentEditorSheetProps = {
  children: React.ReactNode;
  orgName?: string | null;
  orgLogoUrl?: string | null;
  documentLabel: string;
  clientId: string;
  clients: ClientOpt[];
  filteredClients: ClientOpt[];
  selectClientLabel: string;
  createClientLabel: string;
  noClientsHint: string;
  changeClientLabel?: string;
  onClientChange: (id: string) => void;
  onCreateClient: () => void;
  metaFields: React.ReactNode;
  footerCta: React.ReactNode;
  /** Pied de page légal (Paramètres → Pied de page). */
  legalFooterText?: string | null;
  legalFooterTitle?: string;
  legalFooterEmptyHint?: string;
  legalFooterSettingsLabel?: string;
  className?: string;
};

/**
 * Feuille A4 type Tiime : papier 210×297 mm, logo, client, contenu, pied légal.
 */
export function DocumentEditorSheet({
  children,
  orgName,
  orgLogoUrl,
  documentLabel,
  clientId,
  clients,
  filteredClients,
  selectClientLabel,
  createClientLabel,
  noClientsHint,
  changeClientLabel = 'Changer',
  onClientChange,
  onCreateClient,
  metaFields,
  footerCta,
  legalFooterText,
  legalFooterTitle = 'Informations légales de ma société',
  legalFooterEmptyHint = 'Renseignez le pied de page dans Paramètres.',
  legalFooterSettingsLabel = 'Configurer dans Paramètres',
  className,
}: DocumentEditorSheetProps) {
  const logoSrc = resolveLogoDisplayUrl(orgLogoUrl);
  const selected = clients.find((c) => c.id === clientId);
  const footer = legalFooterText?.trim() ?? '';
  const footerRemaining = Math.max(0, 500 - footer.length);

  return (
    <div className={cn('mx-auto w-full max-w-[210mm] pb-32', className)}>
      {/* Feuille A4 */}
      <div
        className="flex min-h-[297mm] flex-col bg-white px-[12mm] py-[14mm] shadow-[0_8px_30px_rgba(15,23,42,0.08)] print:shadow-none"
        style={{ aspectRatio: undefined }}
      >
        <div className="flex flex-1 flex-col">
          {/* Émetteur + client */}
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex min-w-0 flex-col gap-3">
              <div
                className={cn(
                  'flex h-16 w-16 items-center justify-center overflow-hidden rounded-md border border-dashed border-slate-300 bg-slate-50',
                  logoSrc && 'border-solid border-slate-200'
                )}
              >
                {logoSrc ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={logoSrc} alt="" className="h-full w-full object-contain p-1.5" />
                ) : (
                  <ImagePlus className="h-5 w-5 text-slate-400" aria-hidden />
                )}
              </div>
              <p className="max-w-[240px] truncate text-sm font-medium text-s-navy">
                {orgName || 'Votre entreprise'}
              </p>
            </div>

            <div className="flex w-full flex-col items-stretch gap-2 sm:max-w-[260px] sm:items-end">
              {selected ? (
                <>
                  <p className="text-sm font-semibold text-s-navy sm:text-end">{selected.name}</p>
                  <select
                    className="w-full rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-s-navy"
                    value={clientId}
                    onChange={(e) => onClientChange(e.target.value)}
                    aria-label={changeClientLabel}
                  >
                    {filteredClients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={onCreateClient}
                    className="inline-flex items-center gap-1 text-sm font-semibold text-[#3b7aef] hover:underline"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    {createClientLabel.replace(/^\+\s*/, '')}
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={onCreateClient}
                    className="inline-flex items-center justify-center gap-1.5 rounded-full bg-[#3b7aef] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#2663eb]"
                  >
                    <Plus className="h-4 w-4" />
                    {createClientLabel.replace(/^\+\s*/, '')}
                  </button>
                  {clients.length > 0 ? (
                    <select
                      className="w-full rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-s-navy"
                      value={clientId}
                      onChange={(e) => onClientChange(e.target.value)}
                    >
                      <option value="">— {selectClientLabel} —</option>
                      {filteredClients.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-xs text-s-muted sm:text-end">{noClientsHint}</p>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="mt-10">
            <p className="text-[22px] font-semibold tracking-tight text-s-navy">{documentLabel}</p>
            <div className="mt-5 flex flex-wrap items-end gap-x-8 gap-y-4">{metaFields}</div>
          </div>

          <div className="mt-10 flex-1">{children}</div>
        </div>

        {/* Pied de page légal (Paramètres) */}
        <footer className="mt-10 border-t border-slate-200 pt-4">
          <div className="flex items-start justify-between gap-3">
            <p className="text-[11px] font-semibold text-s-navy">{legalFooterTitle}</p>
            <p className="shrink-0 text-[10px] text-s-muted">
              {footer ? `${footerRemaining}/500` : '0/500'}
            </p>
          </div>
          {footer ? (
            <p className="mt-2 whitespace-pre-wrap text-center text-[9pt] leading-snug text-slate-600">
              {footer}
            </p>
          ) : (
            <div className="mt-2 rounded-lg border border-dashed border-slate-200 bg-slate-50/80 px-4 py-3 text-center">
              <p className="text-[11px] text-s-muted">{legalFooterEmptyHint}</p>
              <Link
                href="/settings?s=pied"
                className="mt-1 inline-block text-[11px] font-semibold text-[#3b7aef] hover:underline"
              >
                {legalFooterSettingsLabel}
              </Link>
            </div>
          )}
        </footer>
      </div>

      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-20 flex justify-center px-4 pb-5 pe-16">
        <div className="pointer-events-auto w-full max-w-[210mm]">{footerCta}</div>
      </div>
    </div>
  );
}
