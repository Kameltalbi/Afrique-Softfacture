import type { InvoiceKind } from '../../../generated/prisma/index.js';
import {
  escapeXml,
  formatTeifDate,
  formatTeifTime,
  normalizeTunisianTaxId,
  teifAmount,
  teifTaxCategory,
  teifUnitCode,
} from './teifHelpers.js';

export type TeifParty = {
  taxId: string;
  name: string;
  street?: string | null;
  city?: string | null;
  postalCode?: string | null;
  country: string;
  phone?: string | null;
  email?: string | null;
};

export type TeifLine = {
  id: number;
  description: string;
  quantity: number;
  unitCode: string;
  unitPriceHt: number;
  lineHt: number;
  taxRate: number;
  productCode?: string | null;
};

export type TeifInvoiceInput = {
  invoiceId: string;
  invoiceNumber: string;
  issueDate: Date;
  dueDate?: Date | null;
  currency: string;
  kind: InvoiceKind;
  notes?: string | null;
  /** Timbre fiscal (TND) — inclus dans le payable si > 0. */
  fiscalStamp?: number | null;
  /** Retenue à la source (montant) — déduite du payable. */
  withholdingAmount?: number | null;
  withholdingRate?: number | null;
  supplier: TeifParty;
  customer: TeifParty;
  lines: TeifLine[];
  subtotalHt: number;
  vatTotal: number;
  totalTtc: number;
};

function invoiceTypeCode(kind: InvoiceKind): string {
  if (kind === 'CREDIT_NOTE') return '381';
  if (kind === 'DEPOSIT') return '386';
  return '380';
}

function partyXml(tag: 'Supplier' | 'Customer', party: TeifParty): string {
  const contact =
    party.phone || party.email
      ? `
      <Contact>
        ${party.phone ? `<Telephone>${escapeXml(party.phone)}</Telephone>` : ''}
        ${party.email ? `<ElectronicMail>${escapeXml(party.email)}</ElectronicMail>` : ''}
      </Contact>`
      : '';

  return `    <${tag}>
      <PartyIdentification>
        <ID schemeID="TN_MF">${escapeXml(party.taxId)}</ID>
      </PartyIdentification>
      <PartyName>
        <Name>${escapeXml(party.name)}</Name>
      </PartyName>
      <PostalAddress>
        <StreetName>${escapeXml(party.street?.trim() || '—')}</StreetName>
        <CityName>${escapeXml(party.city?.trim() || '—')}</CityName>
        <PostalZone>${escapeXml(party.postalCode?.trim() || '0000')}</PostalZone>
        <Country>
          <IdentificationCode>${escapeXml(party.country || 'TN')}</IdentificationCode>
        </Country>
      </PostalAddress>${contact}
    </${tag}>`;
}

/**
 * Génère un XML TEIF 1.8.8 (structure documentée DGI/TTN).
 * Sans signature — à signer (Digigo) avant soumission El Fatoora.
 */
