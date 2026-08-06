/** Construit l’aperçu du pied de page légal (même logique que l’API suggestion). */
export type OrgLegalFooterSource = {
  name?: string | null;
  documentFooterText?: string | null;
  legalForm?: string | null;
  shareCapital?: string | null;
  billingSiret?: string | null;
  taxMatricule?: string | null;
  billingVatNumber?: string | null;
  rcsCity?: string | null;
  legalAddress?: string | null;
  legalPostalCode?: string | null;
  legalCity?: string | null;
  address?: string | null;
  postalCode?: string | null;
  city?: string | null;
};

export function buildDocumentLegalFooter(org: OrgLegalFooterSource | null | undefined): string {
  if (!org) return '';
  const custom = org.documentFooterText?.trim();
  if (custom) return custom;

  const parts: string[] = [];

  if (org.legalForm || org.name) {
    parts.push(org.legalForm ? `${org.name}, ${org.legalForm}` : String(org.name));
  }

  if (org.shareCapital?.trim()) {
    parts.push(`au capital de ${org.shareCapital.trim()}`);
  }

  const siret = org.billingSiret || org.taxMatricule;
  if (siret) {
    const rcs = org.rcsCity ? `RCS ${org.rcsCity} ` : 'SIRET ';
    parts.push(`${rcs}${siret}`);
  }

  if (org.billingVatNumber) {
    parts.push(`TVA intracommunautaire : ${org.billingVatNumber}`);
  }

  const address = org.legalAddress || org.address;
  const city = org.legalCity || org.city;
  const postalCode = org.legalPostalCode || org.postalCode;
  if (address && city && postalCode) {
    parts.push(`Siège social : ${address}, ${postalCode} ${city}`);
  }

  return parts.join(' — ');
}
