/**
 * Marca d'água sutil da fachada do hospital, fixa ao fundo das telas internas.
 * Bem clara, coberta por véu creme — dá identidade sem atrapalhar a leitura.
 */
export function FundoSuave() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-[0.12]"
        style={{ backgroundImage: "url('/brand/fachada-hc-soft.jpg')" }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,var(--hc-cream)_0%,color-mix(in_srgb,var(--hc-cream)_82%,transparent)_45%,var(--hc-cream)_100%)]" />
    </div>
  );
}
