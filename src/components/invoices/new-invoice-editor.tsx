'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { Check, Plus, ShoppingCart, Trash2 } from 'lucide-react';
import { pdf } from '@react-pdf/renderer';
import { apiFetch, downloadInvoicePdfFromApi } from '@/lib/api-client';
import { useAuth } from '@/contexts/auth-context';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import type { CreatedClient } from '@/components/clients/new-client-drawer';
import {
  InvoicePreviewModal,
  type InvoicePreviewPayload,
} from '@/components/invoices/invoice-preview-modal';
import { buildDocumentLegalFooter, type OrgLegalFooterSource } from '@/lib/document-legal-footer';
import type { InvoicePreviewData } from '@/components/invoices/invoice-preview-document';
import type { InvoicePdfData } from '@/components/invoices/invoice-pdf';
import { InvoiceDoc } from '@/components/invoices/invoice-pdf';
import {
  DocumentEditorActionBar,
  DOCUMENT_TABLE_HEADER_CLASS,
} from '@/components/invoices/document-editor-action-bar';
import { DocumentEditorSheet } from '@/components/invoices/document-editor-sheet';
import { calcLine } from '@/lib/money';
import { FEATURES } from '@/lib/feature-flags';
import { toNumber, cn } from '@/lib/utils';
import {
  InvoiceEditorShell,
  type InvoiceEditorPanel,
} from '@/components/invoices/invoice-editor-rail';
import type {
  AvailableDeposit,
  DocumentSettings,
} from '@/components/invoices/document-settings-drawer';
import {
  InvoiceEinvoiceFieldsSection,
  defaultInvoiceEinvoiceFields,
  type InvoiceEinvoiceFields,
} from '@/components/invoices/invoice-einvoice-fields';
import { useDocumentNumberPreview } from '@/hooks/use-document-number-preview';

type Line = {
  description: string;
  quantity: number;
  unitPriceHt: number;
  taxRate: number;
  discountRate: number;
  productId: string | null;
};

type ClientOpt = {
  id: string;
  name: string;
  siren?: string | null;
  taxId?: string | null;
  address?: string | null;
  city?: string | null;
  country?: string;
};
type ProductOpt = { id: string; name: string; unitPriceHt: unknown; vatRate: unknown };

const VAT_RATES = [20, 10, 5.5, 2.1, 0] as const;

const invoiceLineFieldClass =
  'h-10 rounded-lg border border-s-border bg-white px-3 py-2 text-sm text-s-navy shadow-sm transition placeholder:text-s-muted focus:border-[#1e3a8a] focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20';

function formatMoney(value: number, currency: string) {
  return `${value.toLocaleString('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ${currency}`;
}

function emptyLine(defaultVat: number): Line {
  return {
    description: '',
    quantity: 1,
    unitPriceHt: 0,
    taxRate: defaultVat,
    discountRate: 0,
    productId: null,
  };
}

function TotalsPanel({
  ht,
  vat,
  ttc,
  netPay,
  advanceDeduction,
  currency,
  labels,
  showVat,
}: {
  ht: number;
  vat: number;
  ttc: number;
  netPay: number;
  advanceDeduction: number;
  currency: string;
  showVat: boolean;
  labels: {
    subtotalHt: string;
    vat: string;
    totalTtc: string;
    advanceDeduction: string;
    netToPay: string;
  };
}) {
  return (
    <div className="ms-auto w-full max-w-xs space-y-2 text-sm">
      <div className="flex items-center justify-between text-s-muted">
        <span>{labels.subtotalHt}</span>
        <span className="tabular-nums text-s-navy">{formatMoney(ht, currency)}</span>
      </div>
      {showVat ? (
        <div className="flex items-center justify-between text-s-muted">
          <span>{labels.vat}</span>
          <span className="tabular-nums text-s-navy">{formatMoney(vat, currency)}</span>
        </div>
      ) : null}
      <div className="flex items-center justify-between text-s-navy">
        <span className="font-semibold">{labels.totalTtc}</span>
        <span className="font-semibold tabular-nums">{formatMoney(ttc, currency)}</span>
      </div>
      {advanceDeduction > 0 ? (
        <div className="flex items-center justify-between text-s-muted">
          <span>{labels.advanceDeduction}</span>
          <span className="tabular-nums text-red-600">
            − {formatMoney(advanceDeduction, currency)}
          </span>
        </div>
      ) : null}
      <div className="flex items-center justify-between border-t border-s-border pt-3 text-lg font-bold text-[#3b7aef]">
        <span>{labels.netToPay}</span>
        <span className="tabular-nums">{formatMoney(netPay, currency)}</span>
      </div>
    </div>
  );
}

