/** Helpers TEIF — montants TND à 3 décimales, échappement XML. */

export function teifAmount(value: number | string): string {
  const n = typeof value === 'string' ? Number(value) : value;
  if (!Number.isFinite(n)) return '0.000';
  return n.toFixed(3);
}

export function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/** Normalise un matricule fiscal tunisien (lettres/chiffres uniquement, majuscules). */
export function normalizeTunisianTaxId(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const cleaned = raw.replace(/[\s./-]/g, '').toUpperCase();
  return cleaned.length >= 7 ? cleaned : null;
}

export function formatTeifDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function formatTeifTime(d: Date): string {
  return d.toISOString().slice(11, 19);
}

/** UN/ECE Rec. 20 — unités courantes SoftFacture → codes TEIF. */
export function teifUnitCode(unit: string | null | undefined): string {
  const u = (unit ?? '').toLowerCase().trim();
  if (!u || u.includes('unité') || u.includes('piece') || u.includes('pièce')) return 'C62';
  if (u.includes('heure') || u === 'h' || u === 'hr') return 'HUR';
  if (u.includes('jour') || u === 'j') return 'DAY';
  if (u.includes('kg')) return 'KGM';
  if (u.includes('m²') || u.includes('m2')) return 'MTK';
  if (u.includes('m³') || u.includes('m3')) return 'MTQ';
  if (u.includes('litre') || u === 'l') return 'LTR';
  return 'C62';
}

export function teifTaxCategory(rate: number): { id: 'S' | 'Z' | 'E'; percent: string } {
  if (rate <= 0) return { id: 'Z', percent: '0' };
  return { id: 'S', percent: String(rate) };
}
