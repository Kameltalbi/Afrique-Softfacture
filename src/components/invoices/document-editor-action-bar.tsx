'use client';

import { Check, CloudDownload, Eye, Lock, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type DocumentEditorActionBarProps = {
  title: string;
  /** Affiché après le titre ; ignoré si `variant="template"` sans subtitle. */
  number?: string;
  subtitle?: string;
  variant?: 'document' | 'template';
  previewLabel: string;
  saveDraftLabel: string;
  saveAndFinalizeLabel: string;
  loadingLabel: string;
  deleteAriaLabel: string;
  downloadAriaLabel: string;
  closeAriaLabel: string;
  pending?: 'draft' | 'finalize' | 'delete' | null;
  className?: string;
  /** Mode épuré : X à gauche, moins de boutons texte. */
  minimal?: boolean;
  onDelete?: () => void;
  onDownload?: () => void;
  onPreview?: () => void;
  onSaveDraft?: () => void;
  onSaveAndFinalize: () => void;
  onClose: () => void;
};

export function DocumentEditorActionBar({
  title,
  number,
  subtitle,
  variant = 'document',
  previewLabel,
  saveDraftLabel,
  saveAndFinalizeLabel,
  loadingLabel,
  deleteAriaLabel,
  downloadAriaLabel,
  closeAriaLabel,
  pending = null,
  className,
  minimal = false,
  onDelete,
  onDownload,
  onPreview,
  onSaveDraft,
  onSaveAndFinalize,
  onClose,
}: DocumentEditorActionBarProps) {
  const isBusy = pending !== null;
  const isTemplate = variant === 'template';

  if (minimal) {
    return (
      <header
        className={cn(
          'sticky top-0 z-10 mb-6 flex shrink-0 items-center justify-between gap-3 border-b border-s-border/80 bg-slate-50/95 py-3 backdrop-blur',
          className
        )}
      >
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            aria-label={closeAriaLabel}
            className="rounded-lg p-2 text-s-muted transition hover:bg-white hover:text-s-navy"
          >
            <X className="h-5 w-5" />
          </button>
          <h1 className="min-w-0 truncate text-base font-semibold text-s-navy">
            {title}
            {number ? <span className="font-normal text-s-muted"> · {number}</span> : null}
          </h1>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          {!isTemplate ? (
            <>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-9 gap-1.5 text-s-muted hover:text-s-navy"
                disabled={isBusy}
                onClick={onPreview}
              >
                <Eye className="h-4 w-4" />
                <span className="hidden sm:inline">{previewLabel}</span>
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-9 gap-1.5 text-s-muted hover:text-s-navy"
                disabled={isBusy}
                onClick={onSaveDraft}
              >
                <Lock className="h-4 w-4" />
                <span className="hidden sm:inline">
                  {pending === 'draft' ? loadingLabel : saveDraftLabel}
                </span>
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-9 w-9 p-0 text-s-muted hover:text-s-navy"
                disabled={isBusy}
                onClick={onDownload}
                aria-label={downloadAriaLabel}
              >
                <CloudDownload className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-9 w-9 p-0 text-s-muted hover:text-red-600"
                disabled={isBusy}
                onClick={onDelete}
                aria-label={deleteAriaLabel}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          ) : null}
        </div>
      </header>
    );
  }

  return (
    <header
      className={cn(
        'sticky top-0 z-10 mb-4 flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-s-border bg-white py-3',
        className
      )}
    >
      <h1 className="min-w-0 truncate text-base font-bold text-s-navy md:text-lg">
        {title}
        {isTemplate && subtitle ? (
          <span className="font-semibold text-s-muted"> — {subtitle}</span>
        ) : null}
        {!isTemplate && number ? (
          <span className="font-semibold text-s-muted"> n° {number}</span>
        ) : null}
      </h1>
      <div className="flex max-w-full flex-wrap items-center justify-end gap-2">
        {!isTemplate ? (
          <>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-9 w-9 p-0 text-s-muted hover:text-red-600"
              disabled={isBusy}
              onClick={onDelete}
              aria-label={deleteAriaLabel}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-9 w-9 p-0 text-s-muted hover:text-s-navy"
              disabled={isBusy}
              onClick={onDownload}
              aria-label={downloadAriaLabel}
            >
              <CloudDownload className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="shrink-0 gap-1.5 border border-s-border bg-white text-s-navy shadow-sm hover:bg-slate-50"
              disabled={isBusy}
              onClick={onPreview}
            >
              <Eye className="h-4 w-4" />
              {previewLabel}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="shrink-0 gap-1.5 border border-s-border bg-white text-s-navy shadow-sm hover:bg-slate-50"
              disabled={isBusy}
              onClick={onSaveDraft}
            >
              <Lock className="h-4 w-4" />
              {pending === 'draft' ? loadingLabel : saveDraftLabel}
            </Button>
          </>
        ) : null}
        <Button
          type="button"
          size="sm"
          className="shrink-0 gap-1.5 bg-brand-blue px-4 text-white shadow-sm hover:bg-brand-blue-hover"
          disabled={isBusy}
          onClick={onSaveAndFinalize}
        >
          <Check className="h-4 w-4" />
          {pending === 'finalize' ? loadingLabel : saveAndFinalizeLabel}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-9 w-9 p-0 text-s-muted hover:text-s-navy"
          onClick={onClose}
          aria-label={closeAriaLabel}
        >
          <X className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}

/** En-tête de tableau lignes — style Tiime (barre bleue). */
export const DOCUMENT_TABLE_HEADER_CLASS =
  'grid gap-2 bg-[#3b82f6] px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-white';
