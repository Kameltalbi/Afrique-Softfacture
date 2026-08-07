import { prisma } from '../lib/db.js';
import { buildTeifXmlFromInvoice } from '../lib/einvoice/teif/mapInvoiceToTeif.js';

export class TeifGenerateError extends Error {
  constructor(
    message: string,
    readonly statusCode = 400
  ) {
    super(message);
    this.name = 'TeifGenerateError';
  }
}

const invoiceInclude = {
  client: true,
  organization: true,
  lines: {
    orderBy: { sortOrder: 'asc' as const },
    include: { product: true },
  },
};

async function loadInvoiceForTeif(invoiceId: string, organizationId: string) {
  const invoice = await prisma.invoice.findFirst({
    where: { id: invoiceId, organizationId },
    include: invoiceInclude,
  });
  if (!invoice) throw new TeifGenerateError('Facture introuvable', 404);
  if (invoice.status === 'DRAFT' || !invoice.number) {
    throw new TeifGenerateError('Validez la facture (numéro définitif) avant export TEIF', 400);
  }
  if (invoice.status === 'CANCELLED') {
    throw new TeifGenerateError('Facture annulée — export TEIF indisponible', 400);
  }
  if (!invoice.lines.length) {
    throw new TeifGenerateError('La facture doit contenir au moins une ligne', 400);
  }
  return invoice;
}

/** Export XML TEIF non signé (phase A — El Fatoora / signature TUNTRUST ensuite). */
export async function generateTeifXml(invoiceId: string, organizationId: string) {
  const invoice = await loadInvoiceForTeif(invoiceId, organizationId);
  try {
    const xml = buildTeifXmlFromInvoice(invoice);
    const safeNumber = invoice.number!.replace(/[^\w.-]/g, '_');
    return {
      xml,
      filename: `${safeNumber}-teif.xml`,
      unsigned: true as const,
    };
  } catch (e) {
    throw new TeifGenerateError(e instanceof Error ? e.message : 'Données TEIF invalides', 422);
  }
}
