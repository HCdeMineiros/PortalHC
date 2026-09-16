/**
 * Fundo escuro (azul petróleo) com marca d'água sutil da fachada.
 * Usado nas telas de acesso para manter a linguagem visual da home.
 */
export function FundoEscuro() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 bg-hc-navy-1">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-[0.10]"
        style={{ backgroundImage: "url('/brand/fachada-hc-soft.jpg')" }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,19,31,.55)_0%,rgba(10,26,41,.85)_60%,var(--hc-navy-1)_100%)]" />
    </div>
  );
}
