import { describe, expect, it } from 'vitest';
import { buildTeifXml } from './buildTeifXml.js';
import { normalizeTunisianTaxId, teifAmount } from './teifHelpers.js';

describe('TEIF helpers', () => {
  it('formats amounts with 3 decimals', () => {
    expect(teifAmount(19)).toBe('19.000');
    expect(teifAmount('1400.5')).toBe('1400.500');
  });

  it('normalizes matricule fiscal', () => {
    expect(normalizeTunisianTaxId('1234567/A/M/000')).toBe('1234567AM000');
    expect(normalizeTunisianTaxId('  abc  ')).toBeNull();
  });
});

describe('buildTeifXml', () => {
  it('builds a TEIF invoice XML', () => {
    const xml = buildTeifXml({
      invoiceId: 'inv1',
      invoiceNumber: 'FAC-2026-0001',
      issueDate: new Date('2026-02-22T14:30:00Z'),
      dueDate: new Date('2026-03-22T00:00:00Z'),
      currency: 'TND',
      kind: 'STANDARD',
      notes: 'Test',
      supplier: {
        taxId: '12345678A000000',
        name: 'SoftFacture Demo',
        street: 'Av. Habib Bourguiba',
        city: 'Tunis',
        postalCode: '1000',
        country: 'TN',
      },
      customer: {
        taxId: '98765432B000111',
        name: 'Client SA',
        city: 'Sfax',
        postalCode: '3000',
        country: 'TN',
      },
      lines: [
        {
          id: 1,
          description: 'Prestation conseil',
          quantity: 10,
          unitCode: 'HUR',
          unitPriceHt: 50,
          lineHt: 500,
          taxRate: 19,
        },
      ],
      subtotalHt: 500,
      vatTotal: 95,
      totalTtc: 595,
    });

    expect(xml).toContain('urn:tn:gov:dgi:teif:1.8');
    expect(xml).toContain('TEIF_v1.8.8.xsd');
    expect(xml).toContain('<InvoiceID>FAC-2026-0001</InvoiceID>');
    expect(xml).toContain('schemeID="TN_MF"');
    expect(xml).toContain('12345678A000000');
    expect(xml).toContain('500.000');
    expect(xml).toContain('<InvoiceTypeCode>380</InvoiceTypeCode>');
  });

  it('includes fiscal stamp and withholding in monetary totals', () => {
    const xml = buildTeifXml({
      invoiceId: 'inv1',
      invoiceNumber: 'FAC-2026-0002',
      issueDate: new Date('2026-02-22T14:30:00Z'),
      currency: 'TND',
      kind: 'STANDARD',
      fiscalStamp: 1,
      withholdingAmount: 50,
      withholdingRate: 5,
      supplier: {
        taxId: '12345678A000000',
        name: 'SoftFacture Demo',
        country: 'TN',
      },
      customer: {
        taxId: '98765432B000111',
        name: 'Client SA',
        country: 'TN',
      },
      lines: [
        {
          id: 1,
          description: 'Prestation',
          quantity: 1,
          unitCode: 'C62',
          unitPriceHt: 500,
          lineHt: 500,
          taxRate: 19,
        },
      ],
      subtotalHt: 500,
      vatTotal: 95,
      totalTtc: 596,
    });

    expect(xml).toContain('<ChargeTotalAmount currencyID="TND">1.000</ChargeTotalAmount>');
    expect(xml).toContain('<PrepaidAmount currencyID="TND">50.000</PrepaidAmount>');
    expect(xml).toContain('<PayableAmount currencyID="TND">546.000</PayableAmount>');
    expect(xml).toContain('Retenue à la source');
  });

  it('rejects missing supplier tax id', () => {
    expect(() =>
      buildTeifXml({
        invoiceId: 'inv1',
        invoiceNumber: 'FAC-1',
        issueDate: new Date(),
        currency: 'TND',
        kind: 'STANDARD',
        supplier: { taxId: 'x', name: 'A', country: 'TN' },
        customer: { taxId: '98765432B000111', name: 'B', country: 'TN' },
        lines: [
          {
            id: 1,
            description: 'L',
            quantity: 1,
            unitCode: 'C62',
            unitPriceHt: 10,
            lineHt: 10,
            taxRate: 19,
          },
        ],
        subtotalHt: 10,
        vatTotal: 1.9,
        totalTtc: 11.9,
      })
    ).toThrow(/Matricule fiscal émetteur/);
  });
});
