'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslations } from 'next-intl';
import { X } from 'lucide-react';
import { apiFetch } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';
import { cn } from '@/lib/utils';

const TRANSITION_MS = 300;

export type CreatedClient = {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  taxId?: string | null;
  siren?: string | null;
  address?: string | null;
  postalCode?: string | null;
  city?: string | null;
  country?: string;
  isCompany?: boolean;
};

type FormState = {
  isCompany: boolean;
  name: string;
  email: string;
  phone: string;
  taxId: string;
  siren: string;
  address: string;
  postalCode: string;
  city: string;
  country: string;
};

const EMPTY_FORM: FormState = {
  isCompany: true,
  name: '',
  email: '',
  phone: '',
  taxId: '',
  siren: '',
  address: '',
  postalCode: '',
  city: '',
  country: 'FR',
};

type FormProps = {
  onClose: () => void;
  onCreated: (client: CreatedClient) => void;
  /** dock = panneau latéral éditeur (sans overlay) */
  variant?: 'dock' | 'overlay';
  className?: string;
};

/** Formulaire création client — utilisable en panneau docké ou overlay. */
export function NewClientForm({ onClose, onCreated, variant = 'dock', className }: FormProps) {
  const t = useTranslations('clients');
  const tc = useTranslations('common');
  const toast = useToast();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    setForm(EMPTY_FORM);
  }, []);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.push(t('nameRequired'), 'error');
      return;
    }
    setPending(true);
    try {
      const created = await apiFetch<CreatedClient>('/clients', {
        method: 'POST',
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim() || null,
          phone: form.phone.trim() || null,
          taxId: form.taxId.trim() || null,
          siren: form.siren.trim() || null,
          address: form.address.trim() || null,
          postalCode: form.postalCode.trim() || null,
          city: form.city.trim() || null,
          country: form.country.trim().toUpperCase() || 'FR',
          isCompany: form.isCompany,
        }),
      });
      toast.push(t('createdToast'), 'success');
      onCreated(created);
      onClose();
    } catch (err: unknown) {
      toast.push(err instanceof Error ? err.message : tc('error'), 'error');
    } finally {
      setPending(false);
    }
  }

  return (
    <div className={cn('flex h-full min-h-[calc(100vh-8rem)] flex-col bg-white', className)}>
      <div className="flex shrink-0 items-center justify-between border-b border-s-border px-5 py-4">
        <h2 className="text-base font-semibold text-s-navy">{t('new')}</h2>
        <button
          type="button"
          onClick={onClose}
          disabled={pending}
          className="rounded-lg p-1.5 text-s-muted transition hover:bg-slate-100 hover:text-s-navy"
          aria-label={tc('cancel')}
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col">
        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
          <fieldset>
            <legend className="mb-2 text-xs font-semibold uppercase tracking-wide text-s-muted">
              {t('clientType')}
            </legend>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => update('isCompany', true)}
                className={cn(
                  'flex-1 rounded-lg border px-3 py-2.5 text-sm font-medium transition',
                  form.isCompany
                    ? 'border-brand bg-brand/5 text-brand'
                    : 'border-s-border text-s-muted hover:border-slate-300'
                )}
              >
                {t('typeCompany')}
              </button>
              <button
                type="button"
                onClick={() => update('isCompany', false)}
                className={cn(
                  'flex-1 rounded-lg border px-3 py-2.5 text-sm font-medium transition',
                  !form.isCompany
                    ? 'border-brand bg-brand/5 text-brand'
                    : 'border-s-border text-s-muted hover:border-slate-300'
                )}
              >
                {t('typeIndividual')}
              </button>
            </div>
          </fieldset>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-s-muted">{t('name')}</label>
            <Input
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              placeholder={
                form.isCompany ? t('nameCompanyPlaceholder') : t('namePersonPlaceholder')
              }
              required
              autoFocus={variant === 'dock'}
            />
          </div>

          {form.isCompany ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-s-muted">
                  {t('siren')}
                </label>
                <Input
                  value={form.siren}
                  onChange={(e) => update('siren', e.target.value)}
                  placeholder="123456789"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-s-muted">
                  {t('taxId')}
                </label>
                <Input
                  value={form.taxId}
                  onChange={(e) => update('taxId', e.target.value)}
                  placeholder="12345678900012"
                />
              </div>
            </div>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-s-muted">{t('email')}</label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
                placeholder="client@exemple.fr"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-s-muted">{t('phone')}</label>
              <Input
                value={form.phone}
                onChange={(e) => update('phone', e.target.value)}
                placeholder="06 12 34 56 78"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-s-muted">{t('address')}</label>
            <Input
              value={form.address}
              onChange={(e) => update('address', e.target.value)}
              placeholder={t('addressPlaceholder')}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-s-muted">
                {t('postalCode')}
              </label>
              <Input
                value={form.postalCode}
                onChange={(e) => update('postalCode', e.target.value)}
                placeholder="75001"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-xs font-medium text-s-muted">{t('city')}</label>
              <Input
                value={form.city}
                onChange={(e) => update('city', e.target.value)}
                placeholder="Paris"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-s-muted">{t('country')}</label>
            <Input
              value={form.country}
              onChange={(e) => update('country', e.target.value.toUpperCase())}
              maxLength={2}
              placeholder="FR"
            />
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-between gap-3 border-t border-s-border bg-white px-5 py-4">
          <Button type="button" variant="secondary" onClick={onClose} disabled={pending}>
            {tc('cancel')}
          </Button>
          <Button
            type="submit"
            variant="primary"
            className="bg-brand hover:bg-brand-hover"
            disabled={pending}
          >
            {pending ? '…' : t('createSubmit')}
          </Button>
        </div>
      </form>
    </div>
  );
}

type DrawerProps = {
  open: boolean;
  onClose: () => void;
  onCreated: (client: CreatedClient) => void;
};

/** Overlay fixe (hors éditeur document). Préférer le panneau docké dans l’éditeur. */
export function NewClientDrawer({ open, onClose, onCreated }: DrawerProps) {
  const t = useTranslations('clients');
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (open) {
      setMounted(true);
      const frame = requestAnimationFrame(() => {
        requestAnimationFrame(() => setVisible(true));
      });
      return () => cancelAnimationFrame(frame);
    }
    setVisible(false);
    const timer = window.setTimeout(() => setMounted(false), TRANSITION_MS);
    return () => window.clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    if (!mounted) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mounted, onClose]);

  if (!mounted || typeof document === 'undefined') return null;

  return createPortal(
    <aside
      className={cn(
        'fixed inset-y-0 end-0 z-50 flex w-full max-w-[420px] flex-col bg-white shadow-2xl transition-transform duration-300 ease-out',
        visible ? 'translate-x-0' : 'translate-x-full'
      )}
      role="dialog"
      aria-modal="true"
      aria-label={t('new')}
    >
      <NewClientForm variant="overlay" onClose={onClose} onCreated={onCreated} />
    </aside>,
    document.body
  );
}
