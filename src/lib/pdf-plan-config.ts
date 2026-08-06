/** Règles PDF par plan — miroir de backend/src/lib/pdfPlanConfig.ts */

export const PDF_TEMPLATE_IDS = ['CLASSIC', 'MODERN', 'MINIMAL'] as const;
export type PdfTemplateId = (typeof PDF_TEMPLATE_IDS)[number];

export type SubscriptionPlanId = 'free' | 'pro' | 'business';

export const PLAN_TO_API: Record<SubscriptionPlanId, 'FREE' | 'PRO' | 'BUSINESS'> = {
  free: 'FREE',
  pro: 'PRO',
  business: 'BUSINESS',
};

export const API_TO_PLAN: Record<'FREE' | 'PRO' | 'BUSINESS', SubscriptionPlanId> = {
  FREE: 'free',
  PRO: 'pro',
  BUSINESS: 'business',
};

export type PdfPlanLimits = {
  maxTemplates: number;
  unifiedTemplate: boolean;
  allowAccentColor: boolean;
  perDocumentAccentColor: boolean;
  allowCustomLogo: boolean;
  showWatermark: boolean;
  allowedTemplates: PdfTemplateId[];
};

export const PLAN_PDF_LIMITS: Record<SubscriptionPlanId, PdfPlanLimits> = {
  free: {
    maxTemplates: 1,
    unifiedTemplate: true,
    allowAccentColor: false,
    perDocumentAccentColor: false,
    allowCustomLogo: true,
    showWatermark: true,
    allowedTemplates: ['CLASSIC'],
  },
  pro: {
    maxTemplates: 3,
    unifiedTemplate: true,
    allowAccentColor: true,
    perDocumentAccentColor: false,
    allowCustomLogo: true,
    showWatermark: false,
    allowedTemplates: ['CLASSIC', 'MODERN', 'MINIMAL'],
  },
  business: {
    maxTemplates: 3,
    unifiedTemplate: true,
    allowAccentColor: true,
    perDocumentAccentColor: false,
    allowCustomLogo: true,
    showWatermark: false,
    allowedTemplates: ['CLASSIC', 'MODERN', 'MINIMAL'],
  },
};

/** Normalise les anciens ids (MONO / BLUE_PRO) vers le catalogue à 3. */
export function normalizePdfTemplateId(value: string | null | undefined): PdfTemplateId {
  if (value === 'BLUE_PRO') return 'MODERN';
  if (value === 'MONO') return 'MINIMAL';
  if (value === 'CLASSIC' || value === 'MODERN' || value === 'MINIMAL') return value;
  return 'CLASSIC';
}

export function normalizeHexColor(input: string, fallback = '#0f766e'): string {
  const v = input.trim();
  if (/^#[0-9A-Fa-f]{6}$/.test(v)) return v.toLowerCase();
  if (/^[0-9A-Fa-f]{6}$/.test(v)) return `#${v.toLowerCase()}`;
  return fallback;
}

export function planFromApi(apiPlan: string | undefined): SubscriptionPlanId {
  if (apiPlan === 'PRO') return 'pro';
  if (apiPlan === 'BUSINESS') return 'business';
  // FREE, STARTER (legacy) ou inconnu → freemium
  return 'free';
}
