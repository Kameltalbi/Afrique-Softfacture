/**
 * Visuel hero SoftFacture Afrique.
 * WebP ~30 ko / JPEG ~48 ko — servi en static pour un affichage immédiat.
 */
export function HeroVisual() {
  return (
    <div className="relative mx-auto w-full max-w-lg lg:max-w-none lg:ms-auto">
      <div className="relative overflow-hidden rounded-3xl bg-[#E4F0FB] shadow-2xl ring-1 ring-slate-200/70">
        <picture>
          <source srcSet="/hero-softfacture-afrique.webp" type="image/webp" />
          <img
            src="/hero-softfacture-afrique.jpg"
            alt="Professionnelle présentant SoftFacture sur tablette dans un environnement de bureau"
            width={960}
            height={638}
            className="h-auto w-full object-cover object-center"
            decoding="async"
            fetchPriority="high"
            loading="eager"
          />
        </picture>
      </div>
    </div>
  );
}