export function buildTeifXml(input: TeifInvoiceInput): string {
  const supplierTax = normalizeTunisianTaxId(input.supplier.taxId);
  const customerTax = normalizeTunisianTaxId(input.customer.taxId);
  if (!supplierTax) {
    throw new Error('Matricule fiscal émetteur manquant ou invalide (organisation)');
  }
  if (!customerTax) {
    throw new Error('Matricule fiscal client manquant ou invalide');
  }

  const currency = (input.currency || 'TND').toUpperCase();
  const typeCode = invoiceTypeCode(input.kind);

  const taxByRate = new Map<number, { taxable: number; tax: number }>();
  for (const line of input.lines) {
    const rate = Number(line.taxRate) || 0;
    const prev = taxByRate.get(rate) ?? { taxable: 0, tax: 0 };
    const lineVat = line.lineHt * (rate / 100);
    prev.taxable += line.lineHt;
    prev.tax += lineVat;
    taxByRate.set(rate, prev);
  }

  const linesXml = input.lines
    .map((line) => {
      const cat = teifTaxCategory(line.taxRate);
      const qty = teifAmount(line.quantity);
      const lineHt = teifAmount(line.lineHt);
      const price = teifAmount(line.unitPriceHt);
      const productId = line.productCode
        ? `
        <SellersItemIdentification>
          <ID>${escapeXml(line.productCode)}</ID>
        </SellersItemIdentification>`
        : '';
      return `    <InvoiceLine>
      <ID>${line.id}</ID>
      <InvoicedQuantity unitCode="${escapeXml(line.unitCode)}">${qty}</InvoicedQuantity>
      <LineExtensionAmount currencyID="${currency}">${lineHt}</LineExtensionAmount>
      <Item>
        <Name>${escapeXml(line.description)}</Name>${productId}
        <ClassifiedTaxCategory>
          <ID>${cat.id}</ID>
          <Percent>${cat.percent}</Percent>
          <TaxScheme><ID>TVA</ID></TaxScheme>
        </ClassifiedTaxCategory>
      </Item>
      <Price>
        <PriceAmount currencyID="${currency}">${price}</PriceAmount>
        <BaseQuantity unitCode="${escapeXml(line.unitCode)}">1</BaseQuantity>
      </Price>
    </InvoiceLine>`;
    })
    .join('\n');

  const taxSubtotals = [...taxByRate.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([rate, amounts]) => {
      const cat = teifTaxCategory(rate);
      return `    <TaxSubtotal>
      <TaxableAmount currencyID="${currency}">${teifAmount(amounts.taxable)}</TaxableAmount>
      <TaxAmount currencyID="${currency}">${teifAmount(amounts.tax)}</TaxAmount>
      <TaxCategory>
        <ID>${cat.id}</ID>
        <Percent>${cat.percent}</Percent>
        <TaxScheme><ID>TVA</ID></TaxScheme>
      </TaxCategory>
    </TaxSubtotal>`;
    })
    .join('\n');

  const stamp = Number(input.fiscalStamp) || 0;
  const withholding = Number(input.withholdingAmount) || 0;
  const withholdingRate = Number(input.withholdingRate) || 0;
  // totalTtc SoftFacture inclut déjà le timbre si applyFiscalStamp
  const payable = Math.max(0, input.totalTtc - withholding);

  const stampXml =
    stamp > 0
      ? `
    <ChargeTotalAmount currencyID="${currency}">${teifAmount(stamp)}</ChargeTotalAmount>`
      : '';
  const withholdingXml =
    withholding > 0
      ? `
    <PrepaidAmount currencyID="${currency}">${teifAmount(withholding)}</PrepaidAmount>`
      : '';

  const notes: string[] = [];
  if (input.notes?.trim()) notes.push(input.notes.trim());
  if (stamp > 0) notes.push(`Timbre fiscal: ${teifAmount(stamp)} ${currency}`);
  if (withholding > 0) {
    notes.push(
      `Retenue à la source${withholdingRate > 0 ? ` ${teifAmount(withholdingRate)}%` : ''}: ${teifAmount(withholding)} ${currency}`
    );
  }
  const note = notes.length ? notes.map((n) => `\n    <Note>${escapeXml(n)}</Note>`).join('') : '';
  const due = input.dueDate ? `\n    <DueDate>${formatTeifDate(input.dueDate)}</DueDate>` : '';

  return `<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:tn:gov:dgi:teif:1.8"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="urn:tn:gov:dgi:teif:1.8 TEIF_v1.8.8.xsd">
  <Header>
    <InvoiceID>${escapeXml(input.invoiceNumber)}</InvoiceID>
    <IssueDate>${formatTeifDate(input.issueDate)}</IssueDate>
    <IssueTime>${formatTeifTime(input.issueDate)}</IssueTime>
    <InvoiceTypeCode>${typeCode}</InvoiceTypeCode>
    <DocumentCurrencyCode>${currency}</DocumentCurrencyCode>
    <TaxCurrencyCode>${currency}</TaxCurrencyCode>${due}${note}
  </Header>
  <Parties>
${partyXml('Supplier', { ...input.supplier, taxId: supplierTax })}
${partyXml('Customer', { ...input.customer, taxId: customerTax })}
  </Parties>
  <InvoiceLines>
${linesXml}
  </InvoiceLines>
  <TaxTotal>
    <TaxAmount currencyID="${currency}">${teifAmount(input.vatTotal)}</TaxAmount>
${taxSubtotals}
  </TaxTotal>
  <LegalMonetaryTotal>
    <LineExtensionAmount currencyID="${currency}">${teifAmount(input.subtotalHt)}</LineExtensionAmount>
    <TaxExclusiveAmount currencyID="${currency}">${teifAmount(input.subtotalHt)}</TaxExclusiveAmount>
    <TaxInclusiveAmount currencyID="${currency}">${teifAmount(input.totalTtc)}</TaxInclusiveAmount>${stampXml}${withholdingXml}
    <PayableAmount currencyID="${currency}">${teifAmount(payable)}</PayableAmount>
  </LegalMonetaryTotal>
</Invoice>
`;
}

/** Insère un bloc Signature (empreinte + valeur Digigo / simulation) avant </Invoice>. */
export function embedTeifSignature(
  unsignedXml: string,
  opts: { contentHashHex: string; signatureValue: string; mode: 'simulation' | 'production' }
): string {
  const digestB64 = Buffer.from(opts.contentHashHex, 'hex').toString('base64');
  const block = `  <Signature>
    <SignedInfo>
      <CanonicalizationMethod Algorithm="http://www.w3.org/2001/10/xml-exc-c14n#"/>
      <SignatureMethod Algorithm="http://www.w3.org/2001/04/xmldsig-more#rsa-sha256"/>
      <Reference URI="">
        <DigestMethod Algorithm="http://www.w3.org/2001/04/xmlenc#sha256"/>
        <DigestValue>${digestB64}</DigestValue>
      </Reference>
    </SignedInfo>
    <SignatureValue>${escapeXml(opts.signatureValue)}</SignatureValue>
    <Object>
      <SoftFactureSignatureMeta>
        <Mode>${opts.mode}</Mode>
        <HashAlgorithm>SHA-256</HashAlgorithm>
        <ContentHash>${escapeXml(opts.contentHashHex)}</ContentHash>
      </SoftFactureSignatureMeta>
    </Object>
  </Signature>
`;
  if (!unsignedXml.includes('</Invoice>')) {
    throw new Error('XML TEIF invalide — balise </Invoice> manquante');
  }
  return unsignedXml.replace('</Invoice>', `${block}</Invoice>`);
}

export { teifUnitCode };
