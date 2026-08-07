import type {
  Client,
  Invoice,
  InvoiceLine,
  Organization,
  Product,
} from '../../../generated/prisma/index.js';
import { buildTeifXml, type TeifInvoiceInput, teifUnitCode } from './buildTeifXml.js';
import { normalizeTunisianTaxId } from './teifHelpers.js';

type InvoiceForTeif = Invoice & {
  client: Client;
  organization: Organization;
  lines: (InvoiceLine & { product?: Product | null })[];
};

export function mapInvoiceToTeifInput(invoice: InvoiceForTeif): TeifInvoiceInput {
  const org = invoice.organization;
  const client = invoice.client;

  const supplierTax =
    normalizeTunisianTaxId(org.taxMatricule) ??
    normalizeTunisianTaxId(org.billingVatNumber) ??
    normalizeTunisianTaxId(org.billingSiret);

  const customerTax = normalizeTunisianTaxId(client.taxId) ?? normalizeTunisianTaxId(client.siren);

  if (!supplierTax) {
    throw new Error(
      'Renseignez le matricule fiscal de l’organisation (Paramètres → Organisation) pour exporter en TEIF.'
    );
  }
  if (!customerTax) {
    throw new Error(
      'Renseignez le matricule fiscal du client pour exporter en TEIF (champ Identifiant fiscal / taxId).'
    );
  }

  return {
    invoiceId: invoice.id,
    invoiceNumber: invoice.number!,
    issueDate: invoice.issueDate,
    dueDate: invoice.dueDate,
    currency: invoice.currency || org.defaultCurrency || 'TND',
    kind: invoice.kind,
    notes: invoice.notes,
    fiscalStamp: invoice.applyFiscalStamp ? Number(invoice.fiscalStamp) : null,
    withholdingAmount: invoice.applyWithholding ? Number(invoice.withholdingAmount) : null,
    withholdingRate: invoice.applyWithholding ? Number(invoice.withholdingRate) : null,
    supplier: {
      taxId: supplierTax,
      name: org.billingLegalName?.trim() || org.name,
      street: org.address ?? org.legalAddress,
      city: org.city ?? org.legalCity,
      postalCode: org.postalCode ?? org.legalPostalCode,
      country: org.country || 'TN',
    },
    customer: {
      taxId: customerTax,
      name: client.name,
      street: client.address,
      city: client.city,
      postalCode: client.postalCode,
      country: client.country || 'TN',
      phone: client.phone,
      email: client.email,
    },
    lines: invoice.lines.map((line, index) => ({
      id: index + 1,
      description: line.description,
      quantity: Number(line.quantity),
      unitCode: teifUnitCode(line.product?.unit ?? 'unité'),
      unitPriceHt: Number(line.unitPriceHt),
      lineHt: Number(line.lineTotalHt),
      taxRate: Number(line.taxRate),
      productCode: line.productId,
    })),
    subtotalHt: Number(invoice.subtotalHt),
    vatTotal: Number(invoice.vatTotal),
    totalTtc: Number(invoice.totalTtc),
  };
}

export function buildTeifXmlFromInvoice(invoice: InvoiceForTeif): string {
  return buildTeifXml(mapInvoiceToTeifInput(invoice));
}
