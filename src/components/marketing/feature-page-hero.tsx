import type { ReactNode } from 'react';
import { Check } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type FeatureHeroTone = 'quotes' | 'invoices' | 'einvoice' | 'expenses';

const TONE_STYLES: Record<
  FeatureHeroTone,
  {
    section: string;
    blob: string;
    blobSecondary: string;
    label: string;
  }
> = {
  quotes: {
    section: 'bg-[#E4F0FB]',
    blob: 'bg-brand-blue/15',
    blobSecondary: 'bg-sky-200/30',
    label: 'border-brand-blue/20 bg-white/70 text-brand-blue',
  },
  invoices: {
    section: 'bg-[#E4F0FB]',
    blob: 'bg-brand/15',
    blobSecondary: 'bg-brand-blue/10',
    label: 'border-brand/25 bg-white/70 text-brand-dark',
  },
  einvoice: {
    section: 'bg-[#E4F0FB]',
    blob: 'bg-slate-300/30',
    blobSecondary: 'bg-brand-blue/10',
    label: 'border-slate-200 bg-white/70 text-slate-700',
  },
  expenses: {
    section: 'bg-[#E4F0FB]',
    blob: 'bg-amber-200/35',
    blobSecondary: 'bg-brand-blue/10',
    label: 'border-amber-200/60 bg-white/70 text-amber-900',
  },
};

export type FeaturePageHeroProps = {
  tone: FeatureHeroTone;
  label: string;
  /** Titre déjà composé (avec spans d’accent). */
  title: ReactNode;
  description: string;
  benefits: string[];
  primaryCta: { href: string; label: string };
  secondaryCta?: { href: string; label: string };
  reassurance: string;
  visual: ReactNode;
  className?: string;
};

/** Hero commercial type feature page — colonne texte + composition produit. */
export function FeaturePageHero({
  tone,
  label,
  title,
  description,
  benefits,
  primaryCta,
  secondaryCta,
  reassurance,
  visual,
  className,
}: FeaturePageHeroProps) {
  const styles = TONE_STYLES[tone];

  return (
    <section className={cn('relative overflow-hidden', styles.section, className)}>
      <div
        className={cn(
          'pointer-events-none absolute -end-16 top-16 h-[26rem] w-[26rem] rounded-[3rem] blur-3xl md:rounded-[4rem]',
          styles.blob
        )}
        aria-hidden
      />
      <div
        className={cn(
          'pointer-events-none absolute -start-24 bottom-10 h-72 w-72 rounded-full blur-3xl',
          styles.blobSecondary
        )}
        aria-hidden
      />

      <div className="relative mx-auto grid min-h-[650px] max-w-[1280px] items-center gap-10 px-4 py-12 md:min-h-[700px] md:px-8 md:py-16 lg:grid-cols-[48%_52%] lg:gap-12 lg:py-20">
        <div className="order-1 max-w-xl lg:max-w-none">
          <p
            className={cn(
              'mb-5 inline-flex items-center rounded-full border px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em]',
              styles.label
            )}
          >
            {label}
          </p>

          <h1 className="text-[2.25rem] font-extrabold leading-[1.12] tracking-tight text-slate-900 sm:text-[2.5rem] md:text-[3.5rem] lg:text-[3.75rem] lg:leading-[1.08]">
            {title}
          </h1>

          <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-600 md:text-[1.2rem] md:leading-relaxed">
            {description}
          </p>

          <ul className="mt-7 space-y-3">
            {benefits.map((item) => (
              <li
                key={item}
                className="flex items-start gap-3 text-[15px] font-medium text-slate-800 md:text-base"
              >
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-blue text-white shadow-sm shadow-brand-blue/25">
                  <Check className="h-3.5 w-3.5" strokeWidth={3} />
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <Link href={primaryCta.href} className="w-full sm:w-auto">
              <Button
                size="lg"
                className="h-12 w-full rounded-xl bg-brand-blue px-7 text-base font-semibold text-white shadow-lg shadow-brand-blue/25 hover:bg-brand-blue-hover sm:w-auto"
              >
                {primaryCta.label}
              </Button>
            </Link>
            {secondaryCta ? (
              <Link href={secondaryCta.href} className="w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="secondary"
                  className="h-12 w-full rounded-xl border border-slate-200 bg-white px-7 text-base font-semibold text-slate-800 shadow-sm hover:bg-slate-50 sm:w-auto"
                >
                  {secondaryCta.label}
                </Button>
              </Link>
            ) : null}
          </div>

          <p className="mt-4 text-sm font-medium text-slate-500">{reassurance}</p>
        </div>

        <div className="order-2 w-full">{visual}</div>
      </div>
    </section>
  );
}

/** Mise en avant d’un fragment de titre (couleur SoftFacture). */
export function HeroAccent({
  children,
  variant = 'text',
}: {
  children: ReactNode;
  variant?: 'text' | 'pill';
}) {
  if (variant === 'pill') {
    return (
      <span className="inline-block rounded-xl bg-brand-blue px-2.5 py-0.5 text-white sm:px-3">
        {children}
      </span>
    );
  }
  return <span className="text-brand-blue">{children}</span>;
}
