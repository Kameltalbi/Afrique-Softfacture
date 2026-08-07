/** Conteneur centré pour les pages auth hors connexion (inscription, reset…). */
export function AuthCardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh items-center justify-center px-4 py-8 pb-[max(2rem,env(safe-area-inset-bottom))] pt-[max(2rem,env(safe-area-inset-top))] sm:py-12">
      <div className="w-full max-w-[440px]">{children}</div>
    </div>
  );
}
