/**
 * Client Digigo / TunTrust — signature à distance du hash TEIF.
 *
 * Modes :
 *  - simulation (défaut) : empreinte simulée pour tests sans credentials
 *  - production : oauth2/authorize → token/SAD → signHash (+ Timestamp optionnel)
 *
 * Variables :
 *  DIGIGO_MODE=simulation|production
 *  DIGIGO_BASE_URL (défaut https://193.95.63.230)
 *  DIGIGO_CLIENT_ID / DIGIGO_CLIENT_SECRET / DIGIGO_CREDENTIAL_ID
 *  DIGIGO_SIGNER_EMAIL / DIGIGO_PIN (optionnel selon flux)
 */

import crypto from 'crypto';
import { logger } from '../lib/logger.js';
import { hashHexToBase64 } from '../lib/einvoice/teif/canonicalHash.js';

const SHA256_OID = '2.16.840.1.101.3.4.2.1';
const RSA_SHA256_OID = '1.2.840.113549.1.1.11';

export type DigigoSignMode = 'simulation' | 'production';

export type DigigoSignResult = {
  mode: DigigoSignMode;
  signatureValue: string;
  sessionId: string | null;
  credentialId: string | null;
  timestampToken: string | null;
  signedAt: Date;
};

export function getDigigoMode(): DigigoSignMode {
  const raw = (process.env.DIGIGO_MODE || process.env.EINVOICE_SIGN_MODE || 'simulation')
    .trim()
    .toLowerCase();
  return raw === 'production' || raw === 'prod' ? 'production' : 'simulation';
}

function digigoConfig() {
  return {
    baseUrl: (
      process.env.DIGIGO_BASE_URL ||
      process.env.TUNTRUST_API_URL ||
      'https://193.95.63.230'
    ).replace(/\/$/, ''),
    clientId: process.env.DIGIGO_CLIENT_ID || process.env.TUNTRUST_CLIENT_ID || '',
    clientSecret: process.env.DIGIGO_CLIENT_SECRET || process.env.TUNTRUST_CLIENT_SECRET || '',
    credentialId: process.env.DIGIGO_CREDENTIAL_ID || '',
    signerEmail: process.env.DIGIGO_SIGNER_EMAIL || '',
    pin: process.env.DIGIGO_PIN || '',
  };
}

async function digigoFetch(path: string, init: RequestInit = {}): Promise<unknown> {
  const { baseUrl } = digigoConfig();
  const url = `${baseUrl}${path}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(init.headers ?? {}),
    },
  });
  const text = await res.text();
  let body: unknown;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }
  if (!res.ok) {
    const detail = typeof body === 'string' ? body : JSON.stringify(body);
    throw new Error(`DIGIGO ${path} failed (${res.status}): ${detail}`);
  }
  return body;
}

function simulateSignature(contentHashHex: string): DigigoSignResult {
  const mac = crypto
    .createHmac('sha256', 'SoftFacture-TEIF-SIM')
    .update(contentHashHex)
    .digest('base64');
  return {
    mode: 'simulation',
    signatureValue: `SIM.${mac}`,
    sessionId: `sim-${contentHashHex.slice(0, 16)}`,
    credentialId: 'SIMULATION',
    timestampToken: null,
    signedAt: new Date(),
  };
}

/**
 * Signe le hash SHA-256 hex du XML TEIF canonique.
 * Digigo attend le hash en Base64.
 */
export async function signTeifContentHash(
  contentHashHex: string,
  opts?: { credentialId?: string | null; signerEmail?: string | null }
): Promise<DigigoSignResult> {
  const mode = getDigigoMode();
  if (mode === 'simulation') {
    logger.info({ hashPrefix: contentHashHex.slice(0, 12) }, 'Digigo: signature simulation');
    return simulateSignature(contentHashHex);
  }

  const cfg = digigoConfig();
  const credentialId = opts?.credentialId?.trim() || cfg.credentialId;
  const signerEmail = opts?.signerEmail?.trim() || cfg.signerEmail;

  if (!cfg.clientId || !cfg.clientSecret || !credentialId) {
    throw new Error(
      'Digigo production : configurez DIGIGO_CLIENT_ID, DIGIGO_CLIENT_SECRET et DIGIGO_CREDENTIAL_ID (et DIGIGO_SIGNER_EMAIL).'
    );
  }
  if (!signerEmail) {
    throw new Error('Digigo production : DIGIGO_SIGNER_EMAIL requis');
  }

  const hashB64 = hashHexToBase64(contentHashHex);

  logger.info(
    { credentialId, signerEmail, hashPrefix: contentHashHex.slice(0, 12) },
    'Digigo: signature production'
  );

  // 1. OAuth2 authorize → code
  const authBody = (await digigoFetch('/oauth2/authorize', {
    method: 'POST',
    body: JSON.stringify({
      clientId: cfg.clientId,
      responseType: 'code',
      scope: 'signature',
      credentialId,
      signerEmail,
      hash: hashB64,
      ...(cfg.pin ? { pin: cfg.pin } : {}),
    }),
  })) as { code?: string };

  const authCode = authBody?.code;
  if (!authCode) throw new Error('Digigo: aucun code OAuth2 obtenu');

  // 2. Token → SAD
  const tokenRes = (await digigoFetch(
    `/oauth2/token/${cfg.clientId}/authorization_code/${cfg.clientSecret}/${authCode}`,
    { method: 'POST' }
  )) as { SAD?: string; sad?: string };
  const sad = tokenRes?.SAD ?? tokenRes?.sad;
  if (!sad) throw new Error('Digigo: aucun SAD retourné par oauth2/token');

  // 3. signHash
  const signRes = (await digigoFetch(
    `/signatures/signHash/${cfg.clientId}/${credentialId}/${sad}/${SHA256_OID}/${RSA_SHA256_OID}`,
    {
      method: 'POST',
      body: JSON.stringify({ hash: [hashB64] }),
    }
  )) as { signatures?: string[]; signature?: string };

  const signature = signRes?.signatures?.[0] ?? signRes?.signature;
  if (!signature) throw new Error('Digigo: aucune signature retournée par signHash');

  // 4. Timestamp (best-effort)
  let timestampToken: string | null = null;
  try {
    const tsRes = (await digigoFetch(`/Timestamp/${cfg.clientId}/${SHA256_OID}`, {
      method: 'POST',
      body: JSON.stringify({ hash: signature }),
    })) as { timestampToken?: string; token?: string };
    timestampToken = tsRes?.timestampToken ?? tsRes?.token ?? null;
  } catch (e) {
    logger.warn({ err: e instanceof Error ? e.message : e }, 'Digigo: Timestamp échoué (ignoré)');
  }

  return {
    mode: 'production',
    signatureValue: signature,
    sessionId: sad.slice(0, 48),
    credentialId,
    timestampToken,
    signedAt: new Date(),
  };
}