function lineGridClass(showDiscount: boolean, showVat: boolean) {
  if (showDiscount && showVat) {
    return 'grid-cols-[minmax(180px,2fr)_80px_100px_90px_80px_minmax(120px,1fr)_40px]';
  }
  if (showDiscount) {
    return 'grid-cols-[minmax(180px,2fr)_80px_100px_90px_minmax(120px,1fr)_40px]';
  }
  if (showVat) {
    return 'grid-cols-[minmax(180px,2fr)_80px_100px_80px_minmax(120px,1fr)_40px]';
  }
  return 'grid-cols-[minmax(180px,2fr)_80px_100px_minmax(120px,1fr)_40px]';
}

export type NewInvoiceEditorProps = {
  invoiceKind?: 'STANDARD' | 'DEPOSIT';
};

export function NewInvoiceEditor({ invoiceKind = 'STANDARD' }: NewInvoiceEditorProps) {
  const isDeposit = invoiceKind === 'DEPOSIT';
  const t = useTranslations('invoices');
  const tcl = useTranslations('clients');
  const tc = useTranslations('common');
  const toast = useToast();
  const router = useRouter();
  const { token, user } = useAuth();
  const [clients, setClients] = useState<ClientOpt[] | null>(null);
  const [products, setProducts] = useState<ProductOpt[] | null>(null);
  const [availableDeposits, setAvailableDeposits] = useState<AvailableDeposit[]>([]);
  const [legalFooterText, setLegalFooterText] = useState('');
  const [clientQuery, setClientQuery] = useState('');
  const [clientId, setClientId] = useState('');
  const [subject, setSubject] = useState('');
  const [issueDate, setIssueDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState('');
  const [activePanel, setActivePanel] = useState<InvoiceEditorPanel>(null);
  const defaultVat = toNumber(user?.organization?.defaultVatRate ?? 19);
  const orgCurrency = user?.organization?.defaultCurrency ?? 'TND';
  const orgCountry = (user?.organization?.country ?? 'TN').toUpperCase();
  const isTunisia = orgCountry === 'TN' || orgCurrency === 'TND';
  const [settings, setSettings] = useState<DocumentSettings>(() => ({
    documentLanguage: 'fr',
    currency: orgCurrency,
    applyVat: true,
    applyFiscalStamp: isTunisia,
    fiscalStamp: isTunisia ? 1 : 0,
    discountEnabled: false,
    discountRate: 0,
    showCurrencyOnLines: true,
    appliedDepositId: null,
  }));
  const [einvoiceFields, setEinvoiceFields] = useState<InvoiceEinvoiceFields>(() =>
    defaultInvoiceEinvoiceFields()
  );
  const [lines, setLines] = useState<Line[]>(() => [emptyLine(20)]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [savedDraftId, setSavedDraftId] = useState<string | null>(null);
  const [pending, setPending] = useState<'draft' | 'finalize' | 'delete' | null>(null);
  const [productPickerIdx, setProductPickerIdx] = useState<number | null>(null);

  const load = useCallback(async () => {
    const [c, p, org] = await Promise.all([
      apiFetch<ClientOpt[]>('/clients'),
      apiFetch<ProductOpt[]>('/products'),
      apiFetch<OrgLegalFooterSource>('/organizations'),
    ]);
    setClients(c);
    setProducts(p);
    setLegalFooterText(buildDocumentLegalFooter(org));
  }, []);

  useEffect(() => {
    if (!token) return;
    void load().catch((e: unknown) =>
      toast.push(e instanceof Error ? e.message : 'Erreur', 'error')
    );
  }, [token, load, toast]);

  useEffect(() => {
    const currency = user?.organization?.defaultCurrency;
    const country = user?.organization?.country?.toUpperCase();
    if (!currency && !country) return;
    setSettings((prev) => {
      const nextCurrency = currency ?? prev.currency;
      const tunisia = (country ?? '') === 'TN' || nextCurrency === 'TND';
      // Appliquer le timbre par défaut seulement si l’utilisateur ne l’a pas déjà activé/réglé.
      const stampUntouched = !prev.applyFiscalStamp && prev.fiscalStamp === 0;
      return {
        ...prev,
        currency: nextCurrency,
        ...(tunisia && stampUntouched ? { applyFiscalStamp: true, fiscalStamp: 1 } : {}),
      };
    });
  }, [user?.organization?.defaultCurrency, user?.organization?.country]);

  useEffect(() => {
    if (!token || isDeposit || !clientId) {
      setAvailableDeposits([]);
      setSettings((prev) => ({ ...prev, appliedDepositId: null }));
      return;
    }
    void apiFetch<AvailableDeposit[]>(`/invoices/deposits/available?clientId=${clientId}`)
      .then((list) => {
        setAvailableDeposits(list);
        setSettings((prev) => ({
          ...prev,
          appliedDepositId:
            prev.appliedDepositId && list.some((d) => d.id === prev.appliedDepositId)
              ? prev.appliedDepositId
              : null,
        }));
      })
      .catch(() => setAvailableDeposits([]));
  }, [token, clientId, isDeposit]);

  const filteredClients = useMemo(() => {
    if (!clients) return [];
    const q = clientQuery.trim().toLowerCase();
    if (!q) return clients;
    return clients.filter((c) => c.name.toLowerCase().includes(q));
  }, [clients, clientQuery]);

  const numberType = isDeposit ? 'deposit' : 'invoice';
  const { nextNumber: previewNumber, loading: previewLoading } = useDocumentNumberPreview(
    numberType,
    issueDate
  );
  const draftNumber = previewNumber ?? (isDeposit ? 'ACO-…' : 'FAC-…');
  const currency = settings.currency;
  const showLineDiscount = settings.discountEnabled;
  const showLineVat = settings.applyVat;
  const lineGrid = lineGridClass(showLineDiscount, showLineVat);

  const advanceDeduction = useMemo(() => {
    if (isDeposit || !settings.appliedDepositId) return 0;
    const d = availableDeposits.find((x) => x.id === settings.appliedDepositId);
    return d ? toNumber(d.totalTtc) : 0;
  }, [isDeposit, settings.appliedDepositId, availableDeposits]);

  const totals = useMemo(() => {
    let ht = 0;
    let vat = 0;
    let ttc = 0;
    const globalFactor = settings.discountEnabled ? 1 - settings.discountRate / 100 : 1;

    for (const l of lines) {
      const lineFactor = settings.discountEnabled ? 1 - (l.discountRate || 0) / 100 : 1;
      const calc = calcLine(
        l.quantity || 0,
        l.unitPriceHt || 0,
        settings.applyVat ? l.taxRate || 0 : 0
      );
      ht += toNumber(calc.lineTotalHt) * lineFactor * globalFactor;
      vat += toNumber(calc.lineVat) * lineFactor * globalFactor;
      ttc += toNumber(calc.lineTotalTtc) * lineFactor * globalFactor;
    }
    if (settings.applyFiscalStamp) ttc += settings.fiscalStamp || 0;
    const netPay = Math.max(0, ttc - advanceDeduction);
    return { ht, vat, ttc, netPay };
  }, [lines, settings, advanceDeduction]);

  function addLine() {
    setLines((prev) => [...prev, emptyLine(defaultVat)]);
  }

  function removeLine(index: number) {
    setLines((prev) => {
      const next = prev.filter((_, i) => i !== index);
      return next.length ? next : [emptyLine(defaultVat)];
    });
    setProductPickerIdx(null);
  }

  function applyProduct(index: number, productId: string) {
    const p = products?.find((x) => x.id === productId);
    if (!p) return;
    setLines((prev) =>
      prev.map((l, i) =>
        i === index
          ? {
              ...l,
              productId,
              description: p.name,
              unitPriceHt: toNumber(p.unitPriceHt),
              taxRate: toNumber(p.vatRate),
            }
          : l
      )
    );
    setProductPickerIdx(null);
  }

  function lineTotalHt(line: Line) {
    const factor = settings.discountEnabled ? 1 - (line.discountRate || 0) / 100 : 1;
    const globalFactor = settings.discountEnabled ? 1 - settings.discountRate / 100 : 1;
    const calc = calcLine(
      line.quantity || 0,
      line.unitPriceHt || 0,
      settings.applyVat ? line.taxRate || 0 : 0
    );
    return toNumber(calc.lineTotalHt) * factor * globalFactor;
  }

  function buildPayload() {
    const payloadLines = lines
      .filter((l) => l.description.trim())
      .map((l) => ({
        description: l.description,
        quantity: l.quantity,
        unitPriceHt: l.unitPriceHt,
        taxRate: l.taxRate,
        productId: l.productId,
      }));

    const mergedNotes = [subject.trim() && `Sujet : ${subject.trim()}`, notes.trim()]
      .filter(Boolean)
      .join('\n\n');

    return { payloadLines, mergedNotes };
  }

  function openPreview() {
    setPreviewOpen(true);
  }

  const persistDraft = useCallback(async (): Promise<string> => {
    const { payloadLines, mergedNotes } = buildPayload();
    if (!clientId) {
      throw new Error('Sélectionnez un client.');
    }
    if (!payloadLines.length) {
      throw new Error('Ajoutez au moins une ligne.');
    }

    const { appliedDepositId, ...docSettings } = settings;
    const body = {
      clientId,
      issueDate: new Date(issueDate).toISOString(),
      notes: mergedNotes || undefined,
      kind: isDeposit ? ('DEPOSIT' as const) : ('STANDARD' as const),
      appliedDepositId: !isDeposit && appliedDepositId ? appliedDepositId : undefined,
      ...docSettings,
      ...einvoiceFields,
      lines: payloadLines,
    };

    if (savedDraftId) {
      await apiFetch(`/invoices/${savedDraftId}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      });
      return savedDraftId;
    }

    const inv = await apiFetch<{ id: string }>('/invoices', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    setSavedDraftId(inv.id);
    return inv.id;
  }, [
    clientId,
    issueDate,
    settings,
    savedDraftId,
    isDeposit,
    lines,
    notes,
    subject,
    einvoiceFields,
  ]);

  async function saveDraft() {
    setPending('draft');
    try {
      const id = await persistDraft();
      toast.push(t('previewDraftSaved'));
      router.push(`/invoices/${id}`);
    } catch (e: unknown) {
      toast.push(e instanceof Error ? e.message : tc('error'), 'error');
    } finally {
      setPending(null);
    }
  }

  async function saveAndFinalize() {
    setPending('finalize');
    try {
      const id = await persistDraft();
      await apiFetch(`/invoices/${id}/validate`, { method: 'POST' });
      toast.push(t('previewFinalized'));
      router.push(`/invoices/${id}`);
    } catch (e: unknown) {
      toast.push(e instanceof Error ? e.message : tc('error'), 'error');
    } finally {
      setPending(null);
    }
  }

  async function deleteDraft() {
    if (!savedDraftId) {
      router.push('/invoices');
      return;
    }
    if (!window.confirm(t('deleteDraftConfirm'))) return;
    setPending('delete');
    try {
      await apiFetch(`/invoices/${savedDraftId}`, { method: 'DELETE' });
      toast.push(t('toastInvoiceDeleted'));
      router.push('/invoices');
    } catch (e: unknown) {
      toast.push(e instanceof Error ? e.message : tc('error'), 'error');
    } finally {
      setPending(null);
    }
  }

  const selectedClient = useMemo(
    () => clients?.find((c) => c.id === clientId),
    [clients, clientId]
  );

  const dueDate = useMemo(() => {
    const d = new Date(issueDate);
    d.setDate(d.getDate() + 30);
    return d.toISOString().slice(0, 10);
  }, [issueDate]);

  const previewPayload = useMemo((): InvoicePreviewPayload => {
    const { payloadLines, mergedNotes } = buildPayload();
    return {
      clientId,
      issueDate,
      notes: mergedNotes || undefined,
      kind: isDeposit ? 'DEPOSIT' : 'STANDARD',
      settings,
      lines: payloadLines,
    };
  }, [clientId, issueDate, isDeposit, lines, notes, settings, subject]);

  const previewData = useMemo((): InvoicePreviewData => {
    const globalFactor = settings.discountEnabled ? 1 - settings.discountRate / 100 : 1;
    const previewLines = lines
      .filter((l) => l.description.trim())
      .map((l) => {
        const lineFactor = settings.discountEnabled ? 1 - (l.discountRate || 0) / 100 : 1;
        const calc = calcLine(
          l.quantity || 0,
          l.unitPriceHt || 0,
          settings.applyVat ? l.taxRate || 0 : 0
        );
        return {
          description: l.description,
          quantity: l.quantity,
          unitPriceHt: l.unitPriceHt,
          taxRate: l.taxRate,
          lineTotalHt: toNumber(calc.lineTotalHt) * lineFactor * globalFactor,
        };
      });

    const org = user?.organization;
    return {
      documentTitle: isDeposit ? "FACTURE D'ACOMPTE" : 'FACTURE',
      number: draftNumber,
      issueDate,
      dueDate,
      isDeposit,
      companyName: org?.name ?? 'Mon entreprise',
      companyTax: org?.taxMatricule,
      companyAddress: org?.address,
      companyCity: org?.city,
      clientName: selectedClient?.name ?? '—',
      clientTax: selectedClient?.taxId,
      clientAddress: selectedClient?.address,
      clientCity: selectedClient?.city,
      subject: subject.trim() || null,
      notes: notes.trim() || null,
      currency,
      applyVat: settings.applyVat,
      lines: previewLines,
      subtotalHt: totals.ht,
      vatTotal: totals.vat,
      totalTtc: totals.ttc,
      advanceDeduction,
      netToPay: totals.netPay,
      labels: {
        client: 'Client',
        designation: 'Désignation',
        qty: 'Qté.',
        unit: 'Unité',
        unitPrice: 'Prix U. HT',
        totalHt: 'Total HT',
        subtotalHt: t('subtotalHt'),
        vat: t('vat'),
        totalTtc: t('totalTtc'),
        advanceDeduction: t('advanceDeduction'),
        netToPay: t('netToPay'),
        issueDate: t('date'),
        dueDate: 'Échéance',
        paymentMethods: 'Modes de règlement',
      },
    };
  }, [
    selectedClient,
    lines,
    settings,
    user?.organization,
    isDeposit,
    draftNumber,
    issueDate,
    dueDate,
    subject,
    notes,
    currency,
    totals,
    advanceDeduction,
    t,
  ]);

  const previewPdfData = useMemo((): InvoicePdfData => {
    const org = user?.organization;
    return {
      number: draftNumber,
      issueDate: new Date(issueDate).toLocaleDateString('fr-FR'),
      dueDate: new Date(dueDate).toLocaleDateString('fr-FR'),
      companyName: org?.name ?? 'Mon entreprise',
      companyTax: org?.taxMatricule,
      companyAddress: org?.address,
      companyCity: org?.city,
      companyCountry: org?.country,
      clientName: selectedClient?.name ?? '—',
      clientTax: selectedClient?.taxId,
      clientAddress: selectedClient?.address,
      clientCity: selectedClient?.city,
      clientCountry: selectedClient?.country,
      currency,
      subtotalHt: totals.ht,
      vatTotal: totals.vat,
      timbreFiscal: settings.applyFiscalStamp ? settings.fiscalStamp : 0,
      totalTtc: totals.ttc,
      paymentTerms: notes.trim() || undefined,
      lines: lines
        .filter((l) => l.description.trim())
        .map((l) => {
          const lineFactor = settings.discountEnabled ? 1 - (l.discountRate || 0) / 100 : 1;
          const globalFactor = settings.discountEnabled ? 1 - settings.discountRate / 100 : 1;
          const calc = calcLine(
            l.quantity || 0,
            l.unitPriceHt || 0,
            settings.applyVat ? l.taxRate || 0 : 0
          );
          return {
            description: l.description,
            qty: l.quantity,
            unitHt: l.unitPriceHt,
            rate: l.taxRate,
            ht: toNumber(calc.lineTotalHt) * lineFactor * globalFactor,
            vat: toNumber(calc.lineVat) * lineFactor * globalFactor,
            ttc: toNumber(calc.lineTotalTtc) * lineFactor * globalFactor,
          };
        }),
    };
  }, [
    selectedClient,
    user?.organization,
    draftNumber,
    issueDate,
    dueDate,
    currency,
    totals,
    settings,
    lines,
    notes,
  ]);

  async function downloadPdf() {
    if (savedDraftId) {
      try {
        await downloadInvoicePdfFromApi(savedDraftId, `${draftNumber}.pdf`);
      } catch (e: unknown) {
        toast.push(e instanceof Error ? e.message : tc('error'), 'error');
      }
      return;
    }
    try {
      const blob = await pdf(<InvoiceDoc data={previewPdfData} />).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${draftNumber}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e: unknown) {
      toast.push(e instanceof Error ? e.message : tc('error'), 'error');
    }
  }

  if (!clients || !products) {
    return <p className="text-sm text-s-muted">{tc('loading')}</p>;
  }

  return (
    <>
      <InvoiceEditorShell
        settings={settings}
        onSettingsChange={setSettings}
        notes={notes}
        onNotesChange={setNotes}
        activePanel={activePanel}
        onPanelChange={setActivePanel}
        documentType="invoice"
        invoiceKind={invoiceKind}
        clientId={clientId}
        availableDeposits={availableDeposits}
        onClientCreated={(created: CreatedClient) => {
          setClients((prev) => {
            const next = [...(prev ?? [])];
            if (!next.some((c) => c.id === created.id)) {
              next.push({
                id: created.id,
                name: created.name,
                siren: created.siren,
                taxId: created.taxId,
                address: created.address,
                city: created.city,
                country: created.country,
              });
              next.sort((a, b) => a.name.localeCompare(b.name, 'fr'));
            }
            return next;
          });
          setClientId(created.id);
          setClientQuery('');
        }}
      >
        <DocumentEditorActionBar
          minimal
          title={isDeposit ? t('newDepositTitle') : t('newTitle')}
          number={previewLoading ? '…' : draftNumber}
          previewLabel={t('preview')}
          saveDraftLabel={t('saveDraft')}
          saveAndFinalizeLabel={t('saveAndFinalize')}
          loadingLabel={tc('loading')}
          deleteAriaLabel={t('deleteDraft')}
          downloadAriaLabel={t('actionDownloadPdf')}
          closeAriaLabel={tc('cancel')}
          pending={pending}
          onDelete={() => void deleteDraft()}
          onDownload={() => void downloadPdf()}
          onPreview={() => openPreview()}
          onSaveDraft={() => void saveDraft()}
          onSaveAndFinalize={() => void saveAndFinalize()}
          onClose={() => router.push('/invoices')}
        />

        <DocumentEditorSheet
          orgName={user?.organization?.name}
          orgLogoUrl={user?.organization?.logoUrl}
          documentLabel={isDeposit ? t('depositSectionTitle') : t('detailTitle')}
          clientId={clientId}
          clients={clients}
          filteredClients={filteredClients}
          selectClientLabel={t('selectClient')}
          createClientLabel={tcl('createCta')}
          noClientsHint={tcl('noClientsHint')}
          onClientChange={setClientId}
          onCreateClient={() => setActivePanel('client')}
          legalFooterText={legalFooterText}
          legalFooterTitle={t('legalFooterTitle')}
          legalFooterEmptyHint={t('legalFooterEmpty')}
          legalFooterSettingsLabel={t('legalFooterSettings')}
          metaFields={
            <div>
              <label className="mb-1 block text-xs text-s-muted">{t('date')}</label>
              <Input
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="h-10 border-0 border-b border-s-border bg-transparent px-0 shadow-none focus:ring-0"
              />
            </div>
          }
          footerCta={
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Button
                type="button"
                size="lg"
                variant="secondary"
                className="w-full rounded-xl border border-slate-200 bg-white py-3.5 text-base font-semibold text-s-navy shadow-sm hover:bg-slate-50 sm:flex-1"
                disabled={pending !== null}
                onClick={() => void saveDraft()}
              >
                {pending === 'draft' ? tc('loading') : t('saveDraft')}
              </Button>
              <Button
                type="button"
                size="lg"
                className="w-full rounded-xl bg-brand py-3.5 text-base font-semibold text-white shadow-lg hover:bg-brand-hover sm:flex-[1.4]"
                disabled={pending !== null}
                onClick={() => void saveAndFinalize()}
              >
                <Check className="h-5 w-5" />
                {pending === 'finalize' ? tc('loading') : t('create')}
              </Button>
            </div>
          }
        >
          <div className="overflow-x-auto">
            <div className="min-w-[640px]">
              <div className={cn(DOCUMENT_TABLE_HEADER_CLASS, lineGrid)}>
                <span>Désignation</span>
                <span>Qté</span>
                <span>P.U. HT</span>
                {showLineDiscount ? <span>Remise %</span> : null}
                {showLineVat ? <span>TVA</span> : null}
                <span className="text-end">Montant HT</span>
                <span />
              </div>

              {lines.map((line, idx) => (
                <div
                  key={idx}
                  className={cn('grid items-start gap-2 bg-[#f3f8ff]/60 px-2 py-3', lineGrid)}
                >
                  <div className="space-y-2">
                    <Input
                      value={line.description}
                      onChange={(e) =>
                        setLines((prev) =>
                          prev.map((l, i) =>
                            i === idx ? { ...l, description: e.target.value } : l
                          )
                        )
                      }
                      placeholder="Désignation"
                      className={invoiceLineFieldClass}
                    />
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setProductPickerIdx(productPickerIdx === idx ? null : idx)}
                        className="inline-flex items-center gap-1 text-xs font-medium text-brand-blue hover:underline"
                      >
                        <ShoppingCart className="h-3.5 w-3.5" />
                        Catalogue
                      </button>
                      {productPickerIdx === idx && (
                        <div className="absolute start-0 top-full z-20 mt-1 max-h-48 w-64 overflow-y-auto rounded-lg border border-s-border bg-white py-1 shadow-lg">
                          {products.map((p) => (
                            <button
                              key={p.id}
                              type="button"
                              className="block w-full px-3 py-2 text-left text-sm hover:bg-slate-50"
                              onClick={() => applyProduct(idx, p.id)}
                            >
                              {p.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <Input
                    type="number"
                    step="0.001"
                    value={line.quantity}
                    onChange={(e) =>
                      setLines((prev) =>
                        prev.map((l, i) =>
                          i === idx ? { ...l, quantity: parseFloat(e.target.value) || 0 } : l
                        )
                      )
                    }
                    className={invoiceLineFieldClass}
                  />
                  <Input
                    type="number"
                    step="0.01"
                    value={line.unitPriceHt}
                    onChange={(e) =>
                      setLines((prev) =>
                        prev.map((l, i) =>
                          i === idx ? { ...l, unitPriceHt: parseFloat(e.target.value) || 0 } : l
                        )
                      )
                    }
                    className={invoiceLineFieldClass}
                  />
                  {showLineDiscount ? (
                    <Input
                      type="number"
                      step="0.01"
                      value={line.discountRate}
                      onChange={(e) =>
                        setLines((prev) =>
                          prev.map((l, i) =>
                            i === idx ? { ...l, discountRate: parseFloat(e.target.value) || 0 } : l
                          )
                        )
                      }
                      className={invoiceLineFieldClass}
                    />
                  ) : null}
                  {showLineVat ? (
                    <select
                      value={line.taxRate}
                      onChange={(e) =>
                        setLines((prev) =>
                          prev.map((l, i) =>
                            i === idx ? { ...l, taxRate: parseFloat(e.target.value) } : l
                          )
                        )
                      }
                      className={invoiceLineFieldClass}
                    >
                      {VAT_RATES.map((r) => (
                        <option key={r} value={r}>
                          {r}%
                        </option>
                      ))}
                    </select>
                  ) : null}
                  <div className="flex h-10 items-center justify-end text-sm font-medium tabular-nums text-s-navy">
                    {formatMoney(lineTotalHt(line), currency)}
                  </div>
                  <div className="flex h-10 items-center justify-center">
                    <button
                      type="button"
                      onClick={() => removeLine(idx)}
                      className="rounded p-1.5 text-s-muted hover:bg-red-50 hover:text-red-500"
                      aria-label={tc('delete')}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={addLine}
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:underline"
          >
            <Plus className="h-4 w-4" />
            {t('addLine')}
          </button>

          {!isDeposit && FEATURES.einvoiceUi ? (
            <div className="mt-8 border-t border-s-border/60 pt-6">
              <InvoiceEinvoiceFieldsSection
                value={einvoiceFields}
                onChange={setEinvoiceFields}
                vatOnDebitsAvailable={Boolean(user?.organization?.vatOnDebitsEnabled)}
                labels={{
                  title: t('einvoiceSectionTitle'),
                  operationNature: t('operationNature'),
                  operationGoods: t('operationGoods'),
                  operationServices: t('operationServices'),
                  operationMixed: t('operationMixed'),
                  vatOnDebits: t('vatOnDebits'),
                  vatOnDebitsHint: t('vatOnDebitsHint'),
                  differentDelivery: t('differentDelivery'),
                  deliveryAddress: t('deliveryAddress'),
                  deliveryPostalCode: t('deliveryPostalCode'),
                  deliveryCity: t('deliveryCity'),
                  deliveryCountry: t('deliveryCountry'),
                }}
              />
            </div>
          ) : null}

          <div className="mt-10 flex justify-end">
            <TotalsPanel
              ht={totals.ht}
              vat={totals.vat}
              ttc={totals.ttc}
              netPay={totals.netPay}
              advanceDeduction={advanceDeduction}
              currency={currency}
              showVat={settings.applyVat}
              labels={{
                subtotalHt: t('subtotalHt'),
                vat: t('vat'),
                totalTtc: t('totalTtc'),
                advanceDeduction: t('advanceDeduction'),
                netToPay: t('netToPay'),
              }}
            />
          </div>
        </DocumentEditorSheet>
      </InvoiceEditorShell>

      {previewOpen ? (
        <InvoicePreviewModal
          open={previewOpen}
          onClose={() => setPreviewOpen(false)}
          previewData={previewData}
          payload={previewPayload}
          settings={settings}
          onSettingsChange={setSettings}
          notes={notes}
          onNotesChange={setNotes}
          invoiceKind={invoiceKind}
          clientId={clientId}
          availableDeposits={availableDeposits}
          invoiceId={savedDraftId}
          onInvoiceIdChange={setSavedDraftId}
          pdfData={previewPdfData}
        />
      ) : null}
    </>
  );
}
