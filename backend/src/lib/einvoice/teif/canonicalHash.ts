import crypto from 'crypto';

/**
 * Empreinte SHA-256 du contenu TEIF canonique (LF, trim final).
 * Calculée sur le XML non signé, avant embedding Signature.
 */
export function computeTeifContentHash(unsignedXml: string): string {
  const canonical = unsignedXml.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trimEnd() + '\n';
  return crypto.createHash('sha256').update(canonical, 'utf8').digest('hex');
}

export function hashHexToBase64(hex: string): string {
  return Buffer.from(hex, 'hex').toString('base64');
}
