import { prisma } from '../lib/db.js';
import { submitTeifToElFatooraMock } from '../lib/einvoice/teif/mockElFatoora.js';
import { generateTeifXml, TeifGenerateError } from './teifGenerate.js';

export class TeifTransmitError extends Error {
  constructor(
    message: string,
    readonly statusCode = 400
  ) {
    super(message);
    this.name = 'TeifTransmitError';
  }
}

/**
 * Soumission sandbox El Fatoora (mock) — journalise une transmission MOCK.
 * Production : remplacer mock par API TTN + signature TUNTRUST.
 */
export async function transmitTeifToElFatoora(invoiceId: string, organizationId: string) {
  let generated;
  try {
    generated = await generateTeifXml(invoiceId, organizationId);
  } catch (e) {
    if (e instanceof TeifGenerateError) {
      throw new TeifTransmitError(e.message, e.statusCode);
    }
    throw e;
  }

  const invoice = await prisma.invoice.findFirst({
    where: { id: invoiceId, organizationId },
    select: { number: true, status: true },
  });
  if (!invoice?.number) throw new TeifTransmitError('Facture introuvable', 404);

  const result = await submitTeifToElFatooraMock(generated.xml, invoice.number);
  if (result.status === 'REJECTED') {
    throw new TeifTransmitError(result.errorMessage || 'Rejet El Fatoora (sandbox)', 422);
  }

  const now = new Date();
  const transmission = await prisma.eInvoiceTransmission.create({
    data: {
      organizationId,
      invoiceId,
      paProvider: 'MOCK',
      status: 'DEPOSITED',
      paExternalId: result.externalId,
      lastError: null,
      depositedAt: now,
    },
  });

  return {
    transmission,
    qrPlaceholder: result.qrPlaceholder,
    unsignedTeif: true as const,
    note: 'Sandbox SoftFacture — XML TEIF non signé. Signature TUNTRUST + API TTN à brancher.',
  };
}
