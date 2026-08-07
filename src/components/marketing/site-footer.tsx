import { Link } from '@/i18n/navigation';
import { getTranslations } from 'next-intl/server';
import { BrandLogo } from '@/components/brand/brand-logo';

/**
 * Footer marketing riche — affiché sur toutes les pages publiques.
 * Les ancres pointent vers `/#…` pour fonctionner hors de l’accueil.
 */
export async function SiteFooter() {
  const t = await getTranslations('marketing');
  const year = new Date().getFullYear();

  const columns = [
    {
      title: t('footerColProduct'),
      links: [
        { href: '/devis', label: t('navQuotes') },
        { href: '/factures', label: t('navInvoices') },
        { href: '/facture-electronique', label: t('navEinvoice') },
        { href: '/note-de-frais', label: t('navExpenses') },
        { href: '/tarifs', label: t('navPricing') },
      ],
    },
    {
      title: t('footerColResources'),
      links: [
        { href: '/#how', label: t('navHow') },
        { href: '/tarifs', label: t('pricingTeaserCta') },
      ],
    },
    {
      title: t('footerColCompany'),
      links: [
        { href: 'mailto:contact@softfacture.fr', label: t('footerContact') },
        { href: '/mentions-legales', label: t('footerLegal') },
        { href: '/politique-de-confidentialite', label: t('footerPrivacy') },
        { href: '/cgv', label: t('footerCgv') },
      ],
    },
    {
      title: t('footerColLegal'),
      links: [
        { href: '/politique-de-confidentialite', label: t('footerRgpd') },
        { href: '/politique-de-confidentialite', label: t('footerCookies') },
        { href: '/politique-de-confidentialite', label: t('footerSecurity') },
      ],
    },
  ] as const;

  return (
    <footer className="border-t border-slate-200 bg-[#f8fafc]">
      <div className="mx-auto max-w-7xl px-4 py-14 md:px-8">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <BrandLogo href="/" />
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-slate-600">
              {t('footerTagline')}
            </p>
          </div>
        </div>

        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-bold tracking-wide text-slate-900">{col.title}</h3>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={`${col.title}-${link.label}`}>
                    {link.href.startsWith('mailto:') ? (
                      <a
                        href={link.href}
                        className="text-sm text-slate-600 transition hover:text-brand-blue"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-sm text-slate-600 transition hover:text-brand-blue"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-slate-200 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-semibold text-slate-900">SoftFacture Afrique © {year}</p>
          <p className="text-xs text-slate-400">{t('footerBrandNote')}</p>
        </div>
      </div>
    </footer>
  );
}
