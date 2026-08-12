import Link from "next/link";

/**
 * Botão premium destacado para o médico — "área nobre" de quem cadastra a cirurgia.
 * variant "light": sobre fundo claro. variant "glass": sobre o hero escuro.
 */
export function BotaoMedico({
  className = "",
  variant = "light",
}: {
  className?: string;
  variant?: "light" | "glass";
}) {
  const glass = variant === "glass";
  return (
    <Link
      href="/medico"
      className={`group relative inline-flex items-center gap-3 rounded-2xl border px-5 py-3 transition-all hover:-translate-y-0.5 ${
        glass
          ? "border-[color-mix(in_srgb,var(--hc-gold-soft)_60%,transparent)] bg-white/10 backdrop-blur-md shadow-[0_12px_34px_-14px_rgba(0,0,0,.55)] hover:bg-white/20"
          : "border-[color-mix(in_srgb,var(--hc-gold)_55%,white)] bg-gradient-to-b from-white to-[var(--hc-cream-2)] shadow-[0_10px_30px_-14px_rgba(154,123,18,.55)] hover:shadow-[0_16px_36px_-14px_rgba(154,123,18,.7)]"
      } ${className}`}
    >
      <span className="flex h-16 w-16 flex-none items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--hc-red)] to-[var(--hc-red-700)] text-[2rem] leading-none text-white shadow-[inset_0_1px_0_rgba(255,255,255,.35),0_6px_16px_-6px_rgba(160,12,34,.6)]">
        ⚕
      </span>
      <span className="leading-tight">
        <span
          className={`block text-[11px] font-semibold uppercase tracking-[0.14em] ${
            glass ? "text-[var(--hc-gold-soft)]" : "text-[var(--hc-gold-deep)]"
          }`}
        >
          Área do Médico
        </span>
        <span
          className={`block font-serif text-lg font-semibold ${
            glass ? "text-white" : "text-[var(--hc-ink)]"
          }`}
        >
          Cadastrar cirurgia
        </span>
      </span>
      <span
        className={`ml-1 transition-transform group-hover:translate-x-0.5 ${
          glass ? "text-[var(--hc-gold-soft)]" : "text-[var(--hc-gold-deep)]"
        }`}
      >
        →
      </span>
    </Link>
  );
}
