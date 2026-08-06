import type { PdfDocumentTemplate, SubscriptionPlan } from '../generated/prisma/index.js';

/** Catalogue produit : 3 gabarits distincts (les anciens MONO / BLUE_PRO sont mappés). */
export const ALL_PDF_TEMPLATES: PdfDocumentTemplate[] = ['CLASSIC', 'MODERN', 'MINIMAL'];

export type PdfPlanLimits = {
  /** Nombre de gabarits distincts disponibles */
  maxTemplates: number;
  /** Un seul gabarit pour facture, devis et autre document */
  unifiedTemplate: boolean;
  /** Choix d'une couleur d'accent (code hex) */
  allowAccentColor: boolean;
  /** Couleur différente par type de document */
  perDocumentAccentColor: boolean;
  /** Logo personnalisé autorisé */
  allowCustomLogo: boolean;
  /** Filigrane Softfacture sur les PDF */
  showWatermark: boolean;
  /** Gabarits autorisés pour ce plan */
  allowedTemplates: PdfDocumentTemplate[];
};

export const PLAN_PDF_LIMITS: Record<SubscriptionPlan, PdfPlanLimits> = {
  FREE: {
    maxTemplates: 1,
    unifiedTemplate: true,
    allowAccentColor: false,
    perDocumentAccentColor: false,
    allowCustomLogo: true,
    showWatermark: true,
    allowedTemplates: ['CLASSIC'],
  },
  PRO: {
    maxTemplates: 3,
    unifiedTemplate: true,
    allowAccentColor: true,
    perDocumentAccentColor: false,
    allowCustomLogo: true,
    showWatermark: false,
    allowedTemplates: ['CLASSIC', 'MODERN', 'MINIMAL'],
  },
  BUSINESS: {
    maxTemplates: 3,
    unifiedTemplate: true,
    allowAccentColor: true,
    perDocumentAccentColor: false,
    allowCustomLogo: true,
    showWatermark: false,
    allowedTemplates: ['CLASSIC', 'MODERN', 'MINIMAL'],
  },
};

export type OrgPdfSettings = {
  subscriptionPlan: SubscriptionPlan;
  invoicePdfTemplate: PdfDocumentTemplate;
  quotePdfTemplate: PdfDocumentTemplate;
  otherDocumentPdfTemplate: PdfDocumentTemplate;
  pdfPrimaryColor: string;
  invoicePdfAccentColor: string | null;
  quotePdfAccentColor: string | null;
  otherDocumentPdfAccentColor: string | null;
};

export type PdfSettingsPatch = Partial<{
  invoicePdfTemplate: PdfDocumentTemplate;
  quotePdfTemplate: PdfDocumentTemplate;
  otherDocumentPdfTemplate: PdfDocumentTemplate;
  pdfPrimaryColor: string;
  invoicePdfAccentColor: string | null;
  quotePdfAccentColor: string | null;
  otherDocumentPdfAccentColor: string | null;
}>;

const HEX_RE = /^#?[0-9A-Fa-f]{6}$/;

/** Normalise les anciens ids vers le catalogue à 3 gabarits. */
export function normalizePdfTemplate(value: PdfDocumentTemplate | string): PdfDocumentTemplate {
  if (value === 'BLUE_PRO') return 'MODERN';
  if (value === 'MONO') return 'MINIMAL';
  if (value === 'CLASSIC' || value === 'MODERN' || value === 'MINIMAL') return value;
  return 'CLASSIC';
}

export function normalizeHexColor(input: string | null | undefined, fallback = '#0f766e'): string {
  if (!input?.trim()) return fallback;
  const v = input.trim();
  if (/^#[0-9A-Fa-f]{6}$/.test(v)) return v.toLowerCase();
  if (/^[0-9A-Fa-f]{6}$/.test(v)) return `#${v.toLowerCase()}`;
  if (HEX_RE.test(v)) return normalizeHexColor(`#${v.replace('#', '')}`, fallback);
  return fallback;
}

function pickAllowed(
  value: PdfDocumentTemplate,
  allowed: PdfDocumentTemplate[]
): PdfDocumentTemplate {
  const normalized = normalizePdfTemplate(value);
  return allowed.includes(normalized) ? normalized : allowed[0];
}

/** Applique les règles du plan et retourne les champs PDF à enregistrer. */
export function sanitizePdfSettingsPatch(
  org: OrgPdfSettings,
  patch: PdfSettingsPatch
): PdfSettingsPatch {
  const limits = PLAN_PDF_LIMITS[org.subscriptionPlan];
  const allowed = limits.allowedTemplates;

  // Toujours un gabarit unique pour tous les documents.
  const master =
    patch.invoicePdfTemplate ??
    patch.quotePdfTemplate ??
    patch.otherDocumentPdfTemplate ??
    org.invoicePdfTemplate;
  const unified = pickAllowed(master, allowed);

  const result: PdfSettingsPatch = {
    invoicePdfTemplate: unified,
    quotePdfTemplate: unified,
    otherDocumentPdfTemplate: unified,
  };

  if (limits.allowAccentColor) {
    const primary = normalizeHexColor(patch.pdfPrimaryColor ?? org.pdfPrimaryColor);
    result.pdfPrimaryColor = primary;
    // Couleur d'accent unique (plus de variante par type de document).
    result.invoicePdfAccentColor = null;
    result.quotePdfAccentColor = null;
    result.otherDocumentPdfAccentColor = null;
  }

  return result;
}
