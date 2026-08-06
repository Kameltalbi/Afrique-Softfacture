import { defineRouting } from 'next-intl/routing';

/** Interface FR + EN + AR. Les langues PDF (factures/devis) sont gérées à part (documentLanguage). */
const localeSwitcherDisabled = process.env.NEXT_PUBLIC_SHOW_LOCALE_SWITCHER === 'false';

export const routing = defineRouting({
  locales: ['fr', 'en', 'ar'],
  defaultLocale: 'fr',
  localePrefix: 'never',
  localeDetection: !localeSwitcherDisabled,
});
