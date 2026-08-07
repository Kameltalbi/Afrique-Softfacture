import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import {
  ArrowRight,
  Check,
  FileText,
  FolderOpen,
  Package,
  Calculator,
  RefreshCw,
  Users,
} from 'lucide-react';
import { getTranslations } from 'next-intl/server';

/** Contenu marketing page /devis — 4 sections après le hero. */
export async function DevisPageSections() {
  const t = await getTranslations('featurePages.devis');

  const strengths = [
    t('s1Point1'),
    t('s1Point2'),
    t('s1Point3'),
    t('s1Point4'),
    t('s1Point5'),
    t('s1Point6'),
  ];

  const steps = [
    { n: '1', title: t('s2Step1Title'), desc: t('s2Step1Desc') },
    { n: '2', title: t('s2Step2Title'), desc: t('s2Step2Desc') },
    { n: '3', title: t('s2Step3Title'), desc: t('s2Step3Desc') },
    { n: '4', title: t('s2Step4Title'), desc: t('s2Step4Desc') },
  ];

  const features = [
    { icon: FileText, title: t('s3F1Title'), desc: t('s3F1Desc') },
    { icon: Calculator, title: t('s3F2Title'), desc: t('s3F2Desc') },
    { icon: Users, title: t('s3F3Title'), desc: t('s3F3Desc') },
    { icon: Package, title: t('s3F4Title'), desc: t('s3F4Desc') },
    { icon: FolderOpen, title: t('s3F5Title'), desc: t('s3F5Desc') },
    { icon: RefreshCw, title: t('s3F6Title'), desc: t('s3F6Desc') },
  ];

  return (
    <>
      {/* SECTION 1 — Bénéfices */}
      <section className="bg-white py-16 md:py-20" id="benefices">
        <div className="mx-auto grid max-w-[1280px] items-start gap-10 px-4 md:px-8 lg:grid-cols-2 lg:gap-16">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
              {t('s1Title')}
            </h2>
            <p className="mt-3 text-lg font-semibold text-brand-blue">{t('s1Subtitle')}</p>
            <p className="mt-4 text-base leading-relaxed text-slate-600 md:text-[1.05rem]">
              {t('s1Body1')}
            </p>
            <p className="mt-3 text-base leading-relaxed text-slate-600 md:text-[1.05rem]">
              {t('s1Body2')}
            </p>
            <Link href="/register" className="mt-8 inline-flex">
              <Button className="h-12 rounded-xl bg-brand-blue px-7 text-base font-semibold text-white shadow-lg shadow-brand-blue/20 hover:bg-brand-blue-hover">
                {t('s1Cta')}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <ul className="space-y-3">
            {strengths.map((item) => (
              <li
                key={item}
                className="flex items-start gap-3 border-b border-slate-100 pb-3 last:border-0"
              >
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-blue text-white">
                  <Check className="h-3.5 w-3.5" strokeWidth={3} />
                </span>
                <span className="text-[15px] font-medium text-slate-800">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* SECTION 2 — Fonctionnement */}
      <section className="bg-[#E4F0FB] py-16 md:py-20" id="fonctionnement">
        <div className="mx-auto max-w-[1280px] px-4 md:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
              {t('s2Title')}
            </h2>
            <p className="mt-3 text-lg text-slate-600">{t('s2Subtitle')}</p>
            <p className="mt-3 text-base text-slate-600">{t('s2Intro')}</p>
          </div>

          <ol className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step) => (
              <li key={step.n} className="relative">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-blue text-sm font-bold text-white shadow-md shadow-brand-blue/25">
                  {step.n}
                </div>
                <h3 className="mt-4 text-lg font-bold text-slate-900">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{step.desc}</p>
              </li>
            ))}
          </ol>

          <div className="mt-12 flex justify-center">
            <Link href="/register">
              <Button className="h-12 rounded-xl bg-brand-blue px-7 text-base font-semibold text-white shadow-lg shadow-brand-blue/20 hover:bg-brand-blue-hover">
                {t('s2Cta')}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 3 — Fonctionnalités */}
      <section className="bg-white py-16 md:py-20" id="fonctionnalites">
        <div className="mx-auto max-w-[1280px] px-4 md:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
              {t('s3Title')}
            </h2>
            <p className="mt-3 text-lg text-slate-600">{t('s3Subtitle')}</p>
          </div>

          <div className="mt-12 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title}>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-blue-soft text-brand-blue">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg font-bold text-slate-900">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4 — CTA final */}
      <section className="bg-[#E4F0FB] py-16 md:py-20" id="commencer">
        <div className="mx-auto max-w-3xl px-4 text-center md:px-8">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
            {t('s4Title')}
          </h2>
          <p className="mt-3 text-lg font-semibold text-brand-blue">{t('s4Subtitle')}</p>
          <p className="mt-4 text-base leading-relaxed text-slate-600">{t('s4Body1')}</p>
          <p className="mt-3 text-base leading-relaxed text-slate-600">{t('s4Body2')}</p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/register" className="w-full sm:w-auto">
              <Button className="h-12 w-full rounded-xl bg-brand-blue px-7 text-base font-semibold text-white shadow-lg shadow-brand-blue/20 hover:bg-brand-blue-hover sm:w-auto">
                {t('s4CtaPrimary')}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="#fonctionnalites" className="w-full sm:w-auto">
              <Button
                variant="secondary"
                className="h-12 w-full rounded-xl border border-slate-200 bg-white px-7 text-base font-semibold text-slate-800 shadow-sm hover:bg-slate-50 sm:w-auto"
              >
                {t('s4CtaSecondary')}
              </Button>
            </Link>
          </div>
          <p className="mt-4 text-sm font-medium text-slate-500">{t('s4Note')}</p>
        </div>
      </section>
    </>
  );
}
