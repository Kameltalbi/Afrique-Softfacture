import type PDFKit from 'pdfkit';

/** A4 lateral margin used across templates (matches previous PDFs). */
export const SIDE_MARGIN = 48;

/** Footer band height: 1.5 cm from physical bottom (72 pt/in, 25.4 mm/in). */
export const FOOTER_BAND_HEIGHT_PT = (72 / 25.4) * 15;

export function pageContentWidth(doc: PDFKit.PDFDocument): number {
  return doc.page.width - 2 * SIDE_MARGIN;
}

export function pageContentRight(doc: PDFKit.PDFDocument): number {
  return doc.page.width - SIDE_MARGIN;
}

/** Colonnes tableau Minimal (4 cols) — largeur utile A4, padding interne. */
export function tableColsMinimal(doc: PDFKit.PDFDocument) {
  const left = SIDE_MARGIN;
  const right = pageContentRight(doc);
  const width = right - left;
  const pad = 12;
  const gap = 10;
  const qtyW = 44;
  const unitW = 92;
  const amountW = 96;
  const descW = width - pad * 2 - qtyW - unitW - amountW - gap * 3;
  const descX = left + pad;
  const qtyX = descX + descW + gap;
  const unitX = qtyX + qtyW + gap;
  const amountX = unitX + unitW + gap;
  return { left, right, width, pad, descX, descW, qtyX, qtyW, unitX, unitW, amountX, amountW };
}

/** Colonnes Classic (5 cols : desc, PU, qty, TVA, total). */
export function tableColsClassic(doc: PDFKit.PDFDocument) {
  const left = SIDE_MARGIN;
  const right = pageContentRight(doc);
  const width = right - left;
  const pad = 10;
  const gap = 8;
  const puW = 72;
  const qtyW = 40;
  const vatW = 48;
  const totalW = 78;
  const descW = width - pad * 2 - puW - qtyW - vatW - totalW - gap * 4;
  const descX = left + pad;
  const puX = descX + descW + gap;
  const qtyX = puX + puW + gap;
  const vatX = qtyX + qtyW + gap;
  const totalX = vatX + vatW + gap;
  return {
    left,
    right,
    width,
    pad,
    descX,
    descW,
    puX,
    puW,
    qtyX,
    qtyW,
    vatX,
    vatW,
    totalX,
    totalW,
  };
}

/** Colonnes Modern (4 cols : service, qty, PU, total). */
export function tableColsModern(doc: PDFKit.PDFDocument) {
  const left = SIDE_MARGIN;
  const right = pageContentRight(doc);
  const width = right - left;
  const pad = 10;
  const gap = 10;
  const qtyW = 44;
  const unitW = 88;
  const totalW = 78;
  const descW = width - pad * 2 - qtyW - unitW - totalW - gap * 3;
  const descX = left + pad;
  const qtyX = descX + descW + gap;
  const unitX = qtyX + qtyW + gap;
  const totalX = unitX + unitW + gap;
  return { left, right, width, pad, descX, descW, qtyX, qtyW, unitX, unitW, totalX, totalW };
}

export function footerBandTop(doc: PDFKit.PDFDocument): number {
  return doc.page.height - FOOTER_BAND_HEIGHT_PT;
}

/** Max Y for flowing content so it does not enter the footer band. */
export function contentMaxY(doc: PDFKit.PDFDocument): number {
  return footerBandTop(doc) - 14;
}

const FOOTER_FONT_SIZE = 9;

export function finalizeBufferedFooters(doc: PDFKit.PDFDocument, footerText: string): void {
  const range = doc.bufferedPageRange();
  const pageWidth = doc.page.width;

  for (let i = 0; i < range.count; i++) {
    doc.switchToPage(range.start + i);
    const bandTop = footerBandTop(doc);
    doc
      .moveTo(SIDE_MARGIN, bandTop)
      .lineTo(pageWidth - SIDE_MARGIN, bandTop)
      .stroke('#cbd5e1');
    doc
      .fontSize(FOOTER_FONT_SIZE)
      .fillColor('#64748b')
      .text(footerText, SIDE_MARGIN, bandTop + 8, {
        width: pageWidth - 2 * SIDE_MARGIN,
        align: 'center',
        height: FOOTER_BAND_HEIGHT_PT - 12,
        lineBreak: false,
      });
  }
}

/** Filigrane discret pour le plan Gratuit. */
export function drawSoftfactureWatermark(doc: PDFKit.PDFDocument): void {
  const range = doc.bufferedPageRange();
  const label = 'Généré par Softfacture France';

  for (let i = 0; i < range.count; i++) {
    doc.switchToPage(range.start + i);
    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;
    doc.save();
    doc.fillOpacity(0.12);
    doc.fontSize(36).fillColor('#64748b');
    doc.rotate(-32, { origin: [pageWidth / 2, pageHeight / 2] });
    doc.text(label, pageWidth / 2 - 180, pageHeight / 2 - 18, {
      width: 360,
      align: 'center',
      lineBreak: false,
    });
    doc.restore();
  }
}
