import Image from 'next/image';

/** Visuel hero SoftFacture Afrique (professionnelle + tablette analytics). */
const HERO_IMAGE = '/hero-softfacture-afrique.png';

export function HeroVisual() {
  return (
    <div className="relative mx-auto w-full max-w-lg lg:max-w-none lg:ms-auto">
      <div className="relative overflow-hidden rounded-3xl bg-slate-50 shadow-2xl ring-1 ring-slate-200/80">
        <Image
          src={HERO_IMAGE}
          alt="Professionnelle utilisant SoftFacture Afrique sur tablette pour suivre devis et factures"
          width={1024}
          height={768}
          className="h-auto w-full object-cover object-center"
          priority
          sizes="(max-width: 1024px) 100vw, 560px"
        />
      </div>
    </div>
  );
}
