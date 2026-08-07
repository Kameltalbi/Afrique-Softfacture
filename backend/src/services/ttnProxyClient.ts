/**
 * Relais TTN / El Fatoora via proxy VPS whitelisté TunTrust.
 *
 * TEIF_PROXY_URL + TEIF_PROXY_SHARED_SECRET → envoi réel
 * Sinon, si DIGIGO_MODE=simulation → dépôt mock local
 */

import { logger } from '../lib/logger.js';
import { submitTeifToElFatooraMock } from '../lib/einvoice/teif/mockElFatoora.js';
import { getDigigoMode } from './digigoSign.js';

export type TtnSubmitResult = {
  ok: boolean;
  reference: string;
  channel: 'proxy' | 'mock';
  raw?: unknown;
  errorMessage?: string;
};

export function isTtnProxyConfigured(): boolean {
  return Boolean(
    process.env.TEIF_PROXY_URL?.trim() && process.env.TEIF_PROXY_SHARED_SECRET?.trim()
  );
}

export async function submitSignedTeifToTtn(params: {
  signedXml: string;
  invoiceNumber: string;
}): Promise<TtnSubmitResult> {
  const proxyUrl = process.env.TEIF_PROXY_URL?.trim();
  const proxySecret = process.env.TEIF_PROXY_SHARED_SECRET?.trim();

  if (proxyUrl && proxySecret) {
    logger.info({ invoiceNumber: params.invoiceNumber }, 'TTN: envoi via proxy VPS');
    const res = await fetch(proxyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-proxy-secret': proxySecret,
      },
      body: JSON.stringify({
        signedXml: params.signedXml,
        invoiceNumber: params.invoiceNumber,
      }),
    });
    const text = await res.text();
    let payload: unknown;
    try {
      payload = text ? JSON.parse(text) : null;
    } catch {
      payload = { raw: text };
    }

    if (!res.ok) {
      const msg =
        typeof payload === 'object' && payload && 'error' in payload
          ? String((payload as { error: unknown }).error)
          : `Proxy TTN HTTP ${res.status}`;
      return { ok: false, reference: '', channel: 'proxy', raw: payload, errorMessage: msg };
    }

    const data = payload as Record<string, unknown> | null;
    const nested = (data?.data ?? data) as Record<string, unknown> | null;
    const reference =
      String(
        nested?.reference ??
          nested?.ttnReference ??
          nested?.externalId ??
          data?.reference ??
          `TTN-${params.invoiceNumber}`
      ) || `TTN-${Date.now()}`;

    return { ok: true, reference, channel: 'proxy', raw: payload };
  }

  if (getDigigoMode() === 'simulation') {
    logger.info({ invoiceNumber: params.invoiceNumber }, 'TTN: dépôt mock (simulation)');
    const mock = await submitTeifToElFatooraMock(params.signedXml, params.invoiceNumber);
    if (mock.status === 'REJECTED') {
      return {
        ok: false,
        reference: '',
        channel: 'mock',
        errorMessage: mock.errorMessage || 'Rejet mock El Fatoora',
      };
    }
    return { ok: true, reference: mock.externalId, channel: 'mock' };
  }

  return {
    ok: false,
    reference: '',
    channel: 'proxy',
    errorMessage:
      'Proxy TTN non configuré. Définissez TEIF_PROXY_URL et TEIF_PROXY_SHARED_SECRET pour la production.',
  };
}
