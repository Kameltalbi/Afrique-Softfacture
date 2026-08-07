/**
 * Connecteur sandbox El Fatoora (TTN) — ne contacte pas l’API réelle.
 * Remplacera par un vrai client HTTPS + certificat TUNTRUST.
 */
export type ElFatooraSubmitResult = {
  externalId: string;
  status: 'DEPOSITED' | 'REJECTED';
  errorMessage?: string;
  qrPlaceholder?: string;
};

export async function submitTeifToElFatooraMock(
  teifXml: string,
  invoiceNumber: string
): Promise<ElFatooraSubmitResult> {
  if (!teifXml.includes('<Invoice') || !teifXml.includes('urn:tn:gov:dgi:teif')) {
    return {
      externalId: '',
      status: 'REJECTED',
      errorMessage: 'XML TEIF invalide (namespace manquant)',
    };
  }

  const externalId = `ELFATOORA-MOCK-${invoiceNumber.replace(/[^\w.-]/g, '_')}-${Date.now()}`;
  return {
    externalId,
    status: 'DEPOSITED',
    qrPlaceholder: `https://verify.elfatoora.tn/v?iid=${encodeURIComponent(externalId)}`,
  };
}
